package com.scaleguard.controller;

import com.scaleguard.dto.OfficerCreateRequest;
import com.scaleguard.dto.OfficerResponse;
import com.scaleguard.dto.OfficerStatusUpdateRequest;
import com.scaleguard.dto.OfficerUpdateRequest;
import com.scaleguard.entity.OfficerStatus;
import com.scaleguard.service.OfficerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/officers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOfficerController {

    private final OfficerService officerService;

    public AdminOfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    @PostMapping
    public ResponseEntity<OfficerResponse> createOfficer(@Valid @RequestBody OfficerCreateRequest request) {
        OfficerResponse response = officerService.createOfficer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<OfficerResponse>> getAllOfficers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OfficerStatus status,
            @RequestParam(required = false) String district,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<OfficerResponse> response = officerService.getAllOfficers(search, status, district, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficerResponse> getOfficerById(@PathVariable Long id) {
        OfficerResponse response = officerService.getOfficerById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfficerResponse> updateOfficer(
            @PathVariable Long id,
            @Valid @RequestBody OfficerUpdateRequest request
    ) {
        OfficerResponse response = officerService.updateOfficer(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OfficerResponse> updateOfficerStatus(
            @PathVariable Long id,
            @Valid @RequestBody OfficerStatusUpdateRequest request
    ) {
        OfficerResponse response = officerService.updateOfficerStatus(id, request.getStatus());
        return ResponseEntity.ok(response);
    }
}
