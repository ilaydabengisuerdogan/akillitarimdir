package com.akillitarim.akillitarim.controller;

import java.util.Optional;
import java.util.Map;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.akillitarim.akillitarim.dto.LoginRequest;
import com.akillitarim.akillitarim.dto.ResetPasswordRequest;
import com.akillitarim.akillitarim.dto.UserCreateRequest;
import com.akillitarim.akillitarim.entity.User;
import com.akillitarim.akillitarim.entity.UserRole;
import com.akillitarim.akillitarim.repository.UserRepository;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 🔐 LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Kullanıcı bulunamadı");
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Şifre yanlış");
        }

        return ResponseEntity.ok(user);
    }

    // 👤 REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserCreateRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email zaten kayıtlı");
        }

        // Rol belirleme (Gizli koda göre otomatik)
        UserRole finalRole = UserRole.FARMER;
        
        if ("ADMIN123".equals(request.getSecretCode())) {
            finalRole = UserRole.ADMIN;
        } else if ("MANAGER123".equals(request.getSecretCode())) {
            finalRole = UserRole.GREENHOUSE_MANAGER;
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(finalRole);
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    // 🔑 RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Kullanıcı bulunamadı");
        }

        User user = userOpt.get();
        user.setPassword(request.getNewPassword());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Şifre başarıyla güncellendi"));
    }
}