package com.hansjoerg.coloringbook.payload;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class ResetPasswordRequestDTO {
    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 6, message = "{password.size.min}")
    private String newPassword;
}
