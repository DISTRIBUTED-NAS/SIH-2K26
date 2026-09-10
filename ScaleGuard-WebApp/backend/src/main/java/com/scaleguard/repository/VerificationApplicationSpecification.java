package com.scaleguard.repository;

import com.scaleguard.entity.ApplicationStatus;
import com.scaleguard.entity.ApplicationType;
import com.scaleguard.entity.VerificationApplication;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class VerificationApplicationSpecification {

    public static Specification<VerificationApplication> filter(
            Long businessId,
            ApplicationStatus status,
            ApplicationType applicationType,
            Long instrumentId,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Eager fetch / join instrument and business to avoid N+1 queries
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("instrument", JoinType.LEFT);
                root.fetch("business", JoinType.LEFT);
            }

            if (businessId != null) {
                predicates.add(criteriaBuilder.equal(root.get("business").get("id"), businessId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (applicationType != null) {
                predicates.add(criteriaBuilder.equal(root.get("applicationType"), applicationType));
            }

            if (instrumentId != null) {
                predicates.add(criteriaBuilder.equal(root.get("instrument").get("id"), instrumentId));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate appNumberLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("applicationNumber")), searchPattern);
                Predicate purposeLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("purpose")), searchPattern);
                Predicate instrumentNameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("instrument").get("instrumentName")), searchPattern);
                Predicate serialLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("instrument").get("serialNumber")), searchPattern);

                predicates.add(criteriaBuilder.or(appNumberLike, purposeLike, instrumentNameLike, serialLike));
            }

            if (query != null) {
                query.orderBy(criteriaBuilder.desc(root.get("createdAt")));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
