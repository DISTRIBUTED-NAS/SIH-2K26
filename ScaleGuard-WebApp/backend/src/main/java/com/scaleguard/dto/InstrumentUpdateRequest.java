package com.scaleguard.dto;

import com.scaleguard.entity.AccuracyUnit;
import com.scaleguard.entity.CapacityUnit;
import com.scaleguard.entity.InstrumentType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;

public class InstrumentUpdateRequest {

    @NotBlank(message = "Instrument name is required")
    @Size(min = 2, max = 150, message = "Instrument name must be between 2 and 150 characters")
    private String instrumentName;

    @NotNull(message = "Instrument type is required")
    private InstrumentType instrumentType;

    @NotBlank(message = "Manufacturer is required")
    @Size(min = 2, max = 150, message = "Manufacturer must be between 2 and 150 characters")
    private String manufacturer;

    @NotBlank(message = "Model number is required")
    @Size(min = 1, max = 100, message = "Model number must be between 1 and 100 characters")
    private String modelNumber;

    @NotBlank(message = "Serial number is required")
    @Size(min = 2, max = 100, message = "Serial number must be between 2 and 100 characters")
    private String serialNumber;

    @NotNull(message = "Capacity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Capacity must be greater than 0")
    private BigDecimal capacity;

    @NotNull(message = "Capacity unit is required")
    private CapacityUnit capacityUnit;

    @NotNull(message = "Accuracy is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Accuracy must be greater than 0")
    private BigDecimal accuracy;

    @NotNull(message = "Accuracy unit is required")
    private AccuracyUnit accuracyUnit;

    @NotNull(message = "Manufacturing year is required")
    @Min(value = 1900, message = "Manufacturing year must be 1900 or later")
    private Integer manufacturingYear;

    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 255, message = "Location must be between 2 and 255 characters")
    private String location;

    @AssertTrue(message = "Manufacturing year cannot be in the future")
    public boolean isManufacturingYearValid() {
        if (manufacturingYear == null) {
            return true;
        }
        return manufacturingYear >= 1900 && manufacturingYear <= Year.now().getValue() + 1;
    }

    public InstrumentUpdateRequest() {
    }

    public InstrumentUpdateRequest(String instrumentName, InstrumentType instrumentType, String manufacturer,
                                 String modelNumber, String serialNumber, BigDecimal capacity,
                                 CapacityUnit capacityUnit, BigDecimal accuracy, AccuracyUnit accuracyUnit,
                                 Integer manufacturingYear, LocalDate purchaseDate, String location) {
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
}
