package com.securemydocs.controller;

import java.util.Map;

import com.securemydocs.model.Post;
import com.securemydocs.model.User;
import com.securemydocs.service.OTPService;
import com.securemydocs.service.PostService;
import com.securemydocs.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.securemydocs.exceptions.OTPException;
import com.securemydocs.exceptions.ResourceNotFoundException;

@RestController
@RequestMapping("/api/otp")
public class OTPController {

    @Autowired
    private OTPService otpService;

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @PostMapping("/generate/{postId}")
    public ResponseEntity<?> generateOTP(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId) {

        try {
            User user = userService.findUserByJwt(jwt)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            Post post = postService.findPostById(postId);

            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("status", "error", "message", "You don't have permission to access this file"));
            }

            otpService.generateOTP(post, user);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "OTP sent to your email",
                    "email", user.getEmail()
            ));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (OTPException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to send OTP: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/validate/{postId}")
    public ResponseEntity<?> validateOTP(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId,
            @RequestBody Map<String, String> request) {

        try {
            User user = userService.findUserByJwt(jwt)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            Post post = postService.findPostById(postId);
            String code = request.get("code");

            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "OTP code is required",
                        "valid", false
                ));
            }

            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "status", "error",
                                "message", "You don't have permission to access this file",
                                "valid", false
                        ));
            }

            boolean isValid = otpService.validateOTP(code, post, user);
            if (isValid) {
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "OTP validated successfully",
                        "valid", true
                ));
            }

            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Invalid OTP",
                    "valid", false
            ));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", "error",
                            "message", e.getMessage(),
                            "valid", false
                    ));
        } catch (OTPException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "status", "error",
                            "message", e.getMessage(),
                            "valid", false
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "message", "Unexpected error: " + e.getMessage(),
                            "valid", false
                    ));
        }
    }
}
