package com.securemydocs.service;

import com.securemydocs.exceptions.OTPException;
import com.securemydocs.model.OTP;
import com.securemydocs.model.Post;
import com.securemydocs.model.User;
import com.securemydocs.repository.OTPRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OTPServiceImpl implements OTPService {

    private static final Logger logger = LoggerFactory.getLogger(OTPServiceImpl.class);

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService; // ✅ use EmailService instead of JavaMailSender/EmailConfig

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRE_MINUTES = 5;

    @Override
    public OTP generateOTP(Post post, User user) throws OTPException {
        try {
            logger.info("Generating OTP for post ID: {}, user: {}", post.getId(), user.getEmail());

            // Invalidate any existing OTP for this file/user
            otpRepository.findByPostAndUserAndUsedFalseAndExpiresAtAfter(
                    post, user, LocalDateTime.now())
                    .ifPresent(existingOtp -> {
                        logger.info("Invalidating existing OTP: {}", existingOtp.getCode());
                        existingOtp.setUsed(true);
                        otpRepository.save(existingOtp);
                    });

            String code = generateRandomCode();
            LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES);

            OTP otp = new OTP(
                    code,
                    user.getEmail(),
                    expiresAt,
                    post,
                    user
            );

            logger.info("Saving new OTP: {} for email: {}", code, user.getEmail());
            OTP savedOTP = otpRepository.save(otp);

            // ✅ Send OTP using EmailService
            sendOTPEmail(savedOTP);

            logger.info("OTP generated and sent successfully");
            return savedOTP;
        } catch (Exception e) {
            logger.error("Failed to generate OTP for post: {}, user: {}", post.getId(), user.getEmail(), e);
            throw new OTPException("Failed to generate OTP: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean validateOTP(String code, Post post, User user) throws OTPException {
        try {
            logger.info("Validating OTP for post ID: {}, user: {}", post.getId(), user.getEmail());

            OTP otp = otpRepository.findByCodeAndPostAndUserAndUsedFalseAndExpiresAtAfter(
                    code, post, user, LocalDateTime.now())
                    .orElseThrow(() -> new OTPException("Invalid or expired OTP"));

            otp.setUsed(true);
            otpRepository.save(otp);
            logger.info("OTP validated successfully");
            return true;
        } catch (Exception e) {
            logger.error("OTP validation failed for post: {}, user: {}", post.getId(), user.getEmail(), e);
            throw new OTPException("OTP validation failed", e);
        }
    }

    private String generateRandomCode() {
        int maxValue = (int) Math.pow(10, OTP_LENGTH) - 1;
        return String.format("%0" + OTP_LENGTH + "d", new Random().nextInt(maxValue));
    }

    private void sendOTPEmail(OTP otp) throws OTPException {
        try {
            String subject = "SecureMyDocs OTP Verification";
            String body = "Your OTP for SecureMyDocs is: " + otp.getCode() +
                    "\nThis OTP will expire in " + OTP_EXPIRE_MINUTES + " minutes.";

            logger.info("Sending OTP email to {}", otp.getEmail());

            emailService.sendSimpleEmail(otp.getEmail(), subject, body);

            logger.info("Email sent successfully to: {}", otp.getEmail());
        } catch (Exception e) {
            logger.error("Email send failed to: {}", otp.getEmail(), e);
            throw new OTPException("Failed to send email to: " + otp.getEmail(), e);
        }
    }
}
