package com.assetmanagement.asset.service;

import com.assetmanagement.asset.dto.AssetRequest;
import com.assetmanagement.asset.dto.AssetResponse;

import java.util.List;

public interface AssetService {

    AssetResponse createAsset(AssetRequest request);

    AssetResponse getAssetById(Long id);

    List<AssetResponse> getAllAssets();

    List<AssetResponse> getAssetsByEmployeeId(Long employeeId);

    AssetResponse updateAsset(Long id, AssetRequest request);

    void deleteAsset(Long id);
}