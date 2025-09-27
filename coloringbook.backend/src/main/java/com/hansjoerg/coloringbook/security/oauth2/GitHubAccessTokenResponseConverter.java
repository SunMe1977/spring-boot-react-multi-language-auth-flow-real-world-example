package com.hansjoerg.coloringbook.security.oauth2;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.OAuth2AccessToken;

import java.util.*;

public class GitHubAccessTokenResponseConverter implements Converter<Map<String, Object>, OAuth2AccessTokenResponse> {
    @Override
    public OAuth2AccessTokenResponse convert(Map<String, Object> tokenResponseParameters) {
        String accessToken = (String) tokenResponseParameters.get("access_token");
        String tokenType = (String) tokenResponseParameters.get("token_type");
        String scope = (String) tokenResponseParameters.getOrDefault("scope", "");
        Set<String> scopes = scope == null || scope.isEmpty()
                ? Collections.emptySet()
                : new HashSet<>(Arrays.asList(scope.split(" ")));

        if (accessToken == null || tokenType == null) {
            System.out.println("❌ Missing required fields: access_token or token_type");
            return null; // triggers the error you're seeing
        }

        OAuth2AccessTokenResponse response = OAuth2AccessTokenResponse.withToken(accessToken)
                .tokenType(OAuth2AccessToken.TokenType.BEARER)
                .scopes(scopes)
                .build();

          return response;
    }
}


