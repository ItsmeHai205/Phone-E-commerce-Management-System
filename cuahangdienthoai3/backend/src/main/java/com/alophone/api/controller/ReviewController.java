package com.alophone.api.controller;

import com.alophone.api.model.Review;
import com.alophone.api.model.Phone;
import com.alophone.api.repository.ReviewRepository;
import com.alophone.api.repository.PhoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PhoneRepository phoneRepository;

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAllByOrderByIdDesc();
    }

    @GetMapping("/phone/{phoneId}")
    public List<Review> getReviewsByPhoneId(@PathVariable String phoneId) {
        return reviewRepository.findByPhoneIdOrderByIdDesc(phoneId);
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            return ResponseEntity.badRequest().build();
        }

        if (review.getDate() == null || review.getDate().trim().isEmpty()) {
            review.setDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }

        // Fetch Phone to set phoneName
        Phone phone = phoneRepository.findById(review.getPhoneId()).orElse(null);
        if (phone != null) {
            review.setPhoneName(phone.getName());
        }

        Review saved = reviewRepository.save(review);

        // Update Phone average rating and reviewsCount
        if (phone != null) {
            List<Review> phoneReviews = reviewRepository.findByPhoneIdOrderByIdDesc(review.getPhoneId());
            int count = phoneReviews.size();
            double sum = phoneReviews.stream().mapToInt(Review::getRating).sum();
            double avg = Math.round((sum / count) * 10.0) / 10.0;

            phone.setReviewsCount(count);
            phone.setRating(avg);
            phoneRepository.save(phone);
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }

        reviewRepository.deleteById(id);

        // Recalculate Phone average rating and reviewsCount
        Phone phone = phoneRepository.findById(review.getPhoneId()).orElse(null);
        if (phone != null) {
            List<Review> phoneReviews = reviewRepository.findByPhoneIdOrderByIdDesc(review.getPhoneId());
            if (phoneReviews.isEmpty()) {
                phone.setReviewsCount(0);
                phone.setRating(5.0);
            } else {
                int count = phoneReviews.size();
                double sum = phoneReviews.stream().mapToInt(Review::getRating).sum();
                double avg = Math.round((sum / count) * 10.0) / 10.0;
                phone.setReviewsCount(count);
                phone.setRating(avg);
            }
            phoneRepository.save(phone);
        }

        return ResponseEntity.noContent().build();
    }
}
