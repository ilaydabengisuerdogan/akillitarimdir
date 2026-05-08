package com.akillitarim.akillitarim.service;

import com.akillitarim.akillitarim.dto.GreenhouseCreateRequest;
import com.akillitarim.akillitarim.dto.GreenhouseResponse;
import com.akillitarim.akillitarim.entity.Greenhouse;
import com.akillitarim.akillitarim.entity.User;
import com.akillitarim.akillitarim.repository.GreenhouseRepository;
import com.akillitarim.akillitarim.repository.UserRepository;
import com.akillitarim.akillitarim.repository.SensorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GreenhouseService {

    private final GreenhouseRepository greenhouseRepository;
    private final SensorRepository sensorRepository;
    private final UserRepository userRepository;

    public GreenhouseService(GreenhouseRepository greenhouseRepository, 
                             SensorRepository sensorRepository,
                             UserRepository userRepository) {
        this.greenhouseRepository = greenhouseRepository;
        this.sensorRepository = sensorRepository;
        this.userRepository = userRepository;
    }

    public List<GreenhouseResponse> getAllGreenhouses(String ownerEmail) {
        List<Greenhouse> greenhouses;
        if (ownerEmail != null && !ownerEmail.isEmpty()) {
            greenhouses = greenhouseRepository.findByOwnerEmail(ownerEmail);
        } else {
            greenhouses = greenhouseRepository.findAll();
        }

        return greenhouses.stream()
                .map(greenhouse -> new GreenhouseResponse(
                        greenhouse.getId(),
                        greenhouse.getGreenhouseName(),
                        greenhouse.getLocation(),
                        greenhouse.getArea(),
                        greenhouse.getCropType(),
                        greenhouse.getOwnerEmail()
                ))
                .toList();
    }

    public GreenhouseResponse createGreenhouse(GreenhouseCreateRequest request) {
        Greenhouse greenhouse = new Greenhouse();

        greenhouse.setGreenhouseName(request.getGreenhouseName());
        greenhouse.setLocation(request.getLocation());
        greenhouse.setArea(request.getArea());
        greenhouse.setCropType(request.getCropType());
        greenhouse.setOwnerEmail(request.getOwnerEmail());

        // Set User by email if exists
        if (request.getOwnerEmail() != null) {
            userRepository.findByEmail(request.getOwnerEmail()).ifPresent(greenhouse::setUser);
        }

        Greenhouse savedGreenhouse = greenhouseRepository.save(greenhouse);

        return new GreenhouseResponse(
                savedGreenhouse.getId(),
                savedGreenhouse.getGreenhouseName(),
                savedGreenhouse.getLocation(),
                savedGreenhouse.getArea(),
                savedGreenhouse.getCropType(),
                savedGreenhouse.getOwnerEmail()
        );
    }

    public GreenhouseResponse updateGreenhouse(Integer id, GreenhouseCreateRequest request) {
        Greenhouse greenhouse = greenhouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Greenhouse not found"));

        greenhouse.setGreenhouseName(request.getGreenhouseName());
        greenhouse.setLocation(request.getLocation());
        greenhouse.setArea(request.getArea());
        greenhouse.setCropType(request.getCropType());

        Greenhouse updatedGreenhouse = greenhouseRepository.save(greenhouse);

        return new GreenhouseResponse(
                updatedGreenhouse.getId(),
                updatedGreenhouse.getGreenhouseName(),
                updatedGreenhouse.getLocation(),
                updatedGreenhouse.getArea(),
                updatedGreenhouse.getCropType(),
                updatedGreenhouse.getOwnerEmail()
        );
    }

    public void deleteGreenhouse(Integer id) {
        Greenhouse greenhouse = greenhouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Greenhouse not found"));

        greenhouseRepository.delete(greenhouse);
    }
}