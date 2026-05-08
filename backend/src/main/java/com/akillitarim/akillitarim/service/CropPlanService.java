package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.CropPlanCreateRequest;
import com.akillitarim.akillitarim.dto.CropPlanResponse;
import com.akillitarim.akillitarim.entity.CropPlan;
import com.akillitarim.akillitarim.entity.Greenhouse;
import com.akillitarim.akillitarim.repository.CropPlanRepository;
import com.akillitarim.akillitarim.repository.GreenhouseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CropPlanService {

    private final CropPlanRepository cropPlanRepository;
    private final GreenhouseRepository greenhouseRepository;

    public CropPlanService(CropPlanRepository cropPlanRepository,
                           GreenhouseRepository greenhouseRepository) {
        this.cropPlanRepository = cropPlanRepository;
        this.greenhouseRepository = greenhouseRepository;
    }

    public List<CropPlanResponse> getAllCropPlans() {
        return cropPlanRepository.findAll().stream()
                .map(cropPlan -> new CropPlanResponse(
                        cropPlan.getId(),
                        cropPlan.getCropName(),
                        cropPlan.getPlantingDate(),
                        cropPlan.getHarvestDate(),
                        cropPlan.getStatus(),
                        cropPlan.getNotes(),
                        cropPlan.getGreenhouse() != null ? cropPlan.getGreenhouse().getId() : null,
                        cropPlan.getGreenhouse() != null ? cropPlan.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public CropPlanResponse createCropPlan(CropPlanCreateRequest request) {

        Greenhouse greenhouse = null;
        if (request.getGreenhouseId() != null) {
            greenhouse = greenhouseRepository.findById(request.getGreenhouseId()).orElse(null);
        }

        CropPlan cropPlan = new CropPlan();
        cropPlan.setCropName(request.getCropName());
        cropPlan.setPlantingDate(request.getPlantingDate());
        cropPlan.setHarvestDate(request.getHarvestDate());
        cropPlan.setStatus(request.getStatus());
        cropPlan.setNotes(request.getNotes());
        cropPlan.setGreenhouse(greenhouse);

        CropPlan savedCropPlan = cropPlanRepository.save(cropPlan);

        return new CropPlanResponse(
                savedCropPlan.getId(),
                savedCropPlan.getCropName(),
                savedCropPlan.getPlantingDate(),
                savedCropPlan.getHarvestDate(),
                savedCropPlan.getStatus(),
                savedCropPlan.getNotes(),
                savedCropPlan.getGreenhouse() != null ? savedCropPlan.getGreenhouse().getId() : null,
                savedCropPlan.getGreenhouse() != null ? savedCropPlan.getGreenhouse().getGreenhouseName() : null
        );
    }

    public List<CropPlanResponse> getCropPlansByGreenhouseId(Integer greenhouseId) {
        return cropPlanRepository.findByGreenhouseId(greenhouseId).stream()
                .map(cropPlan -> new CropPlanResponse(
                        cropPlan.getId(),
                        cropPlan.getCropName(),
                        cropPlan.getPlantingDate(),
                        cropPlan.getHarvestDate(),
                        cropPlan.getStatus(),
                        cropPlan.getNotes(),
                        cropPlan.getGreenhouse() != null ? cropPlan.getGreenhouse().getId() : null,
                        cropPlan.getGreenhouse() != null ? cropPlan.getGreenhouse().getGreenhouseName() : null
                ))
                .toList();
    }

    public void deleteCropPlan(Integer id) {
        CropPlan cropPlan = cropPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Crop plan not found"));

        cropPlanRepository.delete(cropPlan);
    }
}