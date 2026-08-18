package com.assetmanagement.asset.service;

import com.assetmanagement.asset.dto.AssetRequest;
import com.assetmanagement.asset.dto.AssetResponse;
import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.enums.AssetStatus;
import com.assetmanagement.asset.mapper.AssetMapper;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.common.exception.BadRequestException;
import com.assetmanagement.common.exception.DuplicateResourceException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.department.entity.Department;
import com.assetmanagement.department.repository.DepartmentRepository;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.entity.EmployeeStatus.EmployeeStatus;
import com.assetmanagement.employee.repository.EmployeeRepository;
import com.assetmanagement.vendor.entity.Vendor;
import com.assetmanagement.vendor.enums.VendorStatus;
import com.assetmanagement.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final VendorRepository vendorRepository;
    private final AssetMapper assetMapper;

    @Override
    public AssetResponse createAsset(AssetRequest request) {

        validatePurchaseDates(request);

        if (assetRepository.existsBySerialNumber(request.serialNumber())) {
            throw new DuplicateResourceException(
                    "Serial number already exists."
            );
        }

        Department department = getDepartment(request.departmentId());

        Employee employee = getAssignedEmployee(request.assignedEmployeeId());

        // vendorId is required when creating an asset
        if (request.vendorId() == null) {
            throw new BadRequestException("Vendor is required when creating an asset.");
        }
        Vendor vendor = getActiveVendor(request.vendorId());

        AssetStatus status = employee != null
                ? AssetStatus.ASSIGNED
                : AssetStatus.AVAILABLE;

        Asset asset = Asset.builder()
                .assetCode(generateAssetCode())
                .assetName(request.assetName())
                .serialNumber(request.serialNumber())
                .brand(request.brand())
                .model(request.model())
                .description(request.description())
                .purchaseDate(request.purchaseDate())
                .purchaseCost(request.purchaseCost())
                .warrantyExpiry(request.warrantyExpiry())
                .status(status)
                .category(request.category())
                .department(department)
                .assignedEmployee(employee)
                .vendor(vendor)
                .build();

        Asset savedAsset = assetRepository.save(asset);

        return assetMapper.toResponse(savedAsset);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponse getAssetById(Long id) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Asset not found."));

        return assetMapper.toResponse(asset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssetResponse> getAllAssets() {

        return assetRepository.findByStatusNot(AssetStatus.RETIRED)
                .stream()
                .map(assetMapper::toResponse)
                .toList();
    }

    @Override
    public AssetResponse updateAsset(Long id, AssetRequest request) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Asset not found."));

        if (asset.getStatus() == AssetStatus.RETIRED) {
            throw new BadRequestException(
                    "Retired assets cannot be updated."
            );
        }

        validatePurchaseDates(request);

        if (assetRepository.existsBySerialNumberAndIdNot(
                request.serialNumber(), id)) {

            throw new DuplicateResourceException(
                    "Serial number already exists."
            );
        }

        Department department = getDepartment(request.departmentId());

        Employee employee =
                getAssignedEmployee(request.assignedEmployeeId());

        AssetStatus status = employee != null
                ? AssetStatus.ASSIGNED
                : AssetStatus.AVAILABLE;

        asset.setAssetName(request.assetName());
        asset.setSerialNumber(request.serialNumber());
        asset.setBrand(request.brand());
        asset.setModel(request.model());
        asset.setDescription(request.description());
        asset.setPurchaseDate(request.purchaseDate());
        asset.setPurchaseCost(request.purchaseCost());
        asset.setWarrantyExpiry(request.warrantyExpiry());
        asset.setCategory(request.category());
        asset.setDepartment(department);
        asset.setAssignedEmployee(employee);
        asset.setStatus(status);
        // vendor is intentionally NOT updated here.
        // Once an asset is created with a vendor, the vendor cannot be changed.

        return assetMapper.toResponse(assetRepository.save(asset));
    }

    @Override
    public void deleteAsset(Long id) {

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Asset not found."));

        if (asset.getStatus() == AssetStatus.RETIRED) {
            throw new BadRequestException(
                    "Asset is already retired."
            );
        }

        asset.setAssignedEmployee(null);
        asset.setStatus(AssetStatus.RETIRED);

        assetRepository.save(asset);
    }

    private Department getDepartment(Long departmentId) {

        return departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found."
                        ));
    }

    private Employee getAssignedEmployee(Long employeeId) {

        if (employeeId == null) {
            return null;
        }

        return employeeRepository
                .findByIdAndStatus(
                        employeeId,
                        EmployeeStatus.ACTIVE
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Active employee not found."
                        ));
    }

    private Vendor getActiveVendor(Long vendorId) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Vendor not found."));

        if (vendor.getStatus() != VendorStatus.ACTIVE) {
            throw new BadRequestException(
                    "An INACTIVE vendor cannot be assigned to a new asset."
            );
        }

        return vendor;
    }

    private void validatePurchaseDates(AssetRequest request) {

        if (request.purchaseDate().isAfter(LocalDate.now())) {
            throw new BadRequestException(
                    "Purchase date cannot be in the future."
            );
        }

        if (request.warrantyExpiry()
                .isBefore(request.purchaseDate())) {

            throw new BadRequestException(
                    "Warranty expiry cannot be before purchase date."
            );
        }
    }

    private String generateAssetCode() {

        Asset lastAsset = assetRepository
                .findTopByOrderByIdDesc()
                .orElse(null);

        if (lastAsset == null) {
            return "AST0001";
        }

        String lastCode = lastAsset.getAssetCode();

        int lastNumber = Integer.parseInt(
                lastCode.substring(3)
        );

        return String.format(
                "AST%04d",
                lastNumber + 1
        );
    }
}