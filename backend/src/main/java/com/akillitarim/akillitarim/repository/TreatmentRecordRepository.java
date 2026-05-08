package com.akillitarim.akillitarim.repository;

import com.akillitarim.akillitarim.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Integer> {

    List<TreatmentRecord> findByGreenhouseId(Integer greenhouseId);
}