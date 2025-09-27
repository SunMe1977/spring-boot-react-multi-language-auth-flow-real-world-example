package com.hansjoerg.coloringbook.security;

import com.hansjoerg.coloringbook.model.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.util.StringUtils; // Import StringUtils

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional; // Import Optional

public class UserPrincipal implements OAuth2User, UserDetails {
    @Getter
    private final Long id;
    @Getter
    private final String email; // Keep as String, but ensure it's never null
    private final String password;
    @Getter
    private final Collection<? extends GrantedAuthority> authorities;
    @Setter
    private Map<String, Object> attributes;

    public UserPrincipal(Long id, String email, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = Optional.ofNullable(email).orElse(""); // Ensure email is never null, use empty string instead
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = Collections.
                singletonList(new SimpleGrantedAuthority("ROLE_USER"));

        return new UserPrincipal(
                user.getId(),
                user.getEmail(), // This email can be null from the User object
                user.getPassword(),
                authorities
        );
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        userPrincipal.setAttributes(attributes);
        return userPrincipal;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // Fallback to ID if email is empty (it's already guaranteed not to be null by constructor)
        return StringUtils.hasText(email) ? email : String.valueOf(id);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        // This is used by OAuth2User.getName(). It should be a unique identifier.
        // If email is available, use it. Otherwise, fall back to ID.
        // Email is guaranteed not to be null by constructor, so StringUtils.hasText is sufficient.
        return StringUtils.hasText(email) ? email : String.valueOf(id);
    }
}
