package com.scaleguard.controller;

import com.scaleguard.dto.BusinessCreateRequest;
import com.scaleguard.dto.BusinessResponse;
import com.scaleguard.dto.BusinessUpdateRequest;
import com.scaleguard.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/businesses")
@PreAuthorize("hasRole('BUSINESS_OWNER')")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @PostMapping
    public ResponseEntity<BusinessResponse> createBusiness(@Valid @RequestBody BusinessCreateRequest request) {
        BusinessResponse response = businessService.createBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<BusinessResponse> getMyBusiness() {
        BusinessResponse response = businessService.getCurrentUserBusiness();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<BusinessResponse> updateMyBusiness(@Valid @RequestBody BusinessUpdateRequest request) {
        BusinessResponse response = businessService.updateCurrentUserBusiness(request);
        return ResponseEntity.ok(response);
    }
}
