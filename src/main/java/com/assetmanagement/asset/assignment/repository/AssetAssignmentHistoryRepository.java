package com.assetmanagement.asset.assignment.repository;

import com.assetmanagement.asset.assignment.entity.AssetAssignmentHistory;
import com.assetmanagement.asset.assignment.enums.AssignmentStatus;
import com.assetmanagement.asset.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetAssignmentHistoryRepository
        extends JpaRepository<AssetAssignmentHistory, Long> {

    Optional<AssetAssignmentHistory> findByAssetAndAssignmentStatus(
            Asset asset,
            AssignmentStatus status
    );

    List<AssetAssignmentHistory> findByAssetOrderByAssignedAtDesc(
            Asset asset
    );
}