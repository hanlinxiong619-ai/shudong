package cn.beita.treehole.controller;

import cn.beita.treehole.common.ApiResponse;
import cn.beita.treehole.dto.LoginResult;
import cn.beita.treehole.dto.WxLoginRequest;
import cn.beita.treehole.service.AuthService;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService service;
    public AuthController(AuthService service) { this.service=service; }
    @PostMapping("/wx-login") public ApiResponse<LoginResult> login(@Valid @RequestBody WxLoginRequest request) {
        return ApiResponse.ok(service.login(request));
    }
}
