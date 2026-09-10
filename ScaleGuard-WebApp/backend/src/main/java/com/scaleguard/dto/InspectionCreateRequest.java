package com.scaleguard.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class InspectionCreateRequest {

    @NotNull(message = "Scheduled date and time is required")
    private LocalDateTime scheduledAt;

    @NotBlank(message = "Inspection location is required")
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    public InspectionCreateRequest() {
    }

    public InspectionCreateRequest(LocalDateTime scheduledAt, String location, String notes) {
        this.scheduledAt = scheduledAt;
        this.location = location;
        this.notes = notes;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
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
}
