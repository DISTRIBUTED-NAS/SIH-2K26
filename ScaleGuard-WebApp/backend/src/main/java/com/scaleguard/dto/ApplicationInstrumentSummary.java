package com.scaleguard.dto;

import com.scaleguard.entity.Instrument;

import java.math.BigDecimal;

public class ApplicationInstrumentSummary {

    private Long id;
    private String instrumentName;
    private String instrumentType;
    private String serialNumber;
    private String manufacturer;
    private String modelNumber;
    private BigDecimal capacity;
    private String capacityUnit;
    private BigDecimal accuracy;
    private String accuracyUnit;
    private String status;

    public ApplicationInstrumentSummary() {
    }

    public ApplicationInstrumentSummary(Instrument instrument) {
        if (instrument != null) {
            this.id = instrument.getId();
            this.instrumentName = instrument.getInstrumentName();
            this.instrumentType = instrument.getInstrumentType() != null ? instrument.getInstrumentType().name() : null;
            this.serialNumber = instrument.getSerialNumber();
            this.manufacturer = instrument.getManufacturer();
            this.modelNumber = instrument.getModelNumber();
            this.capacity = instrument.getCapacity();
            this.capacityUnit = instrument.getCapacityUnit() != null ? instrument.getCapacityUnit().name() : null;
            this.accuracy = instrument.getAccuracy();
            this.accuracyUnit = instrument.getAccuracyUnit() != null ? instrument.getAccuracyUnit().name() : null;
            this.status = instrument.getStatus() != null ? instrument.getStatus().name() : null;
        }
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

    public String getInstrumentType() {
        return instrumentType;
    }

    public void setInstrumentType(String instrumentType) {
        this.instrumentType = instrumentType;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
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

    public BigDecimal getCapacity() {
        return capacity;
    }

    public void setCapacity(BigDecimal capacity) {
        this.capacity = capacity;
    }

    public String getCapacityUnit() {
        return capacityUnit;
    }

    public void setCapacityUnit(String capacityUnit) {
        this.capacityUnit = capacityUnit;
    }

    public BigDecimal getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(BigDecimal accuracy) {
        this.accuracy = accuracy;
    }

    public String getAccuracyUnit() {
        return accuracyUnit;
    }

    public void setAccuracyUnit(String accuracyUnit) {
        this.accuracyUnit = accuracyUnit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
