package com.scaleguard.service;

import com.scaleguard.dto.*;
import com.scaleguard.entity.OfficerProfile;
import com.scaleguard.entity.OfficerStatus;
import com.scaleguard.entity.Role;
import com.scaleguard.entity.User;
import com.scaleguard.exception.ConflictException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.OfficerProfileRepository;
import com.scaleguard.repository.OfficerSpecification;
import com.scaleguard.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OfficerServiceImpl implements OfficerService {

    private final OfficerProfileRepository officerProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public OfficerServiceImpl(OfficerProfileRepository officerProfileRepository,
                              UserRepository userRepository,
                              PasswordEncoder passwordEncoder) {
        this.officerProfileRepository = officerProfileRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public OfficerResponse createOfficer(OfficerCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        if (officerProfileRepository.existsByOfficerCode(request.getOfficerCode())) {
            throw new ConflictException("Officer code already exists: " + request.getOfficerCode());
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPhoneNumber(),
                passwordEncoder.encode(request.getPassword()),
                Role.LMO_OFFICER
        );
        User savedUser = userRepository.save(user);

        OfficerProfile officer = new OfficerProfile(
                request.getOfficerCode(),
                request.getDesignation(),
                request.getDepartment(),
                request.getDistrict(),
                request.getPhoneNumber(),
                OfficerStatus.ACTIVE,
                savedUser
        );
        OfficerProfile savedOfficer = officerProfileRepository.save(officer);

        return new OfficerResponse(savedOfficer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OfficerResponse> getAllOfficers(String search, OfficerStatus status, String district, Pageable pageable) {
        Specification<OfficerProfile> spec = OfficerSpecification.filter(search, status, district);
        return officerProfileRepository.findAll(spec, pageable).map(OfficerResponse::new);
    }

    @Override
    @Transactional(readOnly = true)
    public OfficerResponse getOfficerById(Long id) {
        OfficerProfile officer = officerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + id));
        return new OfficerResponse(officer);
    }

    @Override
    @Transactional
    public OfficerResponse updateOfficer(Long id, OfficerUpdateRequest request) {
        OfficerProfile officer = officerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + id));

        // Update Officer Profile fields
        officer.setDesignation(request.getDesignation());
        officer.setDepartment(request.getDepartment());
        officer.setDistrict(request.getDistrict());
        officer.setPhoneNumber(request.getPhoneNumber());

        // Update User associated fields
        if (officer.getUser() != null) {
            officer.getUser().setFullName(request.getName());
            officer.getUser().setPhoneNumber(request.getPhoneNumber());
            userRepository.save(officer.getUser());
        }

        OfficerProfile updatedOfficer = officerProfileRepository.save(officer);
        return new OfficerResponse(updatedOfficer);
    }

    @Override
    @Transactional
    public OfficerResponse updateOfficerStatus(Long id, OfficerStatus status) {
        OfficerProfile officer = officerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found with id: " + id));

        officer.setStatus(status);
        OfficerProfile updatedOfficer = officerProfileRepository.save(officer);
        return new OfficerResponse(updatedOfficer);
    }

    @Override
    @Transactional(readOnly = true)
    public OfficerProfileResponse getOfficerProfile(Long userId) {
        OfficerProfile officer = officerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Officer profile not found for user id: " + userId));
        return new OfficerProfileResponse(officer);
    }
}
