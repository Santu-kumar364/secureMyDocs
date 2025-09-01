package com.securemydocs.repository;

import com.securemydocs.model.ShareableLink;
import com.securemydocs.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;

@Repository
public interface ShareableLinkRepository extends JpaRepository<ShareableLink, Long> {
    Optional<ShareableLink> findByToken(String token);
    Optional<ShareableLink> findByTokenAndIsActiveTrue(String token);

    // Find a valid, active, non-expired link
    @Query("SELECT sl FROM ShareableLink sl WHERE sl.token = :token AND sl.isActive = true AND sl.expiresAt > :now")
    Optional<ShareableLink> findValidLinkByToken(@Param("token") String token, @Param("now") LocalDateTime now);

    // Find all links for a specific post (for management)
    List<ShareableLink> findByPost(Post post);

    // Deactivate all links for a post (e.g., when post is deleted)
    @Modifying
    @Query("UPDATE ShareableLink sl SET sl.isActive = false WHERE sl.post.id = :postId")
    void deactivateAllByPostId(@Param("postId") Integer postId);
}