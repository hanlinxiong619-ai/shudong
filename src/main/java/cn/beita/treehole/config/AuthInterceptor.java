package cn.beita.treehole.config;

import cn.beita.treehole.mapper.AuthMapper;
import cn.beita.treehole.model.UserAccount;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    public static final String CURRENT_USER = "currentUser";
    private final AuthMapper authMapper;
    public AuthInterceptor(AuthMapper authMapper) { this.authMapper=authMapper; }
    @Override public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri=request.getRequestURI();
        if ("GET".equalsIgnoreCase(request.getMethod()) && (uri.equals("/api/boards") || uri.equals("/api/search") || uri.startsWith("/api/posts"))) return true;
        String value=request.getHeader("Authorization");
        String token=value != null && value.startsWith("Bearer ") ? value.substring(7) : null;
        UserAccount user=token == null ? null : authMapper.findUserByToken(token);
        if (user != null) { request.setAttribute(CURRENT_USER,user); return true; }
        response.setStatus(401); response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":401,\"message\":\"请先登录\",\"data\":null}"); return false;
    }
}
