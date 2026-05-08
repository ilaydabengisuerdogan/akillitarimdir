package com.akillitarim.akillitarim.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SensorDataCreateRequest {

    private Double temperature;
    private Double humidity;
    private Double soilMoisture;
    private Double lightLevel;
    private LocalDateTime recordedAt;
    private Integer sensorId;
}