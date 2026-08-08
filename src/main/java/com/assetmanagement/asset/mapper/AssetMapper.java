package com.assetmanagement.asset.mapper;

import com.assetmanagement.asset.dto.AssetResponse;
import com.assetmanagement.asset.entity.Asset;
import org.springframework.stereotype.Component;

@Component
public class AssetMapper {

    public AssetResponse toResponse(Asset asset) {

        return new AssetResponse(

                asset.getId(),

                asset.getAssetCode(),

                asset.getAssetName(),

                asset.getSerialNumber(),

                asset.getBrand(),

                asset.getModel(),

                asset.getDescription(),

                asset.getPurchaseDate(),

                asset.getPurchaseCost(),

                asset.getWarrantyExpiry(),

                asset.getStatus(),

                asset.getCategory(),

                asset.getDepartment().getId(),

                asset.getDepartment().getName(),

                asset.getAssignedEmployee() != null
                        ? asset.getAssignedEmployee().getId()
                        : null,

                asset.getAssignedEmployee() != null
                        ? asset.getAssignedEmployee().getFirstName()
                        + " "
                        + asset.getAssignedEmployee().getLastName()
                        : null
        );
    }
}