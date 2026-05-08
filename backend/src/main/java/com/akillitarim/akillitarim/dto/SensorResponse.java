package com.akillitarim.akillitarim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SensorResponse {

    private Integer id;
    private String sensorName;
    private String sensorType;
    private String status;
    private Integer greenhouseId;
    private String greenhouseName;
}