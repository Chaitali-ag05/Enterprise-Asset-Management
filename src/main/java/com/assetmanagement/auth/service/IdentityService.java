package com.assetmanagement.auth.service;

import org.springframework.security.access.AccessDeniedException;
import com.assetmanagement.common.exception.ResourceNotFoundException;
import com.assetmanagement.employee.entity.Employee.Employee;
import com.assetmanagement.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import com.assetmanagement.auth.entity.User;
import com.assetmanagement.auth.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class IdentityService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public Employee getCurrentEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("User is not authenticated.");
        }
        String principalName = auth.getName();
        
        // Find User to get their actual email
        User user = userRepository.findByUsernameOrEmail(principalName, principalName)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principalName));

        return employeeRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No employee profile found for email: " + user.getEmail()));
    }
    
    public boolean hasAnyRole(String... roles) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        for (String role : roles) {
            for (GrantedAuthority authority : auth.getAuthorities()) {
                if (authority.getAuthority().equals("ROLE_" + role) || authority.getAuthority().equals(role)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    public void verifyEmployeeMatch(Long targetEmployeeId) {
        if (hasAnyRole("ADMIN", "MANAGER")) {
            return;
        }
        Employee current = getCurrentEmployee();
        if (!current.getId().equals(targetEmployeeId)) {
            throw new AccessDeniedException("Access denied. You can only operate on your own resources.");
        }
    }
    
    public void verifyTechnicianMatch(Long targetTechnicianId) {
        if (hasAnyRole("ADMIN", "MANAGER")) {
            return;
        }
        Employee current = getCurrentEmployee();
        if (!current.getId().equals(targetTechnicianId)) {
            throw new AccessDeniedException("Access denied. Work order assigned to another technician.");
        }
    }
}

