package com.assetmanagement.asset.assignment.controller;
import org.springframework.security.access.prepost.PreAuthorize;

import com.assetmanagement.asset.assignment.dto.AssignmentItemResponse;
import com.assetmanagement.asset.assignment.dto.AssignmentRequest;
import com.assetmanagement.asset.assignment.dto.AssignmentResponse;
import com.assetmanagement.asset.assignment.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final com.assetmanagement.auth.service.IdentityService identityService;

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assignmentService.createAssignment(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentById(id)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')") // Fix IDOR #4: Prevent employees from scraping all assignments
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments() {

        return ResponseEntity.ok(
                assignmentService.getAllAssignments()
        );
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'TECHNICIAN')")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByEmployee(
            @PathVariable Long employeeId) {
        
        identityService.verifyEmployeeMatch(employeeId);
        return ResponseEntity.ok(
                assignmentService.getAssignmentsByEmployeeId(employeeId)
        );
    }

    @PutMapping("/{assignmentId}/items/{itemId}/return")
    public ResponseEntity<AssignmentResponse> returnAssignmentItem(
            @PathVariable Long assignmentId,
            @PathVariable Long itemId,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                assignmentService.returnAssignmentItem(assignmentId, itemId, remarks)
        );
    }

    @GetMapping("/{assignmentId}/items")
    public ResponseEntity<List<AssignmentItemResponse>> getAssignmentItems(
            @PathVariable Long assignmentId) {

        return ResponseEntity.ok(
                assignmentService.getAssignmentItems(assignmentId)
        );
    }
}




