package com.scaleguard.entity;

public enum ApplicationType {
    INITIAL_VERIFICATION("Initial Verification"),
    PERIODIC_VERIFICATION("Periodic Verification"),
    RE_VERIFICATION("Re-Verification");

    private final String displayName;

    ApplicationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
