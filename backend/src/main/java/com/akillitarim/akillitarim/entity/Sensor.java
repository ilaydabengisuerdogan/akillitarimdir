package com.akillitarim.akillitarim.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "sensors")
@Data
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String sensorName;

    private String sensorType;

    private String status;
    @ManyToOne
@JoinColumn(name = "greenhouse_id")
private Greenhouse greenhouse;
}