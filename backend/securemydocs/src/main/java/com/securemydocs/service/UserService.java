package com.securemydocs.service;

import java.util.Optional;
import com.securemydocs.exceptions.UserException;
import com.securemydocs.model.User;

public interface UserService {
    public User registerUser(User user);
    public User findUserById(Integer userId) throws UserException;
    public User findUserByEmail(String Email);
    public User updateUser(User user, Integer userId) throws UserException;
    public Optional<User> findUserByJwt(String jwt);
    
    // Password reset methods
    void createPasswordResetTokenForUser(User user, String token);
    String validatePasswordResetToken(String token);
    Optional<User> getUserByPasswordResetToken(String token);
    void changePassword(User user, String newPassword);
    void deletePasswordResetTokenForUser(User user); // Add this method
}