package cn.beita.treehole.model;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class Comment { private Long id,postId,userId,parentId; private String content,nickname,avatarUrl; private Integer deleted; private LocalDateTime createdAt; }
