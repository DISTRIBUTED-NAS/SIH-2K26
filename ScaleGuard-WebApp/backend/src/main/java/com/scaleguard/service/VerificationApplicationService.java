package com.scaleguard.service;

import com.scaleguard.dto.AdminVerificationApplicationResponse;
import com.scaleguard.dto.VerificationApplicationCreateRequest;
import com.scaleguard.dto.VerificationApplicationResponse;
import com.scaleguard.dto.VerificationApplicationUpdateRequest;
import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.ApplicationType;

import java.util.List;

public interface VerificationApplicationService {

    VerificationApplicationResponse createApplication(VerificationApplicationCreateRequest request);

    List<VerificationApplicationResponse> getMyApplications(ApplicationStatus status, ApplicationType applicationType, Long instrumentId, String search);

    VerificationApplicationResponse getMyApplicationById(Long id);

    VerificationApplicationResponse updateDraftApplication(Long id, VerificationApplicationUpdateRequest request);

    VerificationApplicationResponse submitApplication(Long id);

    void deleteDraftApplication(Long id);

    List<AdminVerificationApplicationResponse> getAllApplicationsForAdmin(ApplicationStatus status, ApplicationType applicationType, Long businessId, Long instrumentId, String search);

    AdminVerificationApplicationResponse getApplicationByIdForAdmin(Long id);
}
