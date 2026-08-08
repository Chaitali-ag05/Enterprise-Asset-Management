package com.assetmanagement.asset.controller;

import com.assetmanagement.asset.dto.AssetRequest;
import com.assetmanagement.asset.dto.AssetResponse;
import com.assetmanagement.asset.service.AssetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<AssetResponse> createAsset(
            @Valid @RequestBody AssetRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assetService.createAsset(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponse> getAssetById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                assetService.getAssetById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<AssetResponse>> getAllAssets() {

        return ResponseEntity.ok(
                assetService.getAllAssets()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest request) {

        return ResponseEntity.ok(
                assetService.updateAsset(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable Long id) {

        assetService.deleteAsset(id);

        return ResponseEntity.noContent().build();
    }
}