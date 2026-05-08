package com.akillitarim.akillitarim.dto;

import lombok.Data;

@Data
public class UserCreateRequest {

    private String fullName;
    private String email;
    private String password;
    private String role; // ADMIN, MANAGER, FARMER
    private String secretCode;
}