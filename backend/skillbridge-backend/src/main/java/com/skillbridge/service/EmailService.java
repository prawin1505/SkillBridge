package com.skillbridge.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(
        String email,
        String token) {

    String resetLink =
            "http://localhost:5173/reset-password?token="
                    + token;

    SimpleMailMessage message =
            new SimpleMailMessage();

    message.setFrom("prawinkumarsn05@gmail.com");
    message.setTo(email);

    message.setSubject(
            "SkillBridge - Password Reset"
    );

    message.setText(
            "Hello,\n\n"
            + "We received a request to reset your "
            + "SkillBridge password.\n\n"
            + "Click the link below to reset your password:\n\n"
            + resetLink
            + "\n\n"
            + "This link will expire in 30 minutes.\n\n"
            + "If you did not request a password reset, "
            + "please ignore this email.\n\n"
            + "Regards,\n"
            + "SkillBridge Team"
    );

    mailSender.send(message);
}
}