package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.UserCreateRequest;
import com.akillitarim.akillitarim.dto.UserResponse;
import com.akillitarim.akillitarim.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public UserResponse createUser(@RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/{email}")
    public UserResponse updateUser(@PathVariable String email, @RequestBody UserCreateRequest request) {
        return userService.updateUser(email, request);
    }

    @DeleteMapping("/{email}")
    public String deleteUser(@PathVariable String email) {
        userService.deleteUser(email);
        return "User deleted successfully";
    }
}