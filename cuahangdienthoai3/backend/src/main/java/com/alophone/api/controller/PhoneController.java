package com.alophone.api.controller;

import com.alophone.api.model.Phone;
import com.alophone.api.repository.PhoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/phones")
@CrossOrigin(origins = "http://localhost:5173")
public class PhoneController {

    @Autowired
    private PhoneRepository phoneRepository;

    @GetMapping
    public List<Phone> getAllPhones() {
        return phoneRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Phone> getPhoneById(@PathVariable String id) {
        Optional<Phone> phoneOpt = phoneRepository.findById(id);
        return phoneOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Phone addPhone(@RequestBody Phone phone) {
        return phoneRepository.save(phone);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Phone> updatePhone(@PathVariable String id, @RequestBody Phone phoneDetails) {
        if (!phoneRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        phoneDetails.setId(id);
        Phone updatedPhone = phoneRepository.save(phoneDetails);
        return ResponseEntity.ok(updatedPhone);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhone(@PathVariable String id) {
        if (!phoneRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        phoneRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
