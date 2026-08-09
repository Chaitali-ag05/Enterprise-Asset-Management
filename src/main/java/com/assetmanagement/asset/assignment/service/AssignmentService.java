package com.assetmanagement.asset.assignment.service;

import com.assetmanagement.asset.assignment.dto.AssignmentItemResponse;
import com.assetmanagement.asset.assignment.dto.AssignmentRequest;
import com.assetmanagement.asset.assignment.dto.AssignmentResponse;

import java.util.List;

public interface AssignmentService {

    AssignmentResponse createAssignment(AssignmentRequest request);

    AssignmentResponse getAssignmentById(Long id);

    List<AssignmentResponse> getAllAssignments();

    AssignmentResponse returnAssignmentItem(Long assignmentId, Long itemId, String remarks);

    List<AssignmentItemResponse> getAssignmentItems(Long assignmentId);
}
