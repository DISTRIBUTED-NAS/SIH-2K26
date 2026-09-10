package com.scaleguard.entity;

public enum InstrumentType {
    DIGITAL_WEIGHING_SCALE("Digital Weighing Scale"),
    MECHANICAL_WEIGHING_SCALE("Mechanical Weighing Scale"),
    PLATFORM_SCALE("Platform Scale"),
    ELECTRONIC_BALANCE("Electronic Balance"),
    SPRING_BALANCE("Spring Balance"),
    COUNTER_SCALE("Counter Scale"),
    PRECISION_BALANCE("Precision Balance"),
    OTHER("Other");

    private final String displayName;

    InstrumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
