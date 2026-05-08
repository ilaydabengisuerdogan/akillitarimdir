package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.IrrigationRecordCreateRequest;
import com.akillitarim.akillitarim.dto.IrrigationRecordResponse;
import com.akillitarim.akillitarim.entity.Greenhouse;
import com.akillitarim.akillitarim.entity.IrrigationRecord;
import com.akillitarim.akillitarim.repository.GreenhouseRepository;
import com.akillitarim.akillitarim.repository.IrrigationRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IrrigationRecordService {

    private final IrrigationRecordRepository irrigationRecordRepository;
    private final GreenhouseRepository greenhouseRepository;

    public IrrigationRecordService(IrrigationRecordRepository irrigationRecordRepository,
                                   GreenhouseRepository greenhouseRepository) {
        this.irrigationRecordRepository = irrigationRecordRepository;
        this.greenhouseRepository = greenhouseRepository;
    }

    public List<IrrigationRecordResponse> getAllIrrigationRecords() {
        return irrigationRecordRepository.findAll().stream()
                .map(record -> new IrrigationRecordResponse(
                        record.getId(),
                        record.getWaterAmount(),
                        record.getIrrigationType(),
                        record.getIrrigationTime(),
                        record.getGreenhouse() != null ? record.getGreenhouse().getId() : null,
                        record.getGreenhouse() != null ? record.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public IrrigationRecordResponse createIrrigationRecord(IrrigationRecordCreateRequest request) {

        Greenhouse greenhouse = null;
        if (request.getGreenhouseId() != null) {
            greenhouse = greenhouseRepository.findById(request.getGreenhouseId()).orElse(null);
        }

        IrrigationRecord irrigationRecord = new IrrigationRecord();
        irrigationRecord.setWaterAmount(request.getWaterAmount());
        irrigationRecord.setIrrigationType(request.getIrrigationType());
        irrigationRecord.setIrrigationTime(LocalDateTime.now());
        irrigationRecord.setGreenhouse(greenhouse);

        IrrigationRecord savedRecord = irrigationRecordRepository.save(irrigationRecord);

        return new IrrigationRecordResponse(
                savedRecord.getId(),
                savedRecord.getWaterAmount(),
                savedRecord.getIrrigationType(),
                savedRecord.getIrrigationTime(),
                savedRecord.getGreenhouse() != null ? savedRecord.getGreenhouse().getId() : null,
                savedRecord.getGreenhouse() != null ? savedRecord.getGreenhouse().getGreenhouseName() : null
        );
    }

    public List<IrrigationRecordResponse> getIrrigationRecordsByGreenhouseId(Integer greenhouseId) {
        return irrigationRecordRepository.findByGreenhouseId(greenhouseId).stream()
                .map(record -> new IrrigationRecordResponse(
                        record.getId(),
                        record.getWaterAmount(),
                        record.getIrrigationType(),
                        record.getIrrigationTime(),
                        record.getGreenhouse() != null ? record.getGreenhouse().getId() : null,
                        record.getGreenhouse() != null ? record.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public void deleteIrrigationRecord(Integer id) {
        IrrigationRecord irrigationRecord = irrigationRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Irrigation record not found"));

        irrigationRecordRepository.delete(irrigationRecord);
    }
}