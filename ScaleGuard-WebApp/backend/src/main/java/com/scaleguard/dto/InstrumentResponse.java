package com.scaleguard.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.scaleguard.entity.AccuracyUnit;
import com.scaleguard.entity.CapacityUnit;
import com.scaleguard.entity.Instrument;
import com.scaleguard.entity.InstrumentStatus;
import com.scaleguard.entity.InstrumentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InstrumentResponse {

    private Long id;
    private String instrumentName;
    private InstrumentType instrumentType;
    private String manufacturer;
    private String modelNumber;
    private String serialNumber;
    private BigDecimal capacity;
    private CapacityUnit capacityUnit;
    private BigDecimal accuracy;
    private AccuracyUnit accuracyUnit;
    private Integer manufacturingYear;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate purchaseDate;

    private String location;
    private InstrumentStatus status;
    private Long businessId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public InstrumentResponse() {
    }

    public InstrumentResponse(Long id, String instrumentName, InstrumentType instrumentType,
                              String manufacturer, String modelNumber, String serialNumber,
                              BigDecimal capacity, CapacityUnit capacityUnit, BigDecimal accuracy,
                              AccuracyUnit accuracyUnit, Integer manufacturingYear,
                              LocalDate purchaseDate, String location, InstrumentStatus status,
                              Long businessId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.instrumentName = instrumentName;
        this.instrumentType = instrumentType;
        this.manufacturer = manufacturer;
        this.modelNumber = modelNumber;
        this.serialNumber = serialNumber;
        this.capacity = capacity;
        this.capacityUnit = capacityUnit;
        this.accuracy = accuracy;
        this.accuracyUnit = accuracyUnit;
        this.manufacturingYear = manufacturingYear;
        this.purchaseDate = purchaseDate;
        this.location = location;
        this.status = status;
        this.businessId = businessId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static InstrumentResponse fromEntity(Instrument instrument) {
        return new InstrumentResponse(
                instrument.getId(),
                instrument.getInstrumentName(),
                instrument.getInstrumentType(),
                instrument.getManufacturer(),
                instrument.getModelNumber(),
                instrument.getSerialNumber(),
                instrument.getCapacity(),
                instrument.getCapacityUnit(),
                instrument.getAccuracy(),
                instrument.getAccuracyUnit(),
                instrument.getManufacturingYear(),
                instrument.getPurchaseDate(),
                instrument.getLocation(),
                instrument.getStatus(),
                instrument.getBusiness() != null ? instrument.getBusiness().getId() : null,
                instrument.getCreatedAt(),
                instrument.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInstrumentName() {
        return instrumentName;
    }

    public void setInstrumentName(String instrumentName) {
        this.instrumentName = instrumentName;
    }

    public InstrumentType getInstrumentType() {
        return instrumentType;
    }

    public void setInstrumentType(InstrumentType instrumentType) {
        this.instrumentType = instrumentType;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModelNumber() {
        return modelNumber;
    }

    public void setModelNumber(String modelNumber) {
        this.modelNumber = modelNumber;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public BigDecimal getCapacity() {
        return capacity;
    }

    public void setCapacity(BigDecimal capacity) {
        this.capacity = capacity;
    }

    public CapacityUnit getCapacityUnit() {
        return capacityUnit;
    }

    public void setCapacityUnit(CapacityUnit capacityUnit) {
        this.capacityUnit = capacityUnit;
    }

    public BigDecimal getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(BigDecimal accuracy) {
        this.accuracy = accuracy;
    }

    public AccuracyUnit getAccuracyUnit() {
        return accuracyUnit;
    }

    public void setAccuracyUnit(AccuracyUnit accuracyUnit) {
        this.accuracyUnit = accuracyUnit;
    }

    public Integer getManufacturingYear() {
        return manufacturingYear;
    }

    public void setManufacturingYear(Integer manufacturingYear) {
        this.manufacturingYear = manufacturingYear;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public InstrumentStatus getStatus() {
        return status;
    }

    public void setStatus(InstrumentStatus status) {
        this.status = status;
    }

    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
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
