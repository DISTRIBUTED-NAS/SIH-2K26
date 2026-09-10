package com.scaleguard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scaleguard.dto.BusinessCreateRequest;
import com.scaleguard.dto.BusinessUpdateRequest;
import com.scaleguard.dto.LoginRequest;
import com.scaleguard.dto.RegisterRequest;
import com.scaleguard.repository.BusinessRepository;
import com.scaleguard.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class BusinessProfileIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private UserRepository userRepository;

    private String businessOwnerToken;
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        // Clean business records
        businessRepository.deleteAll();

        // 1. Setup Business Owner
        String boEmail = "profileowner@business.test";
        if (!userRepository.existsByEmail(boEmail)) {
            RegisterRequest registerRequest = new RegisterRequest(
                    "Profile Business Owner",
                    boEmail,
                    "9876543210",
                    "Password@123",
                    "Password@123"
            );
            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated());
        }

        MvcResult boLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(boEmail, "Password@123"))))
                .andExpect(status().isOk())
                .andReturn();
        businessOwnerToken = objectMapper.readTree(boLogin.getResponse().getContentAsString()).get("accessToken").asText();

        // 2. Setup Admin
        MvcResult adminLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@scaleguard.com", "Admin@123"))))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminLogin.getResponse().getContentAsString()).get("accessToken").asText();
    }

    private BusinessCreateRequest buildSampleCreateRequest() {
        return new BusinessCreateRequest(
                "Apex Weighing Solutions",
                "Retail & Calibration",
                "REG-2026-9999",
                "27ABCDE1234F1Z5",
                "contact@apexscales.in",
                "+91-9876543210",
                "Plot 42, Industrial Area Phase II",
                "Near Metro Station",
                "Mumbai",
                "Maharashtra",
                "400001",
                "India"
        );
    }

    @Test
    @DisplayName("BUSINESS_OWNER can successfully create a Business Profile")
    void testCreateBusinessProfileSuccess() throws Exception {
        BusinessCreateRequest request = buildSampleCreateRequest();

        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.businessName", is("Apex Weighing Solutions")))
                .andExpect(jsonPath("$.businessType", is("Retail & Calibration")))
                .andExpect(jsonPath("$.city", is("Mumbai")))
                .andExpect(jsonPath("$.status", is("ACTIVE")))
                .andExpect(jsonPath("$.ownerId", notNullValue()));
    }

    @Test
    @DisplayName("Creating second business profile for same owner fails with 409 Conflict")
    void testCreateDuplicateBusinessProfileFails() throws Exception {
        BusinessCreateRequest request = buildSampleCreateRequest();

        // First creation succeeds
        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second creation must fail with 409
        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("CONFLICT")))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("GET /api/businesses/me returns 404 when no profile exists")
    void testGetMyBusinessNotFound() throws Exception {
        mockMvc.perform(get("/api/businesses/me")
                        .header("Authorization", "Bearer " + businessOwnerToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", is("NOT_FOUND")))
                .andExpect(jsonPath("$.message", containsString("not found")));
    }

    @Test
    @DisplayName("GET /api/businesses/me returns profile after creation")
    void testGetMyBusinessSuccess() throws Exception {
        BusinessCreateRequest request = buildSampleCreateRequest();

        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/businesses/me")
                        .header("Authorization", "Bearer " + businessOwnerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessName", is("Apex Weighing Solutions")))
                .andExpect(jsonPath("$.contactEmail", is("contact@apexscales.in")));
    }

    @Test
    @DisplayName("PUT /api/businesses/me successfully updates business profile")
    void testUpdateMyBusinessSuccess() throws Exception {
        BusinessCreateRequest createRequest = buildSampleCreateRequest();

        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated());

        BusinessUpdateRequest updateRequest = new BusinessUpdateRequest(
                "Apex Metrology Private Limited",
                "Commercial Scale Calibration",
                "REG-2026-9999",
                "27ABCDE1234F1Z5",
                "support@apexscales.in",
                "+91-9876543299",
                "Floor 5, Apex Towers",
                "Tech Park",
                "Pune",
                "Maharashtra",
                "411001",
                "India"
        );

        mockMvc.perform(put("/api/businesses/me")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessName", is("Apex Metrology Private Limited")))
                .andExpect(jsonPath("$.city", is("Pune")))
                .andExpect(jsonPath("$.contactPhone", is("+91-9876543299")));
    }

    @Test
    @DisplayName("ADMIN can view all businesses via /api/admin/businesses")
    void testAdminGetAllBusinesses() throws Exception {
        BusinessCreateRequest request = buildSampleCreateRequest();

        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/admin/businesses")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].businessName", is("Apex Weighing Solutions")));
    }

    @Test
    @DisplayName("ADMIN can view specific business by ID")
    void testAdminGetBusinessById() throws Exception {
        BusinessCreateRequest request = buildSampleCreateRequest();

        MvcResult createResult = mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        long businessId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/admin/businesses/" + businessId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is((int) businessId)))
                .andExpect(jsonPath("$.businessName", is("Apex Weighing Solutions")));
    }

    @Test
    @DisplayName("BUSINESS_OWNER cannot access /api/admin/businesses (403 Forbidden)")
    void testBusinessOwnerCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN cannot create business via /api/businesses (403 Forbidden)")
    void testAdminCannotCreateBusiness() throws Exception {
        BusinessCreateRequest request = buildSampleCreateRequest();

        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Validation fails when required fields are missing")
    void testValidationFailure() throws Exception {
        BusinessCreateRequest invalidRequest = new BusinessCreateRequest();
        invalidRequest.setBusinessName(""); // Blank

        mockMvc.perform(post("/api/businesses")
                        .header("Authorization", "Bearer " + businessOwnerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")))
                .andExpect(jsonPath("$.validationErrors", notNullValue()));
    }
}
