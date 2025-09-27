package com.hansjoerg.coloringbook.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant; // Import Instant
import java.util.Optional; // Import Optional

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})

@Data // Provides getters, setters, equals, hashCode, toString
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String name;

    @Column(nullable = true) // Explicitly set to nullable
    private String email;

    private String imageUrl;

    @Column(nullable = false)
    private Boolean emailVerified = false;

    @JsonIgnore
    @Column(nullable = true)
    private String password;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    @Column(name = "reset_token", unique = true)
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private Instant resetTokenExpiry;

    // Custom getter for email to ensure it's never null when accessed
    public String getEmail() {
        return Optional.ofNullable(this.email).orElse("");
    }

    // Lombok will generate the default setter, which is fine.
    // If you need to explicitly set null, you can still do user.setEmail(null);
    // The custom getter ensures that when you *read* it, it's never null.
}
