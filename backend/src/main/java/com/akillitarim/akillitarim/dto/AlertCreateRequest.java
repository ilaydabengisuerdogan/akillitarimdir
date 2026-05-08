package com.akillitarim.akillitarim.dto;

import lombok.Data;

@Data
public class AlertCreateRequest {

    private String alertType;
    private String message;
    private String severity;
    private Integer greenhouseId;
}