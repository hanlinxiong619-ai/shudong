package cn.beita.treehole.controller;
import cn.beita.treehole.common.ApiResponse; import cn.beita.treehole.config.AuthInterceptor; import cn.beita.treehole.dto.CreateCommentRequest; import cn.beita.treehole.model.*; import cn.beita.treehole.service.InteractionService; import org.springframework.web.bind.annotation.*; import javax.servlet.http.HttpServletRequest; import javax.validation.Valid; import java.util.List;
@RestController @RequestMapping("/api") public class InteractionController {
 private final InteractionService service; public InteractionController(InteractionService s){service=s;}
 @PostMapping("/posts/{id}/like") public ApiResponse<Void> like(@PathVariable Long id,HttpServletRequest r){service.like(id,user(r));return ApiResponse.ok(null);}
 @DeleteMapping("/posts/{id}/like") public ApiResponse<Void> unlike(@PathVariable Long id,HttpServletRequest r){service.unlike(id,user(r));return ApiResponse.ok(null);}
 @GetMapping("/posts/{id}/comments") public ApiResponse<List<Comment>> comments(@PathVariable Long id){return ApiResponse.ok(service.comments(id));}
 @PostMapping("/posts/{id}/comments") public ApiResponse<Comment> comment(@PathVariable Long id,@Valid @RequestBody CreateCommentRequest body,HttpServletRequest r){return ApiResponse.ok(service.comment(id,body,user(r)));}
 @DeleteMapping("/comments/{id}") public ApiResponse<Void> deleteComment(@PathVariable Long id,HttpServletRequest r){service.deleteComment(id,user(r));return ApiResponse.ok(null);}
 private UserAccount user(HttpServletRequest r){return (UserAccount)r.getAttribute(AuthInterceptor.CURRENT_USER);}
}
