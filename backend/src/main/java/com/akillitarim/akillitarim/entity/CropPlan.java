package com.akillitarim.akillitarim.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "crop_plans")
@Data
public class CropPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String cropName;

    private LocalDate plantingDate;

    private LocalDate harvestDate;

    private String status;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "greenhouse_id")
    private Greenhouse greenhouse;
}