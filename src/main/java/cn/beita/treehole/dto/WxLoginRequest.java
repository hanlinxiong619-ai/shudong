package cn.beita.treehole.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class WxLoginRequest {
    @NotBlank private String code;
    private String nickname;
    private String avatarUrl;
}
