package com.scaleguard.service;

import com.scaleguard.dto.*;

public interface MeasurementTestService {

    MeasurementTestSessionResponse startMeasurementTest(Long inspectionId, Long userId);

    MeasurementTestSessionResponse getMeasurementTestByInspectionId(Long inspectionId, Long userId);

    MeasurementTestRecordResponse addTestRecord(Long sessionId, MeasurementTestRecordCreateRequest request, Long userId);

    MeasurementTestRecordResponse updateTestRecord(Long recordId, MeasurementTestRecordUpdateRequest request, Long userId);

    void deleteTestRecord(Long recordId, Long userId);

    MeasurementTestSessionResponse updateOverallRemarks(Long sessionId, MeasurementTestRemarksUpdateRequest request, Long userId);

    MeasurementTestSessionResponse completeMeasurementTest(Long sessionId, Long userId);

    MeasurementTestSessionResponse getMeasurementTestForAdmin(Long inspectionId);
}
