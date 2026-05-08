package com.akillitarim.akillitarim.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "irrigation_records")
@Data
public class IrrigationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Double waterAmount;

    private String irrigationType;

    private LocalDateTime irrigationTime;

    @ManyToOne
    @JoinColumn(name = "greenhouse_id")
    private Greenhouse greenhouse;
}