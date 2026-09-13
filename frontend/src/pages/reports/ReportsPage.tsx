import React, { useState, useEffect, useMemo } from "react";
import { Package, Users, Wrench, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Tabs, type TabItem } from "../../components/ui/Tabs";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { useAuthStore } from "../../context/useAuthStore";
import { useReportsData } from "./hooks/useReportsData";
import { AssetInventoryTab, initialInventoryFilters } from "./tabs/AssetInventoryTab";
import { AllocationsTab, initialAllocationsFilters } from "./tabs/AllocationsTab";
import { MaintenanceReportTab, initialMaintenanceFilters } from "./tabs/MaintenanceReportTab";
import { LifecycleTab, initialLifecycleFilters } from "./tabs/LifecycleTab";
import type {
  ReportTabId,
  InventoryFilters,
  AllocationsFilters,
  MaintenanceFilters,
  LifecycleFilters,
} from "./types";

export default function ReportsPage() {
  const { user } = useAuthStore();
  const role = user?.role || "ROLE_EMPLOYEE";
  const isTechnician = role === "ROLE_TECHNICIAN";
  const isManager = role === "ROLE_MANAGER";
  const isAdmin = role === "ROLE_ADMIN";

  const [activeTab, setActiveTab] = useState<ReportTabId>(isTechnician ? "maintenance" : "inventory");

  // Keep activeTab locked to maintenance for Technician
  useEffect(() => {
    if (isTechnician && activeTab !== "maintenance") {
      setActiveTab("maintenance");
    }
  }, [isTechnician, activeTab]);

  // Tab-scoped independent filter states (zero cross-tab leakage)
  const [inventoryFilters, setInventoryFilters] = useState<InventoryFilters>({ ...initialInventoryFilters });
  const [allocationsFilters, setAllocationsFilters] = useState<AllocationsFilters>({ ...initialAllocationsFilters });
  const [maintenanceFilters, setMaintenanceFilters] = useState<MaintenanceFilters>({ ...initialMaintenanceFilters });
  const [lifecycleFilters, setLifecycleFilters] = useState<LifecycleFilters>({ ...initialLifecycleFilters });

  const {
    assets,
    custodyRecords,
    maintenanceItems,
    lifecycleAssets,
    departments,
    vendors,
    employees,
    loading,
    error,
    refreshData,
  } = useReportsData();

  // Role-scoped authorized tabs
  const reportTabs: TabItem[] = useMemo(() => {
    if (isTechnician) {
      return [
        {
          id: "maintenance",
          label: "Maintenance",
          icon: <Wrench size={15} />,
          count: maintenanceItems.length,
        },
      ];
    }
    return [
      {
        id: "inventory",
        label: "Asset Inventory",
        icon: <Package size={15} />,
        count: assets.length,
      },
      {
        id: "allocations",
        label: "Allocations",
        icon: <Users size={15} />,
        count: custodyRecords.length,
      },
      {
        id: "maintenance",
        label: "Maintenance",
        icon: <Wrench size={15} />,
        count: maintenanceItems.length,
      },
      {
        id: "lifecycle",
        label: "Lifecycle",
        icon: <Clock size={15} />,
        count: lifecycleAssets.length,
      },
    ];
  }, [isTechnician, assets.length, custodyRecords.length, maintenanceItems.length, lifecycleAssets.length]);

  if (loading && assets.length === 0 && custodyRecords.length === 0 && maintenanceItems.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Analytical investigation workspace for inventory, custody, repairs, and hardware lifecycle."
        />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-60 rounded-xl" />
            <Skeleton className="h-60 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Analytical investigation workspace for inventory, custody, repairs, and hardware lifecycle."
        />
        <div className="p-8 text-center bg-white dark:bg-[#111714] border border-[#E5E9E7] dark:border-[#25312B] rounded-xl max-w-lg mx-auto space-y-3 shadow-sm dark:shadow-card">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-heading font-semibold text-sm text-[#1A1D18] dark:text-[#F3F7F4]">
            Failed to Load Reports Telemetry
          </h3>
          <p className="text-xs text-[#74827A] dark:text-[#8E9C94]">{error}</p>
          <Button variant="outline" size="sm" onClick={refreshData}>
            Retry Data Load
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Analytical investigation workspace for hardware inventory, asset custody, field repairs, and lifecycle age brackets."
      />

      {/* Primary Report Tabs */}
      <Tabs
        tabs={reportTabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as ReportTabId)}
      />

      {/* Active Tab Content */}
      <div className="pt-1">
        {activeTab === "inventory" && (
          <AssetInventoryTab
            assets={assets}
            departments={departments}
            vendors={vendors}
            loading={loading}
            filters={inventoryFilters}
            onFilterChange={setInventoryFilters}
          />
        )}

        {activeTab === "allocations" && (
          <AllocationsTab
            custodyRecords={custodyRecords}
            assets={assets}
            departments={departments}
            employees={employees}
            loading={loading}
            filters={allocationsFilters}
            onFilterChange={setAllocationsFilters}
          />
        )}

        {activeTab === "maintenance" && (
          <MaintenanceReportTab
            maintenanceItems={maintenanceItems}
            departments={departments}
            loading={loading}
            filters={maintenanceFilters}
            onFilterChange={setMaintenanceFilters}
          />
        )}

        {activeTab === "lifecycle" && (
          <LifecycleTab
            lifecycleAssets={lifecycleAssets}
            departments={departments}
            vendors={vendors}
            loading={loading}
            filters={lifecycleFilters}
            onFilterChange={setLifecycleFilters}
          />
        )}
      </div>
    </div>
  );
}
