package com.assetmanagement.vendor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VendorRequest(

        @NotBlank(message = "Vendor name is required.")
        @Size(max = 150, message = "Vendor name cannot exceed 150 characters.")
        String name,

        @Size(max = 100, message = "Contact person cannot exceed 100 characters.")
        String contactPerson,

        @Email(message = "Invalid email format.")
        String email,

        @Size(max = 20, message = "Phone cannot exceed 20 characters.")
        String phone,

        @Size(max = 500, message = "Address cannot exceed 500 characters.")
        String address

) {}
