package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.UserCreateRequest;
import com.akillitarim.akillitarim.dto.UserResponse;
import com.akillitarim.akillitarim.entity.User;
import com.akillitarim.akillitarim.entity.UserRole;
import com.akillitarim.akillitarim.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole() != null ? user.getRole().name() : null
                ))
                .collect(Collectors.toList());
    }

    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Bu e-posta adresi zaten kullanımda.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole() != null ? savedUser.getRole().name() : null
        );
    }

    public UserResponse updateUser(String email, UserCreateRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPassword() != null) user.setPassword(request.getPassword());
        // phone/username map to fullName since User entity lacks those specific fields
        
        User savedUser = userRepository.save(user);
        return new UserResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole() != null ? savedUser.getRole().name() : null
        );
    }

    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }
}