package com.securemydocs.controller;

 
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.securemydocs.exceptions.OTPException;
import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.model.Post;
import com.securemydocs.model.User;
import com.securemydocs.service.PostService;
import com.securemydocs.service.OTPService;
import com.securemydocs.service.UserService;

@RestController
@RequestMapping("/api/secure/posts")
public class SecurePostController {

    @Autowired
    private PostService postService;
    
    @Autowired
    private OTPService otpService;
    
    @Autowired
    private UserService userService;

    @PostMapping("/{postId}/toggle-otp")
    public ResponseEntity<?> toggleOtpProtection(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId,
            @RequestParam boolean enable,
            @RequestBody Map<String, String> request) {
        
        try {
            User user = userService.findUserByJwt(jwt)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            Post post = postService.findPostById(postId);
            
            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You don't have permission to modify this post"));
            }
            
            String otpCode = request.get("otpCode");
            if (otpCode == null || otpCode.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "OTP code is required"));
            }
            
            // Set the new OTP protection status
            post.setOtpProtected(enable);
            
            // Update with OTP verification
            Post updatedPost = postService.updatePostOtpProtection(post, otpCode);
            
            return ResponseEntity.ok(Map.of(
                    "message", "OTP protection " + (enable ? "enabled" : "disabled") + " successfully",
                    "otpProtected", updatedPost.isOtpProtected()
            ));
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (OTPException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/{postId}/generate-otp-toggle")
    public ResponseEntity<?> generateOtpForToggle(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId) {
        
        try {
            User user = userService.findUserByJwt(jwt)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            Post post = postService.findPostById(postId);
            
            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You don't have permission to access this post"));
            }
            
            // Generate OTP specifically for toggling protection
            otpService.generateOTP(post, user);
            
            return ResponseEntity.ok(Map.of(
                    "message", "OTP sent to your email for verification",
                    "email", user.getEmail()
            ));
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to generate OTP: " + e.getMessage()));
        }
    }
}