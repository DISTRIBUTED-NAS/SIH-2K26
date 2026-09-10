package com.scaleguard.service;

import com.scaleguard.dto.*;
import com.scaleguard.entity.OfficerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OfficerService {

    OfficerResponse createOfficer(OfficerCreateRequest request);

    Page<OfficerResponse> getAllOfficers(String search, OfficerStatus status, String district, Pageable pageable);

    OfficerResponse getOfficerById(Long id);

    OfficerResponse updateOfficer(Long id, OfficerUpdateRequest request);

    OfficerResponse updateOfficerStatus(Long id, OfficerStatus status);

    OfficerProfileResponse getOfficerProfile(Long userId);
}
