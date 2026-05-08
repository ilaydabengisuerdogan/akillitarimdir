package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.SensorCreateRequest;
import com.akillitarim.akillitarim.dto.SensorResponse;
import com.akillitarim.akillitarim.service.SensorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sensors")
@CrossOrigin
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @GetMapping
    public List<SensorResponse> getAllSensors() {
        return sensorService.getAllSensors();
    }

    @PostMapping
    public SensorResponse createSensor(@RequestBody SensorCreateRequest request) {
        return sensorService.createSensor(request);
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public List<SensorResponse> getSensorsByGreenhouseId(@PathVariable Integer greenhouseId) {
        return sensorService.getSensorsByGreenhouseId(greenhouseId);
    }

    @PutMapping("/{id}")
    public SensorResponse updateSensor(@PathVariable Integer id,
                                       @RequestBody SensorCreateRequest request) {
        return sensorService.updateSensor(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteSensor(@PathVariable Integer id) {
        sensorService.deleteSensor(id);
        return "Sensor deleted successfully";
    }
}