package com.assetmanagement.vendor.controller;

import com.assetmanagement.vendor.dto.VendorRequest;
import com.assetmanagement.vendor.dto.VendorResponse;
import com.assetmanagement.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    public ResponseEntity<VendorResponse> createVendor(
            @Valid @RequestBody VendorRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(vendorService.createVendor(request));
    }

    @GetMapping
    public ResponseEntity<List<VendorResponse>> getAllVendors() {

        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorResponse> getVendorById(
            @PathVariable Long id) {

        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorResponse> updateVendor(
            @PathVariable Long id,
            @Valid @RequestBody VendorRequest request) {

        return ResponseEntity.ok(vendorService.updateVendor(id, request));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<VendorResponse> activateVendor(
            @PathVariable Long id) {

        return ResponseEntity.ok(vendorService.activateVendor(id));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<VendorResponse> deactivateVendor(
            @PathVariable Long id) {

        return ResponseEntity.ok(vendorService.deactivateVendor(id));
    }

    // NOTE: DELETE endpoint intentionally omitted.
    // Vendors are deactivated, never deleted.
}
