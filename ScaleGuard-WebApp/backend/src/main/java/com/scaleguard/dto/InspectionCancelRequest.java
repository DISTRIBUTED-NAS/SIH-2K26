package com.scaleguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class InspectionCancelRequest {

    @NotBlank(message = "Cancellation reason is required")
    @Size(max = 1000, message = "Cancellation reason must not exceed 1000 characters")
    private String reason;

    public InspectionCancelRequest() {
    }

    public InspectionCancelRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setCancellationReason(String cancellationReason) {
        if (this.reason == null || this.reason.isBlank()) {
            this.reason = cancellationReason;
        }
    }
}
