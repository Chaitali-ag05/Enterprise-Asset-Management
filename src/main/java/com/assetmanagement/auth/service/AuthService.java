package com.assetmanagement.auth.service;

import com.assetmanagement.auth.dto.AuthResponse;
import com.assetmanagement.auth.dto.LoginRequest;
import com.assetmanagement.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
