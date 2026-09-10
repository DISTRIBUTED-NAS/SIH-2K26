package com.scaleguard.controller;

import com.scaleguard.dto.AdminVerificationApplicationResponse;
import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.ApplicationType;
import com.scaleguard.service.VerificationApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/verification-applications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVerificationApplicationController {

    private final VerificationApplicationService applicationService;

    public AdminVerificationApplicationController(VerificationApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<List<AdminVerificationApplicationResponse>> getAllApplications(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) ApplicationType applicationType,
            @RequestParam(required = false) Long businessId,
            @RequestParam(required = false) Long instrumentId,
            @RequestParam(required = false) String search
    ) {
        List<AdminVerificationApplicationResponse> response = applicationService.getAllApplicationsForAdmin(
                status, applicationType, businessId, instrumentId, search
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminVerificationApplicationResponse> getApplicationById(@PathVariable Long id) {
        AdminVerificationApplicationResponse response = applicationService.getApplicationByIdForAdmin(id);
        return ResponseEntity.ok(response);
    }
}
