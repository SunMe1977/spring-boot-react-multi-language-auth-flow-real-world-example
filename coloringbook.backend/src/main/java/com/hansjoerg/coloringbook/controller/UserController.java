package com.hansjoerg.coloringbook.controller;

import com.hansjoerg.coloringbook.config.AppProperties;
import com.hansjoerg.coloringbook.exception.BadRequestException;
import com.hansjoerg.coloringbook.exception.ResourceNotFoundException;
import com.hansjoerg.coloringbook.model.User;
import com.hansjoerg.coloringbook.payload.ApiResponseDTO;
import com.hansjoerg.coloringbook.payload.UpdateUserRequestDTO;
import com.hansjoerg.coloringbook.repository.UserRepository;
import com.hansjoerg.coloringbook.security.CurrentUser;
import com.hansjoerg.coloringbook.security.UserPrincipal;
import com.hansjoerg.coloringbook.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AppProperties appProperties;

    @GetMapping("/user/me")
    @PreAuthorize("hasRole('USER')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "error.resourceNotFound", // Message key
                        new Object[]{"User", "id", userPrincipal.getId()}, // Arguments for the message
                        "User", // Resource name (for backward compatibility/context)
                        "id", // Field name (for backward compatibility/context)
                        userPrincipal.getId() // Field value (for backward compatibility/context)
                ));
    }

    @PutMapping("/user/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateCurrentUser(@CurrentUser UserPrincipal userPrincipal,
                                               @Valid @RequestBody UpdateUserRequestDTO updateUserRequest) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "error.resourceNotFound",
                        new Object[]{"User", "id", userPrincipal.getId()},
                        "User", "id", userPrincipal.getId()
                ));

        // Check if the new email is already taken by another user
        if (!user.getEmail().equalsIgnoreCase(updateUserRequest.getEmail()) && userRepository.existsByEmail(updateUserRequest.getEmail())) {
            throw new BadRequestException("error.emailAlreadyInUse");
        }

        // If email is changed, mark as unverified
        if (!user.getEmail().equalsIgnoreCase(updateUserRequest.getEmail())) {
            user.setEmailVerified(false);
        }

        user.setName(updateUserRequest.getName());
        user.setEmail(updateUserRequest.getEmail());

        User updatedUser = userRepository.save(user);

        String successMessage = messageSource.getMessage("user.update.success", null, LocaleContextHolder.getLocale());
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/user/verify-email/request")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> requestEmailVerification(@CurrentUser UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "error.resourceNotFound",
                        new Object[]{"User", "id", userPrincipal.getId()},
                        "User", "id", userPrincipal.getId()
                ));

        Locale currentLocale = LocaleContextHolder.getLocale(); // Get current locale

        if (user.getEmailVerified()) {
            String errorMessage = messageSource.getMessage("email.verification.alreadyVerified", null, currentLocale);
            throw new BadRequestException(errorMessage);
        }

        if (!user.getEmail().isEmpty()) { // Only send if email exists
            String verificationToken = UUID.randomUUID().toString();
            Instant expiryDate = Instant.now().plus(appProperties.getEmailVerification().getTokenExpirationMinutes(), ChronoUnit.MINUTES);

            user.setResetToken(verificationToken); // Reusing resetToken field for verification
            user.setResetTokenExpiry(expiryDate);
            userRepository.save(user);

            String verificationLink = appProperties.getFrontend().getBaseUrl() + "/verify-email?token=" + verificationToken;
            emailService.sendEmailVerificationEmail(user.getEmail(), verificationLink, currentLocale); // Pass locale

            String successMessage = messageSource.getMessage("email.verification.sent", null, currentLocale);
            return ResponseEntity.ok(new ApiResponseDTO(true, successMessage));
        } else {
            String errorMessage = messageSource.getMessage("email.verification.noEmail", null, currentLocale);
            throw new BadRequestException(errorMessage);
        }
    }

    @GetMapping("/user/verify-email/confirm")
    public ResponseEntity<?> confirmEmailVerification(@RequestParam("token") String token) {
        Locale currentLocale = LocaleContextHolder.getLocale(); // Get current locale

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("email.verification.invalidToken"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(Instant.now())) {
            // Clear the expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new BadRequestException("email.verification.expiredToken");
        }

        user.setEmailVerified(true);
        user.setResetToken(null); // Clear token after use
        user.setResetTokenExpiry(null); // Clear expiry after use
        userRepository.save(user);

        String successMessage = messageSource.getMessage("email.verification.success", null, currentLocale);
        return ResponseEntity.ok(new ApiResponseDTO(true, successMessage));
    }
}
