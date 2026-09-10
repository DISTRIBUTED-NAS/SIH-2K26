package com.scaleguard.dto;

import jakarta.validation.constraints.NotNull;

public class OfficerAssignmentRequest {

    @NotNull(message = "Officer ID is required")
    private Long officerId;

    public OfficerAssignmentRequest() {
    }

    public OfficerAssignmentRequest(Long officerId) {
        this.officerId = officerId;
    }

    public Long getOfficerId() {
        return officerId;
    }

    public void setOfficerId(Long officerId) {
        this.officerId = officerId;
    }
}
