package cn.beita.treehole.service;

import cn.beita.treehole.common.BusinessException;
import cn.beita.treehole.dto.LoginResult;
import cn.beita.treehole.dto.WxLoginRequest;
import cn.beita.treehole.mapper.AuthMapper;
import cn.beita.treehole.mapper.UserMapper;
import cn.beita.treehole.model.UserAccount;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {
    private final UserMapper userMapper;
    private final AuthMapper authMapper;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${wechat.app-id:}") private String appId;
    @Value("${wechat.app-secret:}") private String appSecret;
    @Value("${wechat.dev-login-enabled:false}") private boolean devLoginEnabled;

    public AuthService(UserMapper userMapper, AuthMapper authMapper, ObjectMapper objectMapper) {
        this.userMapper=userMapper; this.authMapper=authMapper; this.objectMapper=objectMapper;
    }

    public LoginResult login(WxLoginRequest request) {
        String openid = devLoginEnabled && request.getCode().startsWith("dev-")
                ? "openid-" + request.getCode() : exchangeCode(request.getCode());
        UserAccount user = userMapper.findByOpenid(openid);
        if (user == null) {
            user = new UserAccount(); user.setOpenid(openid);
            user.setNickname(emptyToDefault(request.getNickname(), "匿名用户"));
            user.setAvatarUrl(request.getAvatarUrl()); userMapper.insert(user);
        }
        String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        authMapper.insertToken(user.getId(), token, LocalDateTime.now().plusDays(30));
        return new LoginResult(token, user);
    }

    private String exchangeCode(String code) {
        if (appId.isEmpty() || appSecret.isEmpty()) throw new BusinessException(503, "微信登录尚未配置");
        String url = UriComponentsBuilder.fromHttpUrl("https://api.weixin.qq.com/sns/jscode2session")
                .queryParam("appid", appId).queryParam("secret", appSecret).queryParam("js_code", code)
                .queryParam("grant_type", "authorization_code").toUriString();
        try {
            JsonNode json = objectMapper.readTree(restTemplate.getForObject(url, String.class));
            if (!json.hasNonNull("openid")) throw new BusinessException(401, "微信登录失败");
            return json.get("openid").asText();
        } catch (BusinessException e) { throw e; }
        catch (Exception e) { throw new BusinessException(502, "暂时无法连接微信登录服务"); }
    }
    private String emptyToDefault(String text, String value) { return text == null || text.trim().isEmpty() ? value : text.trim(); }
}
