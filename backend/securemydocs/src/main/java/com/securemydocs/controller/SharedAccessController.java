package com.securemydocs.controller;

import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.model.Post;
import com.securemydocs.model.ShareableLink;
import com.securemydocs.service.OTPService;
import com.securemydocs.service.ShareableLinkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/shared")
public class SharedAccessController {

    private static final Logger logger = LoggerFactory.getLogger(SharedAccessController.class);

    @Autowired
    private ShareableLinkService shareableLinkService;

    @Autowired
    private OTPService otpService;

    @GetMapping("/{token}")
    public ResponseEntity<?> getSharedFileInfo(
            @PathVariable String token,
            @RequestParam(required = false) String otp) {

        try {
            ShareableLink link = shareableLinkService.getValidLinkByToken(token);
            
            // Check if link is valid before proceeding
            if (!link.isValid()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", "error", "message", "This share link is invalid or has expired."));
            }

            Post post = link.getPost();

            // Check if OTP is required and validate ONLY if OTP protection is enabled
            if (post.isOtpProtected()) {
                if (otp == null || otp.trim().isEmpty()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of(
                                    "status", "otp_required",
                                    "message", "This file is protected. Please provide an OTP.",
                                    "fileId", post.getId(),
                                    "otpProtected", true
                            ));
                }

                boolean isValid = otpService.validateOTP(otp, post, post.getUser());
                if (!isValid) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of(
                                    "status", "error", 
                                    "message", "Invalid OTP",
                                    "otpProtected", true
                            ));
                }
            }

            // Increment use count
            link.incrementUseCount();
            shareableLinkService.save(link);

            // Return file info (sanitize sensitive data)
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "post", Map.of(
                            "id", post.getId(),
                            "documentName", post.getDocumentName(),
                            "imageName", post.getImageName(),
                            "videoName", post.getVideoName(),
                            "otpProtected", post.isOtpProtected(),
                            "createdAt", post.getCreatedAt()
                    )
            ));

        } catch (ResourceNotFoundException e) {
            logger.warn("Share link not found or expired: {}", token);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "This share link is invalid or has expired."));
        } catch (Exception e) {
            logger.error("Error accessing shared file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to access file"));
        }
    }

    @GetMapping("/{token}/view")
    public ResponseEntity<?> viewSharedFile(
            @PathVariable String token,
            @RequestParam(required = false) String otp) {

        try {
            logger.info("View request for token: {}", token);

            ShareableLink link = shareableLinkService.getValidLinkByToken(token);
            
            // Check if link is valid before proceeding
            if (!link.isValid()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", "error", "message", "This share link is invalid or has expired."));
            }

            Post post = link.getPost();
            logger.info("Found post: {}", post.getId());

            // Check OTP only if file is protected
            if (post.isOtpProtected()) {
                logger.info("Post is OTP protected");
                if (otp == null || otp.trim().isEmpty()) {
                    logger.warn("OTP required but not provided");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of(
                                    "status", "error", 
                                    "message", "OTP required",
                                    "otpProtected", true
                            ));
                }
                boolean isValid = otpService.validateOTP(otp, post, post.getUser());
                if (!isValid) {
                    logger.warn("Invalid OTP provided");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of(
                                    "status", "error", 
                                    "message", "Invalid OTP",
                                    "otpProtected", true
                            ));
                }
                logger.info("OTP validated successfully");
            } else {
                logger.info("Post is not OTP protected, proceeding without OTP");
            }

            link.incrementUseCount();
            shareableLinkService.save(link);

            // Get the file URL for viewing
            String fileUrl = getFileUrl(post);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "fileUrl", fileUrl,
                    "otpProtected", post.isOtpProtected()
            ));

        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "This share link is invalid or has expired."));
        } catch (Exception e) {
            logger.error("Error viewing file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to view file: " + e.getMessage()));
        }
    }

    @PostMapping("/{token}/request-otp")
    public ResponseEntity<?> requestOtpForSharedFile(@PathVariable String token) {
        try {
            ShareableLink link = shareableLinkService.getValidLinkByToken(token);
            
            // Check if link is valid before proceeding
            if (!link.isValid()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", "error", "message", "This share link is invalid or has expired."));
            }

            Post post = link.getPost();

            if (!post.isOtpProtected()) {
                return ResponseEntity.ok(Map.of(
                        "status", "success", 
                        "message", "File is not OTP protected.",
                        "otpProtected", false
                ));
            }

            otpService.generateOTP(post, post.getUser());
            
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "OTP has been sent to the file owner's email.",
                    "otpProtected", true
            ));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", "This share link is invalid or has expired."));
        } catch (Exception e) {
            logger.error("Error requesting OTP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to send OTP"));
        }
    }

    // Helper methods
    private String getFileUrl(Post post) throws ResourceNotFoundException {
        logger.debug("Getting file URL for post: {}", post.getId());

        if (post.getDocument() != null && (post.getDocument().startsWith("http") || post.getDocument().startsWith("https"))) {
            logger.debug("Document URL found: {}", post.getDocument());
            return post.getDocument();
        } else if (post.getImage() != null && (post.getImage().startsWith("http") || post.getImage().startsWith("https"))) {
            logger.debug("Image URL found: {}", post.getImage());
            return post.getImage();
        } else if (post.getVideo() != null && (post.getVideo().startsWith("http") || post.getVideo().startsWith("https"))) {
            logger.debug("Video URL found: {}", post.getVideo());
            return post.getVideo();
        }

        logger.error("No valid file URL found for post: {}", post.getId());
        throw new ResourceNotFoundException("No valid file URL found for the requested file");
    }
}