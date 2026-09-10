package com.scaleguard.dto;

import com.scaleguard.entity.OfficerStatus;
import jakarta.validation.constraints.NotNull;

public class OfficerStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private OfficerStatus status;

    public OfficerStatusUpdateRequest() {
    }

    public OfficerStatusUpdateRequest(OfficerStatus status) {
        this.status = status;
    }

    public OfficerStatus getStatus() {
        return status;
    }

    public void setStatus(OfficerStatus status) {
        this.status = status;
    }
}
