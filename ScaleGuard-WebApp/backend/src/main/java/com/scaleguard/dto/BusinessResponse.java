package com.scaleguard.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.scaleguard.entity.Business;
import com.scaleguard.entity.BusinessStatus;

import java.time.LocalDateTime;

public class BusinessResponse {

    private Long id;
    private String businessName;
    private String businessType;
    private String registrationNumber;
    private String gstNumber;
    private String contactEmail;
    private String contactPhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private BusinessStatus status;
    private Long ownerId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    public BusinessResponse() {
    }

    public BusinessResponse(Long id, String businessName, String businessType, String registrationNumber,
                            String gstNumber, String contactEmail, String contactPhone,
                            String addressLine1, String addressLine2, String city,
                            String state, String pincode, String country,
                            BusinessStatus status, Long ownerId,
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.businessName = businessName;
        this.businessType = businessType;
        this.registrationNumber = registrationNumber;
        this.gstNumber = gstNumber;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.country = country;
        this.status = status;
        this.ownerId = ownerId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static BusinessResponse fromEntity(Business business) {
        return new BusinessResponse(
                business.getId(),
                business.getBusinessName(),
                business.getBusinessType(),
                business.getRegistrationNumber(),
                business.getGstNumber(),
                business.getContactEmail(),
                business.getContactPhone(),
                business.getAddressLine1(),
                business.getAddressLine2(),
                business.getCity(),
                business.getState(),
                business.getPincode(),
                business.getCountry(),
                business.getStatus(),
                business.getOwner() != null ? business.getOwner().getId() : null,
                business.getCreatedAt(),
                business.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public BusinessStatus getStatus() {
        return status;
    }

    public void setStatus(BusinessStatus status) {
        this.status = status;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
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
