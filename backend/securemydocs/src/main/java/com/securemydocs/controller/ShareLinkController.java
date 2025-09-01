package com.securemydocs.controller;

import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.exceptions.UnauthorizedAccessException;
import com.securemydocs.model.Post;
import com.securemydocs.model.ShareableLink;
import com.securemydocs.model.User;
import com.securemydocs.service.PostService;
import com.securemydocs.service.ShareableLinkService;
import com.securemydocs.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/share")
public class ShareLinkController {

    @Autowired
    private ShareableLinkService shareableLinkService;
    @Autowired
    private UserService userService;
    @Autowired
    private PostService postService;

    @PostMapping("/create/{postId}")
    public ResponseEntity<?> createShareLink(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime expiresAt,
            @RequestParam(required = false) Integer maxUses) {

        try {
            User user = userService.findUserByJwt(jwt)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Post post = postService.findPostById(postId);

            // Authorization check: only the owner can share the file
            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("status", "error", "message", "You can only share your own files."));
            }

            ShareableLink newLink = shareableLinkService.createShareableLink(post, expiresAt, maxUses);
            String shareUrl = shareableLinkService.generateShareUrl(newLink.getToken());

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Shareable link created successfully.",
                    "shareUrl", shareUrl,
                    "expiresAt", newLink.getExpiresAt(),
                    "maxUses", newLink.getMaxUses()
            ));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Failed to create share link: " + e.getMessage()));
        }
    }
    // Add endpoints to: list active links for a post, deactivate a link, etc.
}