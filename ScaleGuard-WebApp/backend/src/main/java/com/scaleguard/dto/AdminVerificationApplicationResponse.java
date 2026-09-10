package com.scaleguard.dto;

import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.ApplicationType;
import com.scaleguard.entity.VerificationApplication;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AdminVerificationApplicationResponse {

    private Long id;
    private String applicationNumber;
    private ApplicationType applicationType;
    private ApplicationStatus status;
    private String purpose;
    private LocalDate requestedDate;
    private LocalDate preferredInspectionDate;
    private String remarks;

    // Business details
    private Long businessId;
    private String businessName;
    private String businessCity;
    private String businessState;
    private String businessGst;
    private String ownerName;
    private String ownerEmail;

    // Instrument details
    private ApplicationInstrumentSummary instrument;

    // Officer assignment
    private OfficerSummary assignedOfficer;
    private LocalDateTime assignedAt;

    // Inspection details
    private Long inspectionId;
    private String inspectionNumber;
    private String inspectionStatus;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdminVerificationApplicationResponse() {
    }

    public AdminVerificationApplicationResponse(VerificationApplication application) {
        if (application != null) {
            this.id = application.getId();
            this.applicationNumber = application.getApplicationNumber();
            this.applicationType = application.getApplicationType();
            this.status = application.getStatus();
            this.purpose = application.getPurpose();
            this.requestedDate = application.getRequestedDate();
            this.preferredInspectionDate = application.getPreferredInspectionDate();
            this.remarks = application.getRemarks();
            this.createdAt = application.getCreatedAt();
            this.updatedAt = application.getUpdatedAt();

            if (application.getBusiness() != null) {
                this.businessId = application.getBusiness().getId();
                this.businessName = application.getBusiness().getBusinessName();
                this.businessCity = application.getBusiness().getCity();
                this.businessState = application.getBusiness().getState();
                this.businessGst = application.getBusiness().getGstNumber();
                if (application.getBusiness().getOwner() != null) {
                    this.ownerName = application.getBusiness().getOwner().getFullName();
                    this.ownerEmail = application.getBusiness().getOwner().getEmail();
                }
            }

            if (application.getInstrument() != null) {
                this.instrument = new ApplicationInstrumentSummary(application.getInstrument());
            }

            if (application.getAssignedOfficer() != null) {
                this.assignedOfficer = new OfficerSummary(application.getAssignedOfficer());
            }
            this.assignedAt = application.getAssignedAt();

            if (application.getInspection() != null) {
                this.inspectionId = application.getInspection().getId();
                this.inspectionNumber = application.getInspection().getInspectionNumber();
                this.inspectionStatus = application.getInspection().getStatus() != null ? application.getInspection().getStatus().name() : null;
            }
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

    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessCity() {
        return businessCity;
    }

    public void setBusinessCity(String businessCity) {
        this.businessCity = businessCity;
    }

    public String getBusinessState() {
        return businessState;
    }

    public void setBusinessState(String businessState) {
        this.businessState = businessState;
    }

    public String getBusinessGst() {
        return businessGst;
    }

    public void setBusinessGst(String businessGst) {
        this.businessGst = businessGst;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public ApplicationInstrumentSummary getInstrument() {
        return instrument;
    }

    public void setInstrument(ApplicationInstrumentSummary instrument) {
        this.instrument = instrument;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getInspectionId() {
        return inspectionId;
    }

    public void setInspectionId(Long inspectionId) {
        this.inspectionId = inspectionId;
    }

    public String getInspectionNumber() {
        return inspectionNumber;
    }

    public void setInspectionNumber(String inspectionNumber) {
        this.inspectionNumber = inspectionNumber;
    }

    public String getInspectionStatus() {
        return inspectionStatus;
    }

    public void setInspectionStatus(String inspectionStatus) {
        this.inspectionStatus = inspectionStatus;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
