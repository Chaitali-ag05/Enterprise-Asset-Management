import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../../context/useAuthStore";
import { assetApi } from "../../../api/assetApi";
import { assignmentService } from "../../../api/assignmentService";
import { maintenanceService } from "../../../api/maintenanceService";
import { employeeApi } from "../../../api/employeeApi";
import { departmentService } from "../../../api/departmentService";
import { vendorApi } from "../../../api/vendorApi";
import type { AssetResponse } from "../../../types/asset";
import type { AssignmentResponse } from "../../../types/assignment";
import type { MaintenanceIssueResponse } from "../../../types/maintenance";
import type { DepartmentResponse } from "../../../types/department";
import type { VendorResponse } from "../../../types/vendor";
import type { EmployeeResponse } from "../../../types/employee";
import type { CustodyRecord, MaintenanceReportItem, LifecycleAssetRecord } from "../types";
import { calculateAssetAgeInYears, getAgeBand, cleanDepartmentName } from "../utils/reportUtils";

export function useReportsData() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assets, setAssets] = useState<AssetResponse[]>([]);
  const [custodyRecords, setCustodyRecords] = useState<CustodyRecord[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceReportItem[]>([]);
  const [lifecycleAssets, setLifecycleAssets] = useState<LifecycleAssetRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

  const role = user?.role || "ROLE_EMPLOYEE";
  const isAdmin = role === "ROLE_ADMIN";
  const isManager = role === "ROLE_MANAGER";
  const isTechnician = role === "ROLE_TECHNICIAN";
  const isEmployee = role === "ROLE_EMPLOYEE";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Departments (available to authorized reports roles)
      const deptList = (isAdmin || isManager || isTechnician)
        ? await departmentService.getAll().catch(() => [])
        : [];
      setDepartments(deptList);

      // 2. Fetch Assets based on authorized role scope (Admin & Manager only)
      let assetList: AssetResponse[] = [];
      if (isAdmin || isManager) {
        assetList = await assetApi.getAll().catch(() => []);
      }
      setAssets(assetList);

      // Augmented lifecycle records
      const lifeRecords: LifecycleAssetRecord[] = assetList.map((a) => {
        const ageYears = calculateAssetAgeInYears(a.purchaseDate);
        return {
          ...a,
          ageYears,
          ageBand: getAgeBand(ageYears),
        };
      });
      setLifecycleAssets(lifeRecords);

      // 3. Fetch Assignments / Custody Records (Admin & Manager only)
      let assignmentList: AssignmentResponse[] = [];
      if (isAdmin || isManager) {
        assignmentList = await assignmentService.getAll().catch(() => []);
      }

      // Map assets to lookup category
      const assetCategoryMap = new Map<string, string>();
      assetList.forEach((a) => {
        if (a.assetCode) assetCategoryMap.set(a.assetCode, a.category);
      });

      // Flatten assignments into custody records with clean department names
      const custody: CustodyRecord[] = [];
      assignmentList.forEach((asgn) => {
        const dept = cleanDepartmentName(asgn.assignedDepartmentName || asgn.currentDepartmentName);
        if (asgn.items && asgn.items.length > 0) {
          asgn.items.forEach((item) => {
            custody.push({
              id: `${asgn.id}_${item.id}`,
              assignedTo: asgn.employeeName || "Unassigned",
              employeeId: asgn.employeeId,
              department: dept,
              assetName: item.assetName || item.assetCode,
              assetCode: item.assetCode,
              category: assetCategoryMap.get(item.assetCode) || "Equipment",
              assignedDate: asgn.assignedAt,
              status: item.status || asgn.status,
            });
          });
        } else {
          custody.push({
            id: asgn.id,
            assignedTo: asgn.employeeName || "Unassigned",
            employeeId: asgn.employeeId,
            department: dept,
            assetName: "Direct Assignment",
            assetCode: `ASGN-${asgn.id}`,
            category: "Equipment",
            assignedDate: asgn.assignedAt,
            status: asgn.status,
          });
        }
      });
      setCustodyRecords(custody);

      // 4. Fetch Maintenance Issues & Work Orders
      let issueList: MaintenanceIssueResponse[] = [];
      if (isAdmin || isManager || isTechnician) {
        issueList = await maintenanceService.getIssues().catch(() => []);
      }

      // Flatten issues & work orders into maintenance report items
      const maintItems: MaintenanceReportItem[] = [];
      issueList.forEach((issue) => {
        const assetCat = assetCategoryMap.get(issue.assetCode) || "Equipment";
        if (issue.workOrders && issue.workOrders.length > 0) {
          issue.workOrders.forEach((wo) => {
            maintItems.push({
              id: `wo_${wo.id}`,
              workOrderCode: wo.workOrderCode || `WO-${wo.id}`,
              assetName: issue.assetName || issue.assetCode,
              assetCode: issue.assetCode,
              issueTitle: issue.title || issue.description,
              technicianName: wo.technicianName || "Unassigned",
              priority: issue.priority,
              status: wo.status,
              reportedAt: issue.reportedAt,
              completedAt: wo.completedAt,
              category: assetCat,
            });
          });
        } else {
          maintItems.push({
            id: `iss_${issue.id}`,
            workOrderCode: issue.issueCode,
            assetName: issue.assetName || issue.assetCode,
            assetCode: issue.assetCode,
            issueTitle: issue.title || issue.description,
            technicianName: "Pending Assignment",
            priority: issue.priority,
            status: issue.status,
            reportedAt: issue.reportedAt,
            completedAt: issue.resolvedAt,
            category: assetCat,
          });
        }
      });
      setMaintenanceItems(maintItems);

      // 5. Fetch Vendors & Employees (Admin & Manager)
      if (isAdmin || isManager) {
        const [empList, venList] = await Promise.all([
          employeeApi.getAll().catch(() => []),
          vendorApi.getAll().catch(() => []),
        ]);
        setEmployees(empList);
        setVendors(venList);
      }
    } catch (err: any) {
      console.error("Failed to fetch reports data:", err);
      setError(err?.message || "Failed to load authorized reports data.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isManager, isTechnician, isEmployee]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    assets,
    custodyRecords,
    maintenanceItems,
    lifecycleAssets,
    departments,
    vendors,
    employees,
    loading,
    error,
    refreshData: fetchData,
    role,
  };
}
