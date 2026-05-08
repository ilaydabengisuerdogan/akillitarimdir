package com.akillitarim.akillitarim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GreenhouseResponse {

    private Integer id;
    private String greenhouseName;
    private String location;
    private Double area;
    private String cropType;
    private String ownerEmail;
}