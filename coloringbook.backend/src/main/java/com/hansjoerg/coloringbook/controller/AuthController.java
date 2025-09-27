package com.hansjoerg.coloringbook.controller;

import com.hansjoerg.coloringbook.config.AppProperties;
import com.hansjoerg.coloringbook.exception.BadRequestException;
import com.hansjoerg.coloringbook.model.AuthProvider;
import com.hansjoerg.coloringbook.model.User;
import com.hansjoerg.coloringbook.payload.*;
import com.hansjoerg.coloringbook.payload.ForgotPasswordRequestDTO;
import com.hansjoerg.coloringbook.payload.ResetPasswordRequestDTO;
import com.hansjoerg.coloringbook.repository.UserRepository;
import com.hansjoerg.coloringbook.security.TokenProvider;
import com.hansjoerg.coloringbook.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenProvider tokenProvider;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private EmailService emailService; // Inject EmailService

    @Autowired
    private AppProperties appProperties; // Inject AppProperties for frontend URL

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequestDTO signUpRequestDTO) {
        if (userRepository.existsByEmail(signUpRequestDTO.getEmail())) {
            throw new BadRequestException("error.emailAlreadyInUse");
        }

        // Creating user's account
        User user = new User();
        user.setName(signUpRequestDTO.getName());
        user.setEmail(signUpRequestDTO.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequestDTO.getPassword()));
        user.setProvider(AuthProvider.local);

        User result = userRepository.save(user);

        // Authenticate the newly registered user and generate a token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signUpRequestDTO.getEmail(),
                        signUpRequestDTO.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.createToken(authentication);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/user/me")
                .buildAndExpand(result.getId()).toUri();

        // Return AuthResponseDTO with the token
        return ResponseEntity.created(location)
                .body(new AuthResponseDTO(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO forgotPasswordRequest) {
        Optional<User> userOptional = userRepository.findByEmail(forgotPasswordRequest.getEmail());
        Locale currentLocale = LocaleContextHolder.getLocale(); // Get current locale

        if (userOptional.isEmpty()) {
            // For security reasons, don't reveal if the email exists or not.
            // Just return a success message as if the email was sent.
            String successMessage = messageSource.getMessage("password.reset.emailSent", null, currentLocale);
            return ResponseEntity.ok(new ApiResponseDTO(true, successMessage));
        }

        User user = userOptional.get();
        if (user.getProvider() != AuthProvider.local) {
            String errorMessage = messageSource.getMessage("password.reset.oauthUser", new Object[]{user.getProvider().toString()}, currentLocale);
            throw new BadRequestException(errorMessage);
        }

        String resetToken = UUID.randomUUID().toString();
        Instant expiryDate = Instant.now().plus(appProperties.getPasswordReset().getTokenExpirationMinutes(), ChronoUnit.MINUTES);

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);

        String resetLink = appProperties.getFrontend().getBaseUrl() + "/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink, currentLocale); // Pass locale

        String successMessage = messageSource.getMessage("password.reset.emailSent", null, currentLocale);
        return ResponseEntity.ok(new ApiResponseDTO(true, successMessage));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO resetPasswordRequest) {
        Optional<User> userOptional = userRepository.findByResetToken(resetPasswordRequest.getToken());
        Locale currentLocale = LocaleContextHolder.getLocale(); // Get current locale

        if (userOptional.isEmpty()) {
            throw new BadRequestException("password.reset.invalidToken");
        }

        User user = userOptional.get();

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(Instant.now())) {
            // Clear the expired token
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new BadRequestException("password.reset.expiredToken");
        }

        user.setPassword(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
        user.setResetToken(null); // Clear token after use
        user.setResetTokenExpiry(null); // Clear expiry after use
        userRepository.save(user);

        String successMessage = messageSource.getMessage("password.reset.success", null, currentLocale);
        return ResponseEntity.ok(new ApiResponseDTO(true, successMessage));
    }
}
