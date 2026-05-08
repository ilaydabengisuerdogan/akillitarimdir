package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.SensorDataCreateRequest;
import com.akillitarim.akillitarim.dto.SensorDataResponse;
import com.akillitarim.akillitarim.service.SensorDataService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sensor-data")
@CrossOrigin
public class SensorDataController {

    private final SensorDataService sensorDataService;

    public SensorDataController(SensorDataService sensorDataService) {
        this.sensorDataService = sensorDataService;
    }

    @GetMapping
    public List<SensorDataResponse> getAllSensorData() {
        return sensorDataService.getAllSensorData();
    }

    @PostMapping
    public SensorDataResponse createSensorData(@RequestBody SensorDataCreateRequest request) {
        return sensorDataService.createSensorData(request);
    }

    @GetMapping("/sensor/{sensorId}")
    public List<SensorDataResponse> getSensorDataBySensorId(@PathVariable Integer sensorId) {
        return sensorDataService.getSensorDataBySensorId(sensorId);
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public List<SensorDataResponse> getSensorDataByGreenhouseId(@PathVariable Integer greenhouseId) {
        return sensorDataService.getSensorDataByGreenhouseId(greenhouseId);
    }
}