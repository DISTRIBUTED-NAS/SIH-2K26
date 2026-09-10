package com.scaleguard.dto;

import com.scaleguard.entity.OfficerProfile;

public class OfficerSummary {

    private Long id;
    private String officerCode;
    private String name;
    private String designation;
    private String district;

    public OfficerSummary() {
    }

    public OfficerSummary(OfficerProfile officer) {
        if (officer != null) {
            this.id = officer.getId();
            this.officerCode = officer.getOfficerCode();
            this.designation = officer.getDesignation();
            this.district = officer.getDistrict();
            if (officer.getUser() != null) {
                this.name = officer.getUser().getFullName();
            }
        }
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }
}
