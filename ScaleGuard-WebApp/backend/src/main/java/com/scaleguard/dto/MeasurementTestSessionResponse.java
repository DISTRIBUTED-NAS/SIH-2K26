package com.scaleguard.dto;

import com.scaleguard.entity.MeasurementTestStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MeasurementTestSessionResponse {

    private Long id;
    private Long inspectionId;
    private MeasurementTestStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String overallRemarks;
    private Integer totalRecords;
    private BigDecimal maximumAbsoluteError;
    private BigDecimal averagePercentageError;
    private List<MeasurementTestRecordResponse> records = new ArrayList<>();

    public MeasurementTestSessionResponse() {
    }

    public MeasurementTestSessionResponse(Long id, Long inspectionId, MeasurementTestStatus status,
                                         LocalDateTime startedAt, LocalDateTime completedAt,
                                         String overallRemarks, Integer totalRecords,
                                         BigDecimal maximumAbsoluteError, BigDecimal averagePercentageError,
                                         List<MeasurementTestRecordResponse> records) {
        this.id = id;
        this.inspectionId = inspectionId;
        this.status = status;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.overallRemarks = overallRemarks;
        this.totalRecords = totalRecords;
        this.maximumAbsoluteError = maximumAbsoluteError;
        this.averagePercentageError = averagePercentageError;
        this.records = records != null ? records : new ArrayList<>();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInspectionId() {
        return inspectionId;
    }

    public void setInspectionId(Long inspectionId) {
        this.inspectionId = inspectionId;
    }

    public MeasurementTestStatus getStatus() {
        return status;
    }

    public void setStatus(MeasurementTestStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getOverallRemarks() {
        return overallRemarks;
    }

    public void setOverallRemarks(String overallRemarks) {
        this.overallRemarks = overallRemarks;
    }

    public Integer getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(Integer totalRecords) {
        this.totalRecords = totalRecords;
    }

    public BigDecimal getMaximumAbsoluteError() {
        return maximumAbsoluteError;
    }

    public void setMaximumAbsoluteError(BigDecimal maximumAbsoluteError) {
        this.maximumAbsoluteError = maximumAbsoluteError;
    }

    public BigDecimal getAveragePercentageError() {
        return averagePercentageError;
    }

    public void setAveragePercentageError(BigDecimal averagePercentageError) {
        this.averagePercentageError = averagePercentageError;
    }

    public List<MeasurementTestRecordResponse> getRecords() {
        return records;
    }

    public void setRecords(List<MeasurementTestRecordResponse> records) {
        this.records = records;
    }
}
