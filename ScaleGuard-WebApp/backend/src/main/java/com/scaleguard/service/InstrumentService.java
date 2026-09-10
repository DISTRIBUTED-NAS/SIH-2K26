package com.scaleguard.service;

import com.scaleguard.dto.*;
import com.scaleguard.entity.InstrumentStatus;
import com.scaleguard.entity.InstrumentType;

import java.util.List;

public interface InstrumentService {

    InstrumentResponse createInstrument(InstrumentCreateRequest request);

    List<InstrumentResponse> getMyInstruments(String search, InstrumentStatus status, InstrumentType instrumentType);

    InstrumentResponse getMyInstrumentById(Long id);

    InstrumentResponse updateMyInstrument(Long id, InstrumentUpdateRequest request);

    InstrumentResponse updateMyInstrumentStatus(Long id, InstrumentStatusUpdateRequest request);

    List<AdminInstrumentResponse> getAllInstrumentsForAdmin(String search, InstrumentStatus status, InstrumentType instrumentType, Long businessId);

    AdminInstrumentResponse getInstrumentByIdForAdmin(Long id);
}
