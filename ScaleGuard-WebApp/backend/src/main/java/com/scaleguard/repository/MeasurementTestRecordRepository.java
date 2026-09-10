package com.scaleguard.repository;

import com.scaleguard.entity.MeasurementTestRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeasurementTestRecordRepository extends JpaRepository<MeasurementTestRecord, Long> {

    Long countByTestSessionId(Long sessionId);

    @Query("SELECT COALESCE(MAX(r.testPoint), 0) FROM MeasurementTestRecord r WHERE r.testSession.id = :sessionId")
    Integer findMaxTestPointBySessionId(@Param("sessionId") Long sessionId);

    List<MeasurementTestRecord> findByTestSessionIdOrderByTestPointAsc(Long sessionId);
}
