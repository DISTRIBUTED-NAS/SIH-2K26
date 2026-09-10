package com.scaleguard.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MeasurementTestRecordResponse {

    private Long id;
    private Integer testPoint;
    private BigDecimal standardValue;
    private BigDecimal observedValue;
    private BigDecimal errorValue;
    private BigDecimal percentageError;
    private String unit;
    private String remarks;
    private LocalDateTime createdAt;

    public MeasurementTestRecordResponse() {
    }

    public MeasurementTestRecordResponse(Long id, Integer testPoint, BigDecimal standardValue,
                                         BigDecimal observedValue, BigDecimal errorValue,
                                         BigDecimal percentageError, String unit, String remarks,
                                         LocalDateTime createdAt) {
        this.id = id;
        this.testPoint = testPoint;
        this.standardValue = standardValue;
        this.observedValue = observedValue;
        this.errorValue = errorValue;
        this.percentageError = percentageError;
        this.unit = unit;
        this.remarks = remarks;
        this.createdAt = createdAt;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getTestPoint() {
        return testPoint;
    }

    public void setTestPoint(Integer testPoint) {
        this.testPoint = testPoint;
    }

    public BigDecimal getStandardValue() {
        return standardValue;
    }

    public void setStandardValue(BigDecimal standardValue) {
        this.standardValue = standardValue;
    }

    public BigDecimal getObservedValue() {
        return observedValue;
    }

    public void setObservedValue(BigDecimal observedValue) {
        this.observedValue = observedValue;
    }

    public BigDecimal getErrorValue() {
        return errorValue;
    }

    public void setErrorValue(BigDecimal errorValue) {
        this.errorValue = errorValue;
    }

    public BigDecimal getPercentageError() {
        return percentageError;
    }

    public void setPercentageError(BigDecimal percentageError) {
        this.percentageError = percentageError;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
