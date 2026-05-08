package com.akillitarim.akillitarim.repository;

import com.akillitarim.akillitarim.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Integer> {

    List<Alert> findByGreenhouseId(Integer greenhouseId);
}