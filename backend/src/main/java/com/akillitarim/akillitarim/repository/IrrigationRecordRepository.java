package com.akillitarim.akillitarim.repository;

import com.akillitarim.akillitarim.entity.IrrigationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IrrigationRecordRepository extends JpaRepository<IrrigationRecord, Integer> {

    List<IrrigationRecord> findByGreenhouseId(Integer greenhouseId);
}