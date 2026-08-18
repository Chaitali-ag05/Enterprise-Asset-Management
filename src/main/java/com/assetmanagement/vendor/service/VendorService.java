package com.assetmanagement.vendor.service;

import com.assetmanagement.vendor.dto.VendorRequest;
import com.assetmanagement.vendor.dto.VendorResponse;

import java.util.List;

public interface VendorService {

    VendorResponse createVendor(VendorRequest request);

    VendorResponse getVendorById(Long id);

    List<VendorResponse> getAllVendors();

    VendorResponse updateVendor(Long id, VendorRequest request);

    VendorResponse activateVendor(Long id);

    VendorResponse deactivateVendor(Long id);
}
