package cn.beita.treehole.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserAccount {
    private Long id;
    private String openid;
    private String nickname;
    private String avatarUrl;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
