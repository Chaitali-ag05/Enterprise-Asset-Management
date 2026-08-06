package com.assetmanagement.department.service.impl;

import com.assetmanagement.common.exception.DuplicateResourceException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.department.dto.request.DepartmentRequest;
import com.assetmanagement.department.dto.response.DepartmentResponse;
import com.assetmanagement.department.entity.Department;
import com.assetmanagement.department.enums.DepartmentStatus;
import com.assetmanagement.department.mapper.DepartmentMapper;
import com.assetmanagement.department.repository.DepartmentRepository;
import com.assetmanagement.department.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    public DepartmentResponse createDepartment(DepartmentRequest request) {

        String name = request.name().trim();

        if (departmentRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Department already exists");
        }

        Department department = departmentMapper.toEntity(request);
        department.setName(name);
        department.setStatus(DepartmentStatus.ACTIVE);

        return departmentMapper.toResponse(
                departmentRepository.save(department)
        );
    }

    @Override
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(departmentMapper::toResponse)
                .toList();
    }

    @Override
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        return departmentMapper.toResponse(department);
    }

    @Override
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {

        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        String name = request.name().trim();

        if (!existing.getName().equalsIgnoreCase(name)
                && departmentRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Department already exists");
        }

        existing.setName(name);

        return departmentMapper.toResponse(
                departmentRepository.save(existing)
        );
    }

    @Override
    public void deactivateDepartment(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        department.setStatus(DepartmentStatus.INACTIVE);

        departmentRepository.save(department);
    }
}