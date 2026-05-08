package com.akillitarim.akillitarim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SensorDataResponse {

    private Integer id;
    private Double temperature;
    private Double humidity;
    private Double soilMoisture;
    private Double lightLevel;
    private LocalDateTime recordedAt;
    private Integer sensorId;
    private String sensorName;
}