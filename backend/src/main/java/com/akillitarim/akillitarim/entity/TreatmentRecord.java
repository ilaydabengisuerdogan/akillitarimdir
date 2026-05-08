package com.akillitarim.akillitarim.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "treatment_records")
@Data
public class TreatmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String treatmentType;

    private String productName;

    private String amount;

    private LocalDate appliedDate;

    private String notes;

    @ManyToOne
    @JoinColumn(name = "greenhouse_id")
    private Greenhouse greenhouse;
}