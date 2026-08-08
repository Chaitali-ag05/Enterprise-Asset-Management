package com.assetmanagement.asset.assignment.service;

import com.assetmanagement.asset.assignment.dto.AssignmentRequest;
import com.assetmanagement.asset.assignment.dto.AssignmentResponse;

import java.util.List;

public interface AssetAssignmentHistoryService {

    AssignmentResponse assignAsset(
            Long assetId,
            AssignmentRequest request
    );

    AssignmentResponse returnAsset(
            Long assetId,
            String remarks
    );

    List<AssignmentResponse> getAssetHistory(
            Long assetId
    );
}