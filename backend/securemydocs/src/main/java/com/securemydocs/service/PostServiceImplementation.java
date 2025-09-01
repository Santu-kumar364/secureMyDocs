package com.securemydocs.service;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securemydocs.exceptions.OTPException;
import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.exceptions.UserException;
import com.securemydocs.model.Post;
import com.securemydocs.model.User;
import com.securemydocs.repository.OTPRepository;
import com.securemydocs.repository.PostRepository;
 

@Service
@Transactional
public class PostServiceImplementation implements PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostServiceImplementation.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private OTPService otpService;

    @Autowired
    private AuditLogService auditLogService;

    @Override
    public Post createNewPost(Post post, Integer userId) throws UserException {
        User user = userService.findUserById(userId);
        Post newPost = new Post();
        newPost.setCaptions(post.getCaptions());
        newPost.setImage(post.getImage());
        newPost.setImageName(post.getImageName());
        newPost.setVideo(post.getVideo());
        newPost.setVideoName(post.getVideoName());
        newPost.setDocument(post.getDocument());
        newPost.setDocumentName(post.getDocumentName());
        newPost.setCreatedAt(LocalDateTime.now());
        newPost.setUser(user);

        Post savedPost = postRepository.save(newPost);

        // Log the creation action - use helper methods
        try {
            auditLogService.saveLog(
                    "UPLOAD",
                    getFileName(savedPost), // Use helper method
                    user
            );
        } catch (Exception e) {
            logger.warn("Failed to log audit entry for post upload: {}", savedPost.getId(), e);
        }

        return savedPost;
    }

    @Override
    @Transactional
    public Post updatePost(Post post) throws ResourceNotFoundException {
        Post existingPost = postRepository.findById(post.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + post.getId()));

        // Only update OTP protection status
        existingPost.setOtpProtected(post.isOtpProtected());

        Post updatedPost = postRepository.save(existingPost);

        // Log the action - use helper methods
        try {
            String action = post.isOtpProtected() ? "ENABLE_OTP" : "DISABLE_OTP";
            auditLogService.saveLog(
                    action,
                    getFileName(existingPost), // Use helper method
                    existingPost.getUser()
            );
        } catch (Exception e) {
            logger.warn("Failed to log OTP protection change: {}", existingPost.getId(), e);
        }

        return updatedPost;
    }

    @Override
    public void deletePost(Integer postId) throws ResourceNotFoundException {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        try {
            otpRepository.deleteByPostId(postId);
            logger.info("Deleted OTP records for post ID: {}", postId);
        } catch (Exception e) {
            logger.warn("Failed to delete OTP records for post ID: {}, proceeding with post deletion", postId, e);
        }

        try {
            auditLogService.saveLog(
                    "DELETE",
                    getFileName(post), // Use helper method
                    post.getUser()
            );
        } catch (Exception e) {
            logger.warn("Failed to log audit entry for post deletion: {}", postId, e);
        }

        postRepository.delete(post);
    }

    @Override
    @Transactional
    public Post updatePostOtpProtection(Post post, String otpCode) throws ResourceNotFoundException, OTPException {
        Post existingPost = postRepository.findById(post.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + post.getId()));

        // Validate OTP before allowing the change
        if (!otpService.validateOTP(otpCode, existingPost, existingPost.getUser())) {
            throw new OTPException("Invalid OTP for updating OTP protection");
        }

        // Only update OTP protection status
        existingPost.setOtpProtected(post.isOtpProtected());

        Post updatedPost = postRepository.save(existingPost);

        // Log the action - use helper methods
        try {
            String action = post.isOtpProtected() ? "ENABLE_OTP" : "DISABLE_OTP";
            auditLogService.saveLog(
                    action,
                    getFileName(existingPost), // Use helper method
                    existingPost.getUser()
            );
        } catch (Exception e) {
            logger.warn("Failed to log OTP protection change: {}", existingPost.getId(), e);
        }

        return updatedPost;
    }

    // Helper method to get file name
    private String getFileName(Post post) {
        if (post.getDocumentName() != null) {
            return post.getDocumentName();
        }
        if (post.getImageName() != null) {
            return post.getImageName();
        }
        if (post.getVideoName() != null) {
            return post.getVideoName();
        }
        return "unknown";
    }

    @Override
    public List<Post> findPostByUserId(Integer userId) {
        return postRepository.findByUserId(userId);
    }

    @Override
    public Post findPostById(Integer postId) throws ResourceNotFoundException {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
    }

    @Override
    public List<Post> findAllPost() {
        return postRepository.findAll();
    }
}