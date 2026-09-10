package com.scaleguard.controller;

import com.scaleguard.dto.VerificationApplicationCreateRequest;
import com.scaleguard.dto.VerificationApplicationResponse;
import com.scaleguard.dto.VerificationApplicationUpdateRequest;
import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.ApplicationType;
import com.scaleguard.service.VerificationApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/verification-applications")
@PreAuthorize("hasRole('BUSINESS_OWNER')")
public class VerificationApplicationController {

    private final VerificationApplicationService applicationService;

    public VerificationApplicationController(VerificationApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<VerificationApplicationResponse> createApplication(
            @Valid @RequestBody VerificationApplicationCreateRequest request
    ) {
        VerificationApplicationResponse response = applicationService.createApplication(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VerificationApplicationResponse>> getMyApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) ApplicationType applicationType,
            @RequestParam(required = false) Long instrumentId,
            @RequestParam(required = false) String search
    ) {
        List<VerificationApplicationResponse> response = applicationService.getMyApplications(
                status, applicationType, instrumentId, search
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VerificationApplicationResponse> getMyApplicationById(@PathVariable Long id) {
        VerificationApplicationResponse response = applicationService.getMyApplicationById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VerificationApplicationResponse> updateDraftApplication(
            @PathVariable Long id,
            @Valid @RequestBody VerificationApplicationUpdateRequest request
    ) {
        VerificationApplicationResponse response = applicationService.updateDraftApplication(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/submit")
    public ResponseEntity<VerificationApplicationResponse> submitApplication(@PathVariable Long id) {
        VerificationApplicationResponse response = applicationService.submitApplication(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDraftApplication(@PathVariable Long id) {
        applicationService.deleteDraftApplication(id);
        return ResponseEntity.noContent().build();
    }
}
