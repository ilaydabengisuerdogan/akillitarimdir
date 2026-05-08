package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.TreatmentRecordCreateRequest;
import com.akillitarim.akillitarim.dto.TreatmentRecordResponse;
import com.akillitarim.akillitarim.service.TreatmentRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/treatment-records")
@CrossOrigin
public class TreatmentRecordController {

    private final TreatmentRecordService treatmentRecordService;

    public TreatmentRecordController(TreatmentRecordService treatmentRecordService) {
        this.treatmentRecordService = treatmentRecordService;
    }

    @GetMapping
    public List<TreatmentRecordResponse> getAllTreatmentRecords() {
        return treatmentRecordService.getAllTreatmentRecords();
    }

    @PostMapping
    public TreatmentRecordResponse createTreatmentRecord(@RequestBody TreatmentRecordCreateRequest request) {
        return treatmentRecordService.createTreatmentRecord(request);
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public List<TreatmentRecordResponse> getTreatmentRecordsByGreenhouseId(@PathVariable Integer greenhouseId) {
        return treatmentRecordService.getTreatmentRecordsByGreenhouseId(greenhouseId);
    }

    @DeleteMapping("/{id}")
    public String deleteTreatmentRecord(@PathVariable Integer id) {
        treatmentRecordService.deleteTreatmentRecord(id);
        return "Treatment record deleted successfully";
    }
}