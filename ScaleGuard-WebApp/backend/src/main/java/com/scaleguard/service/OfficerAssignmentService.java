package com.scaleguard.service;

import com.scaleguard.dto.OfficerApplicationResponse;
import com.scaleguard.dto.OfficerAssignmentResponse;

import java.util.List;

public interface OfficerAssignmentService {

    OfficerAssignmentResponse assignOfficer(Long applicationId, Long officerId);

    OfficerAssignmentResponse reassignOfficer(Long applicationId, Long officerId);

    List<OfficerApplicationResponse> getAssignedApplicationsForOfficer(Long userId);

    OfficerApplicationResponse getAssignedApplicationDetailsForOfficer(Long userId, Long applicationId);
}
