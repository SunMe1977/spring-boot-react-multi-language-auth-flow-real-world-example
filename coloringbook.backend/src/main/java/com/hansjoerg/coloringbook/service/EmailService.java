package com.hansjoerg.coloringbook.service;

import com.hansjoerg.coloringbook.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;
    private final MessageSource messageSource; // Inject MessageSource

    @Autowired
    public EmailService(JavaMailSender mailSender, AppProperties appProperties, MessageSource messageSource) {
        this.mailSender = mailSender;
        this.appProperties = appProperties;
        this.messageSource = messageSource;
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink, Locale locale) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(appProperties.getPasswordReset().getFromEmail());
            message.setTo(toEmail);

            String subject = messageSource.getMessage("email.passwordReset.subject", null, locale);
            String body = messageSource.getMessage(
                    "email.passwordReset.body",
                    new Object[]{resetLink, appProperties.getPasswordReset().getTokenExpirationMinutes()},
                    locale
            );

            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Password reset email sent successfully to {} with locale {}", toEmail, locale);
        } catch (MailException e) {
            logger.error("Failed to send password reset email to {} with locale {}: {}", toEmail, locale, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendEmailVerificationEmail(String toEmail, String verificationLink, Locale locale) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(appProperties.getEmailVerification().getFromEmail());
            message.setTo(toEmail);

            String subject = messageSource.getMessage("email.verification.subject", null, locale);
            String body = messageSource.getMessage(
                    "email.verification.body",
                    new Object[]{verificationLink, appProperties.getEmailVerification().getTokenExpirationMinutes()},
                    locale
            );

            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Email verification email sent successfully to {} with locale {}", toEmail, locale);
        } catch (MailException e) {
            logger.error("Failed to send email verification email to {} with locale {}: {}", toEmail, locale, e.getMessage());
            throw new RuntimeException("Failed to send email verification email", e);
        }
    }
}
