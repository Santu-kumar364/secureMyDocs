package com.securemydocs.repository;

import com.securemydocs.model.OTP;
import com.securemydocs.model.Post;
import com.securemydocs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {

    Optional<OTP> findByPostAndUserAndUsedFalseAndExpiresAtAfter(
            Post post, User user, LocalDateTime now);

    Optional<OTP> findByCodeAndPostAndUserAndUsedFalseAndExpiresAtAfter(
            String code, Post post, User user, LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM OTP o WHERE o.post.id = :postId")
    void deleteByPostId(@Param("postId") Integer postId);
}
