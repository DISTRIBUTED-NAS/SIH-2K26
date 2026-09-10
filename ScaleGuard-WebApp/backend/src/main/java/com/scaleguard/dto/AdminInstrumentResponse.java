package com.scaleguard.dto;

import com.scaleguard.entity.Instrument;

public class AdminInstrumentResponse extends InstrumentResponse {

    private String businessName;
    private String businessCity;
    private String businessState;

    public AdminInstrumentResponse() {
        super();
    }

    public static AdminInstrumentResponse fromEntityWithBusiness(Instrument instrument) {
        AdminInstrumentResponse response = new AdminInstrumentResponse();
        response.setId(instrument.getId());
        response.setInstrumentName(instrument.getInstrumentName());
        response.setInstrumentType(instrument.getInstrumentType());
        response.setManufacturer(instrument.getManufacturer());
        response.setModelNumber(instrument.getModelNumber());
        response.setSerialNumber(instrument.getSerialNumber());
        response.setCapacity(instrument.getCapacity());
        response.setCapacityUnit(instrument.getCapacityUnit());
        response.setAccuracy(instrument.getAccuracy());
        response.setAccuracyUnit(instrument.getAccuracyUnit());
        response.setManufacturingYear(instrument.getManufacturingYear());
        response.setPurchaseDate(instrument.getPurchaseDate());
        response.setLocation(instrument.getLocation());
        response.setStatus(instrument.getStatus());
        response.setCreatedAt(instrument.getCreatedAt());
        response.setUpdatedAt(instrument.getUpdatedAt());

        if (instrument.getBusiness() != null) {
            response.setBusinessId(instrument.getBusiness().getId());
            response.setBusinessName(instrument.getBusiness().getBusinessName());
            response.setBusinessCity(instrument.getBusiness().getCity());
            response.setBusinessState(instrument.getBusiness().getState());
        }

        return response;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessCity() {
        return businessCity;
    }

    public void setBusinessCity(String businessCity) {
        this.businessCity = businessCity;
    }

    public String getBusinessState() {
        return businessState;
    }

    public void setBusinessState(String businessState) {
        this.businessState = businessState;
    }
}
