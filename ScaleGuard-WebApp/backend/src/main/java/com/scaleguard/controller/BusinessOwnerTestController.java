package com.scaleguard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/business-owner")
public class BusinessOwnerTestController {

    @GetMapping("/test")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Map<String, Object>> testBusinessOwnerAccess() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("role", "BUSINESS_OWNER");
        response.put("message", "Authorized: Access granted to Business Owner protected resource");
        return ResponseEntity.ok(response);
    }
}
