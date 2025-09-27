package com.hansjoerg.coloringbook.payload;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class ForgotPasswordRequestDTO {
    @NotBlank
    @Email
    private String email;
}
