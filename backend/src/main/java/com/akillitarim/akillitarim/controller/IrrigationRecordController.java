package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.IrrigationRecordCreateRequest;
import com.akillitarim.akillitarim.dto.IrrigationRecordResponse;
import com.akillitarim.akillitarim.service.IrrigationRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/irrigation-records")
@CrossOrigin
public class IrrigationRecordController {

    private final IrrigationRecordService irrigationRecordService;

    public IrrigationRecordController(IrrigationRecordService irrigationRecordService) {
        this.irrigationRecordService = irrigationRecordService;
    }

    @GetMapping
    public List<IrrigationRecordResponse> getAllIrrigationRecords() {
        return irrigationRecordService.getAllIrrigationRecords();
    }

    @PostMapping
    public IrrigationRecordResponse createIrrigationRecord(@RequestBody IrrigationRecordCreateRequest request) {
        return irrigationRecordService.createIrrigationRecord(request);
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public List<IrrigationRecordResponse> getIrrigationRecordsByGreenhouseId(@PathVariable Integer greenhouseId) {
        return irrigationRecordService.getIrrigationRecordsByGreenhouseId(greenhouseId);
    }

    @DeleteMapping("/{id}")
    public String deleteIrrigationRecord(@PathVariable Integer id) {
        irrigationRecordService.deleteIrrigationRecord(id);
        return "Irrigation record deleted successfully";
    }
}