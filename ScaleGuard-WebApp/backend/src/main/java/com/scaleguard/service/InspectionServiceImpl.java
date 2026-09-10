package com.scaleguard.service;

import com.scaleguard.dto.*;
import com.scaleguard.entity.*;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ConflictException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.InspectionRepository;
import com.scaleguard.repository.OfficerProfileRepository;
import com.scaleguard.repository.VerificationApplicationRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InspectionServiceImpl implements InspectionService {

    private final InspectionRepository inspectionRepository;
    private final VerificationApplicationRepository applicationRepository;
    private final OfficerProfileRepository officerProfileRepository;
    private final InspectionNumberGenerator inspectionNumberGenerator;

    public InspectionServiceImpl(InspectionRepository inspectionRepository,
                                 VerificationApplicationRepository applicationRepository,
                                 OfficerProfileRepository officerProfileRepository,
                                 InspectionNumberGenerator inspectionNumberGenerator) {
        this.inspectionRepository = inspectionRepository;
        this.applicationRepository = applicationRepository;
        this.officerProfileRepository = officerProfileRepository;
        this.inspectionNumberGenerator = inspectionNumberGenerator;
    }

    private OfficerProfile getOfficerProfileByUserId(Long userId) {
        return officerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found for authenticated user."));
    }

    @Override
    @Transactional
    public InspectionResponse createInspection(Long applicationId, InspectionCreateRequest request, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        VerificationApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found with ID: " + applicationId));

        // 1. Must be assigned to this officer
        if (application.getAssignedOfficer() == null || !application.getAssignedOfficer().getId().equals(officer.getId())) {
            throw new ResourceNotFoundException("Verification application not found or not assigned to your jurisdiction.");
        }

        // 2. Application status must be OFFICER_ASSIGNED
        if (application.getStatus() != ApplicationStatus.OFFICER_ASSIGNED) {
            throw new ConflictException("Inspection can only be created for an officer-assigned application.");
        }

        // 3. Must not already have an inspection
        if (inspectionRepository.existsByApplicationId(applicationId)) {
            throw new ConflictException("An inspection already exists for this application.");
        }

        // 4. Validate scheduledAt is not in the past
        if (request.getScheduledAt() == null || request.getScheduledAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Scheduled inspection date and time cannot be in the past.");
        }

        String inspectionNumber = inspectionNumberGenerator.generateNextNumber();

        Inspection inspection = new Inspection(
                inspectionNumber,
                application,
                officer,
                request.getScheduledAt(),
                request.getLocation().trim(),
                request.getNotes() != null ? request.getNotes().trim() : null
        );

        Inspection savedInspection = inspectionRepository.save(inspection);
        return InspectionResponse.fromEntity(savedInspection);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InspectionSummaryResponse> getMyInspections(Long userId, String status, String search, LocalDate fromDate, LocalDate toDate) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        Specification<Inspection> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Must belong to this officer
            predicates.add(cb.equal(root.get("officer").get("id"), officer.getId()));

            // Status filter
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                try {
                    InspectionStatus inspStatus = InspectionStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), inspStatus));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Date range filter on scheduledAt
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("scheduledAt"), fromDate.atStartOfDay()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("scheduledAt"), toDate.atTime(23, 59, 59)));
            }

            // Search query across inspection number, application number, business name, instrument name, location
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Join<Inspection, VerificationApplication> appJoin = root.join("application", JoinType.LEFT);
                Join<VerificationApplication, Business> bizJoin = appJoin.join("business", JoinType.LEFT);
                Join<VerificationApplication, Instrument> instJoin = appJoin.join("instrument", JoinType.LEFT);

                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("inspectionNumber")), term),
                        cb.like(cb.lower(root.get("location")), term),
                        cb.like(cb.lower(appJoin.get("applicationNumber")), term),
                        cb.like(cb.lower(bizJoin.get("businessName")), term),
                        cb.like(cb.lower(instJoin.get("instrumentName")), term)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Inspection> inspections = inspectionRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        return inspections.stream()
                .map(InspectionSummaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InspectionDetailsResponse getMyInspectionById(Long inspectionId, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        Inspection inspection = inspectionRepository.findByIdAndOfficerId(inspectionId, officer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        return InspectionDetailsResponse.fromEntity(inspection);
    }

    @Override
    @Transactional
    public InspectionResponse startInspection(Long inspectionId, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        Inspection inspection = inspectionRepository.findByIdAndOfficerId(inspectionId, officer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        if (inspection.getStatus() != InspectionStatus.SCHEDULED) {
            throw new ConflictException("Only scheduled inspections can be started.");
        }

        inspection.setStatus(InspectionStatus.IN_PROGRESS);
        inspection.setStartedAt(LocalDateTime.now());

        VerificationApplication application = inspection.getApplication();
        if (application != null) {
            application.setStatus(ApplicationStatus.INSPECTION_IN_PROGRESS);
            applicationRepository.save(application);
        }

        Inspection updated = inspectionRepository.save(inspection);
        return InspectionResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public InspectionResponse updateInspectionNotes(Long inspectionId, InspectionNotesUpdateRequest request, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        Inspection inspection = inspectionRepository.findByIdAndOfficerId(inspectionId, officer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        if (inspection.getStatus() != InspectionStatus.IN_PROGRESS) {
            throw new ConflictException("Inspection notes can only be updated while inspection is in progress.");
        }

        inspection.setNotes(request.getNotes().trim());
        Inspection updated = inspectionRepository.save(inspection);
        return InspectionResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public InspectionResponse completeInspection(Long inspectionId, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        Inspection inspection = inspectionRepository.findByIdAndOfficerId(inspectionId, officer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        if (inspection.getStatus() != InspectionStatus.IN_PROGRESS) {
            throw new ConflictException("Only in-progress inspections can be completed.");
        }

        inspection.setStatus(InspectionStatus.COMPLETED);
        inspection.setCompletedAt(LocalDateTime.now());

        VerificationApplication application = inspection.getApplication();
        if (application != null) {
            application.setStatus(ApplicationStatus.INSPECTION_COMPLETED);
            applicationRepository.save(application);
        }

        Inspection updated = inspectionRepository.save(inspection);
        return InspectionResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public InspectionResponse cancelInspection(Long inspectionId, InspectionCancelRequest request, Long userId) {
        OfficerProfile officer = getOfficerProfileByUserId(userId);

        Inspection inspection = inspectionRepository.findByIdAndOfficerId(inspectionId, officer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        if (inspection.getStatus() != InspectionStatus.SCHEDULED) {
            throw new ConflictException("Only scheduled inspections can be cancelled.");
        }

        inspection.setStatus(InspectionStatus.CANCELLED);
        inspection.setCancellationReason(request.getReason().trim());

        VerificationApplication application = inspection.getApplication();
        if (application != null) {
            application.setStatus(ApplicationStatus.OFFICER_ASSIGNED);
            applicationRepository.save(application);
        }

        Inspection updated = inspectionRepository.save(inspection);
        return InspectionResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InspectionSummaryResponse> getAllInspections(String status, Long officerId, String district, String search, LocalDate fromDate, LocalDate toDate) {
        Specification<Inspection> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status filter
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                try {
                    InspectionStatus inspStatus = InspectionStatus.valueOf(status.trim().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), inspStatus));
                } catch (IllegalArgumentException ignored) {
                }
            }

            // Officer ID filter
            if (officerId != null) {
                predicates.add(cb.equal(root.get("officer").get("id"), officerId));
            }

            // District filter
            if (district != null && !district.trim().isEmpty() && !district.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.lower(root.get("officer").get("district")), district.trim().toLowerCase()));
            }

            // Date range filter on scheduledAt
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("scheduledAt"), fromDate.atStartOfDay()));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("scheduledAt"), toDate.atTime(23, 59, 59)));
            }

            // Text search across inspection number, application number, business name, officer name, instrument name, location
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Join<Inspection, VerificationApplication> appJoin = root.join("application", JoinType.LEFT);
                Join<VerificationApplication, Business> bizJoin = appJoin.join("business", JoinType.LEFT);
                Join<VerificationApplication, Instrument> instJoin = appJoin.join("instrument", JoinType.LEFT);
                Join<Inspection, OfficerProfile> officerJoin = root.join("officer", JoinType.LEFT);
                Join<OfficerProfile, User> userJoin = officerJoin.join("user", JoinType.LEFT);

                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("inspectionNumber")), term),
                        cb.like(cb.lower(root.get("location")), term),
                        cb.like(cb.lower(appJoin.get("applicationNumber")), term),
                        cb.like(cb.lower(bizJoin.get("businessName")), term),
                        cb.like(cb.lower(instJoin.get("instrumentName")), term),
                        cb.like(cb.lower(userJoin.get("fullName")), term),
                        cb.like(cb.lower(officerJoin.get("officerCode")), term)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Inspection> inspections = inspectionRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        return inspections.stream()
                .map(InspectionSummaryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InspectionDetailsResponse getInspectionById(Long inspectionId) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with ID: " + inspectionId));

        return InspectionDetailsResponse.fromEntity(inspection);
    }
}
