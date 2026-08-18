package com.assetmanagement.vendor.mapper;

import com.assetmanagement.vendor.dto.VendorRequest;
import com.assetmanagement.vendor.dto.VendorResponse;
import com.assetmanagement.vendor.entity.Vendor;
import org.springframework.stereotype.Component;

@Component
public class VendorMapper {

    public VendorResponse toResponse(Vendor vendor) {
        return new VendorResponse(
                vendor.getId(),
                vendor.getName(),
                vendor.getContactPerson(),
                vendor.getEmail(),
                vendor.getPhone(),
                vendor.getAddress(),
                vendor.getStatus(),
                vendor.getCreatedAt(),
                vendor.getUpdatedAt()
        );
    }

    public Vendor toEntity(VendorRequest request) {
        return Vendor.builder()
                .name(request.name().trim())
                .contactPerson(request.contactPerson())
                .email(request.email())
                .phone(request.phone())
                .address(request.address())
                .build();
    }
}
