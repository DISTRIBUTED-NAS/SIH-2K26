package com.scaleguard.controller;

import com.scaleguard.dto.OfficerApplicationResponse;
import com.scaleguard.dto.OfficerProfileResponse;
import com.scaleguard.entity.User;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.UserRepository;
import com.scaleguard.service.OfficerAssignmentService;
import com.scaleguard.service.OfficerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/officer")
@PreAuthorize("hasRole('LMO_OFFICER')")
public class OfficerController {

    private final OfficerService officerService;
    private final OfficerAssignmentService officerAssignmentService;
    private final UserRepository userRepository;

    public OfficerController(OfficerService officerService,
                             OfficerAssignmentService officerAssignmentService,
                             UserRepository userRepository) {
        this.officerService = officerService;
        this.officerAssignmentService = officerAssignmentService;
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

    @GetMapping("/profile")
    public ResponseEntity<OfficerProfileResponse> getProfile() {
        User user = getAuthenticatedUser();
        OfficerProfileResponse response = officerService.getOfficerProfile(user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verification-applications")
    public ResponseEntity<List<OfficerApplicationResponse>> getAssignedApplications() {
        User user = getAuthenticatedUser();
        List<OfficerApplicationResponse> response = officerAssignmentService.getAssignedApplicationsForOfficer(user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verification-applications/{id}")
    public ResponseEntity<OfficerApplicationResponse> getApplicationDetails(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        OfficerApplicationResponse response = officerAssignmentService.getAssignedApplicationDetailsForOfficer(user.getId(), id);
        return ResponseEntity.ok(response);
    }
}
