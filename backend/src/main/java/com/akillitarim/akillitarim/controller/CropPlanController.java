package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.CropPlanCreateRequest;
import com.akillitarim.akillitarim.dto.CropPlanResponse;
import com.akillitarim.akillitarim.service.CropPlanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crop-plans")
@CrossOrigin
public class CropPlanController {

    private final CropPlanService cropPlanService;

    public CropPlanController(CropPlanService cropPlanService) {
        this.cropPlanService = cropPlanService;
    }

    @GetMapping
    public List<CropPlanResponse> getAllCropPlans() {
        return cropPlanService.getAllCropPlans();
    }

    @PostMapping
    public CropPlanResponse createCropPlan(@RequestBody CropPlanCreateRequest request) {
        return cropPlanService.createCropPlan(request);
    }

    @GetMapping("/greenhouse/{greenhouseId}")
    public List<CropPlanResponse> getCropPlansByGreenhouseId(@PathVariable Integer greenhouseId) {
        return cropPlanService.getCropPlansByGreenhouseId(greenhouseId);
    }

    @DeleteMapping("/{id}")
    public String deleteCropPlan(@PathVariable Integer id) {
        cropPlanService.deleteCropPlan(id);
        return "Crop plan deleted successfully";
    }
}