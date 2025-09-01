package com.securemydocs.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class jwtValidator<Authentication> extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String jwt = request.getHeader(JwtConstant.JWT_HEADER);
        if (jwt != null) {
            try {
                String email = JwtProvider.getEmailFromJwtToken(jwt);
                List<GrantedAuthority> authorities = new ArrayList<>();
                String claims = JwtProvider.getEmailFromJwtToken(jwt);
                Authentication authentication = (Authentication) new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication((org.springframework.security.core.Authentication) authentication);
            } catch (Exception e) {
                throw new BadCredentialsException("invalid token........");
            }
        }
        filterChain.doFilter(request, response);
    }
}
