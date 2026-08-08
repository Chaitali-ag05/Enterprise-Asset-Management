package com.assetmanagement.asset.assignment.mapper;

import com.assetmanagement.asset.assignment.dto.AssignmentResponse;
import com.assetmanagement.asset.assignment.entity.AssetAssignmentHistory;
import org.springframework.stereotype.Component;

@Component
public class AssetAssignmentHistoryMapper {

    public AssignmentResponse toResponse(
            AssetAssignmentHistory history) {

        return new AssignmentResponse(
                history.getId(),

                history.getAsset().getId(),
                history.getAsset().getAssetCode(),

                history.getEmployee().getId(),
                history.getEmployee().getFirstName()
                        + " "
                        + history.getEmployee().getLastName(),

                history.getDepartment().getId(),
                history.getDepartment().getName(),

                history.getAssignedAt(),
                history.getAssignmentStatus(),
                history.getReturnedAt(),
                history.getRemarks()
        );
    }
}