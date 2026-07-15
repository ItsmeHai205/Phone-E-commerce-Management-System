package com.alophone.api.controller;

import com.alophone.api.model.Order;
import com.alophone.api.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc();
    }

    @GetMapping("/user/{username}")
    public List<Order> getOrdersByUser(@PathVariable String username) {
        return orderRepository.findByUsernameOrderByOrderDateDesc(username);
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        if (order.getId() == null || order.getId().trim().isEmpty()) {
            order.setId("ALO-" + (int)(100000 + Math.random() * 900000));
        }
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDateTime.now());
        }
        if (order.getStatus() == null || order.getStatus().trim().isEmpty()) {
            order.setStatus("PENDING");
        }
        return orderRepository.save(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable String id, @RequestBody String status) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (!orderOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Order order = orderOpt.get();
        // Clean status quotes if any
        String cleanStatus = status.replace("\"", "").trim();
        order.setStatus(cleanStatus);
        Order updatedOrder = orderRepository.save(order);
        return ResponseEntity.ok(updatedOrder);
    }
}
