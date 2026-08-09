package com.assetmanagement.asset.assignment.repository;

import com.assetmanagement.asset.assignment.entity.Assignment;
import com.assetmanagement.asset.assignment.entity.AssignmentItem;
import com.assetmanagement.asset.assignment.enums.AssignmentItemStatus;
import com.assetmanagement.asset.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentItemRepository extends JpaRepository<AssignmentItem, Long> {

    Optional<AssignmentItem> findByAssetAndStatus(Asset asset, AssignmentItemStatus status);

    List<AssignmentItem> findByAssignmentOrderByIdAsc(Assignment assignment);
}
