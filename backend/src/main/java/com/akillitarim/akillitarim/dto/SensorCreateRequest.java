package com.akillitarim.akillitarim.dto;

import lombok.Data;

@Data
public class SensorCreateRequest {

    private String sensorName;
    private String sensorType;
    private String status;
    private Integer greenhouseId;
}