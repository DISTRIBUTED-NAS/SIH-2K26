package com.scaleguard.controller;

import com.scaleguard.dto.AdminInstrumentResponse;
import com.scaleguard.entity.InstrumentStatus;
import com.scaleguard.entity.InstrumentType;
import com.scaleguard.service.InstrumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/instruments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInstrumentController {

    private final InstrumentService instrumentService;

    public AdminInstrumentController(InstrumentService instrumentService) {
        this.instrumentService = instrumentService;
    }

    @GetMapping
    public ResponseEntity<List<AdminInstrumentResponse>> getAllInstruments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InstrumentStatus status,
            @RequestParam(required = false) InstrumentType instrumentType,
            @RequestParam(required = false) Long businessId
    ) {
        List<AdminInstrumentResponse> response = instrumentService.getAllInstrumentsForAdmin(search, status, instrumentType, businessId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminInstrumentResponse> getInstrumentById(@PathVariable Long id) {
        AdminInstrumentResponse response = instrumentService.getInstrumentByIdForAdmin(id);
        return ResponseEntity.ok(response);
    }
}
