package com.akillitarim.akillitarim.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CropPlanCreateRequest {

    private String cropName;
    private LocalDate plantingDate;
    private LocalDate harvestDate;
    private String status;
    private String notes;
    private Integer greenhouseId;
}