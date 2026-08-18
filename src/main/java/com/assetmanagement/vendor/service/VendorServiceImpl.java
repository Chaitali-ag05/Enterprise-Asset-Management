package com.assetmanagement.vendor.service;

import com.assetmanagement.common.exception.BadRequestException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.vendor.dto.VendorRequest;
import com.assetmanagement.vendor.dto.VendorResponse;
import com.assetmanagement.vendor.entity.Vendor;
import com.assetmanagement.vendor.enums.VendorStatus;
import com.assetmanagement.vendor.mapper.VendorMapper;
import com.assetmanagement.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final VendorMapper vendorMapper;

    @Override
    public VendorResponse createVendor(VendorRequest request) {

        String name = request.name().trim();

        if (vendorRepository.existsByNameIgnoreCase(name)) {
            throw new BadRequestException("Vendor with this name already exists.");
        }

        Vendor vendor = vendorMapper.toEntity(request);
        vendor.setName(name);
        vendor.setStatus(VendorStatus.ACTIVE);

        return vendorMapper.toResponse(vendorRepository.save(vendor));
    }

    @Override
    @Transactional(readOnly = true)
    public VendorResponse getVendorById(Long id) {

        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found."));

        return vendorMapper.toResponse(vendor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponse> getAllVendors() {

        return vendorRepository.findAll()
                .stream()
                .map(vendorMapper::toResponse)
                .toList();
    }

    @Override
    public VendorResponse updateVendor(Long id, VendorRequest request) {

        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found."));

        String name = request.name().trim();

        // Allow same name; reject only if another vendor already uses this name
        if (!vendor.getName().equalsIgnoreCase(name)
                && vendorRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BadRequestException("Vendor with this name already exists.");
        }

        vendor.setName(name);
        vendor.setContactPerson(request.contactPerson());
        vendor.setEmail(request.email());
        vendor.setPhone(request.phone());
        vendor.setAddress(request.address());
        // Status is NOT changed via updateVendor — use activate/deactivate

        return vendorMapper.toResponse(vendorRepository.save(vendor));
    }

    @Override
    public VendorResponse activateVendor(Long id) {

        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found."));

        vendor.setStatus(VendorStatus.ACTIVE);

        return vendorMapper.toResponse(vendorRepository.save(vendor));
    }

    @Override
    public VendorResponse deactivateVendor(Long id) {

        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found."));

        vendor.setStatus(VendorStatus.INACTIVE);

        // Deactivation does NOT touch existing assets linked to this vendor.
        // Assets retain their vendor reference regardless of vendor status.

        return vendorMapper.toResponse(vendorRepository.save(vendor));
    }
}
