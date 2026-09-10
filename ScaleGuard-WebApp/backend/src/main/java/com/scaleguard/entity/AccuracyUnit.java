package com.scaleguard.entity;

public enum AccuracyUnit {
    MG("mg"),
    G("g"),
    KG("kg");

    private final String symbol;

    AccuracyUnit(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() {
        return symbol;
    }
}
