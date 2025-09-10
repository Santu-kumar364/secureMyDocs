package com.securemydocs.service;

import com.securemydocs.exceptions.OTPException;
import com.securemydocs.exceptions.ResourceNotFoundException;
import com.securemydocs.model.Post;

import java.util.List;

import com.securemydocs.exceptions.UserException;
 

public interface PostService {

    Post createNewPost(Post post, Integer userId) throws UserException;

    Post updatePost(Post post) throws ResourceNotFoundException;

    List<Post> findPostByUserId(Integer userId);

    Post findPostById(Integer postId) throws ResourceNotFoundException;

    List<Post> findAllPost();

    void deletePost(Integer postId) throws ResourceNotFoundException;

   

    Post updatePostOtpProtection(Post post, String otpCode) throws ResourceNotFoundException, OTPException;
}
