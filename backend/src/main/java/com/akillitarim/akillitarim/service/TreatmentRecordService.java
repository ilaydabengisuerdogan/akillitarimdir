package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.TreatmentRecordCreateRequest;
import com.akillitarim.akillitarim.dto.TreatmentRecordResponse;
import com.akillitarim.akillitarim.entity.Greenhouse;
import com.akillitarim.akillitarim.entity.TreatmentRecord;
import com.akillitarim.akillitarim.repository.GreenhouseRepository;
import com.akillitarim.akillitarim.repository.TreatmentRecordRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TreatmentRecordService {

    private final TreatmentRecordRepository treatmentRecordRepository;
    private final GreenhouseRepository greenhouseRepository;

    public TreatmentRecordService(TreatmentRecordRepository treatmentRecordRepository,
                                  GreenhouseRepository greenhouseRepository) {
        this.treatmentRecordRepository = treatmentRecordRepository;
        this.greenhouseRepository = greenhouseRepository;
    }

    public List<TreatmentRecordResponse> getAllTreatmentRecords() {
        return treatmentRecordRepository.findAll().stream()
                .map(record -> new TreatmentRecordResponse(
                        record.getId(),
                        record.getTreatmentType(),
                        record.getProductName(),
                        record.getAmount(),
                        record.getAppliedDate(),
                        record.getNotes(),
                        record.getGreenhouse() != null ? record.getGreenhouse().getId() : null,
                        record.getGreenhouse() != null ? record.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public TreatmentRecordResponse createTreatmentRecord(TreatmentRecordCreateRequest request) {

        Greenhouse greenhouse = null;
        if (request.getGreenhouseId() != null) {
            greenhouse = greenhouseRepository.findById(request.getGreenhouseId()).orElse(null);
        }
        if (greenhouse == null) {
            throw new RuntimeException("Lütfen önce sisteme en az bir sera (Greenhouse) ekleyin!");
        }

        TreatmentRecord treatmentRecord = new TreatmentRecord();
        treatmentRecord.setTreatmentType(request.getTreatmentType());
        treatmentRecord.setProductName(request.getProductName());
        treatmentRecord.setAmount(request.getAmount());
        treatmentRecord.setNotes(request.getNotes());
        treatmentRecord.setAppliedDate(LocalDate.now());
        treatmentRecord.setGreenhouse(greenhouse);

        TreatmentRecord savedRecord = treatmentRecordRepository.save(treatmentRecord);

        return new TreatmentRecordResponse(
                savedRecord.getId(),
                savedRecord.getTreatmentType(),
                savedRecord.getProductName(),
                savedRecord.getAmount(),
                savedRecord.getAppliedDate(),
                savedRecord.getNotes(),
                savedRecord.getGreenhouse() != null ? savedRecord.getGreenhouse().getId() : null,
                savedRecord.getGreenhouse() != null ? savedRecord.getGreenhouse().getGreenhouseName() : null
        );
    }

    public List<TreatmentRecordResponse> getTreatmentRecordsByGreenhouseId(Integer greenhouseId) {
        return treatmentRecordRepository.findByGreenhouseId(greenhouseId).stream()
                .map(record -> new TreatmentRecordResponse(
                        record.getId(),
                        record.getTreatmentType(),
                        record.getProductName(),
                        record.getAmount(),
                        record.getAppliedDate(),
                        record.getNotes(),
                        record.getGreenhouse() != null ? record.getGreenhouse().getId() : null,
                        record.getGreenhouse() != null ? record.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public void deleteTreatmentRecord(Integer id) {
        TreatmentRecord treatmentRecord = treatmentRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Treatment record not found"));

        treatmentRecordRepository.delete(treatmentRecord);
    }
}