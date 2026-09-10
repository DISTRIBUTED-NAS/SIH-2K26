package com.scaleguard.repository;

import com.scaleguard.entity.MeasurementTestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MeasurementTestSessionRepository extends JpaRepository<MeasurementTestSession, Long> {

    Optional<MeasurementTestSession> findByInspectionId(Long inspectionId);

    boolean existsByInspectionId(Long inspectionId);
}
