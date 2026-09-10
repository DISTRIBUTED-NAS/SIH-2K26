package com.scaleguard.service;

import com.scaleguard.dto.AdminVerificationApplicationResponse;
import com.scaleguard.dto.VerificationApplicationCreateRequest;
import com.scaleguard.dto.VerificationApplicationResponse;
import com.scaleguard.dto.VerificationApplicationUpdateRequest;
import com.scaleguard.entity.*;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ConflictException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.BusinessRepository;
import com.scaleguard.repository.InstrumentRepository;
import com.scaleguard.repository.UserRepository;
import com.scaleguard.repository.VerificationApplicationRepository;
import com.scaleguard.repository.VerificationApplicationSpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VerificationApplicationServiceImpl implements VerificationApplicationService {

    private final VerificationApplicationRepository applicationRepository;
    private final InstrumentRepository instrumentRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final ApplicationNumberGenerator applicationNumberGenerator;

    public VerificationApplicationServiceImpl(
            VerificationApplicationRepository applicationRepository,
            InstrumentRepository instrumentRepository,
            BusinessRepository businessRepository,
            UserRepository userRepository,
            ApplicationNumberGenerator applicationNumberGenerator
    ) {
        this.applicationRepository = applicationRepository;
        this.instrumentRepository = instrumentRepository;
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.applicationNumberGenerator = applicationNumberGenerator;
    }

    private Business getCurrentUserBusiness() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found."));

        return businessRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new BadRequestException("Business profile must be created before submitting verification applications."));
    }

    private void validateDates(LocalDate requestedDate, LocalDate preferredInspectionDate) {
        if (preferredInspectionDate != null) {
            if (preferredInspectionDate.isBefore(requestedDate)) {
                throw new BadRequestException("Preferred inspection date cannot be before requested date.");
            }
            if (preferredInspectionDate.isBefore(LocalDate.now())) {
                throw new BadRequestException("Preferred inspection date cannot be in the past.");
            }
        }
    }

    private Instrument validateAndGetInstrument(Long instrumentId, Long businessId) {
        Instrument instrument = instrumentRepository.findById(instrumentId)
                .orElseThrow(() -> new ResourceNotFoundException("Instrument not found."));

        if (!instrument.getBusiness().getId().equals(businessId)) {
            throw new ResourceNotFoundException("Instrument not found.");
        }

        return instrument;
    }

    @Override
    public VerificationApplicationResponse createApplication(VerificationApplicationCreateRequest request) {
        Business business = getCurrentUserBusiness();
        Instrument instrument = validateAndGetInstrument(request.getInstrumentId(), business.getId());

        LocalDate requestedDate = request.getRequestedDate() != null ? request.getRequestedDate() : LocalDate.now();
        validateDates(requestedDate, request.getPreferredInspectionDate());

        String appNumber = applicationNumberGenerator.generateNextNumber();

        VerificationApplication application = new VerificationApplication(
                appNumber,
                request.getApplicationType(),
                ApplicationStatus.DRAFT,
                request.getPurpose(),
                requestedDate,
                request.getPreferredInspectionDate(),
                request.getRemarks(),
                instrument,
                business
        );

        VerificationApplication saved = applicationRepository.save(application);
        return new VerificationApplicationResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VerificationApplicationResponse> getMyApplications(
            ApplicationStatus status,
            ApplicationType applicationType,
            Long instrumentId,
            String search
    ) {
        Business business = getCurrentUserBusiness();

        Specification<VerificationApplication> spec = VerificationApplicationSpecification.filter(
                business.getId(),
                status,
                applicationType,
                instrumentId,
                search
        );

        return applicationRepository.findAll(spec)
                .stream()
                .map(VerificationApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VerificationApplicationResponse getMyApplicationById(Long id) {
        Business business = getCurrentUserBusiness();
        VerificationApplication application = applicationRepository.findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found."));

        return new VerificationApplicationResponse(application);
    }

    @Override
    public VerificationApplicationResponse updateDraftApplication(Long id, VerificationApplicationUpdateRequest request) {
        Business business = getCurrentUserBusiness();
        VerificationApplication application = applicationRepository.findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found."));

        if (application.getStatus() == ApplicationStatus.SUBMITTED) {
            throw new ConflictException("Submitted applications cannot be modified.");
        }

        Instrument instrument = validateAndGetInstrument(request.getInstrumentId(), business.getId());

        LocalDate requestedDate = request.getRequestedDate() != null ? request.getRequestedDate() : LocalDate.now();
        validateDates(requestedDate, request.getPreferredInspectionDate());

        application.setInstrument(instrument);
        application.setApplicationType(request.getApplicationType());
        application.setPurpose(request.getPurpose());
        application.setRequestedDate(requestedDate);
        application.setPreferredInspectionDate(request.getPreferredInspectionDate());
        application.setRemarks(request.getRemarks());

        VerificationApplication updated = applicationRepository.save(application);
        return new VerificationApplicationResponse(updated);
    }

    @Override
    public VerificationApplicationResponse submitApplication(Long id) {
        Business business = getCurrentUserBusiness();
        VerificationApplication application = applicationRepository.findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found."));

        if (application.getStatus() == ApplicationStatus.SUBMITTED) {
            throw new ConflictException("Application has already been submitted.");
        }

        if (application.getInstrument().getStatus() != InstrumentStatus.ACTIVE) {
            throw new BadRequestException("Verification applications can only be submitted for active instruments.");
        }

        application.setStatus(ApplicationStatus.SUBMITTED);
        VerificationApplication saved = applicationRepository.save(application);
        return new VerificationApplicationResponse(saved);
    }

    @Override
    public void deleteDraftApplication(Long id) {
        Business business = getCurrentUserBusiness();
        VerificationApplication application = applicationRepository.findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found."));

        if (application.getStatus() == ApplicationStatus.SUBMITTED) {
            throw new ConflictException("Submitted applications cannot be deleted.");
        }

        applicationRepository.delete(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminVerificationApplicationResponse> getAllApplicationsForAdmin(
            ApplicationStatus status,
            ApplicationType applicationType,
            Long businessId,
            Long instrumentId,
            String search
    ) {
        Specification<VerificationApplication> spec = VerificationApplicationSpecification.filter(
                businessId,
                status,
                applicationType,
                instrumentId,
                search
        );

        return applicationRepository.findAll(spec)
                .stream()
                .map(AdminVerificationApplicationResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminVerificationApplicationResponse getApplicationByIdForAdmin(Long id) {
        VerificationApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification application not found."));

        return new AdminVerificationApplicationResponse(application);
    }
}
