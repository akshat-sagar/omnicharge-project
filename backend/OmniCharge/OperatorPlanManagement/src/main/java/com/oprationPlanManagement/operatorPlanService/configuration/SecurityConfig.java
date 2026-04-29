
package com.oprationPlanManagement.operatorPlanService.configuration;

import com.oprationPlanManagement.operatorPlanService.filter.HeaderAuthenticationFilter;
import com.oprationPlanManagement.operatorPlanService.repository.IAppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final HeaderAuthenticationFilter filter;
    private final IAppUserRepository appUserRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                		.requestMatchers("/actuator/health", "/actuator/info", "/actuator/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> {});

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> appUserRepository.findByUsername(username)
                .map(user -> User.withUsername(user.getUsername())
                        .password(user.getPassword())
                        .authorities(user.getRole())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
