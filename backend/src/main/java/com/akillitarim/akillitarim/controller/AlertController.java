package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.AlertCreateRequest;
import com.akillitarim.akillitarim.dto.AlertResponse;
import com.akillitarim.akillitarim.service.AlertService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alerts")
@CrossOrigin
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<AlertResponse> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @PostMapping
    public AlertResponse createAlert(@RequestBody AlertCreateRequest request) {
        return alertService.createAlert(request);
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public List<AlertResponse> getAlertsByGreenhouseId(@PathVariable Integer greenhouseId) {
        return alertService.getAlertsByGreenhouseId(greenhouseId);
    }

    @PatchMapping("/{id}/status")
    public AlertResponse updateAlertStatus(@PathVariable Integer id, @RequestParam String status) {
        return alertService.updateAlertStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public String deleteAlert(@PathVariable Integer id) {
        alertService.deleteAlert(id);
        return "Alert deleted successfully";
    }
}