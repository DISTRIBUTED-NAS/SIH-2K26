package com.scaleguard.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "measurement_test_records", indexes = {
    @Index(name = "idx_mtr_session", columnList = "test_session_id"),
    @Index(name = "idx_mtr_test_point", columnList = "test_session_id, test_point")
})
public class MeasurementTestRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_session_id", nullable = false)
    private MeasurementTestSession testSession;

    @Column(name = "test_point", nullable = false)
    private Integer testPoint;

    @Column(name = "standard_value", nullable = false, precision = 19, scale = 6)
    private BigDecimal standardValue;

    @Column(name = "observed_value", nullable = false, precision = 19, scale = 6)
    private BigDecimal observedValue;

    @Column(name = "error_value", nullable = false, precision = 19, scale = 6)
    private BigDecimal errorValue;

    @Column(name = "percentage_error", nullable = false, precision = 19, scale = 6)
    private BigDecimal percentageError;

    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public MeasurementTestRecord() {
    }

    public MeasurementTestRecord(MeasurementTestSession testSession, Integer testPoint,
                                 BigDecimal standardValue, BigDecimal observedValue,
                                 BigDecimal errorValue, BigDecimal percentageError,
                                 String unit, String remarks) {
        this.testSession = testSession;
        this.testPoint = testPoint;
        this.standardValue = standardValue;
        this.observedValue = observedValue;
        this.errorValue = errorValue;
        this.percentageError = percentageError;
        this.unit = unit;
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MeasurementTestSession getTestSession() {
        return testSession;
    }

    public void setTestSession(MeasurementTestSession testSession) {
        this.testSession = testSession;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
