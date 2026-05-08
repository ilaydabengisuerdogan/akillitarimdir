package com.akillitarim.akillitarim.repository;

import com.akillitarim.akillitarim.entity.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SensorDataRepository extends JpaRepository<SensorData, Integer> {
    List<SensorData> findBySensorId(Integer sensorId);
    List<SensorData> findBySensor_Greenhouse_Id(Integer greenhouseId);
}