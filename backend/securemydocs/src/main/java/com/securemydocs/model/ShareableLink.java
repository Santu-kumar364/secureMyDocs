package com.securemydocs.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shareable_links")
public class ShareableLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token; // Unique identifier for the URL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "max_uses")
    private Integer maxUses; // Optional: null means unlimited uses

    @Column(name = "use_count")
    private Integer useCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructor
    public ShareableLink() {
        this.token = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.useCount = 0;
        this.isActive = true;
    }

    public ShareableLink(Post post, LocalDateTime expiresAt, Integer maxUses) {
        this();
        this.post = post;
        this.expiresAt = expiresAt;
        this.maxUses = maxUses;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public Integer getMaxUses() { return maxUses; }
    public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }
    public Integer getUseCount() { return useCount; }
    public void setUseCount(Integer useCount) { this.useCount = useCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // Helper method to check if the link is valid
    public boolean isValid() {
        return isActive &&
               LocalDateTime.now().isBefore(expiresAt) &&
               (maxUses == null || useCount < maxUses);
    }

    // Helper method to increment use count
    public void incrementUseCount() {
        this.useCount++;
    }
}