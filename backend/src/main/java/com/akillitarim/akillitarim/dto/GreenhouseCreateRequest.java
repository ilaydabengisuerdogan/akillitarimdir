package com.akillitarim.akillitarim.dto;

import lombok.Data;

@Data
public class GreenhouseCreateRequest {

    private String greenhouseName;
    private String location;
    private Double area;
    private String cropType;
    private String ownerEmail;
}