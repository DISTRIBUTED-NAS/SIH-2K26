package com.scaleguard.repository;

import com.scaleguard.entity.OfficerProfile;
import com.scaleguard.entity.OfficerStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OfficerSpecification {

    public static Specification<OfficerProfile> filter(
            String search,
            OfficerStatus status,
            String district
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Eager fetch user
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("user", JoinType.LEFT);
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (district != null && !district.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("district")),
                        district.trim().toLowerCase()
                ));
            }

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate officerCodeLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("officerCode")), searchPattern);
                Predicate designationLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("designation")), searchPattern);
                Predicate departmentLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("department")), searchPattern);
                Predicate districtLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("district")), searchPattern);
                Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("fullName")), searchPattern);
                Predicate emailLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("email")), searchPattern);

                predicates.add(criteriaBuilder.or(officerCodeLike, designationLike, departmentLike, districtLike, nameLike, emailLike));
            }

            if (query != null) {
                query.orderBy(criteriaBuilder.desc(root.get("createdAt")));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
