package com.assetmanagement.asset.assignment.repository;

import com.assetmanagement.asset.assignment.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByEmployeeIdOrderByIdDesc(Long employeeId);
}
