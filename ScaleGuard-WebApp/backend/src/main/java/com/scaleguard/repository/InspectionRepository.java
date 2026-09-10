package com.scaleguard.repository;

import com.scaleguard.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long>, JpaSpecificationExecutor<Inspection> {

    Optional<Inspection> findByApplicationId(Long applicationId);

    boolean existsByApplicationId(Long applicationId);

    Optional<Inspection> findByIdAndOfficerId(Long inspectionId, Long officerId);

    List<Inspection> findByOfficerIdOrderByCreatedAtDesc(Long officerId);

    boolean existsByInspectionNumber(String inspectionNumber);

    @Query("SELECT i.inspectionNumber FROM Inspection i WHERE i.inspectionNumber LIKE :prefix% ORDER BY i.inspectionNumber DESC")
    List<String> findInspectionNumbersByPrefix(@Param("prefix") String prefix);
}
