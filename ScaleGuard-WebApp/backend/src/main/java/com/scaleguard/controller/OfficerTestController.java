package com.scaleguard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/officer")
public class OfficerTestController {

    @GetMapping("/test")
    @PreAuthorize("hasRole('LMO_OFFICER')")
    public ResponseEntity<Map<String, Object>> testOfficerAccess() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("role", "LMO_OFFICER");
        response.put("message", "Authorized: Access granted to LMO Officer protected resource");
        return ResponseEntity.ok(response);
    }
}
