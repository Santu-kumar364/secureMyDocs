package com.securemydocs.repository;

import com.securemydocs.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Integer> {
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId")
    List<Post> findByUserId(Integer userId);

    @Query("SELECT p FROM Post p WHERE p.otpProtected = true")
    List<Post> findAllOtpProtectedPosts();
}