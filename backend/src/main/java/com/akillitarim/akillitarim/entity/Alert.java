package com.akillitarim.akillitarim.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String alertType;

    private String message;

    private String severity;

    private LocalDateTime createdAt;

    private String status; // PENDING, ACCEPTED, REJECTED

    @ManyToOne
    @JoinColumn(name = "greenhouse_id")
    private Greenhouse greenhouse;
}