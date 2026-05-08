package com.akillitarim.akillitarim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class TreatmentRecordResponse {

    private Integer id;
    private String treatmentType;
    private String productName;
    private String amount;
    private LocalDate appliedDate;
    private String notes;
    private Integer greenhouseId;
    private String greenhouseName;
}