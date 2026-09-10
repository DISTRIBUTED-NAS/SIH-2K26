package com.scaleguard.service;

import com.scaleguard.repository.InspectionRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class InspectionNumberGenerator {

    private final InspectionRepository repository;

    public InspectionNumberGenerator(InspectionRepository repository) {
        this.repository = repository;
    }

    public synchronized String generateNextNumber() {
        int year = LocalDate.now().getYear();
        String prefix = String.format("INSP-%d-", year);

        List<String> topNumbers = repository.findInspectionNumbersByPrefix(prefix);
        long nextSequence = 1;
        if (!topNumbers.isEmpty()) {
            String top = topNumbers.get(0);
            try {
                String suffix = top.substring(prefix.length());
                nextSequence = Long.parseLong(suffix) + 1;
            } catch (Exception ignored) {
                nextSequence = topNumbers.size() + 1;
            }
        }

        String candidate = String.format("INSP-%d-%06d", year, nextSequence);
        while (repository.existsByInspectionNumber(candidate)) {
            nextSequence++;
            candidate = String.format("INSP-%d-%06d", year, nextSequence);
        }
        return candidate;
    }
}
