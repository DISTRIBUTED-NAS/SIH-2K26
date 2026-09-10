package com.scaleguard.service;

import com.scaleguard.dto.OfficerApplicationResponse;
import com.scaleguard.dto.OfficerAssignmentResponse;
import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.OfficerProfile;
import com.scaleguard.entity.OfficerStatus;
import com.scaleguard.entity.VerificationApplication;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ConflictException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.OfficerProfileRepository;
import com.scaleguard.repository.VerificationApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OfficerAssignmentServiceImpl implements OfficerAssignmentService {

    private final VerificationApplicationRepository verificationApplicationRepository;
    private final OfficerProfileRepository officerProfileRepository;

    public OfficerAssignmentServiceImpl(VerificationApplicationRepository verificationApplicationRepository,
                                        OfficerProfileRepository officerProfileRepository) {
        this.verificationApplicationRepository = verificationApplicationRepository;
        this.officerProfileRepository = officerProfileRepository;
    }

    @Override
    @Transactional
    public OfficerAssignmentResponse assignOfficer(Long applicationId, Long officerId) {
        VerificationApplication app = verificationApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found with id: " + applicationId));

        if (app.getStatus() == ApplicationStatus.DRAFT) {
            throw new ConflictException("Cannot assign officer to a draft application");
        }

        if (app.getStatus() == ApplicationStatus.OFFICER_ASSIGNED) {
            throw new ConflictException("Application is already assigned to an officer. Use reassign endpoint to change officer.");
        }

        if (app.getStatus() != ApplicationStatus.SUBMITTED) {
            throw new ConflictException("Application must be in SUBMITTED status to assign an officer");
        }

        OfficerProfile officer = officerProfileRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (officer.getStatus() != OfficerStatus.ACTIVE) {
            throw new BadRequestException("Cannot assign inactive officer");
        }

        app.setAssignedOfficer(officer);
        app.setStatus(ApplicationStatus.OFFICER_ASSIGNED);
        app.setAssignedAt(LocalDateTime.now());

        VerificationApplication saved = verificationApplicationRepository.save(app);
        return new OfficerAssignmentResponse(saved);
    }

    @Override
    @Transactional
    public OfficerAssignmentResponse reassignOfficer(Long applicationId, Long officerId) {
        VerificationApplication app = verificationApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found with id: " + applicationId));

        if (app.getStatus() != ApplicationStatus.OFFICER_ASSIGNED) {
            throw new BadRequestException("Application must be in OFFICER_ASSIGNED status to reassign officer");
        }

        OfficerProfile officer = officerProfileRepository.findById(officerId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + officerId));

        if (officer.getStatus() != OfficerStatus.ACTIVE) {
            throw new BadRequestException("Cannot assign inactive officer");
        }

        app.setAssignedOfficer(officer);
        app.setAssignedAt(LocalDateTime.now());

        VerificationApplication saved = verificationApplicationRepository.save(app);
        return new OfficerAssignmentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfficerApplicationResponse> getAssignedApplicationsForOfficer(Long userId) {
        OfficerProfile officer = officerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found for user id: " + userId));

        List<VerificationApplication> apps = verificationApplicationRepository
                .findByAssignedOfficerIdOrderByAssignedAtDesc(officer.getId());

        return apps.stream().map(OfficerApplicationResponse::new).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OfficerApplicationResponse getAssignedApplicationDetailsForOfficer(Long userId, Long applicationId) {
        OfficerProfile officer = officerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found for user id: " + userId));

        VerificationApplication app = verificationApplicationRepository
                .findByIdAndAssignedOfficerId(applicationId, officer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found or not assigned to you"));

        return new OfficerApplicationResponse(app);
    }
}
