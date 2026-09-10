package com.scaleguard.service;

import com.scaleguard.dto.BusinessCreateRequest;
import com.scaleguard.dto.BusinessResponse;
import com.scaleguard.dto.BusinessUpdateRequest;
import com.scaleguard.entity.Business;
import com.scaleguard.entity.BusinessStatus;
import com.scaleguard.entity.Role;
import com.scaleguard.entity.User;
import com.scaleguard.exception.BadRequestException;
import com.scaleguard.exception.ConflictException;
import com.scaleguard.exception.ResourceNotFoundException;
import com.scaleguard.repository.BusinessRepository;
import com.scaleguard.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public BusinessServiceImpl(BusinessRepository businessRepository, UserRepository userRepository) {
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
    @Transactional
    public BusinessResponse createBusiness(BusinessCreateRequest request) {
        User currentUser = getAuthenticatedUser();

        // Ensure user is BUSINESS_OWNER
        if (currentUser.getRole() != Role.BUSINESS_OWNER) {
            throw new AccessDeniedException("Only users with role BUSINESS_OWNER can create a business profile");
        }

        // Reject if business profile already exists for this user
        if (businessRepository.existsByOwnerId(currentUser.getId())) {
            throw new ConflictException("Business profile already exists for this user.");
        }

        Business business = new Business(
                request.getBusinessName().trim(),
                request.getBusinessType().trim(),
                request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim() : null,
                request.getGstNumber() != null ? request.getGstNumber().trim() : null,
                request.getContactEmail().trim().toLowerCase(),
                request.getContactPhone().trim(),
                request.getAddressLine1().trim(),
                request.getAddressLine2() != null ? request.getAddressLine2().trim() : null,
                request.getCity().trim(),
                request.getState().trim(),
                request.getPincode().trim(),
                request.getCountry().trim(),
                BusinessStatus.ACTIVE,
                currentUser
        );

        Business saved = businessRepository.save(business);
        return BusinessResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessResponse getCurrentUserBusiness() {
        User currentUser = getAuthenticatedUser();

        Business business = businessRepository.findByOwnerId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Business profile not found. Please create your business profile."));

        return BusinessResponse.fromEntity(business);
    }

    @Override
    @Transactional
    public BusinessResponse updateCurrentUserBusiness(BusinessUpdateRequest request) {
        User currentUser = getAuthenticatedUser();

        Business business = businessRepository.findByOwnerId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Business profile not found. Please create your business profile."));

        // Update updatable fields (owner remains unchanged)
        business.setBusinessName(request.getBusinessName().trim());
        business.setBusinessType(request.getBusinessType().trim());
        business.setRegistrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim() : null);
        business.setGstNumber(request.getGstNumber() != null ? request.getGstNumber().trim() : null);
        business.setContactEmail(request.getContactEmail().trim().toLowerCase());
        business.setContactPhone(request.getContactPhone().trim());
        business.setAddressLine1(request.getAddressLine1().trim());
        business.setAddressLine2(request.getAddressLine2() != null ? request.getAddressLine2().trim() : null);
        business.setCity(request.getCity().trim());
        business.setState(request.getState().trim());
        business.setPincode(request.getPincode().trim());
        business.setCountry(request.getCountry().trim());

        Business updated = businessRepository.save(business);
        return BusinessResponse.fromEntity(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessResponse> getAllBusinesses() {
        return businessRepository.findAll().stream()
                .map(BusinessResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessResponse getBusinessById(Long id) {
        Business business = businessRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with ID: " + id));

        return BusinessResponse.fromEntity(business);
    }
}
