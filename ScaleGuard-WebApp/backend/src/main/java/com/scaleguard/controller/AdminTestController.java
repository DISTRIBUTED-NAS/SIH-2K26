package com.scaleguard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminTestController {

    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testAdminAccess() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("role", "ADMIN");
        response.put("message", "Authorized: Access granted to Admin protected resource");
        return ResponseEntity.ok(response);
    }
}
