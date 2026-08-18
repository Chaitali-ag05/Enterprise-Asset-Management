package com.assetmanagement.maintenance.repository;

import com.assetmanagement.maintenance.entity.MaintenanceWorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceWorkOrderRepository extends JpaRepository<MaintenanceWorkOrder, Long> {

    Optional<MaintenanceWorkOrder> findTopByOrderByIdDesc();

    /** Used by code generator: only looks at WO-prefixed codes, ignoring test-inserted codes. */
    Optional<MaintenanceWorkOrder> findTopByWorkOrderCodeStartingWithOrderByIdDesc(String prefix);

    List<MaintenanceWorkOrder> findByTechnicianIdOrderByAssignedAtDesc(Long technicianId);

    List<MaintenanceWorkOrder> findByMaintenanceIssueIdOrderByIdAsc(Long issueId);
}
