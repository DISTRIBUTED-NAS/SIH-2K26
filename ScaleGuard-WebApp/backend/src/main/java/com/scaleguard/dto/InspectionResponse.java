package com.scaleguard.dto;

import com.scaleguard.entity.Inspection;
import com.scaleguard.entity.InspectionStatus;

import java.time.LocalDateTime;

public class InspectionResponse {

    private Long id;
    private String inspectionNumber;
    private InspectionStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String location;
    private String notes;
    private String cancellationReason;
    private Long applicationId;
    private String applicationNumber;
    private Long officerId;
    private String officerName;
    private String officerCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InspectionResponse() {
    }

    public static InspectionResponse fromEntity(Inspection inspection) {
        if (inspection == null) {
            return null;
        }
        InspectionResponse res = new InspectionResponse();
        res.setId(inspection.getId());
        res.setInspectionNumber(inspection.getInspectionNumber());
        res.setStatus(inspection.getStatus());
        res.setScheduledAt(inspection.getScheduledAt());
        res.setStartedAt(inspection.getStartedAt());
        res.setCompletedAt(inspection.getCompletedAt());
        res.setLocation(inspection.getLocation());
        res.setNotes(inspection.getNotes());
        res.setCancellationReason(inspection.getCancellationReason());
        if (inspection.getApplication() != null) {
            res.setApplicationId(inspection.getApplication().getId());
            res.setApplicationNumber(inspection.getApplication().getApplicationNumber());
        }
        if (inspection.getOfficer() != null) {
            res.setOfficerId(inspection.getOfficer().getId());
            res.setOfficerCode(inspection.getOfficer().getOfficerCode());
            if (inspection.getOfficer().getUser() != null) {
                res.setOfficerName(inspection.getOfficer().getUser().getFullName());
            }
        }
        res.setCreatedAt(inspection.getCreatedAt());
        res.setUpdatedAt(inspection.getUpdatedAt());
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
