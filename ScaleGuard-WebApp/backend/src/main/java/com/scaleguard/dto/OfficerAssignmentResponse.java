package com.scaleguard.dto;

import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.VerificationApplication;

import java.time.LocalDateTime;

public class OfficerAssignmentResponse {

    private Long applicationId;
    private String applicationNumber;
    private ApplicationStatus status;
    private OfficerSummary assignedOfficer;
    private LocalDateTime assignedAt;

    public OfficerAssignmentResponse() {
    }

    public OfficerAssignmentResponse(VerificationApplication app) {
        if (app != null) {
            this.applicationId = app.getId();
            this.applicationNumber = app.getApplicationNumber();
            this.status = app.getStatus();
            this.assignedAt = app.getAssignedAt();
            if (app.getAssignedOfficer() != null) {
                this.assignedOfficer = new OfficerSummary(app.getAssignedOfficer());
            }
        }
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public OfficerSummary getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(OfficerSummary assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
