package com.omnicharge.authservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthUserDTO {
    private Long userId;
    private String name;
    private String email;
    private String contactNo;
    private String role;
}
