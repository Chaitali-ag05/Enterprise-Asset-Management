package com.assetmanagement.maintenance.dto.response;

import java.util.List;

/**
 * Complete maintenance history for a single asset.
 * Contains all issues ever reported for the asset, each with its full work order history.
 */
public record MaintenanceHistoryResponse(

        Long assetId,
        String assetCode,
        String assetName,
        String assetStatus,

        int totalIssues,
        List<MaintenanceIssueResponse> issues

) {}
