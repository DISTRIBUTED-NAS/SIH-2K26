package com.scaleguard.controller;

import com.scaleguard.dto.*;
import com.scaleguard.entity.User;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.UserRepository;
import com.scaleguard.service.InspectionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/officer")
@PreAuthorize("hasRole('LMO_OFFICER')")
public class OfficerInspectionController {

    private final InspectionService inspectionService;
    private final UserRepository userRepository;

    public OfficerInspectionController(InspectionService inspectionService, UserRepository userRepository) {
        this.inspectionService = inspectionService;
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

    @PostMapping("/verification-applications/{applicationId}/inspection")
    public ResponseEntity<InspectionResponse> createInspection(
            @PathVariable Long applicationId,
            @Valid @RequestBody InspectionCreateRequest request) {
        User user = getAuthenticatedUser();
        InspectionResponse response = inspectionService.createInspection(applicationId, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/inspections")
    public ResponseEntity<List<InspectionSummaryResponse>> getMyInspections(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        User user = getAuthenticatedUser();
        List<InspectionSummaryResponse> response = inspectionService.getMyInspections(user.getId(), status, search, fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inspections/{id}")
    public ResponseEntity<InspectionDetailsResponse> getMyInspectionById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        InspectionDetailsResponse response = inspectionService.getMyInspectionById(id, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/inspections/{id}/start")
    public ResponseEntity<InspectionResponse> startInspection(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        InspectionResponse response = inspectionService.startInspection(id, user.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/inspections/{id}/notes")
    public ResponseEntity<InspectionResponse> updateInspectionNotes(
            @PathVariable Long id,
            @Valid @RequestBody InspectionNotesUpdateRequest request) {
        User user = getAuthenticatedUser();
        InspectionResponse response = inspectionService.updateInspectionNotes(id, request, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/inspections/{id}/complete")
    public ResponseEntity<InspectionResponse> completeInspection(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        InspectionResponse response = inspectionService.completeInspection(id, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/inspections/{id}/cancel")
    public ResponseEntity<InspectionResponse> cancelInspection(
            @PathVariable Long id,
            @Valid @RequestBody InspectionCancelRequest request) {
        User user = getAuthenticatedUser();
        InspectionResponse response = inspectionService.cancelInspection(id, request, user.getId());
        return ResponseEntity.ok(response);
    }
}
