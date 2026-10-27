package cn.beita.treehole.service;
import cn.beita.treehole.common.BusinessException;
import cn.beita.treehole.dto.CreatePostRequest;
import cn.beita.treehole.mapper.BoardMapper;
import cn.beita.treehole.mapper.PostMapper;
import cn.beita.treehole.model.Board;
import cn.beita.treehole.model.Post;
import cn.beita.treehole.model.UserAccount;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
@Service public class PostService {
    private final PostMapper postMapper; private final BoardMapper boardMapper; private final ObjectMapper objectMapper;
    public PostService(PostMapper p,BoardMapper b,ObjectMapper o){postMapper=p;boardMapper=b;objectMapper=o;}
    public Post create(CreatePostRequest req, UserAccount user){
        Board board=boardMapper.findByCode(req.getBoardCode()); if(board==null) throw new BusinessException(404,"板块不存在");
        Post post=new Post(); post.setUserId(user.getId()); post.setBoardId(board.getId()); post.setTitle(req.getTitle()); post.setContent(req.getContent()); post.setCampus(req.getCampus()); post.setContact(req.getContact()); post.setEstimatedPrice(req.getEstimatedPrice());
        try { post.setImages(objectMapper.writeValueAsString(req.getImages()==null? Collections.emptyList():req.getImages())); } catch(JsonProcessingException e){throw new BusinessException(400,"图片地址不正确");}
        postMapper.insert(post); return postMapper.findById(post.getId());
    }
    public List<Post> list(String board,String group,String campus,String sort,int page,int size){ return postMapper.findPage(board,group,campus,"hot".equals(sort)?"hot":"new",(page-1)*size,size); }
    public Post detail(Long id,boolean view){ if(view) postMapper.incrementView(id); Post p=postMapper.findById(id); if(p==null) throw new BusinessException(404,"帖子不存在"); return p; }
    public void delete(Long id,UserAccount user){ if(postMapper.softDelete(id,user.getId())==0) throw new BusinessException(403,"只能删除自己的帖子"); }
}
