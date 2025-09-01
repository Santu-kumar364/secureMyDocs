package com.securemydocs.service;

import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.model.Post;
import com.securemydocs.model.ShareableLink;
import com.securemydocs.repository.ShareableLinkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ShareableLinkServiceImpl implements ShareableLinkService {

    @Autowired
    private ShareableLinkRepository shareableLinkRepository;

    @Value("${app.frontend.url}") // Change this to your frontend URL
    private String frontendBaseUrl;

    @Override
    public ShareableLink createShareableLink(Post post, LocalDateTime expiresAt, Integer maxUses) {

        ShareableLink newLink = new ShareableLink(post, expiresAt, maxUses);
        return shareableLinkRepository.save(newLink);
    }

    @Override
    public ShareableLink getValidLinkByToken(String token) throws ResourceNotFoundException {
        ShareableLink link = shareableLinkRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Link not found"));

        if (!link.isValid()) {
            throw new ResourceNotFoundException("Link expired or invalid");
        }

        return link;
    }

    @Override
    public String generateShareUrl(String token) {
        return frontendBaseUrl + "/shared/" + token; // Frontend will handle this route
    }

    @Override
    public void deactivateLink(Long linkId) throws ResourceNotFoundException {
        ShareableLink link = shareableLinkRepository.findById(linkId)
                .orElseThrow(() -> new ResourceNotFoundException("Link not found"));
        link.setIsActive(false);
        shareableLinkRepository.save(link);
    }

    @Override
    public ShareableLink save(ShareableLink link) {
        return shareableLinkRepository.save(link);
    }

}
