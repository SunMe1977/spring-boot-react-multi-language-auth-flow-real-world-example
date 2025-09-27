package com.hansjoerg.coloringbook.payload;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class UpdateUserRequestDTO {
    @NotBlank(message = "{validation.user.name.notBlank}")
    @Size(min = 2, max = 50, message = "{validation.user.name.size}")
    private String name;

    @NotBlank(message = "{validation.user.email.notBlank}")
    @Email(message = "{validation.user.email.invalid}")
    @Size(max = 100, message = "{validation.user.email.size}")
    private String email;
}
