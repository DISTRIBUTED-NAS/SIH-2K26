package com.scaleguard.dto;

import com.scaleguard.entity.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InspectionDetailsResponse {

    // Inspection Info
    private Long id;
    private String inspectionNumber;
    private InspectionStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String location;
    private String notes;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Officer Info
    private Long officerId;
    private String officerName;
    private String officerCode;
    private String officerDesignation;
    private String officerDepartment;
    private String officerDistrict;
    private String officerPhone;

    // Application Info
    private Long applicationId;
    private String applicationNumber;
    private ApplicationType applicationType;
    private ApplicationStatus applicationStatus;
    private String purpose;
    private LocalDate requestedDate;
    private LocalDate preferredInspectionDate;
    private String applicationRemarks;

    // Business Info
    private Long businessId;
    private String businessName;
    private String businessType;
    private String registrationNumber;
    private String gstNumber;
    private String contactEmail;
    private String contactPhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;

    // Instrument Info
    private Long instrumentId;
    private String instrumentName;
    private InstrumentType instrumentType;
    private String manufacturer;
    private String modelNumber;
    private String serialNumber;
    private BigDecimal capacity;
    private CapacityUnit capacityUnit;
    private BigDecimal accuracy;
    private AccuracyUnit accuracyUnit;
    private String instrumentLocation;

    public InspectionDetailsResponse() {
    }

    public static InspectionDetailsResponse fromEntity(Inspection inspection) {
        if (inspection == null) {
            return null;
        }
        InspectionDetailsResponse res = new InspectionDetailsResponse();
        res.setId(inspection.getId());
        res.setInspectionNumber(inspection.getInspectionNumber());
        res.setStatus(inspection.getStatus());
        res.setScheduledAt(inspection.getScheduledAt());
        res.setStartedAt(inspection.getStartedAt());
        res.setCompletedAt(inspection.getCompletedAt());
        res.setLocation(inspection.getLocation());
        res.setNotes(inspection.getNotes());
        res.setCancellationReason(inspection.getCancellationReason());
        res.setCreatedAt(inspection.getCreatedAt());
        res.setUpdatedAt(inspection.getUpdatedAt());

        OfficerProfile officer = inspection.getOfficer();
        if (officer != null) {
            res.setOfficerId(officer.getId());
            res.setOfficerCode(officer.getOfficerCode());
            res.setOfficerDesignation(officer.getDesignation());
            res.setOfficerDepartment(officer.getDepartment());
            res.setOfficerDistrict(officer.getDistrict());
            res.setOfficerPhone(officer.getPhoneNumber());
            if (officer.getUser() != null) {
                res.setOfficerName(officer.getUser().getFullName());
            }
        }

        VerificationApplication app = inspection.getApplication();
        if (app != null) {
            res.setApplicationId(app.getId());
            res.setApplicationNumber(app.getApplicationNumber());
            res.setApplicationType(app.getApplicationType());
            res.setApplicationStatus(app.getStatus());
            res.setPurpose(app.getPurpose());
            res.setRequestedDate(app.getRequestedDate());
            res.setPreferredInspectionDate(app.getPreferredInspectionDate());
            res.setApplicationRemarks(app.getRemarks());

            Business business = app.getBusiness();
            if (business != null) {
                res.setBusinessId(business.getId());
                res.setBusinessName(business.getBusinessName());
                res.setBusinessType(business.getBusinessType());
                res.setRegistrationNumber(business.getRegistrationNumber());
                res.setGstNumber(business.getGstNumber());
                res.setContactEmail(business.getContactEmail());
                res.setContactPhone(business.getContactPhone());
                res.setAddressLine1(business.getAddressLine1());
                res.setAddressLine2(business.getAddressLine2());
                res.setCity(business.getCity());
                res.setState(business.getState());
                res.setPincode(business.getPincode());
            }

            Instrument inst = app.getInstrument();
            if (inst != null) {
                res.setInstrumentId(inst.getId());
                res.setInstrumentName(inst.getInstrumentName());
                res.setInstrumentType(inst.getInstrumentType());
                res.setManufacturer(inst.getManufacturer());
                res.setModelNumber(inst.getModelNumber());
                res.setSerialNumber(inst.getSerialNumber());
                res.setCapacity(inst.getCapacity());
                res.setCapacityUnit(inst.getCapacityUnit());
                res.setAccuracy(inst.getAccuracy());
                res.setAccuracyUnit(inst.getAccuracyUnit());
                res.setInstrumentLocation(inst.getLocation());
            }
        }

        return res;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInspectionNumber() {
        return inspectionNumber;
    }

    public void setInspectionNumber(String inspectionNumber) {
        this.inspectionNumber = inspectionNumber;
    }

    public InspectionStatus getStatus() {
        return status;
    }

    public void setStatus(InspectionStatus status) {
        this.status = status;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
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

    public Long getOfficerId() {
        return officerId;
    }

    public void setOfficerId(Long officerId) {
        this.officerId = officerId;
    }

    public String getOfficerName() {
        return officerName;
    }

    public void setOfficerName(String officerName) {
        this.officerName = officerName;
    }

    public String getOfficerCode() {
        return officerCode;
    }

    public void setOfficerCode(String officerCode) {
        this.officerCode = officerCode;
    }

    public String getOfficerDesignation() {
        return officerDesignation;
    }

    public void setOfficerDesignation(String officerDesignation) {
        this.officerDesignation = officerDesignation;
    }

    public String getOfficerDepartment() {
        return officerDepartment;
    }

    public void setOfficerDepartment(String officerDepartment) {
        this.officerDepartment = officerDepartment;
    }

    public String getOfficerDistrict() {
        return officerDistrict;
    }

    public void setOfficerDistrict(String officerDistrict) {
        this.officerDistrict = officerDistrict;
    }

    public String getOfficerPhone() {
        return officerPhone;
    }

    public void setOfficerPhone(String officerPhone) {
        this.officerPhone = officerPhone;
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

    public ApplicationType getApplicationType() {
        return applicationType;
    }

    public void setApplicationType(ApplicationType applicationType) {
        this.applicationType = applicationType;
    }

    public ApplicationStatus getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(ApplicationStatus applicationStatus) {
        this.applicationStatus = applicationStatus;
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

    public String getApplicationRemarks() {
        return applicationRemarks;
    }

    public void setApplicationRemarks(String applicationRemarks) {
        this.applicationRemarks = applicationRemarks;
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

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
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

    public Long getInstrumentId() {
        return instrumentId;
    }

    public void setInstrumentId(Long instrumentId) {
        this.instrumentId = instrumentId;
    }

    public String getInstrumentName() {
        return instrumentName;
    }

    public void setInstrumentName(String instrumentName) {
        this.instrumentName = instrumentName;
    }

    public InstrumentType getInstrumentType() {
        return instrumentType;
    }

    public void setInstrumentType(InstrumentType instrumentType) {
        this.instrumentType = instrumentType;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModelNumber() {
        return modelNumber;
    }

    public void setModelNumber(String modelNumber) {
        this.modelNumber = modelNumber;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public BigDecimal getCapacity() {
        return capacity;
    }

    public void setCapacity(BigDecimal capacity) {
        this.capacity = capacity;
    }

    public CapacityUnit getCapacityUnit() {
        return capacityUnit;
    }

    public void setCapacityUnit(CapacityUnit capacityUnit) {
        this.capacityUnit = capacityUnit;
    }

    public BigDecimal getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(BigDecimal accuracy) {
        this.accuracy = accuracy;
    }

    public AccuracyUnit getAccuracyUnit() {
        return accuracyUnit;
    }

    public void setAccuracyUnit(AccuracyUnit accuracyUnit) {
        this.accuracyUnit = accuracyUnit;
    }

    public String getInstrumentLocation() {
        return instrumentLocation;
    }

    public void setInstrumentLocation(String instrumentLocation) {
        this.instrumentLocation = instrumentLocation;
    }
}
