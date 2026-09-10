package com.scaleguard.dto;

import com.scaleguard.entity.Inspection;
import com.scaleguard.entity.InspectionStatus;

import java.time.LocalDateTime;

public class InspectionSummaryResponse {

    private Long id;
    private String inspectionNumber;
    private InspectionStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String location;
    private Long applicationId;
    private String applicationNumber;
    private String applicationType;
    private String businessName;
    private String businessCity;
    private String instrumentName;
    private String officerName;
    private String officerCode;
    private String district;
    private LocalDateTime createdAt;

    public InspectionSummaryResponse() {
    }

    public static InspectionSummaryResponse fromEntity(Inspection inspection) {
        if (inspection == null) {
            return null;
        }
        InspectionSummaryResponse res = new InspectionSummaryResponse();
        res.setId(inspection.getId());
        res.setInspectionNumber(inspection.getInspectionNumber());
        res.setStatus(inspection.getStatus());
        res.setScheduledAt(inspection.getScheduledAt());
        res.setStartedAt(inspection.getStartedAt());
        res.setCompletedAt(inspection.getCompletedAt());
        res.setLocation(inspection.getLocation());
        res.setCreatedAt(inspection.getCreatedAt());

        if (inspection.getApplication() != null) {
            res.setApplicationId(inspection.getApplication().getId());
            res.setApplicationNumber(inspection.getApplication().getApplicationNumber());
            if (inspection.getApplication().getApplicationType() != null) {
                res.setApplicationType(inspection.getApplication().getApplicationType().name());
            }
            if (inspection.getApplication().getBusiness() != null) {
                res.setBusinessName(inspection.getApplication().getBusiness().getBusinessName());
                res.setBusinessCity(inspection.getApplication().getBusiness().getCity());
            }
            if (inspection.getApplication().getInstrument() != null) {
                res.setInstrumentName(inspection.getApplication().getInstrument().getInstrumentName());
            }
        }

        if (inspection.getOfficer() != null) {
            res.setOfficerCode(inspection.getOfficer().getOfficerCode());
            res.setDistrict(inspection.getOfficer().getDistrict());
            if (inspection.getOfficer().getUser() != null) {
                res.setOfficerName(inspection.getOfficer().getUser().getFullName());
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

    public String getApplicationType() {
        return applicationType;
    }

    public void setApplicationType(String applicationType) {
        this.applicationType = applicationType;
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

    public String getInstrumentName() {
        return instrumentName;
    }

    public void setInstrumentName(String instrumentName) {
        this.instrumentName = instrumentName;
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

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
