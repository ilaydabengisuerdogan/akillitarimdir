package com.akillitarim.akillitarim.repository;

import com.akillitarim.akillitarim.entity.CropPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropPlanRepository extends JpaRepository<CropPlan, Integer> {

    List<CropPlan> findByGreenhouseId(Integer greenhouseId);
}