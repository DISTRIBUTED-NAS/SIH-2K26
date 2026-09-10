package com.scaleguard.dto;

import jakarta.validation.constraints.Size;

public class MeasurementTestRemarksUpdateRequest {

    @Size(max = 2000, message = "Overall remarks cannot exceed 2000 characters.")
    private String overallRemarks;

    public MeasurementTestRemarksUpdateRequest() {
    }

    public MeasurementTestRemarksUpdateRequest(String overallRemarks) {
        this.overallRemarks = overallRemarks;
    }

    public String getOverallRemarks() {
        return overallRemarks;
    }

    public void setOverallRemarks(String overallRemarks) {
        this.overallRemarks = overallRemarks;
    }
}
