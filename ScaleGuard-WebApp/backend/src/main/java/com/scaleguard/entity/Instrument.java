package com.scaleguard.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "instruments", indexes = {
    @Index(name = "idx_instrument_serial", columnList = "serial_number", unique = true),
    @Index(name = "idx_instrument_business", columnList = "business_id")
})
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instrument_name", nullable = false, length = 150)
    private String instrumentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "instrument_type", nullable = false, length = 50)
    private InstrumentType instrumentType;

    @Column(name = "manufacturer", nullable = false, length = 150)
    private String manufacturer;

    @Column(name = "model_number", nullable = false, length = 100)
    private String modelNumber;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Column(name = "capacity", nullable = false, precision = 14, scale = 4)
    private BigDecimal capacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "capacity_unit", nullable = false, length = 20)
    private CapacityUnit capacityUnit;

    @Column(name = "accuracy", nullable = false, precision = 14, scale = 4)
    private BigDecimal accuracy;

    @Enumerated(EnumType.STRING)
    @Column(name = "accuracy_unit", nullable = false, length = 20)
    private AccuracyUnit accuracyUnit;

    @Column(name = "manufacturing_year", nullable = false)
    private Integer manufacturingYear;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "location", nullable = false, length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InstrumentStatus status = InstrumentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @OneToMany(mappedBy = "instrument", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VerificationApplication> verificationApplications = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = InstrumentStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Instrument() {
    }

    public Instrument(String instrumentName, InstrumentType instrumentType, String manufacturer,
                      String modelNumber, String serialNumber, BigDecimal capacity,
                      CapacityUnit capacityUnit, BigDecimal accuracy, AccuracyUnit accuracyUnit,
                      Integer manufacturingYear, LocalDate purchaseDate, String location,
                      InstrumentStatus status, Business business) {
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
        this.status = status != null ? status : InstrumentStatus.ACTIVE;
        this.business = business;
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

    public Business getBusiness() {
        return business;
    }

    public void setBusiness(Business business) {
        this.business = business;
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

    public List<VerificationApplication> getVerificationApplications() {
        return verificationApplications;
    }

    public void setVerificationApplications(List<VerificationApplication> verificationApplications) {
        this.verificationApplications = verificationApplications;
    }
}
