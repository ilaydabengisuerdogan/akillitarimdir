package com.akillitarim.akillitarim.dto;

import lombok.Data;

@Data
public class TreatmentRecordCreateRequest {

    private String treatmentType;
    private String productName;
    private String amount;
    private String notes;
    private Integer greenhouseId;
}