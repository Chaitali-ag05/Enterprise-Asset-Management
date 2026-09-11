package com.assetmanagement.maintenance;

import com.assetmanagement.asset.assignment.entity.Assignment;
import com.assetmanagement.asset.assignment.entity.AssignmentItem;
import com.assetmanagement.asset.assignment.enums.AssignmentItemStatus;
import com.assetmanagement.asset.assignment.enums.AssignmentStatus;
import com.assetmanagement.asset.assignment.repository.AssignmentItemRepository;
import com.assetmanagement.asset.assignment.repository.AssignmentRepository;
import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.enums.AssetCategory;
import com.assetmanagement.asset.enums.AssetStatus;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.auth.repository.UserRepository;
import com.assetmanagement.auth.entity.User;
import com.assetmanagement.auth.entity.Role;
import com.assetmanagement.department.entity.Department;
import com.assetmanagement.department.enums.DepartmentStatus;
import com.assetmanagement.department.repository.DepartmentRepository;
import com.assetmanagement.employee.entity.Designation;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.repository.EmployeeRepository;
import com.assetmanagement.maintenance.entity.MaintenanceIssue;
import com.assetmanagement.maintenance.entity.MaintenanceWorkOrder;
import com.assetmanagement.maintenance.enums.IssueStatus;
import com.assetmanagement.maintenance.enums.IssuePriority;
import com.assetmanagement.maintenance.enums.WorkOrderStatus;
import com.assetmanagement.maintenance.repository.MaintenanceIssueRepository;
import com.assetmanagement.maintenance.repository.MaintenanceWorkOrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(username = "adminUser", roles = "ADMIN")
public class MaintenanceIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EntityManager em;
    @Autowired private UserRepository userRepository;
    @Autowired private DepartmentRepository departmentRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private AssetRepository assetRepository;
    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private AssignmentItemRepository assignmentItemRepository;
    @Autowired private MaintenanceIssueRepository issueRepository;
    @Autowired private MaintenanceWorkOrderRepository workOrderRepository;

    private final AtomicInteger issueCounter    = new AtomicInteger(1);
    private final AtomicInteger woCounter       = new AtomicInteger(1);

    private Department deptIT;
    private Employee empActive2;
    private Employee empActive3;
    private Employee empInactive;
    private Employee technicianA;
    private Employee technicianB;
    private Asset assetAssignedToEmp2;
    private Asset assetAssignedToEmp3;
    private Asset assetAvailable;
    private Asset assetRetired;
    private Assignment assignmentEmp2;
    private AssignmentItem itemEmp2;

    @BeforeEach
    void setUp() {
        issueCounter.set(1);
        woCounter.set(1);

        deptIT = departmentRepository.findAll().stream()
                .filter(d -> "IT Department".equalsIgnoreCase(d.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Department d = new Department();
                    d.setName("IT Department");
                    d.setStatus(DepartmentStatus.ACTIVE);
                    return departmentRepository.save(d);
                });

                User adminUser = new User();
        adminUser.setUsername("adminUser");
        adminUser.setEmail("adminUser@test.com");
        adminUser.setPassword("pass");
        adminUser.setRole(Role.ROLE_ADMIN);
        userRepository.save(adminUser);

        long ts = System.nanoTime();
        Employee adminEmp = saveEmp("EMP_ADMIN_" + ts, "Admin", "User", "adminUser@test.com", "9999" + ts%10000, EmployeeStatus.ACTIVE, Designation.ADMIN);
        empActive2  = saveEmp("EMP_T2_"+ts, "Alice",   "Smith",   "alice_"+ts+"@t.com",   "9000"+ts%10000, EmployeeStatus.ACTIVE,   Designation.SOFTWARE_ENGINEER);
        empActive3  = saveEmp("EMP_T3_"+ts, "Bob",     "Jones",   "bob_"+ts+"@t.com",     "9001"+ts%10000, EmployeeStatus.ACTIVE,   Designation.SENIOR_SOFTWARE_ENGINEER);
        empInactive = saveEmp("EMP_T4_"+ts, "Charlie", "Brown",   "charlie_"+ts+"@t.com", "9002"+ts%10000, EmployeeStatus.INACTIVE, Designation.INTERN);
        technicianA = saveEmp("EMP_T5_"+ts, "Tech",    "Alpha",   "techa_"+ts+"@t.com",   "9003"+ts%10000, EmployeeStatus.ACTIVE,   Designation.ADMIN);
        technicianB = saveEmp("EMP_T6_"+ts, "Tech",    "Beta",    "techb_"+ts+"@t.com",   "9004"+ts%10000, EmployeeStatus.ACTIVE,   Designation.ADMIN);

        assetAssignedToEmp2 = saveAsset("AST_T2_"+ts,"Dell 5540","SN-DL-"+ts, AssetStatus.ASSIGNED,  empActive2);
        assetAssignedToEmp3 = saveAsset("AST_T3_"+ts,"HP 840",   "SN-HP-"+ts, AssetStatus.ASSIGNED,  empActive3);
        assetAvailable      = saveAsset("AST_T4_"+ts,"ThinkPad", "SN-TP-"+ts, AssetStatus.AVAILABLE, null);
        assetRetired        = saveAsset("AST_T5_"+ts,"Old Mon",  "SN-OM-"+ts, AssetStatus.RETIRED,   null);

        assignmentEmp2 = assignmentRepository.save(Assignment.builder()
                .employee(empActive2).department(deptIT)
                .assignedAt(LocalDateTime.now()).status(AssignmentStatus.ACTIVE)
                .notes("Test Assignment").build());

        itemEmp2 = assignmentItemRepository.save(AssignmentItem.builder()
                .assignment(assignmentEmp2).asset(assetAssignedToEmp2)
                .status(AssignmentItemStatus.ASSIGNED).build());
    }

    private Employee saveEmp(String code,String fn,String ln,String email,String phone,
                              EmployeeStatus status,Designation des) {
        return employeeRepository.save(Employee.builder()
                .employeeCode(code).firstName(fn).lastName(ln)
                .email(email).phone(phone).status(status)
                .designation(des).department(deptIT).build());
    }

    private Asset saveAsset(String code,String name,String serial,AssetStatus status,Employee emp) {
        return assetRepository.save(Asset.builder()
                .assetCode(code).assetName(name).serialNumber(serial)
                .brand("Generic").model("Standard").description("Test")
                .purchaseDate(LocalDate.now().minusMonths(6))
                .purchaseCost(new BigDecimal("50000.00"))
                .warrantyExpiry(LocalDate.now().plusYears(2))
                .status(status).category(AssetCategory.LAPTOP)
                .department(deptIT).assignedEmployee(emp).build());
    }

    /** Unique issue code per call within same test */
    private MaintenanceIssue createTestIssue(Asset asset, Employee reporter) {
        String code = String.format("TST%04d%d", issueCounter.getAndIncrement(), Thread.currentThread().getId() % 9999);
        return issueRepository.save(MaintenanceIssue.builder()
                .issueCode(code).asset(asset).reportedBy(reporter)
                .title("Test Issue").description("Test description")
                .priority(IssuePriority.HIGH).status(IssueStatus.REPORTED)
                .reportedAt(LocalDateTime.now()).build());
    }

    /** Unique work order code per call within same test */
    private MaintenanceWorkOrder createTestWorkOrder(MaintenanceIssue issue, Employee tech) {
        String code = String.format("TWO%04d%d", woCounter.getAndIncrement(), Thread.currentThread().getId() % 9999);
        return workOrderRepository.save(MaintenanceWorkOrder.builder()
                .workOrderCode(code).maintenanceIssue(issue)
                .technician(tech).assignedBy(tech)
                .assignedAt(LocalDateTime.now())
                .status(WorkOrderStatus.PENDING_ACCEPTANCE).build());
    }

    // -----------------------------------------------------------------------
    // TEST 1
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("TEST 1: Employee creates issue for their own asset")
    void test1_reportIssueSuccess() throws Exception {
        String body = String.format("""
            {"assetId":%d,"reportedByEmployeeId":%d,
             "description":"Overheating","priority":"HIGH"}
            """, assetAssignedToEmp2.getId(), empActive2.getId());

        mockMvc.perform(post("/api/maintenance/issues")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.issueCode", startsWith("MNT")))
                .andExpect(jsonPath("$.assetId").value(assetAssignedToEmp2.getId()))
                .andExpect(jsonPath("$.reportedById").value(empActive2.getId()))
                .andExpect(jsonPath("$.status").value("REPORTED"))
                .andExpect(jsonPath("$.reportedAt", notNullValue()));
    }

    // -----------------------------------------------------------------------
    // TEST 4
    // -----------------------------------------------------------------------


    // -----------------------------------------------------------------------
    // TEST 5
    // -----------------------------------------------------------------------


    // -----------------------------------------------------------------------
    // TEST 6
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("TEST 6: Retired asset cannot enter maintenance")
    void test6_retiredAssetCannotEnterMaintenance() throws Exception {
        String body = String.format("""
            {"assetId":%d,"reportedByEmployeeId":%d,
             "description":"Retired asset","priority":"HIGH"}
            """, assetRetired.getId(), empActive2.getId());

        mockMvc.perform(post("/api/maintenance/issues")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("retired asset")));
    }

    // -----------------------------------------------------------------------
    // STEP 4
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 4: Manager assigns technician")
    void testStep4_assignTechnician() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);
        String body = String.format("""
            {"technicianId":%d,"instructions":"Check fan"}
            """, technicianA.getId(), empActive3.getId());

        mockMvc.perform(post("/api/maintenance/issues/"+issue.getId()+"/work-orders")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.workOrderCode", startsWith("WO")))
                .andExpect(jsonPath("$.status").value("PENDING_ACCEPTANCE"))
                .andExpect(jsonPath("$.technicianId").value(technicianA.getId()));
    }

    // -----------------------------------------------------------------------
    // TEST 8
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("TEST 8: Nonexistent technician returns 404, inactive technician returns 400")
    void test8_invalidTechnician() throws Exception {
        long initialCount = workOrderRepository.count();
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);

        mockMvc.perform(post("/api/maintenance/issues/"+issue.getId()+"/work-orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"technicianId\":99999}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Technician not found")));

        String inactiveBody = String.format("{\"technicianId\":%d}", empInactive.getId());
        mockMvc.perform(post("/api/maintenance/issues/"+issue.getId()+"/work-orders")
                        .contentType(MediaType.APPLICATION_JSON).content(inactiveBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("not active")));

        assertEquals(initialCount, workOrderRepository.count());
    }

    // -----------------------------------------------------------------------
    // STEP 5 + 6
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 5+6: Start work order, verify UNDER_MAINTENANCE and AssignmentItem stays ASSIGNED")
    void testStep5And6_startAndDuplicatePrevention() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianA);

        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.startedAt", notNullValue()));

        Asset updatedAsset = assetRepository.findById(assetAssignedToEmp2.getId()).orElseThrow();
        assertEquals(AssetStatus.UNDER_MAINTENANCE, updatedAsset.getStatus());
        assertEquals(empActive2.getId(), updatedAsset.getAssignedEmployee().getId());

        AssignmentItem item = assignmentItemRepository.findById(itemEmp2.getId()).orElseThrow();
        assertEquals(AssignmentItemStatus.ASSIGNED, item.getStatus());

        // Duplicate prevention: start again -> 400
        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/start"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("already in progress")));
    }

    // -----------------------------------------------------------------------
    // STEP 7
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 7: Technician rejects work order with reason")
    void testStep7_rejection() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianA);

        String body = "{\"reason\":\"Not qualified for motherboard repair.\"}";
        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/reject")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectionReason").value("Not qualified for motherboard repair."))
                .andExpect(jsonPath("$.technicianId").value(technicianA.getId()));

        MaintenanceWorkOrder saved = workOrderRepository.findById(wo.getId()).orElseThrow();
        assertEquals(WorkOrderStatus.REJECTED, saved.getStatus());
    }

    // -----------------------------------------------------------------------
    // TEST 10
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("TEST 10: Rejection with blank reason returns 400 and WO unchanged")
    void test10_blankReasonFails() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianA);

        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"\"}"))
                .andExpect(status().isBadRequest());

        MaintenanceWorkOrder saved = workOrderRepository.findById(wo.getId()).orElseThrow();
        // Work order was created with PENDING_ACCEPTANCE; must remain unchanged
        assertEquals(WorkOrderStatus.PENDING_ACCEPTANCE, saved.getStatus());
        assertNull(saved.getRejectionReason());
    }

    // -----------------------------------------------------------------------
    // TEST 11
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("TEST 11: REJECTED work order cannot be completed")
    void test11_rejectedCannotComplete() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianA);
        wo.setStatus(WorkOrderStatus.REJECTED);
        wo.setRejectionReason("Not qualified");
        workOrderRepository.save(wo);

        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resolutionNotes\":\"Trying to complete rejected\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Rejected work order cannot be completed")));
    }

    // -----------------------------------------------------------------------
    // STEP 8
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 8+16: Second technician, history preserved")
    void testStep8_historyPreserved() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);

        MaintenanceWorkOrder wo1 = createTestWorkOrder(issue, technicianA);
        wo1.setStatus(WorkOrderStatus.REJECTED);
        wo1.setRejectionReason("Not my specialization");
        workOrderRepository.save(wo1);

        String assignBody = String.format(
                "{\"technicianId\":%d,\"instructions\":\"Take over repair\"}", technicianB.getId());
        mockMvc.perform(post("/api/maintenance/issues/"+issue.getId()+"/work-orders")
                        .contentType(MediaType.APPLICATION_JSON).content(assignBody))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/maintenance/issues/"+issue.getId()+"/work-orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].technicianId").value(technicianA.getId()))
                .andExpect(jsonPath("$[0].status").value("REJECTED"))
                .andExpect(jsonPath("$[0].rejectionReason").value("Not my specialization"))
                .andExpect(jsonPath("$[1].technicianId").value(technicianB.getId()))
                .andExpect(jsonPath("$[1].status").value("PENDING_ACCEPTANCE"));
    }

    // -----------------------------------------------------------------------
    // STEP 9 + 10
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 9+10: Complete repair restores asset and preserves employee ownership")
    void testStep9And10_completeRepair() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianB);

        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/start"))
                .andExpect(status().isOk());

        String completeBody = """
            {"resolutionNotes":"Replaced motherboard successfully.","repairCost":1500.00}
            """;
        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/complete")
                        .contentType(MediaType.APPLICATION_JSON).content(completeBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.resolutionNotes").value("Replaced motherboard successfully."));

        Asset asset = assetRepository.findById(assetAssignedToEmp2.getId()).orElseThrow();
        assertEquals(AssetStatus.ASSIGNED, asset.getStatus());
        assertNotNull(asset.getAssignedEmployee());
        assertEquals(empActive2.getId(), asset.getAssignedEmployee().getId());

        AssignmentItem item = assignmentItemRepository.findById(itemEmp2.getId()).orElseThrow();
        assertEquals(AssignmentItemStatus.ASSIGNED, item.getStatus());
        assertNull(item.getReturnedAt());
    }

    // -----------------------------------------------------------------------
    // STEP 11 + 12
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 11+12: Mark NOT_REPAIRABLE and verify invalid re-transition")
    void testStep11And12_notRepairable() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp3, empActive3);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianB);

        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/start"))
                .andExpect(status().isOk());

        String nrBody = "{\"reason\":\"Motherboard damage beyond economical repair.\"}";
        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/not-repairable")
                        .contentType(MediaType.APPLICATION_JSON).content(nrBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NOT_REPAIRABLE"))
                .andExpect(jsonPath("$.rejectionReason").value("Motherboard damage beyond economical repair."));

        Asset asset = assetRepository.findById(assetAssignedToEmp3.getId()).orElseThrow();
        assertEquals(AssetStatus.UNDER_MAINTENANCE, asset.getStatus());

        // Invalid re-transition
        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/not-repairable")
                        .contentType(MediaType.APPLICATION_JSON).content(nrBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Cannot mark a NOT_REPAIRABLE work order")));
    }

    // -----------------------------------------------------------------------
    // STEP 13 + TEST 14
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 13+TEST 14: Manager RETIRE decision")
    void testStep13_retireDecision() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp3, empActive3);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianB);
        wo.setStatus(WorkOrderStatus.NOT_REPAIRABLE);
        wo.setRejectionReason("Water damage");
        workOrderRepository.save(wo);
        issue.setStatus(IssueStatus.NOT_REPAIRABLE);
        issueRepository.save(issue);

        String retireBody = "{\"decision\":\"RETIRE\",\"notes\":\"Severe liquid damage.\"}";
        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/decision")
                        .contentType(MediaType.APPLICATION_JSON).content(retireBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("NOT_REPAIRABLE"));

        Asset asset = assetRepository.findById(assetAssignedToEmp3.getId()).orElseThrow();
        assertEquals(AssetStatus.RETIRED, asset.getStatus());
        assertNull(asset.getAssignedEmployee());

        // TEST 14: manager decision on non-NOT_REPAIRABLE work order -> 400
        MaintenanceWorkOrder activeWo = createTestWorkOrder(issue, technicianA);
        mockMvc.perform(put("/api/maintenance/work-orders/"+activeWo.getId()+"/decision")
                        .contentType(MediaType.APPLICATION_JSON).content(retireBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Manager decision RETIRE can only be applied when status is NOT_REPAIRABLE")));
    }

    // -----------------------------------------------------------------------
    // STEP 15
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 15: Manager REPLACE decision")
    void testStep15_replaceDecision() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp3, empActive3);
        MaintenanceWorkOrder wo = createTestWorkOrder(issue, technicianB);
        wo.setStatus(WorkOrderStatus.NOT_REPAIRABLE);
        wo.setRejectionReason("Board burnt");
        workOrderRepository.save(wo);
        issue.setStatus(IssueStatus.NOT_REPAIRABLE);
        issueRepository.save(issue);

        String replaceBody = "{\"decision\":\"REPLACE\",\"notes\":\"Flagged for replacement.\"}";
        mockMvc.perform(put("/api/maintenance/work-orders/"+wo.getId()+"/decision")
                        .contentType(MediaType.APPLICATION_JSON).content(replaceBody))
                .andExpect(status().isOk());

        Asset asset = assetRepository.findById(assetAssignedToEmp3.getId()).orElseThrow();
        assertEquals(AssetStatus.RETIRED, asset.getStatus());
        assertNull(asset.getAssignedEmployee());

        MaintenanceIssue updated = issueRepository.findById(issue.getId()).orElseThrow();
        assertEquals(IssueStatus.RESOLVED_REPLACED, updated.getStatus());
    }

    // -----------------------------------------------------------------------
    // STEP 16
    // -----------------------------------------------------------------------
    @Test
    @DisplayName("STEP 16: Asset maintenance history shows both work orders")
    void testStep16_historyEndpoint() throws Exception {
        MaintenanceIssue issue = createTestIssue(assetAssignedToEmp2, empActive2);

        MaintenanceWorkOrder wo1 = createTestWorkOrder(issue, technicianA);
        wo1.setStatus(WorkOrderStatus.REJECTED);
        wo1.setRejectionReason("Not qualified");
        workOrderRepository.save(wo1);

        MaintenanceWorkOrder wo2 = createTestWorkOrder(issue, technicianB);
        wo2.setStatus(WorkOrderStatus.COMPLETED);
        wo2.setResolutionNotes("Fixed fan");
        workOrderRepository.save(wo2);

        // Flush pending writes then clear the L1 cache so the subsequent
        // MockMvc request sees the committed state rather than the stale
        // in-memory issue entity (which has an empty workOrders collection).
        em.flush();
        em.clear();

        mockMvc.perform(get("/api/maintenance/assets/"+assetAssignedToEmp2.getId()+"/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetId").value(assetAssignedToEmp2.getId()))
                .andExpect(jsonPath("$.totalIssues").value(1))
                .andExpect(jsonPath("$.issues[0].workOrders", hasSize(2)))
                .andExpect(jsonPath("$.issues[0].workOrders[0].status").value("REJECTED"))
                .andExpect(jsonPath("$.issues[0].workOrders[1].status").value("COMPLETED"));
    }
}