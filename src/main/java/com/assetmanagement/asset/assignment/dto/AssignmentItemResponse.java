package com.assetmanagement.asset.assignment.dto;

import com.assetmanagement.asset.assignment.enums.AssignmentItemStatus;

import java.time.LocalDateTime;

public record AssignmentItemResponse(
        Long id,
        Long assetId,
        String assetCode,
        String assetName,
        AssignmentItemStatus status,
        LocalDateTime returnedAt,
        String remarks
) {
}
