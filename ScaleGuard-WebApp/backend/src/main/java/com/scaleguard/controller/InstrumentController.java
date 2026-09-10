package com.scaleguard.controller;

import com.scaleguard.dto.InstrumentCreateRequest;
import com.scaleguard.dto.InstrumentResponse;
import com.scaleguard.dto.InstrumentStatusUpdateRequest;
import com.scaleguard.dto.InstrumentUpdateRequest;
import com.scaleguard.entity.InstrumentStatus;
import com.scaleguard.entity.InstrumentType;
import com.scaleguard.service.InstrumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instruments")
@PreAuthorize("hasRole('BUSINESS_OWNER')")
public class InstrumentController {

    private final InstrumentService instrumentService;

    public InstrumentController(InstrumentService instrumentService) {
        this.instrumentService = instrumentService;
    }

    @PostMapping
    public ResponseEntity<InstrumentResponse> createInstrument(@Valid @RequestBody InstrumentCreateRequest request) {
        InstrumentResponse response = instrumentService.createInstrument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<InstrumentResponse>> getMyInstruments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InstrumentStatus status,
            @RequestParam(required = false) InstrumentType instrumentType
    ) {
        List<InstrumentResponse> response = instrumentService.getMyInstruments(search, status, instrumentType);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstrumentResponse> getMyInstrumentById(@PathVariable Long id) {
        InstrumentResponse response = instrumentService.getMyInstrumentById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstrumentResponse> updateMyInstrument(
            @PathVariable Long id,
            @Valid @RequestBody InstrumentUpdateRequest request
    ) {
        InstrumentResponse response = instrumentService.updateMyInstrument(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InstrumentResponse> updateMyInstrumentStatus(
            @PathVariable Long id,
            @Valid @RequestBody InstrumentStatusUpdateRequest request
    ) {
        InstrumentResponse response = instrumentService.updateMyInstrumentStatus(id, request);
        return ResponseEntity.ok(response);
    }
}
