package com.scaleguard.dto;

import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.ApplicationType;
import com.scaleguard.entity.VerificationApplication;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class VerificationApplicationResponse {

    private Long id;
    private String applicationNumber;
    private ApplicationType applicationType;
    private ApplicationStatus status;
    private String purpose;
    private LocalDate requestedDate;
    private LocalDate preferredInspectionDate;
    private String remarks;
    private ApplicationInstrumentSummary instrument;
    private Long businessId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VerificationApplicationResponse() {
    }

    public VerificationApplicationResponse(VerificationApplication application) {
        if (application != null) {
            this.id = application.getId();
            this.applicationNumber = application.getApplicationNumber();
            this.applicationType = application.getApplicationType();
            this.status = application.getStatus();
            this.purpose = application.getPurpose();
            this.requestedDate = application.getRequestedDate();
            this.preferredInspectionDate = application.getPreferredInspectionDate();
            this.remarks = application.getRemarks();
            this.instrument = application.getInstrument() != null ? new ApplicationInstrumentSummary(application.getInstrument()) : null;
            this.businessId = application.getBusiness() != null ? application.getBusiness().getId() : null;
            this.createdAt = application.getCreatedAt();
            this.updatedAt = application.getUpdatedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicationNumber() {
        return applicationNumber;
    }

    public void setApplicationNumber(String applicationNumber) {
        this.applicationNumber = applicationNumber;
    }

    public ApplicationType getApplicationType() {
        return applicationType;
    }

    public void setApplicationType(ApplicationType applicationType) {
        this.applicationType = applicationType;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDate requestedDate) {
        this.requestedDate = requestedDate;
    }

    public LocalDate getPreferredInspectionDate() {
        return preferredInspectionDate;
    }

    public void setPreferredInspectionDate(LocalDate preferredInspectionDate) {
        this.preferredInspectionDate = preferredInspectionDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public ApplicationInstrumentSummary getInstrument() {
        return instrument;
    }

    public void setInstrument(ApplicationInstrumentSummary instrument) {
        this.instrument = instrument;
    }

    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
