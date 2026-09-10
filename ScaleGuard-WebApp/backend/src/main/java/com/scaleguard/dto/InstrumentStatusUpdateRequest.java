package com.scaleguard.dto;

import com.scaleguard.entity.InstrumentStatus;
import jakarta.validation.constraints.NotNull;

public class InstrumentStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private InstrumentStatus status;

    public InstrumentStatusUpdateRequest() {
    }

    public InstrumentStatusUpdateRequest(InstrumentStatus status) {
        this.status = status;
    }

    public InstrumentStatus getStatus() {
        return status;
    }

    public void setStatus(InstrumentStatus status) {
        this.status = status;
    }
}
