package com.scaleguard.controller;

import com.scaleguard.dto.MeasurementTestSessionResponse;
import com.scaleguard.service.MeasurementTestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMeasurementTestController {

    private final MeasurementTestService measurementTestService;

    public AdminMeasurementTestController(MeasurementTestService measurementTestService) {
        this.measurementTestService = measurementTestService;
    }

    @GetMapping("/inspections/{inspectionId}/measurement-tests")
    public ResponseEntity<MeasurementTestSessionResponse> getMeasurementTestForAdmin(@PathVariable Long inspectionId) {
        MeasurementTestSessionResponse response = measurementTestService.getMeasurementTestForAdmin(inspectionId);
        return ResponseEntity.ok(response);
    }
}
