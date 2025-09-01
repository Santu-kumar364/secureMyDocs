package com.securemydocs.controller;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.securemydocs.request.LoginRequest;
import com.securemydocs.config.JwtProvider;
import com.securemydocs.model.User;
import com.securemydocs.repository.PasswordResetTokenRepository;
import com.securemydocs.repository.UserRepository;
import com.securemydocs.response.AuthResponse;
import com.securemydocs.service.CustomerUserDetailsService;
import com.securemydocs.service.UserService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private CustomerUserDetailsService customerUserDetails;

    //     /auth/signup	
    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody User user) throws Exception {

        User isExist = userRepository.findByEmail(user.getEmail());

        if (isExist != null) {
            throw new Exception("this email already used with another account");
        }

        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setFirstName(user.getFirstName());
        newUser.setLastName(user.getLastName());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(newUser);

        Authentication authentication = new UsernamePasswordAuthenticationToken(savedUser.getEmail(), savedUser.getPassword());

        String token = JwtProvider.generatedToken(authentication);

        AuthResponse res = new AuthResponse(token, "Register Success");

        return res;

    }

    //  auth/signin	
    @PostMapping("/signin")
    public AuthResponse signin(@RequestBody LoginRequest loginRequest) {

        Authentication authentication
                = authentication(loginRequest.getEmail(), loginRequest.getPassword());

        String token = JwtProvider.generatedToken(authentication);

        AuthResponse res = new AuthResponse(token, "Login Success");

        return res;
    }

    private Authentication authentication(String email, String password) {
        UserDetails userDetails = customerUserDetails.loadUserByUsername(email);

        if (userDetails == null) {
            throw new BadCredentialsException("invalid username");
        }
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("password not matched");
        }
        return new UsernamePasswordAuthenticationToken(userDetails,
                null,
                userDetails.getAuthorities());
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User with this email does not exist");
        }

        String token = UUID.randomUUID().toString();
        userService.createPasswordResetTokenForUser(user, token);

        // Send email with reset link
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        sendPasswordResetEmail(user.getEmail(), resetLink);

        return ResponseEntity.ok("Password reset link sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");

        String validationResult = userService.validatePasswordResetToken(token);

        if (!validationResult.equals("valid")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(validationResult.equals("expired")
                            ? "Token has expired" : "Invalid token");
        }

        Optional<User> user = userService.getUserByPasswordResetToken(token);
        if (user.isPresent()) {
            userService.changePassword(user.get(), newPassword);
            // Delete the token after successful password reset
            userService.deletePasswordResetTokenForUser(user.get());
            return ResponseEntity.ok("Password reset successfully");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token");
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<String> validateResetToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String validationResult = userService.validatePasswordResetToken(token);

        if (validationResult.equals("valid")) {
            return ResponseEntity.ok("Token is valid");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(validationResult.equals("expired")
                            ? "Token has expired" : "Invalid token");
        }
    }

    private void sendPasswordResetEmail(String email, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request - SecureMyDocs");
        message.setText("To reset your password, click the link below:\n" + resetLink
                + "\n\nThis link will expire in 24 hours.");
        mailSender.send(message);
    }

}
