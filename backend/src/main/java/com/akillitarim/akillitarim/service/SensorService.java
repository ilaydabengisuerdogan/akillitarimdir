package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.SensorCreateRequest;
import com.akillitarim.akillitarim.dto.SensorResponse;
import com.akillitarim.akillitarim.entity.Greenhouse;
import com.akillitarim.akillitarim.entity.Sensor;
import com.akillitarim.akillitarim.repository.GreenhouseRepository;
import com.akillitarim.akillitarim.repository.SensorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SensorService {

    private final SensorRepository sensorRepository;
    private final GreenhouseRepository greenhouseRepository;

    public SensorService(SensorRepository sensorRepository,
                         GreenhouseRepository greenhouseRepository) {
        this.sensorRepository = sensorRepository;
        this.greenhouseRepository = greenhouseRepository;
    }

    public List<SensorResponse> getAllSensors() {
        return sensorRepository.findAll().stream()
                .map(sensor -> new SensorResponse(
                        sensor.getId(),
                        sensor.getSensorName(),
                        sensor.getSensorType(),
                        sensor.getStatus(),
                        sensor.getGreenhouse() != null ? sensor.getGreenhouse().getId() : null,
                        sensor.getGreenhouse() != null ? sensor.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public SensorResponse createSensor(SensorCreateRequest request) {
        Greenhouse greenhouse = greenhouseRepository.findById(request.getGreenhouseId())
                .orElseThrow(() -> new RuntimeException("Greenhouse not found"));

        Sensor sensor = new Sensor();
        sensor.setSensorName(request.getSensorName());
        sensor.setSensorType(request.getSensorType());
        sensor.setStatus(request.getStatus());
        sensor.setGreenhouse(greenhouse);

        Sensor savedSensor = sensorRepository.save(sensor);

        return new SensorResponse(
                savedSensor.getId(),
                savedSensor.getSensorName(),
                savedSensor.getSensorType(),
                savedSensor.getStatus(),
                savedSensor.getGreenhouse() != null ? savedSensor.getGreenhouse().getId() : null,
                savedSensor.getGreenhouse() != null ? savedSensor.getGreenhouse().getGreenhouseName() : null
        );
    }

    public List<SensorResponse> getSensorsByGreenhouseId(Integer greenhouseId) {
        return sensorRepository.findByGreenhouseId(greenhouseId).stream()
                .map(sensor -> new SensorResponse(
                        sensor.getId(),
                        sensor.getSensorName(),
                        sensor.getSensorType(),
                        sensor.getStatus(),
                        sensor.getGreenhouse() != null ? sensor.getGreenhouse().getId() : null,
                        sensor.getGreenhouse() != null ? sensor.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public SensorResponse updateSensor(Integer id, SensorCreateRequest request) {
        Sensor sensor = sensorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sensor not found"));

        Greenhouse greenhouse = greenhouseRepository.findById(request.getGreenhouseId())
                .orElseThrow(() -> new RuntimeException("Greenhouse not found"));

        sensor.setSensorName(request.getSensorName());
        sensor.setSensorType(request.getSensorType());
        sensor.setStatus(request.getStatus());
        sensor.setGreenhouse(greenhouse);

        Sensor updatedSensor = sensorRepository.save(sensor);

        return new SensorResponse(
                updatedSensor.getId(),
                updatedSensor.getSensorName(),
                updatedSensor.getSensorType(),
                updatedSensor.getStatus(),
                updatedSensor.getGreenhouse() != null ? updatedSensor.getGreenhouse().getId() : null,
                updatedSensor.getGreenhouse() != null ? updatedSensor.getGreenhouse().getGreenhouseName() : null
        );
    }

    public void deleteSensor(Integer id) {
        Sensor sensor = sensorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sensor not found"));

        sensorRepository.delete(sensor);
    }
}