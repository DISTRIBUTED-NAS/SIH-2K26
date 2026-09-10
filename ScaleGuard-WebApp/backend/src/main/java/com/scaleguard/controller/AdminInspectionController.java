package com.scaleguard.controller;

import com.scaleguard.dto.InspectionDetailsResponse;
import com.scaleguard.dto.InspectionSummaryResponse;
import com.scaleguard.service.InspectionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/inspections")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInspectionController {

    private final InspectionService inspectionService;

    public AdminInspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping
    public ResponseEntity<List<InspectionSummaryResponse>> getAllInspections(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long officerId,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<InspectionSummaryResponse> response = inspectionService.getAllInspections(status, officerId, district, search, fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InspectionDetailsResponse> getInspectionById(@PathVariable Long id) {
        InspectionDetailsResponse response = inspectionService.getInspectionById(id);
        return ResponseEntity.ok(response);
    }
}
