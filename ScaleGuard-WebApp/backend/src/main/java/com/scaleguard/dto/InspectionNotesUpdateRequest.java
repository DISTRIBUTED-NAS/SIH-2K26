package com.scaleguard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class InspectionNotesUpdateRequest {

    @NotBlank(message = "Notes cannot be empty")
    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    public InspectionNotesUpdateRequest() {
    }

    public InspectionNotesUpdateRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
