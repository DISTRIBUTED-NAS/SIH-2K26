package com.scaleguard.service;

import com.scaleguard.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface InspectionService {

    InspectionResponse createInspection(Long applicationId, InspectionCreateRequest request, Long userId);

    List<InspectionSummaryResponse> getMyInspections(Long userId, String status, String search, LocalDate fromDate, LocalDate toDate);

    InspectionDetailsResponse getMyInspectionById(Long inspectionId, Long userId);

    InspectionResponse startInspection(Long inspectionId, Long userId);

    InspectionResponse updateInspectionNotes(Long inspectionId, InspectionNotesUpdateRequest request, Long userId);

    InspectionResponse completeInspection(Long inspectionId, Long userId);

    InspectionResponse cancelInspection(Long inspectionId, InspectionCancelRequest request, Long userId);

    List<InspectionSummaryResponse> getAllInspections(String status, Long officerId, String district, String search, LocalDate fromDate, LocalDate toDate);

    InspectionDetailsResponse getInspectionById(Long inspectionId);
}
