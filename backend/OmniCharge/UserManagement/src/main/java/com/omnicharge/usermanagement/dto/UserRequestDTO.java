package com.omnicharge.usermanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserRequestDTO {

    @NotBlank(message = "name feild is required!")
    @Size(max=50)
    @Pattern(regexp = "^[A-Za-z]+(?:[ '-][A-Za-z]+)*$", message = "Name must contain letters only")
    private String name;

    @NotBlank(message = "email feild is required!")
    @Email(message = "Invalid email!")
    private String email;

    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number")
    private String contactNo;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,20}$",
            message = "Password must be 8-20 chars with uppercase, lowercase, number & special character"
    )
    private String password;


}
