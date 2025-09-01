package com.securemydocs.service;

import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.model.Post;
import com.securemydocs.model.ShareableLink;

import java.time.LocalDateTime;

public interface ShareableLinkService {

    ShareableLink createShareableLink(Post post, LocalDateTime expiresAt, Integer maxUses) throws ResourceNotFoundException;

    ShareableLink getValidLinkByToken(String token) throws ResourceNotFoundException;

    String generateShareUrl(String token);

    void deactivateLink(Long linkId) throws ResourceNotFoundException;
    ShareableLink save(ShareableLink link);
}
