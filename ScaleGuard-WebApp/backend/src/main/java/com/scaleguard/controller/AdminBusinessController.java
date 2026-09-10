package com.scaleguard.controller;

import com.scaleguard.dto.BusinessResponse;
import com.scaleguard.service.BusinessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/businesses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBusinessController {

    private final BusinessService businessService;

    public AdminBusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @GetMapping
    public ResponseEntity<List<BusinessResponse>> getAllBusinesses() {
        List<BusinessResponse> response = businessService.getAllBusinesses();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponse> getBusinessById(@PathVariable Long id) {
        BusinessResponse response = businessService.getBusinessById(id);
        return ResponseEntity.ok(response);
    }
}
