package aivle0514.backspringboot.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // 추가-jks : 보안 무시 목록
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring()
                .requestMatchers("/public/**", "/favicon.ico", "/assets/**", "/error");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(c -> c.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())

        .exceptionHandling(e -> e
            .authenticationEntryPoint((req, res, ex) -> {
                res.setStatus(401);      // ★ 미인증은 401
                res.setContentType("application/json;charset=UTF-8");
                res.getWriter().write("{\"error\":\"unauthorized\"}");
            })
        )

        .formLogin(form -> form
            .loginProcessingUrl("/api/user/login")
            .usernameParameter("email")
            .passwordParameter("password")
            .successHandler((req, res, auth) -> {
                res.setStatus(200);
                res.setContentType("application/json;charset=UTF-8");
                res.getWriter().write("{\"message\":\"로그인 성공\"}");
            })
            .failureHandler((req, res, ex) -> {
                res.setStatus(401);
                res.setContentType("application/json;charset=UTF-8");
                res.getWriter().write("{\"error\":\"이메일 또는 비밀번호가 올바르지 않습니다.\"}");
            })
        )

        .logout(l -> l
            .logoutUrl("/api/user/logout")
            .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
        )

        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/user/signup", "/api/user/login", "/api/user/reset-password").permitAll()
            .requestMatchers("/api/upload/cat-image").permitAll() // 추가-jks : 이미지 업로드 API와 정적리소스는 인증없이 허용(고양이프로필사진)
            .requestMatchers("/api/events/**").authenticated() // /api/events/ 로 시작하는 모든 경로는 인증된 사용자만 허용
            .requestMatchers("/api/user/**").authenticated()
            .anyRequest().authenticated()
        );

    return http.build();
}
    // CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // configuration.setAllowedOrigins(Arrays.asList("https://5174-sjleecatthe-wantedcat-7dxfzhg0f8g.ws-us121.gitpod.io"));
        configuration.setAllowedOriginPatterns(List.of("http://*", "https://*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}