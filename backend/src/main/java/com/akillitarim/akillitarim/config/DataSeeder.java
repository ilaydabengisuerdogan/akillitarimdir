package com.akillitarim.akillitarim.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.akillitarim.akillitarim.entity.User;
import com.akillitarim.akillitarim.entity.UserRole;
import com.akillitarim.akillitarim.entity.Sensor;
import com.akillitarim.akillitarim.entity.SensorData;
import com.akillitarim.akillitarim.repository.GreenhouseRepository;
import com.akillitarim.akillitarim.repository.SensorRepository;
import com.akillitarim.akillitarim.repository.SensorDataRepository;
import com.akillitarim.akillitarim.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Random;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner loadData(
            GreenhouseRepository greenhouseRepository, 
            UserRepository userRepository, 
            SensorRepository sensorRepository,
            SensorDataRepository sensorDataRepository) {
        return args -> {
            // 1. KULLANICILAR
            try {
                if (!userRepository.existsByEmail("admin@test.com")) {
                    try {
                        User admin = new User();
                        admin.setEmail("admin@test.com");
                        admin.setPassword("1234");
                        admin.setRole(UserRole.ADMIN);
                        admin.setFullName("Sistem Yöneticisi");
                        userRepository.saveAndFlush(admin);
                    } catch (Exception e) {
                        System.err.println("❌ Admin oluşturulamadı: " + e.getMessage());
                    }
                }

                if (!userRepository.existsByEmail("manager@test.com")) {
                    try {
                        User manager = new User();
                        manager.setEmail("manager@test.com");
                        manager.setPassword("1234");
                        manager.setRole(UserRole.GREENHOUSE_MANAGER);
                        manager.setFullName("Sera Yöneticisi");
                        userRepository.saveAndFlush(manager);
                    } catch (Exception e) {
                        System.err.println("❌ Manager oluşturulamadı (Muhtemelen rol kısıtlaması): " + e.getMessage());
                    }
                }

                if (!userRepository.existsByEmail("farmer@test.com")) {
                    try {
                        User farmer = new User();
                        farmer.setEmail("farmer@test.com");
                        farmer.setPassword("1234");
                        farmer.setRole(UserRole.FARMER);
                        farmer.setFullName("Örnek Çiftçi");
                        userRepository.saveAndFlush(farmer);
                    } catch (Exception e) {
                        System.err.println("❌ Farmer oluşturulamadı: " + e.getMessage());
                    }
                }
                
                System.out.println("✅ Varsayılan Kullanıcılar kontrol edildi!");

                // 2. VARSAYILAN SERA OLUŞTURMA
                if (greenhouseRepository.count() == 0) {
                    com.akillitarim.akillitarim.entity.Greenhouse defaultGh = new com.akillitarim.akillitarim.entity.Greenhouse();
                    defaultGh.setGreenhouseName("Merkez Akıllı Sera");
                    defaultGh.setLocation("Antalya / Aksu");
                    defaultGh.setArea(1500.0);
                    defaultGh.setCropType("Domates");
                    defaultGh.setOwnerEmail("farmer@test.com");
                    greenhouseRepository.save(defaultGh);
                    System.out.println("✅ Varsayılan Sera oluşturuldu!");
                }

                // 3. SENSÖR TOHUMLAMA (Eğer sera varsa ve sensör yoksa)
                greenhouseRepository.findAll().forEach(gh -> {
                    if (sensorRepository.findByGreenhouseId(gh.getId()).isEmpty()) {
                        Sensor s = new Sensor();
                        s.setSensorName(gh.getGreenhouseName() + " Ana Sensör");
                        s.setSensorType("COMBO");
                        s.setGreenhouse(gh);
                        s.setStatus("ACTIVE");
                        Sensor savedSensor = sensorRepository.save(s);

                        // Başlangıç verileri oluştur (Son 10 saat)
                        Random r = new Random();
                        for (int i = 10; i >= 0; i--) {
                            SensorData sd = new SensorData();
                            sd.setSensor(savedSensor);
                            sd.setTemperature(20 + r.nextDouble() * 10);
                            sd.setHumidity(40 + r.nextDouble() * 20);
                            sd.setSoilMoisture(30 + r.nextDouble() * 30);
                            sd.setLightLevel(500 + r.nextDouble() * 4000);
                            sd.setRecordedAt(LocalDateTime.now().minusHours(i));
                            sensorDataRepository.save(sd);
                        }
                        System.out.println("✅ " + gh.getGreenhouseName() + " için sensör ve veriler oluşturuldu!");
                    }
                });

            } catch (Exception e) {
                System.out.println("⚠️ Veri tohumlama hatası: " + e.getMessage());
                e.printStackTrace();
            }

        };
    }
}
