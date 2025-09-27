package com.hansjoerg.coloringbook.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hansjoerg.coloringbook.payload.AuthResponseDTO;
import com.hansjoerg.coloringbook.security.*;
import com.hansjoerg.coloringbook.security.filter.JsonUsernamePasswordAuthenticationFilter;
import com.hansjoerg.coloringbook.security.filter.RateLimitingFilter;
import com.hansjoerg.coloringbook.security.handler.JsonAuthenticationFailureHandler;
import com.hansjoerg.coloringbook.security.oauth2.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.endpoint.DefaultAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.hansjoerg.coloringbook.security.oauth2.CustomAuthorizationRequestRepository;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;

import java.util.*;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    @Autowired
    private CustomAuthorizationRequestRepository httpSessionOAuth2AuthorizationRequestRepository;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    private final AppProperties appProperties;
    private final CustomUserDetailsService customUserDetailsService;

    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
      private final TokenProvider tokenProvider;
    private final JsonAuthenticationFailureHandler jsonAuthenticationFailureHandler;
    private final MessageSource messageSource;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SecurityConfig(AppProperties appProperties,
                          CustomUserDetailsService customUserDetailsService,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler,
                          OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler,
                              TokenProvider tokenProvider,
                          JsonAuthenticationFailureHandler jsonAuthenticationFailureHandler,
                          MessageSource messageSource) {
        this.appProperties = appProperties;
        this.customUserDetailsService = customUserDetailsService;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
        this.oAuth2AuthenticationFailureHandler = oAuth2AuthenticationFailureHandler;
        this.tokenProvider = tokenProvider;
        this.jsonAuthenticationFailureHandler = jsonAuthenticationFailureHandler;
        this.messageSource = messageSource;

        System.out.println("🛡️ SecurityConfig constructor called");
    }

    @Bean
    @Order(0)
    public AuthenticationManager swaggerAuthenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(users());
        provider.setPasswordEncoder(swaggerPasswordEncoder());
        return new ProviderManager(provider);
    }

    @Bean
    @Order(1)
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public TokenAuthenticationFilter tokenAuthenticationFilter() {
        return new TokenAuthenticationFilter(tokenProvider, customUserDetailsService);
    }

    @Bean
    public JsonUsernamePasswordAuthenticationFilter jsonUsernamePasswordAuthenticationFilter(
            AuthenticationManager authenticationManager,
            JsonAuthenticationFailureHandler jsonAuthenticationFailureHandler,
            TokenProvider tokenProvider) {
        JsonUsernamePasswordAuthenticationFilter filter = new JsonUsernamePasswordAuthenticationFilter();
        filter.setAuthenticationManager(authenticationManager);
        filter.setFilterProcessesUrl("/auth/login");
        filter.setAuthenticationSuccessHandler((request, response, authentication) -> {
            String token = tokenProvider.createToken(authentication);
            AuthResponseDTO authResponseDTO = new AuthResponseDTO(token);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(authResponseDTO));
            response.getWriter().flush();
        });
        filter.setAuthenticationFailureHandler(jsonAuthenticationFailureHandler);
        return filter;
    }

    @Bean
    public RateLimitingFilter rateLimitingFilter() {
        return new RateLimitingFilter(appProperties, messageSource);
    }

    @Bean
    @Order(1)
    public SecurityFilterChain swaggerSecurity(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                .authenticationManager(swaggerAuthenticationManager())
                .authorizeHttpRequests(auth -> auth.anyRequest().hasRole("SWAGGER"))
                .httpBasic(withDefaults())
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of(appProperties.getFrontend().getBaseUrl()));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true); // ✅ critical
                    config.setExposedHeaders(List.of("Authorization", "Set-Cookie")); // ✅ optional
                    return config;
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new RestAuthenticationEntryPoint(messageSource)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/oauth2/**", "/").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .tokenEndpoint(token -> token
                                .accessTokenResponseClient(accessTokenResponseClient()) // ✅ inject your bean here
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                        .failureHandler(oAuth2AuthenticationFailureHandler)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jsonUsernamePasswordAuthenticationFilter(authenticationManager, jsonAuthenticationFailureHandler, tokenProvider), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(tokenAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitingFilter(), JsonUsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService users() {
        String password = appProperties.getSwagger().getPassword();
        return new InMemoryUserDetailsManager(
                User.withUsername("swagger")
                        .password("{noop}" + password)
                        .roles("SWAGGER")
                        .build()
        );
    }

    @Bean
    public PasswordEncoder swaggerPasswordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient() {
        DefaultAuthorizationCodeTokenResponseClient client = new DefaultAuthorizationCodeTokenResponseClient();

        OAuth2AccessTokenResponseHttpMessageConverter converter = new OAuth2AccessTokenResponseHttpMessageConverter();
        converter.setAccessTokenResponseConverter(new GitHubAccessTokenResponseConverter());

        RestTemplate restTemplate = new RestTemplate(Arrays.asList(
                new FormHttpMessageConverter(),
                converter // ✅ use the patched converter here
        ));
        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());

        client.setRestOperations(restTemplate); // ✅ inject the RestTemplate into the client
        return client;
    }



}
