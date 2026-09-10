package com.scaleguard.dto;

import com.scaleguard.entity.OfficerProfile;
import com.scaleguard.entity.OfficerStatus;

import java.time.LocalDateTime;

public class OfficerResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String officerCode;
    private String designation;
    private String department;
    private String district;
    private String phoneNumber;
    private OfficerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OfficerResponse() {
    }

    public OfficerResponse(OfficerProfile officer) {
        if (officer != null) {
            this.id = officer.getId();
            this.officerCode = officer.getOfficerCode();
            this.designation = officer.getDesignation();
            this.department = officer.getDepartment();
            this.district = officer.getDistrict();
            this.phoneNumber = officer.getPhoneNumber();
            this.status = officer.getStatus();
            this.createdAt = officer.getCreatedAt();
            this.updatedAt = officer.getUpdatedAt();

            if (officer.getUser() != null) {
                this.userId = officer.getUser().getId();
                this.name = officer.getUser().getFullName();
                this.email = officer.getUser().getEmail();
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
