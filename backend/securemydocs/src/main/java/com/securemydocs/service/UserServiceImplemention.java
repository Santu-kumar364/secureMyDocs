package com.securemydocs.service;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.securemydocs.config.JwtProvider;
import com.securemydocs.exceptions.UserException;
import com.securemydocs.model.PasswordResetToken;
import com.securemydocs.model.User;
import com.securemydocs.repository.PasswordResetTokenRepository;
import com.securemydocs.repository.UserRepository;

@Service
public class UserServiceImplemention implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // REMOVE THIS PROBLEMATIC LINE:
    // PasswordResetToken existingToken = passwordResetTokenRepository.findByUser(user);

    @Override
    public User registerUser(User user) {
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setFirstName(user.getFirstName());
        newUser.setLastName(user.getLastName());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(newUser);
        return savedUser;
    }

    @Override
    public User findUserById(Integer userId) throws UserException {
        Optional<User> users = userRepository.findById(userId);

        if (users.isPresent()) {
            return users.get();
        }

        throw new UserException("user not exist with userId " + userId);
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User updateUser(User user, Integer userId) throws UserException {
        Optional<User> user1 = userRepository.findById(userId);

        if (user1.isEmpty()) {
            throw new UserException("user not exist with id " + userId);
        }

        User oldUser = user1.get();

        if (user.getFirstName() != null) {
            oldUser.setFirstName(user.getFirstName());
        }
        if (user.getPassword() != null) {
            oldUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getEmail() != null) {
            oldUser.setEmail(user.getEmail());
        }
        if (user.getLastName() != null) {
            oldUser.setLastName(user.getLastName());
        }

        return userRepository.save(oldUser);
    }

    @Override
    public Optional<User> findUserByJwt(String jwt) {
        String email = JwtProvider.getEmailFromJwtToken(jwt);
        User user = userRepository.findByEmail(email);
        return Optional.ofNullable(user);
    }

    @Override
    public void createPasswordResetTokenForUser(User user, String token) {
        // First check if a token already exists for this user
        PasswordResetToken existingToken = passwordResetTokenRepository.findByUser(user);

        if (existingToken != null) {
            // Update the existing token
            existingToken.setToken(token);
            existingToken.setExpiryDate(calculateExpiryDate(60 * 24)); // 24 hours
            passwordResetTokenRepository.save(existingToken);
        } else {
            // Create a new token
            PasswordResetToken newToken = new PasswordResetToken(token, user);
            passwordResetTokenRepository.save(newToken);
        }
    }

    @Override
    public void deletePasswordResetTokenForUser(User user) {
        PasswordResetToken token = passwordResetTokenRepository.findByUser(user);
        if (token != null) {
            passwordResetTokenRepository.delete(token);
        }
    }

    private Date calculateExpiryDate(int expiryTimeInMinutes) {
        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(new Date().getTime());
        cal.add(Calendar.MINUTE, expiryTimeInMinutes);
        return new Date(cal.getTime().getTime());
    }

    @Override
    public String validatePasswordResetToken(String token) {
        PasswordResetToken passToken = passwordResetTokenRepository.findByToken(token);

        if (passToken == null) {
            return "invalid";
        }

        if (passToken.getExpiryDate().before(new Date())) {
            return "expired";
        }

        return "valid";
    }

    @Override
    public Optional<User> getUserByPasswordResetToken(String token) {
        PasswordResetToken passToken = passwordResetTokenRepository.findByToken(token);
        if (passToken != null) {
            return Optional.of(passToken.getUser());
        }
        return Optional.empty();
    }

    @Override
    public void changePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}