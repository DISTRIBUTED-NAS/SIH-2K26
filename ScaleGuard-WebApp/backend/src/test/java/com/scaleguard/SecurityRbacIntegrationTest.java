package com.scaleguard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scaleguard.dto.LoginRequest;
import com.scaleguard.dto.RegisterRequest;
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

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String businessOwnerToken;
    private String adminToken;
    private String officerToken;

    @BeforeEach
    void setUp() throws Exception {
        // Register business owner if not present
        String boEmail = "owner@rbac.test";
        if (!userRepository.existsByEmail(boEmail)) {
            RegisterRequest registerRequest = new RegisterRequest(
                    "RBAC Business Owner",
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

        // Login Business Owner
        MvcResult boLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(boEmail, "Password@123"))))
                .andExpect(status().isOk())
                .andReturn();
        businessOwnerToken = objectMapper.readTree(boLogin.getResponse().getContentAsString()).get("accessToken").asText();

        // Login Admin
        MvcResult adminLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin@scaleguard.com", "Admin@123"))))
                .andExpect(status().isOk())
                .andReturn();
        adminToken = objectMapper.readTree(adminLogin.getResponse().getContentAsString()).get("accessToken").asText();

        // Login Officer
        MvcResult officerLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("officer@scaleguard.com", "Officer@123"))))
                .andExpect(status().isOk())
                .andReturn();
        officerToken = objectMapper.readTree(officerLogin.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    @DisplayName("BUSINESS_OWNER can access /api/business-owner/test")
    void testBusinessOwnerCanAccessOwnEndpoint() throws Exception {
        mockMvc.perform(get("/api/business-owner/test")
                        .header("Authorization", "Bearer " + businessOwnerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.role", is("BUSINESS_OWNER")));
    }

    @Test
    @DisplayName("BUSINESS_OWNER cannot access /api/admin/test (403 FORBIDDEN)")
    void testBusinessOwnerCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/test")
                        .header("Authorization", "Bearer " + businessOwnerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("BUSINESS_OWNER cannot access /api/officer/test (403 FORBIDDEN)")
    void testBusinessOwnerCannotAccessOfficerEndpoint() throws Exception {
        mockMvc.perform(get("/api/officer/test")
                        .header("Authorization", "Bearer " + businessOwnerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN can access /api/admin/test")
    void testAdminCanAccessOwnEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/test")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.role", is("ADMIN")));
    }

    @Test
    @DisplayName("ADMIN cannot access /api/business-owner/test (403 FORBIDDEN)")
    void testAdminCannotAccessBusinessOwnerEndpoint() throws Exception {
        mockMvc.perform(get("/api/business-owner/test")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN cannot access /api/officer/test (403 FORBIDDEN)")
    void testAdminCannotAccessOfficerEndpoint() throws Exception {
        mockMvc.perform(get("/api/officer/test")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("LMO_OFFICER can access /api/officer/test")
    void testOfficerCanAccessOwnEndpoint() throws Exception {
        mockMvc.perform(get("/api/officer/test")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.role", is("LMO_OFFICER")));
    }

    @Test
    @DisplayName("LMO_OFFICER cannot access /api/admin/test (403 FORBIDDEN)")
    void testOfficerCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/test")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("LMO_OFFICER cannot access /api/business-owner/test (403 FORBIDDEN)")
    void testOfficerCannotAccessBusinessOwnerEndpoint() throws Exception {
        mockMvc.perform(get("/api/business-owner/test")
                        .header("Authorization", "Bearer " + officerToken))
                .andExpect(status().isForbidden());
    }
}
