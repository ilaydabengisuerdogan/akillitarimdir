package com.akillitarim.akillitarim.controller;

import com.akillitarim.akillitarim.dto.GreenhouseCreateRequest;
import com.akillitarim.akillitarim.dto.GreenhouseResponse;
import com.akillitarim.akillitarim.service.GreenhouseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/greenhouses")
@CrossOrigin
public class GreenhouseController {

    private final GreenhouseService greenhouseService;

    public GreenhouseController(GreenhouseService greenhouseService) {
        this.greenhouseService = greenhouseService;
    }

    @GetMapping
    public List<GreenhouseResponse> getAllGreenhouses(@RequestParam(required = false) String ownerEmail) {
        return greenhouseService.getAllGreenhouses(ownerEmail);
    }

    @PostMapping
    public GreenhouseResponse createGreenhouse(@RequestBody GreenhouseCreateRequest request) {
        return greenhouseService.createGreenhouse(request);
    }

    @PutMapping("/{id}")
    public GreenhouseResponse updateGreenhouse(@PathVariable Integer id,
                                               @RequestBody GreenhouseCreateRequest request) {
        return greenhouseService.updateGreenhouse(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteGreenhouse(@PathVariable Integer id) {
        greenhouseService.deleteGreenhouse(id);
        return "Greenhouse deleted successfully";
    }
}