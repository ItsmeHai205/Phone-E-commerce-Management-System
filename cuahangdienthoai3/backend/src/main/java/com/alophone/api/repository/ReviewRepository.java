package com.alophone.api.repository;

import com.alophone.api.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPhoneIdOrderByIdDesc(String phoneId);
    List<Review> findAllByOrderByIdDesc();
}
