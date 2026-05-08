package com.akillitarim.akillitarim.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AlertResponse {

    private Integer id;
    private String alertType;
    private String message;
    private String severity;
    private LocalDateTime createdAt;
    private String status;
    private Integer greenhouseId;
    private String greenhouseName;
}