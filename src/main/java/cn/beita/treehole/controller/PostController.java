package cn.beita.treehole.controller;
import cn.beita.treehole.common.ApiResponse;
import cn.beita.treehole.config.AuthInterceptor;
import cn.beita.treehole.dto.CreatePostRequest;
import cn.beita.treehole.model.Post;
import cn.beita.treehole.model.UserAccount;
import cn.beita.treehole.service.PostService;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
@RestController @RequestMapping("/api/posts") public class PostController {
    private final PostService service; public PostController(PostService s){service=s;}
    @GetMapping public ApiResponse<List<Post>> list(@RequestParam(required=false) String board,@RequestParam(required=false) String group,@RequestParam(required=false) String campus,@RequestParam(defaultValue="new") String sort,@RequestParam(defaultValue="1") int page,@RequestParam(defaultValue="20") int pageSize){
        page=Math.max(1,page); pageSize=Math.min(50,Math.max(1,pageSize)); return ApiResponse.ok(service.list(board,group,campus,sort,page,pageSize));
    }
    @GetMapping("/{id}") public ApiResponse<Post> detail(@PathVariable Long id){return ApiResponse.ok(service.detail(id,true));}
    @PostMapping public ApiResponse<Post> create(@Valid @RequestBody CreatePostRequest body,HttpServletRequest request){return ApiResponse.ok(service.create(body,user(request)));}
    @DeleteMapping("/{id}") public ApiResponse<Void> delete(@PathVariable Long id,HttpServletRequest request){service.delete(id,user(request));return ApiResponse.ok(null);}
    private UserAccount user(HttpServletRequest r){return (UserAccount)r.getAttribute(AuthInterceptor.CURRENT_USER);}
}
