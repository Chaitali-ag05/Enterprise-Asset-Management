package com.assetmanagement.maintenance.repository;

import com.assetmanagement.maintenance.entity.MaintenanceIssue;
import com.assetmanagement.maintenance.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceIssueRepository extends JpaRepository<MaintenanceIssue, Long> {

    Optional<MaintenanceIssue> findTopByOrderByIdDesc();

    /**
     * Fetches all issues for an asset and eagerly loads work orders via JOIN FETCH.
     * This avoids LazyInitializationException and ensures the history response
     * reflects the current database state (not the stale in-memory collection).
     */
    @Query("SELECT DISTINCT i FROM MaintenanceIssue i " +
           "LEFT JOIN FETCH i.workOrders " +
           "WHERE i.asset.id = :assetId " +
           "ORDER BY i.reportedAt DESC")
    List<MaintenanceIssue> findByAssetIdWithWorkOrdersOrderByReportedAtDesc(@Param("assetId") Long assetId);

    List<MaintenanceIssue> findByAssetIdOrderByReportedAtDesc(Long assetId);

    List<MaintenanceIssue> findByStatus(IssueStatus status);

    List<MaintenanceIssue> findByReportedByIdOrderByReportedAtDesc(Long employeeId);
}
