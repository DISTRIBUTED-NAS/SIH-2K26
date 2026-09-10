package com.scaleguard.repository;

import com.scaleguard.entity.Instrument;
import com.scaleguard.entity.InstrumentStatus;
import com.scaleguard.entity.InstrumentType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class InstrumentSpecification {

    public static Specification<Instrument> filter(Long businessId, String search, InstrumentStatus status, InstrumentType instrumentType) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (businessId != null) {
                predicates.add(criteriaBuilder.equal(root.get("business").get("id"), businessId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (instrumentType != null) {
                predicates.add(criteriaBuilder.equal(root.get("instrumentType"), instrumentType));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("instrumentName")), searchPattern);
                Predicate manufacturerLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("manufacturer")), searchPattern);
                Predicate modelLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("modelNumber")), searchPattern);
                Predicate serialLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("serialNumber")), searchPattern);

                predicates.add(criteriaBuilder.or(nameLike, manufacturerLike, modelLike, serialLike));
            }

            query.orderBy(criteriaBuilder.desc(root.get("createdAt")));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
