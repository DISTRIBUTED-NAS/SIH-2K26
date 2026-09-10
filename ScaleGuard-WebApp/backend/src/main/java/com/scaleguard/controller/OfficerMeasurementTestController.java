package com.scaleguard.controller;

import com.scaleguard.dto.*;
import com.scaleguard.entity.User;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.UserRepository;
import com.scaleguard.service.MeasurementTestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/officer")
@PreAuthorize("hasRole('LMO_OFFICER')")
public class OfficerMeasurementTestController {

    private final MeasurementTestService measurementTestService;
    private final UserRepository userRepository;

    public OfficerMeasurementTestController(MeasurementTestService measurementTestService, UserRepository userRepository) {
        this.measurementTestService = measurementTestService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found in security context");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @PostMapping("/inspections/{inspectionId}/measurement-tests/start")
    public ResponseEntity<MeasurementTestSessionResponse> startMeasurementTest(@PathVariable Long inspectionId) {
        User user = getAuthenticatedUser();
        MeasurementTestSessionResponse response = measurementTestService.startMeasurementTest(inspectionId, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/inspections/{inspectionId}/measurement-tests")
    public ResponseEntity<MeasurementTestSessionResponse> getMeasurementTestByInspectionId(@PathVariable Long inspectionId) {
        User user = getAuthenticatedUser();
        MeasurementTestSessionResponse response = measurementTestService.getMeasurementTestByInspectionId(inspectionId, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/measurement-tests/{sessionId}/records")
    public ResponseEntity<MeasurementTestRecordResponse> addTestRecord(
            @PathVariable Long sessionId,
            @Valid @RequestBody MeasurementTestRecordCreateRequest request) {
        User user = getAuthenticatedUser();
        MeasurementTestRecordResponse response = measurementTestService.addTestRecord(sessionId, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/measurement-tests/records/{recordId}")
    public ResponseEntity<MeasurementTestRecordResponse> updateTestRecord(
            @PathVariable Long recordId,
            @Valid @RequestBody MeasurementTestRecordUpdateRequest request) {
        User user = getAuthenticatedUser();
        MeasurementTestRecordResponse response = measurementTestService.updateTestRecord(recordId, request, user.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/measurement-tests/records/{recordId}")
    public ResponseEntity<Void> deleteTestRecord(@PathVariable Long recordId) {
        User user = getAuthenticatedUser();
        measurementTestService.deleteTestRecord(recordId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/measurement-tests/{sessionId}/remarks")
    public ResponseEntity<MeasurementTestSessionResponse> updateOverallRemarks(
            @PathVariable Long sessionId,
            @Valid @RequestBody MeasurementTestRemarksUpdateRequest request) {
        User user = getAuthenticatedUser();
        MeasurementTestSessionResponse response = measurementTestService.updateOverallRemarks(sessionId, request, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/measurement-tests/{sessionId}/complete")
    public ResponseEntity<MeasurementTestSessionResponse> completeMeasurementTest(@PathVariable Long sessionId) {
        User user = getAuthenticatedUser();
        MeasurementTestSessionResponse response = measurementTestService.completeMeasurementTest(sessionId, user.getId());
        return ResponseEntity.ok(response);
    }
}
