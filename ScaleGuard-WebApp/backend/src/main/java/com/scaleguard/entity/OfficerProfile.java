package com.scaleguard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "officer_profiles", indexes = {
    @Index(name = "idx_officer_code", columnList = "officer_code", unique = true),
    @Index(name = "idx_officer_user", columnList = "user_id", unique = true),
    @Index(name = "idx_officer_status", columnList = "status"),
    @Index(name = "idx_officer_district", columnList = "district")
})
public class OfficerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "officer_code", nullable = false, unique = true, length = 50)
    private String officerCode;

    @Column(name = "designation", nullable = false, length = 100)
    private String designation;

    @Column(name = "department", nullable = false, length = 150)
    private String department;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OfficerStatus status = OfficerStatus.ACTIVE;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "assignedOfficer", fetch = FetchType.LAZY)
    private List<VerificationApplication> verificationApplications = new ArrayList<>();

    @OneToMany(mappedBy = "officer", fetch = FetchType.LAZY)
    private List<Inspection> inspections = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public OfficerProfile() {
    }

    public OfficerProfile(String officerCode, String designation, String department,
                          String district, String phoneNumber, OfficerStatus status, User user) {
        this.officerCode = officerCode;
        this.designation = designation;
        this.department = department;
        this.district = district;
        this.phoneNumber = phoneNumber;
        this.status = status != null ? status : OfficerStatus.ACTIVE;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = OfficerStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOfficerCode() {
        return officerCode;
    }

    public void setOfficerCode(String officerCode) {
        this.officerCode = officerCode;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public OfficerStatus getStatus() {
        return status;
    }

    public void setStatus(OfficerStatus status) {
        this.status = status;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<VerificationApplication> getVerificationApplications() {
        return verificationApplications;
    }

    public void setVerificationApplications(List<VerificationApplication> verificationApplications) {
        this.verificationApplications = verificationApplications;
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

    public List<Inspection> getInspections() {
        return inspections;
    }

    public void setInspections(List<Inspection> inspections) {
        this.inspections = inspections;
    }
}
