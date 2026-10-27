package cn.beita.treehole.service;
import cn.beita.treehole.common.BusinessException; import cn.beita.treehole.dto.CreateCommentRequest; import cn.beita.treehole.mapper.*; import cn.beita.treehole.model.*; import org.springframework.stereotype.Service; import java.util.*;
@Service public class InteractionService {
 private final PostMapper posts; private final CommentMapper comments;
 public InteractionService(PostMapper p,CommentMapper c){posts=p;comments=c;}
 public void like(Long id,UserAccount u){if(posts.liked(id,u.getId())>0) throw new BusinessException(409,"已经点过赞"); if(posts.addLike(id,u.getId())>0) posts.incrementLike(id);}
 public void unlike(Long id,UserAccount u){if(posts.removeLike(id,u.getId())>0) posts.decrementLike(id);}
 public List<Comment> comments(Long id){return comments.findByPost(id);}
 public Comment comment(Long id,CreateCommentRequest r,UserAccount u){Comment c=new Comment();c.setPostId(id);c.setUserId(u.getId());c.setParentId(r.getParentId());c.setContent(r.getContent());comments.insert(c);return c;}
 public void deleteComment(Long id,UserAccount u){if(comments.delete(id,u.getId())==0) throw new BusinessException(403,"只能删除自己的评论");}
}
