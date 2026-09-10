package com.scaleguard.service;

import com.scaleguard.dto.*;
import com.scaleguard.entity.*;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ConflictException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.InspectionRepository;
import com.scaleguard.repository.MeasurementTestRecordRepository;
import com.scaleguard.repository.MeasurementTestSessionRepository;
import com.scaleguard.repository.OfficerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeasurementTestServiceImpl implements MeasurementTestService {

    private final MeasurementTestSessionRepository sessionRepository;
    private final MeasurementTestRecordRepository recordRepository;
    private final InspectionRepository inspectionRepository;
    private final OfficerProfileRepository officerProfileRepository;

    public MeasurementTestServiceImpl(MeasurementTestSessionRepository sessionRepository,
                                     MeasurementTestRecordRepository recordRepository,
                                     InspectionRepository inspectionRepository,
                                     OfficerProfileRepository officerProfileRepository) {
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.inspectionRepository = inspectionRepository;
        this.officerProfileRepository = officerProfileRepository;
    }

    private OfficerProfile getOfficerProfileByUserId(Long userId) {
        return officerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found for authenticated user."));
    }

    private Inspection getInspectionAndValidateOwnership(Long inspectionId, OfficerProfile officer) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        if (inspection.getOfficer() == null || !inspection.getOfficer().getId().equals(officer.getId())) {
            throw new ResourceNotFoundException("Inspection not found or not assigned to your jurisdiction.");
        }
        return inspection;
    }

    private MeasurementTestSession getSessionAndValidateOwnership(Long sessionId, OfficerProfile officer) {
        MeasurementTestSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Measurement test session not found with ID: " + sessionId));

        Inspection inspection = session.getInspection();
        if (inspection == null || inspection.getOfficer() == null || !inspection.getOfficer().getId().equals(officer.getId())) {
            throw new ResourceNotFoundException("Measurement test session not found or not assigned to your jurisdiction.");
        }
        return session;
    }

    private BigDecimal calculateError(BigDecimal observed, BigDecimal standard) {
        return observed.subtract(standard).setScale(6, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePercentageError(BigDecimal error, BigDecimal standard) {
        return error.divide(standard, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(6, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional
    public MeasurementTestSessionResponse startMeasurementTest(Long inspectionId, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);
        Inspection inspection = getInspectionAndValidateOwnership(inspectionId, officer);

        if (inspection.getStatus() != InspectionStatus.IN_PROGRESS) {
            throw new ConflictException("Measurement testing can only be started while inspection is in progress.");
        }

        if (sessionRepository.existsByInspectionId(inspectionId)) {
            throw new ConflictException("Measurement testing has already been started for this inspection.");
        }

        MeasurementTestSession session = new MeasurementTestSession(inspection);
        session = sessionRepository.save(session);

        return mapToSessionResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public MeasurementTestSessionResponse getMeasurementTestByInspectionId(Long inspectionId, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);
        getInspectionAndValidateOwnership(inspectionId, officer);

        MeasurementTestSession session = sessionRepository.findByInspectionId(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Measurement test session not found for inspection ID: " + inspectionId));

        return mapToSessionResponse(session);
    }

    @Override
    @Transactional
    public MeasurementTestRecordResponse addTestRecord(Long sessionId, MeasurementTestRecordCreateRequest request, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);
        MeasurementTestSession session = getSessionAndValidateOwnership(sessionId, officer);

        if (session.getStatus() == MeasurementTestStatus.COMPLETED) {
            throw new ConflictException("Measurement testing is already completed.");
        }

        if (request.getStandardValue() == null || request.getStandardValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Standard value must be greater than zero.");
        }

        if (request.getObservedValue() == null || request.getObservedValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Observed value cannot be negative.");
        }

        if (request.getUnit() == null || request.getUnit().trim().isEmpty()) {
            throw new BadRequestException("Measurement unit is required.");
        }

        BigDecimal standard = request.getStandardValue().setScale(6, RoundingMode.HALF_UP);
        BigDecimal observed = request.getObservedValue().setScale(6, RoundingMode.HALF_UP);
        BigDecimal error = calculateError(observed, standard);
        BigDecimal percentageError = calculatePercentageError(error, standard);

        int nextTestPoint = recordRepository.findMaxTestPointBySessionId(sessionId) + 1;

        MeasurementTestRecord record = new MeasurementTestRecord(
                session,
                nextTestPoint,
                standard,
                observed,
                error,
                percentageError,
                request.getUnit().trim(),
                request.getRemarks() != null ? request.getRemarks().trim() : null
        );

        record = recordRepository.save(record);
        return mapToRecordResponse(record);
    }

    @Override
    @Transactional
    public MeasurementTestRecordResponse updateTestRecord(Long recordId, MeasurementTestRecordUpdateRequest request, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        MeasurementTestRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Measurement test record not found with ID: " + recordId));

        MeasurementTestSession session = record.getTestSession();
        Inspection inspection = session.getInspection();
        if (inspection == null || inspection.getOfficer() == null || !inspection.getOfficer().getId().equals(officer.getId())) {
            throw new ResourceNotFoundException("Measurement test record not found or not assigned to your jurisdiction.");
        }

        if (session.getStatus() == MeasurementTestStatus.COMPLETED) {
            throw new ConflictException("Measurement testing is already completed.");
        }

        if (request.getStandardValue() == null || request.getStandardValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Standard value must be greater than zero.");
        }

        if (request.getObservedValue() == null || request.getObservedValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Observed value cannot be negative.");
        }

        if (request.getUnit() == null || request.getUnit().trim().isEmpty()) {
            throw new BadRequestException("Measurement unit is required.");
        }

        BigDecimal standard = request.getStandardValue().setScale(6, RoundingMode.HALF_UP);
        BigDecimal observed = request.getObservedValue().setScale(6, RoundingMode.HALF_UP);
        BigDecimal error = calculateError(observed, standard);
        BigDecimal percentageError = calculatePercentageError(error, standard);

        record.setStandardValue(standard);
        record.setObservedValue(observed);
        record.setErrorValue(error);
        record.setPercentageError(percentageError);
        record.setUnit(request.getUnit().trim());
        record.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        record = recordRepository.save(record);
        return mapToRecordResponse(record);
    }

    @Override
    @Transactional
    public void deleteTestRecord(Long recordId, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        MeasurementTestRecord record = recordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Measurement test record not found with ID: " + recordId));

        MeasurementTestSession session = record.getTestSession();
        Inspection inspection = session.getInspection();
        if (inspection == null || inspection.getOfficer() == null || !inspection.getOfficer().getId().equals(officer.getId())) {
            throw new ResourceNotFoundException("Measurement test record not found or not assigned to your jurisdiction.");
        }

        if (session.getStatus() == MeasurementTestStatus.COMPLETED) {
            throw new ConflictException("Measurement testing is already completed.");
        }

        recordRepository.delete(record);
    }

    @Override
    @Transactional
    public MeasurementTestSessionResponse updateOverallRemarks(Long sessionId, MeasurementTestRemarksUpdateRequest request, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);
        MeasurementTestSession session = getSessionAndValidateOwnership(sessionId, officer);

        if (session.getStatus() == MeasurementTestStatus.COMPLETED) {
            throw new ConflictException("Measurement testing is already completed.");
        }

        session.setOverallRemarks(request.getOverallRemarks() != null ? request.getOverallRemarks().trim() : null);
        session = sessionRepository.save(session);

        return mapToSessionResponse(session);
    }

    @Override
    @Transactional
    public MeasurementTestSessionResponse completeMeasurementTest(Long sessionId, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);
        MeasurementTestSession session = getSessionAndValidateOwnership(sessionId, officer);

        if (session.getStatus() == MeasurementTestStatus.COMPLETED) {
            throw new ConflictException("Measurement testing is already completed.");
        }

        Long count = recordRepository.countByTestSessionId(sessionId);
        if (count == null || count == 0) {
            throw new BadRequestException("At least one measurement test record is required before completing testing.");
        }

        session.setStatus(MeasurementTestStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session = sessionRepository.save(session);

        return mapToSessionResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public MeasurementTestSessionResponse getMeasurementTestForAdmin(Long inspectionId) {
        if (!inspectionRepository.existsById(inspectionId)) {
            throw new ResourceNotFoundException("Inspection not found with ID: " + inspectionId);
        }

        MeasurementTestSession session = sessionRepository.findByInspectionId(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Measurement test session not found for inspection ID: " + inspectionId));

        return mapToSessionResponse(session);
    }

    private MeasurementTestRecordResponse mapToRecordResponse(MeasurementTestRecord record) {
        return new MeasurementTestRecordResponse(
                record.getId(),
                record.getTestPoint(),
                record.getStandardValue(),
                record.getObservedValue(),
                record.getErrorValue(),
                record.getPercentageError(),
                record.getUnit(),
                record.getRemarks(),
                record.getCreatedAt()
        );
    }

    private MeasurementTestSessionResponse mapToSessionResponse(MeasurementTestSession session) {
        List<MeasurementTestRecord> recordEntities = recordRepository.findByTestSessionIdOrderByTestPointAsc(session.getId());
        List<MeasurementTestRecordResponse> recordResponses = recordEntities.stream()
                .map(this::mapToRecordResponse)
                .collect(Collectors.toList());

        BigDecimal maxAbsError = null;
        BigDecimal avgPctError = null;

        if (!recordEntities.isEmpty()) {
            maxAbsError = recordEntities.stream()
                    .map(r -> r.getErrorValue().abs())
                    .max(BigDecimal::compareTo)
                    .orElse(null);

            BigDecimal sumPctError = recordEntities.stream()
                    .map(r -> r.getPercentageError().abs())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            avgPctError = sumPctError.divide(BigDecimal.valueOf(recordEntities.size()), 6, RoundingMode.HALF_UP);
        }

        return new MeasurementTestSessionResponse(
                session.getId(),
                session.getInspection().getId(),
                session.getStatus(),
                session.getStartedAt(),
                session.getCompletedAt(),
                session.getOverallRemarks(),
                recordResponses.size(),
                maxAbsError,
                avgPctError,
                recordResponses
        );
    }
}
