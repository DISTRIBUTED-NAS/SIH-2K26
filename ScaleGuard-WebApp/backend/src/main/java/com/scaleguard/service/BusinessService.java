package com.scaleguard.service;

import com.scaleguard.dto.BusinessCreateRequest;
import com.scaleguard.dto.BusinessResponse;
import com.scaleguard.dto.BusinessUpdateRequest;

import java.util.List;

public interface BusinessService {
    BusinessResponse createBusiness(BusinessCreateRequest request);
    BusinessResponse getCurrentUserBusiness();
    BusinessResponse updateCurrentUserBusiness(BusinessUpdateRequest request);
    List<BusinessResponse> getAllBusinesses();
    BusinessResponse getBusinessById(Long id);
}
