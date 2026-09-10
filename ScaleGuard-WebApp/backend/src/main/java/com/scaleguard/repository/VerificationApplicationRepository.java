package com.scaleguard.repository;

import com.scaleguard.entity.VerificationApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationApplicationRepository extends JpaRepository<VerificationApplication, Long>, JpaSpecificationExecutor<VerificationApplication> {

    Optional<VerificationApplication> findByIdAndBusinessId(Long id, Long businessId);

    Optional<VerificationApplication> findByApplicationNumber(String applicationNumber);

    boolean existsByApplicationNumber(String applicationNumber);

    List<VerificationApplication> findByBusinessIdOrderByCreatedAtDesc(Long businessId);

    List<VerificationApplication> findByAssignedOfficerIdOrderByAssignedAtDesc(Long officerId);

    Optional<VerificationApplication> findByIdAndAssignedOfficerId(Long id, Long officerId);

    @Query("SELECT v.applicationNumber FROM VerificationApplication v WHERE v.applicationNumber LIKE :prefix% ORDER BY v.applicationNumber DESC")
    List<String> findApplicationNumbersByPrefix(@Param("prefix") String prefix);
}
