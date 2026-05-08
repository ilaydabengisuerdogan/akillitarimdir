package com.akillitarim.akillitarim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class CropPlanResponse {

    private Integer id;
    private String cropName;
    private LocalDate plantingDate;
    private LocalDate harvestDate;
    private String status;
    private String notes;
    private Integer greenhouseId;
    private String greenhouseName;
}