package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.AlertCreateRequest;
import com.akillitarim.akillitarim.dto.AlertResponse;
import com.akillitarim.akillitarim.entity.Alert;
import com.akillitarim.akillitarim.entity.Greenhouse;
import com.akillitarim.akillitarim.repository.AlertRepository;
import com.akillitarim.akillitarim.repository.GreenhouseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final GreenhouseRepository greenhouseRepository;

    public AlertService(AlertRepository alertRepository,
                        GreenhouseRepository greenhouseRepository) {
        this.alertRepository = alertRepository;
        this.greenhouseRepository = greenhouseRepository;
    }

    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAll().stream()
                .map(alert -> new AlertResponse(
                        alert.getId(),
                        alert.getAlertType(),
                        alert.getMessage(),
                        alert.getSeverity(),
                        alert.getCreatedAt(),
                        alert.getStatus(),
                        alert.getGreenhouse() != null ? alert.getGreenhouse().getId() : null,
                        alert.getGreenhouse() != null ? alert.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public AlertResponse createAlert(AlertCreateRequest request) {

        Greenhouse greenhouse = null;
        if (request.getGreenhouseId() != null) {
            greenhouse = greenhouseRepository.findById(request.getGreenhouseId()).orElse(null);
        }

        Alert alert = new Alert();
        alert.setAlertType(request.getAlertType());
        alert.setMessage(request.getMessage());
        alert.setSeverity(request.getSeverity());
        alert.setCreatedAt(LocalDateTime.now());
        alert.setStatus("PENDING");
        alert.setGreenhouse(greenhouse);

        Alert savedAlert = alertRepository.save(alert);

        return new AlertResponse(
                savedAlert.getId(),
                savedAlert.getAlertType(),
                savedAlert.getMessage(),
                savedAlert.getSeverity(),
                savedAlert.getCreatedAt(),
                savedAlert.getStatus(),
                savedAlert.getGreenhouse() != null ? savedAlert.getGreenhouse().getId() : null,
                savedAlert.getGreenhouse() != null ? savedAlert.getGreenhouse().getGreenhouseName() : null
        );
    }

    public List<AlertResponse> getAlertsByGreenhouseId(Integer greenhouseId) {
        return alertRepository.findByGreenhouseId(greenhouseId).stream()
                .map(alert -> new AlertResponse(
                        alert.getId(),
                        alert.getAlertType(),
                        alert.getMessage(),
                        alert.getSeverity(),
                        alert.getCreatedAt(),
                        alert.getStatus(),
                        alert.getGreenhouse() != null ? alert.getGreenhouse().getId() : null,
                        alert.getGreenhouse() != null ? alert.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public AlertResponse updateAlertStatus(Integer id, String status) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        alert.setStatus(status);
        Alert saved = alertRepository.save(alert);
        return new AlertResponse(
                saved.getId(),
                saved.getAlertType(),
                saved.getMessage(),
                saved.getSeverity(),
                saved.getCreatedAt(),
                saved.getStatus(),
                saved.getGreenhouse() != null ? saved.getGreenhouse().getId() : null,
                saved.getGreenhouse() != null ? saved.getGreenhouse().getGreenhouseName() : null
        );
    }

    public void deleteAlert(Integer id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        alertRepository.delete(alert);
    }
}