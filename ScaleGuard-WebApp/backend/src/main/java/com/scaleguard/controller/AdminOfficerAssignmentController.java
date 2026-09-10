package com.scaleguard.controller;

import com.scaleguard.dto.OfficerAssignmentRequest;
import com.scaleguard.dto.OfficerAssignmentResponse;
import com.scaleguard.service.OfficerAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/verification-applications/{applicationId}/assign-officer")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOfficerAssignmentController {

    private final OfficerAssignmentService officerAssignmentService;

    public AdminOfficerAssignmentController(OfficerAssignmentService officerAssignmentService) {
        this.officerAssignmentService = officerAssignmentService;
    }

    @PostMapping
    public ResponseEntity<OfficerAssignmentResponse> assignOfficer(
            @PathVariable Long applicationId,
            @Valid @RequestBody OfficerAssignmentRequest request
    ) {
        OfficerAssignmentResponse response = officerAssignmentService.assignOfficer(applicationId, request.getOfficerId());
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<OfficerAssignmentResponse> reassignOfficer(
            @PathVariable Long applicationId,
            @Valid @RequestBody OfficerAssignmentRequest request
    ) {
        OfficerAssignmentResponse response = officerAssignmentService.reassignOfficer(applicationId, request.getOfficerId());
        return ResponseEntity.ok(response);
    }
}
