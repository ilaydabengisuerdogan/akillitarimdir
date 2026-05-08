package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.SensorDataCreateRequest;
import com.akillitarim.akillitarim.dto.SensorDataResponse;
import com.akillitarim.akillitarim.entity.Sensor;
import com.akillitarim.akillitarim.entity.SensorData;
import com.akillitarim.akillitarim.repository.SensorDataRepository;
import com.akillitarim.akillitarim.repository.SensorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SensorDataService {

    private final SensorDataRepository sensorDataRepository;
    private final SensorRepository sensorRepository;

    public SensorDataService(SensorDataRepository sensorDataRepository,
                             SensorRepository sensorRepository) {
        this.sensorDataRepository = sensorDataRepository;
        this.sensorRepository = sensorRepository;
    }

    public List<SensorDataResponse> getAllSensorData() {
        return sensorDataRepository.findAll().stream()
                .map(data -> new SensorDataResponse(
                        data.getId(),
                        data.getTemperature(),
                        data.getHumidity(),
                        data.getSoilMoisture(),
                        data.getLightLevel(),
                        data.getRecordedAt(),
                        data.getSensor() != null ? data.getSensor().getId() : null,
                        data.getSensor() != null ? data.getSensor().getSensorName() : null
                ))
                .toList();
    }

    public SensorDataResponse createSensorData(SensorDataCreateRequest request) {
        Sensor sensor = sensorRepository.findById(request.getSensorId())
                .orElseThrow(() -> new RuntimeException("Sensor not found"));

        SensorData sensorData = new SensorData();
        sensorData.setTemperature(request.getTemperature());
        sensorData.setHumidity(request.getHumidity());
        sensorData.setSoilMoisture(request.getSoilMoisture());
        sensorData.setLightLevel(request.getLightLevel());
        sensorData.setRecordedAt(request.getRecordedAt());
        sensorData.setSensor(sensor);

        SensorData savedData = sensorDataRepository.save(sensorData);

        return new SensorDataResponse(
                savedData.getId(),
                savedData.getTemperature(),
                savedData.getHumidity(),
                savedData.getSoilMoisture(),
                savedData.getLightLevel(),
                savedData.getRecordedAt(),
                savedData.getSensor() != null ? savedData.getSensor().getId() : null,
                savedData.getSensor() != null ? savedData.getSensor().getSensorName() : null
        );
    }

    public List<SensorDataResponse> getSensorDataBySensorId(Integer sensorId) {
        return sensorDataRepository.findBySensorId(sensorId).stream()
                .map(data -> new SensorDataResponse(
                        data.getId(),
                        data.getTemperature(),
                        data.getHumidity(),
                        data.getSoilMoisture(),
                        data.getLightLevel(),
                        data.getRecordedAt(),
                        data.getSensor() != null ? data.getSensor().getId() : null,
                        data.getSensor() != null ? data.getSensor().getSensorName() : null
                ))
                .toList();
    }

    public List<SensorDataResponse> getSensorDataByGreenhouseId(Integer greenhouseId) {
        return sensorDataRepository.findBySensor_Greenhouse_Id(greenhouseId).stream()
                .map(data -> new SensorDataResponse(
                        data.getId(),
                        data.getTemperature(),
                        data.getHumidity(),
                        data.getSoilMoisture(),
                        data.getLightLevel(),
                        data.getRecordedAt(),
                        data.getSensor() != null ? data.getSensor().getId() : null,
                        data.getSensor() != null ? data.getSensor().getSensorName() : null
                ))
                .toList();
    }
}