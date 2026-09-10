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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Clean non-seed users if needed
        userRepository.findByEmail("testbusiness@example.com").ifPresent(userRepository::delete);
    }

    @Test
    @DisplayName("Should successfully register a new BUSINESS_OWNER")
    void testSuccessfulRegistration() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Test Business Owner",
                "testbusiness@example.com",
                "9876543210",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("Registration successful. Please login.")));
    }

    @Test
    @DisplayName("Should fail registration if email is already taken")
    void testDuplicateEmailRegistration() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Duplicate User",
                "admin@scaleguard.com", // Existing seed user
                "9876543210",
                "Password@123",
                "Password@123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("CONFLICT")))
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    @DisplayName("Should fail registration when passwords do not match")
    void testPasswordMismatchRegistration() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Mismatch User",
                "mismatch@example.com",
                "9876543210",
                "Password@123",
                "Password@999"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")))
                .andExpect(jsonPath("$.message", containsString("match")));
    }

    @Test
    @DisplayName("Should successfully login and retrieve JWT token")
    void testSuccessfulLogin() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@scaleguard.com", "Admin@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.user.email", is("admin@scaleguard.com")))
                .andExpect(jsonPath("$.user.role", is("ADMIN")))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("Should fail login with invalid password")
    void testInvalidPasswordLogin() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@scaleguard.com", "WrongPassword@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("Should return 401 when accessing /api/auth/me without token")
    void testGetMeWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should return user details when accessing /api/auth/me with valid token")
    void testGetMeWithValidToken() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@scaleguard.com", "Admin@123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseJson).get("accessToken").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("admin@scaleguard.com")))
                .andExpect(jsonPath("$.role", is("ADMIN")));
    }
}
