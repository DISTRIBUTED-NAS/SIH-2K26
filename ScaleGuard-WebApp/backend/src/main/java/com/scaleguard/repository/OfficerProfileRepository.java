package com.scaleguard.repository;

import com.scaleguard.entity.OfficerProfile;
import com.scaleguard.entity.OfficerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficerProfileRepository extends JpaRepository<OfficerProfile, Long>, JpaSpecificationExecutor<OfficerProfile> {

    Optional<OfficerProfile> findByUserId(Long userId);

    Optional<OfficerProfile> findByOfficerCode(String officerCode);

    boolean existsByOfficerCode(String officerCode);

    List<OfficerProfile> findByStatus(OfficerStatus status);

    Optional<OfficerProfile> findByIdAndStatus(Long id, OfficerStatus status);
}
