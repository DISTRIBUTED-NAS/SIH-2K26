package com.scaleguard.service;

import com.scaleguard.dto.*;
import com.scaleguard.entity.Business;
import com.scaleguard.entity.Instrument;
import com.scaleguard.entity.InstrumentStatus;
import com.scaleguard.entity.InstrumentType;
import com.scaleguard.entity.User;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ConflictException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.BusinessRepository;
import com.scaleguard.repository.InstrumentRepository;
import com.scaleguard.repository.InstrumentSpecification;
import com.scaleguard.repository.UserRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InstrumentServiceImpl implements InstrumentService {

    private final InstrumentRepository instrumentRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public InstrumentServiceImpl(InstrumentRepository instrumentRepository,
                                 BusinessRepository businessRepository,
                                 UserRepository userRepository) {
        this.instrumentRepository = instrumentRepository;
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user found in security context");
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public InstrumentResponse createInstrument(InstrumentCreateRequest request) {
        User currentUser = getAuthenticatedUser();
        Business business = businessRepository.findByOwnerId(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Business profile must be created before registering instruments."));

        String serial = request.getSerialNumber().trim();
        if (instrumentRepository.existsBySerialNumber(serial)) {
            throw new ConflictException("An instrument with this serial number already exists.");
        }

        Instrument instrument = new Instrument();
        instrument.setInstrumentName(request.getInstrumentName().trim());
        instrument.setInstrumentType(request.getInstrumentType());
        instrument.setManufacturer(request.getManufacturer().trim());
        instrument.setModelNumber(request.getModelNumber().trim());
        instrument.setSerialNumber(serial);
        instrument.setCapacity(request.getCapacity());
        instrument.setCapacityUnit(request.getCapacityUnit());
        instrument.setAccuracy(request.getAccuracy());
        instrument.setAccuracyUnit(request.getAccuracyUnit());
        instrument.setManufacturingYear(request.getManufacturingYear());
        instrument.setPurchaseDate(request.getPurchaseDate());
        instrument.setLocation(request.getLocation().trim());
        instrument.setStatus(InstrumentStatus.ACTIVE);
        instrument.setBusiness(business);

        Instrument saved = instrumentRepository.save(instrument);
        return InstrumentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InstrumentResponse> getMyInstruments(String search, InstrumentStatus status, InstrumentType instrumentType) {
        User currentUser = getAuthenticatedUser();
        Business business = businessRepository.findByOwnerId(currentUser.getId()).orElse(null);

        if (business == null) {
            return Collections.emptyList();
        }

        Specification<Instrument> spec = InstrumentSpecification.filter(business.getId(), search, status, instrumentType);
        return instrumentRepository.findAll(spec).stream()
                .map(InstrumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InstrumentResponse getMyInstrumentById(Long id) {
        User currentUser = getAuthenticatedUser();
        Business business = businessRepository.findByOwnerId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument not found"));

        Instrument instrument = instrumentRepository.findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument not found"));

        return InstrumentResponse.fromEntity(instrument);
    }

    @Override
    public InstrumentResponse updateMyInstrument(Long id, InstrumentUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        Business business = businessRepository.findByOwnerId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument not found"));

        Instrument instrument = instrumentRepository.findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument not found"));

        String newSerial = request.getSerialNumber().trim();
        if (instrumentRepository.existsBySerialNumberAndIdNot(newSerial, id)) {
            throw new ConflictException("An instrument with this serial number already exists.");
        }

        instrument.setInstrumentName(request.getInstrumentName().trim());
        instrument.setInstrumentType(request.getInstrumentType());
        instrument.setManufacturer(request.getManufacturer().trim());
        instrument.setModelNumber(request.getModelNumber().trim());
        instrument.setSerialNumber(newSerial);
        instrument.setCapacity(request.getCapacity());
        instrument.setCapacityUnit(request.getCapacityUnit());
        instrument.setAccuracy(request.getAccuracy());
        instrument.setAccuracyUnit(request.getAccuracyUnit());
        instrument.setManufacturingYear(request.getManufacturingYear());
        instrument.setPurchaseDate(request.getPurchaseDate());
        instrument.setLocation(request.getLocation().trim());

        Instrument updated = instrumentRepository.save(instrument);
        return InstrumentResponse.fromEntity(updated);
    }

    @Override
    public InstrumentResponse updateMyInstrumentStatus(Long id, InstrumentStatusUpdateRequest request) {
        User currentUser = getAuthenticatedUser();
        Business business = businessRepository.findByOwnerId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument not found"));

        Instrument instrument = instrumentRepository.findByIdAndBusinessId(id, business.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Instrument not found"));

        instrument.setStatus(request.getStatus());
        Instrument updated = instrumentRepository.save(instrument);
        return InstrumentResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminInstrumentResponse> getAllInstrumentsForAdmin(String search, InstrumentStatus status, InstrumentType instrumentType, Long businessId) {
        Specification<Instrument> spec = InstrumentSpecification.filter(businessId, search, status, instrumentType);
        return instrumentRepository.findAll(spec).stream()
                .map(AdminInstrumentResponse::fromEntityWithBusiness)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminInstrumentResponse getInstrumentByIdForAdmin(Long id) {
        Instrument instrument = instrumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instrument with ID " + id + " not found"));

        return AdminInstrumentResponse.fromEntityWithBusiness(instrument);
    }
}
