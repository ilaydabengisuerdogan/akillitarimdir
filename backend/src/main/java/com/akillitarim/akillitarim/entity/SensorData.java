package com.akillitarim.akillitarim.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_data")
@Data
public class SensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Double temperature;
    private Double humidity;
    private Double soilMoisture;
    private Double lightLevel;
    private LocalDateTime recordedAt;

    @ManyToOne
    @JoinColumn(name = "sensor_id")
    private Sensor sensor;
}