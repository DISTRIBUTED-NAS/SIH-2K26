package com.scaleguard.dto;

import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.ApplicationType;
import com.scaleguard.entity.VerificationApplication;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class OfficerApplicationResponse {

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
    private String businessType;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String gstNumber;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;

    // Instrument details
    private ApplicationInstrumentSummary instrument;

    // Inspection details
    private Long inspectionId;
    private String inspectionNumber;
    private String inspectionStatus;

    private LocalDateTime assignedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OfficerApplicationResponse() {
    }

    public OfficerApplicationResponse(VerificationApplication application) {
        if (application != null) {
            this.id = application.getId();
            this.applicationNumber = application.getApplicationNumber();
            this.applicationType = application.getApplicationType();
            this.status = application.getStatus();
            this.purpose = application.getPurpose();
            this.requestedDate = application.getRequestedDate();
            this.preferredInspectionDate = application.getPreferredInspectionDate();
            this.remarks = application.getRemarks();
            this.assignedAt = application.getAssignedAt();
            this.createdAt = application.getCreatedAt();
            this.updatedAt = application.getUpdatedAt();

            if (application.getBusiness() != null) {
                this.businessId = application.getBusiness().getId();
                this.businessName = application.getBusiness().getBusinessName();
                this.businessType = application.getBusiness().getBusinessType();
                this.addressLine1 = application.getBusiness().getAddressLine1();
                this.addressLine2 = application.getBusiness().getAddressLine2();
                this.city = application.getBusiness().getCity();
                this.state = application.getBusiness().getState();
                this.pincode = application.getBusiness().getPincode();
                this.gstNumber = application.getBusiness().getGstNumber();
                this.contactEmail = application.getBusiness().getContactEmail();
                this.contactPhone = application.getBusiness().getContactPhone();

                if (application.getBusiness().getOwner() != null) {
                    this.contactPerson = application.getBusiness().getOwner().getFullName();
                }
            }

            if (application.getInstrument() != null) {
                this.instrument = new ApplicationInstrumentSummary(application.getInstrument());
            }

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

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public ApplicationInstrumentSummary getInstrument() {
        return instrument;
    }

    public void setInstrument(ApplicationInstrumentSummary instrument) {
        this.instrument = instrument;
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
