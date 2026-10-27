package cn.beita.treehole.dto;

import cn.beita.treehole.model.UserAccount;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResult {
    private String token;
    private UserAccount user;
}
