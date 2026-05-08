package com.akillitarim.akillitarim.repository;

import com.akillitarim.akillitarim.entity.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SensorRepository extends JpaRepository<Sensor, Integer> {

    List<Sensor> findByGreenhouseId(Integer greenhouseId);
}