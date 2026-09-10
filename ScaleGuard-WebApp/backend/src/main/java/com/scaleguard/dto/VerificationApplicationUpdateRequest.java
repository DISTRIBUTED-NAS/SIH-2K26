package com.scaleguard.dto;

import com.scaleguard.entity.ApplicationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class VerificationApplicationUpdateRequest {

    @NotNull(message = "Instrument ID is required")
    private Long instrumentId;

    @NotNull(message = "Application type is required")
    private ApplicationType applicationType;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose must not exceed 500 characters")
    private String purpose;

    private LocalDate requestedDate;

    private LocalDate preferredInspectionDate;

    @Size(max = 1000, message = "Remarks must not exceed 1000 characters")
    private String remarks;

    public VerificationApplicationUpdateRequest() {
    }

    public VerificationApplicationUpdateRequest(Long instrumentId, ApplicationType applicationType,
                                               String purpose, LocalDate requestedDate,
                                               LocalDate preferredInspectionDate, String remarks) {
        this.instrumentId = instrumentId;
        this.applicationType = applicationType;
        this.purpose = purpose;
        this.requestedDate = requestedDate;
        this.preferredInspectionDate = preferredInspectionDate;
        this.remarks = remarks;
    }

    public Long getInstrumentId() {
        return instrumentId;
    }

    public void setInstrumentId(Long instrumentId) {
        this.instrumentId = instrumentId;
    }

    public ApplicationType getApplicationType() {
        return applicationType;
    }

    public void setApplicationType(ApplicationType applicationType) {
        this.applicationType = applicationType;
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
}
