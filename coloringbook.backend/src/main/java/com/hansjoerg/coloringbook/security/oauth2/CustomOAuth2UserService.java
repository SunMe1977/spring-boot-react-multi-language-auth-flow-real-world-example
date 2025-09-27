package com.hansjoerg.coloringbook.security.oauth2;

import com.hansjoerg.coloringbook.exception.OAuth2AuthenticationProcessingException;
import com.hansjoerg.coloringbook.model.AuthProvider;
import com.hansjoerg.coloringbook.model.User;
import com.hansjoerg.coloringbook.repository.UserRepository;
import com.hansjoerg.coloringbook.security.UserPrincipal;
import com.hansjoerg.coloringbook.security.oauth2.user.GithubOAuth2UserInfo;
import com.hansjoerg.coloringbook.security.oauth2.user.OAuth2UserInfo;
import com.hansjoerg.coloringbook.security.oauth2.user.OAuth2UserInfoFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.dao.DataAccessException;
import org.springframework.http.*;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageSource messageSource;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        }
        catch (DataAccessException ex) {
            throw new InternalAuthenticationServiceException("DB error: " + ex.getMessage(), ex);
        }catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            String errorMessage = messageSource.getMessage("error.oauth2.generic", new Object[]{ex.getMessage()}, LocaleContextHolder.getLocale());
            throw new InternalAuthenticationServiceException(errorMessage, ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String email = oAuth2UserInfo.getEmail();
        String name = oAuth2UserInfo.getName(); // Get initial name

        // GitHub fallback email and name logic
        if ("github".equalsIgnoreCase(registrationId)) {
            // 1. Try to fetch primary email from GitHub API
            if (!StringUtils.hasText(email)) {
                String fetchedEmail = fetchPrimaryEmail(oAuth2UserRequest.getAccessToken().getTokenValue());
                if (StringUtils.hasText(fetchedEmail)) {
                    email = fetchedEmail;
                }
            }

            // 2. If email is still not present, generate a default one
            if (!StringUtils.hasText(email)) {
                String login = (String) oAuth2User.getAttributes().get("login");
                if (StringUtils.hasText(login)) {
                    email = login + "@users.noreply.github.com";
                } else {
                    // Fallback if login is also missing, though highly unlikely for GitHub
                    email = "github-user-" + oAuth2UserInfo.getId() + "@users.noreply.github.com";
                }
            }

            // 3. If name is not present, use login as name
            if (!StringUtils.hasText(name)) {
                String login = (String) oAuth2User.getAttributes().get("login");
                if (StringUtils.hasText(login)) {
                    name = login;
                } else {
                    name = "GitHubUser"; // Fallback if login is also missing
                }
            }

            // Recreate OAuth2UserInfo with potentially updated email and name
            Map<String, Object> updatedAttributes = new HashMap<>(oAuth2User.getAttributes());
            updatedAttributes.put("email", email);
            updatedAttributes.put("name", name);
            oAuth2UserInfo = new GithubOAuth2UserInfo(updatedAttributes);
        }

        // Now, `email` is guaranteed to be non-null and non-empty for GitHub users.
        // For other providers, it will be whatever they provided (which might still be null/empty if they don't provide one).
        Optional<User> userOptional = userRepository.findByEmail(email); // This will return empty if email is null/empty for non-GitHub providers

        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (!user.getProvider().equals(AuthProvider.valueOf(registrationId))) {
                throw new OAuth2AuthenticationProcessingException("error.oauth2.providerMismatch", user.getProvider().toString());
            }
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            // If userOptional is empty (either because email was not found, or email was null/empty for non-GitHub providers)
            user = registerNewUser(oAuth2UserRequest, oAuth2UserInfo, email);
        }

        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private String fetchPrimaryEmail(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                for (Map<String, Object> emailEntry : response.getBody()) {
                    Boolean primary = (Boolean) emailEntry.get("primary");
                    Boolean verified = (Boolean) emailEntry.get("verified");
                    String email = (String) emailEntry.get("email");

                    if (Boolean.TRUE.equals(primary) && Boolean.TRUE.equals(verified) && StringUtils.hasText(email)) {
                        return email;
                    }
                }
            } else {
                System.out.println("⚠️ GitHub /user/emails returned non-200: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            System.out.println("❌ Failed to fetch email: " + ex.getMessage());
        }

        return null;
    }


    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo, String email) {
        User user = new User();
        user.setProvider(AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId()));
        user.setProviderId(oAuth2UserInfo.getId());
        user.setName(oAuth2UserInfo.getName());
        user.setEmail(email); // Use the potentially null email
        user.setImageUrl(oAuth2UserInfo.getImageUrl());
        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        existingUser.setName(oAuth2UserInfo.getName());
        existingUser.setImageUrl(oAuth2UserInfo.getImageUrl());
        // Only update email if the OAuth2 provider actually provided one and it's different
        if (StringUtils.hasText(oAuth2UserInfo.getEmail()) && !oAuth2UserInfo.getEmail().equals(existingUser.getEmail())) {
            existingUser.setEmail(oAuth2UserInfo.getEmail());
        }
        return userRepository.save(existingUser);
    }
}
