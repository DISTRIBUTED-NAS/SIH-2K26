package com.scaleguard.repository;

import com.scaleguard.entity.Business;
import com.scaleguard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    Optional<Business> findByOwner(User owner);
    Optional<Business> findByOwnerId(Long ownerId);
    boolean existsByOwnerId(Long ownerId);
}
