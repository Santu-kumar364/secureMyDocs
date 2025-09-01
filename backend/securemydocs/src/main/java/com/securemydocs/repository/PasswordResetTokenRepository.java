package com.securemydocs.repository;

import com.securemydocs.model.PasswordResetToken;
import com.securemydocs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);
    PasswordResetToken findByUser(User user); // Make sure this method exists
    void deleteByToken(String token);
    void deleteByUser(User user);
}