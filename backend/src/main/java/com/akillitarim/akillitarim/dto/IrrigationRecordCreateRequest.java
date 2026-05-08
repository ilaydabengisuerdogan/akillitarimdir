package com.akillitarim.akillitarim.dto;

import lombok.Data;

@Data
public class IrrigationRecordCreateRequest {

    private Double waterAmount;
    private String irrigationType;
    private Integer greenhouseId;
}