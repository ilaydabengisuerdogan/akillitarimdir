package com.akillitarim.akillitarim.repository;

import com.akillitarim.akillitarim.entity.Greenhouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GreenhouseRepository extends JpaRepository<Greenhouse, Integer> {
    List<Greenhouse> findByOwnerEmail(String ownerEmail);
}