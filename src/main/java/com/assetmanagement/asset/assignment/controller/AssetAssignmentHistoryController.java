package com.assetmanagement.asset.assignment.controller;

import com.assetmanagement.asset.assignment.dto.AssignmentRequest;
import com.assetmanagement.asset.assignment.dto.AssignmentResponse;
import com.assetmanagement.asset.assignment.service.AssetAssignmentHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetAssignmentHistoryController {

    private final AssetAssignmentHistoryService assignmentHistoryService;

    @PostMapping("/{assetId}/assign")
    public ResponseEntity<AssignmentResponse> assignAsset(
            @PathVariable Long assetId,
            @Valid @RequestBody AssignmentRequest request) {

        return ResponseEntity.ok(
                assignmentHistoryService.assignAsset(assetId, request)
        );
    }

    @PutMapping("/{assetId}/return")
    public ResponseEntity<AssignmentResponse> returnAsset(
            @PathVariable Long assetId,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                assignmentHistoryService.returnAsset(
                        assetId,
                        remarks
                )
        );
    }

    @GetMapping("/{assetId}/assignment-history")
    public ResponseEntity<List<AssignmentResponse>> getAssetHistory(
            @PathVariable Long assetId) {

        return ResponseEntity.ok(
                assignmentHistoryService.getAssetHistory(assetId)
        );
    }
}