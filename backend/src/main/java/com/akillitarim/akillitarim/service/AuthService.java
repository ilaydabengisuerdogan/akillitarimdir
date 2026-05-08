package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.LoginRequest;
import com.akillitarim.akillitarim.dto.LoginResponse;
import com.akillitarim.akillitarim.entity.User;
import com.akillitarim.akillitarim.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new LoginResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : null,
                "Login successful"
        );
    }
}