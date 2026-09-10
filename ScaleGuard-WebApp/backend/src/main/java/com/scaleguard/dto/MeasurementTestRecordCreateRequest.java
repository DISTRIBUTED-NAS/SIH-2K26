package com.scaleguard.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class MeasurementTestRecordCreateRequest {

    @NotNull(message = "Standard value is required.")
    @DecimalMin(value = "0.000001", message = "Standard value must be greater than zero.")
    private BigDecimal standardValue;

    @NotNull(message = "Observed value is required.")
    @DecimalMin(value = "0.0", message = "Observed value cannot be negative.")
    private BigDecimal observedValue;

    @NotBlank(message = "Unit is required.")
    @Size(max = 30, message = "Unit cannot exceed 30 characters.")
    private String unit;

    @Size(max = 1000, message = "Remarks cannot exceed 1000 characters.")
    private String remarks;

    public MeasurementTestRecordCreateRequest() {
    }

    public MeasurementTestRecordCreateRequest(BigDecimal standardValue, BigDecimal observedValue, String unit, String remarks) {
        this.standardValue = standardValue;
        this.observedValue = observedValue;
        this.unit = unit;
        this.remarks = remarks;
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
}
