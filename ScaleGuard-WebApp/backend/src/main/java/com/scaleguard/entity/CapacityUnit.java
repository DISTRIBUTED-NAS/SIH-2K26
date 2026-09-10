package com.scaleguard.entity;

public enum CapacityUnit {
    MG("mg"),
    G("g"),
    KG("kg"),
    TON("ton");

    private final String symbol;

    CapacityUnit(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() {
        return symbol;
    }
}
