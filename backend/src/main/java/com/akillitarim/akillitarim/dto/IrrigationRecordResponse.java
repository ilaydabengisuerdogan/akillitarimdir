package com.akillitarim.akillitarim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class IrrigationRecordResponse {

    private Integer id;
    private Double waterAmount;
    private String irrigationType;
    private LocalDateTime irrigationTime;
    private Integer greenhouseId;
    private String greenhouseName;
}