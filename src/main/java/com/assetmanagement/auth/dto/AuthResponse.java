package com.assetmanagement.auth.dto;

import com.assetmanagement.auth.entity.Role;

public record AuthResponse(
        String token,
        String tokenType,
        String username,
        String email,
        Role role
) {
    public AuthResponse(String token, String username, String email, Role role) {
        this(token, "Bearer", username, email, role);
    }
}
