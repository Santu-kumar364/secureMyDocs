package com.securemydocs.controller;

import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.exceptions.UnauthorizedAccessException;
import com.securemydocs.model.Post;
import com.securemydocs.service.PostService;
import com.securemydocs.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.securemydocs.model.User;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private UserService userService;
    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestHeader("Authorization") String jwt, @RequestBody Post post) throws Exception {
        Optional<User> reqUser = userService.findUserByJwt(jwt);
        User user = reqUser.orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Post createdPost = postService.createNewPost(post, user.getId());
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId) throws ResourceNotFoundException, UnauthorizedAccessException {

        Integer userId = userService.findUserByJwt(jwt)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();

        Post post = postService.findPostById(postId);

        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have permission to access this resource");
        }

        return ResponseEntity.ok(post);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("#userId == authentication.principal.id")
    public ResponseEntity<List<Post>> getUserPosts(
            @PathVariable Integer userId) throws ResourceNotFoundException {
        return ResponseEntity.ok(postService.findPostByUserId(userId));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Post>> getCurrentUserPosts(
            @RequestHeader("Authorization") String jwt) throws ResourceNotFoundException {
        Integer userId = userService.findUserByJwt(jwt)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();
        return ResponseEntity.ok(postService.findPostByUserId(userId));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId) throws ResourceNotFoundException, UnauthorizedAccessException {

        Integer userId = userService.findUserByJwt(jwt)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();

        Post post = postService.findPostById(postId);

        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have permission to delete this post");
        }

        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{postId}/otp-protection")
    public ResponseEntity<Post> updateOtpProtection(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId,
            @RequestParam boolean enabled) throws ResourceNotFoundException, UnauthorizedAccessException {

        Integer userId = userService.findUserByJwt(jwt)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();

        Post post = postService.findPostById(postId);
        
        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have permission to modify this post");
        }

        post.setOtpProtected(enabled);
        Post updatedPost = postService.updatePost(post);

        return ResponseEntity.ok(updatedPost);
    }

    @GetMapping("/{postId}/otp-status")
    public ResponseEntity<Map<String, Boolean>> checkOtpStatus(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer postId) throws ResourceNotFoundException, UnauthorizedAccessException {

        Integer userId = userService.findUserByJwt(jwt)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"))
                .getId();

        Post post = postService.findPostById(postId);

        if (!post.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have permission to view this post");
        }

        return ResponseEntity.ok(Collections.singletonMap("otpProtected", post.isOtpProtected()));
    }
}