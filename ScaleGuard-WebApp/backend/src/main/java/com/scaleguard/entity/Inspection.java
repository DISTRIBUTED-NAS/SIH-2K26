package com.scaleguard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspections", indexes = {
    @Index(name = "idx_insp_number", columnList = "inspection_number", unique = true),
    @Index(name = "idx_insp_application", columnList = "application_id", unique = true),
    @Index(name = "idx_insp_officer", columnList = "officer_id"),
    @Index(name = "idx_insp_status", columnList = "status"),
    @Index(name = "idx_insp_scheduled_at", columnList = "scheduled_at")
})
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_number", nullable = false, unique = true, length = 50)
    private String inspectionNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private VerificationApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private OfficerProfile officer;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "location", nullable = false, length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private InspectionStatus status = InspectionStatus.SCHEDULED;

    @Column(name = "notes", length = 2000)
    private String notes;

    @Column(name = "cancellation_reason", length = 1000)
    private String cancellationReason;

    @OneToOne(mappedBy = "inspection", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private MeasurementTestSession measurementTestSession;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Inspection() {
    }

    public Inspection(String inspectionNumber, VerificationApplication application,
                      OfficerProfile officer, LocalDateTime scheduledAt, String location,
                      String notes) {
        this.inspectionNumber = inspectionNumber;
        this.application = application;
        this.officer = officer;
        this.scheduledAt = scheduledAt;
        this.location = location;
        this.notes = notes;
        this.status = InspectionStatus.SCHEDULED;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = InspectionStatus.SCHEDULED;
        }
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

    public String getInspectionNumber() {
        return inspectionNumber;
    }

    public void setInspectionNumber(String inspectionNumber) {
        this.inspectionNumber = inspectionNumber;
    }

    public VerificationApplication getApplication() {
        return application;
    }

    public void setApplication(VerificationApplication application) {
        this.application = application;
    }

    public OfficerProfile getOfficer() {
        return officer;
    }

    public void setOfficer(OfficerProfile officer) {
        this.officer = officer;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public InspectionStatus getStatus() {
        return status;
    }

    public void setStatus(InspectionStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public MeasurementTestSession getMeasurementTestSession() {
        return measurementTestSession;
    }

    public void setMeasurementTestSession(MeasurementTestSession measurementTestSession) {
        this.measurementTestSession = measurementTestSession;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
