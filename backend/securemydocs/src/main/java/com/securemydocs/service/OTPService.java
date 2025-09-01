package com.securemydocs.service;

import com.securemydocs.exceptions.OTPException;
import com.securemydocs.model.OTP;
import com.securemydocs.model.Post;
import com.securemydocs.model.User;

public interface OTPService {
    OTP generateOTP(Post post, User user) throws OTPException;
    boolean validateOTP(String code, Post post, User user) throws OTPException;
}