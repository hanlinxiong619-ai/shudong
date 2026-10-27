package cn.beita.treehole.model;
import lombok.Data;
import java.time.LocalDateTime;
@Data public class Post {
    private Long id; private Long userId; private Long boardId; private String boardCode; private String boardName;
    private String nickname; private String avatarUrl; private String title; private String content; private String images; private String campus; private String contact; private java.math.BigDecimal estimatedPrice;
    private Integer viewCount; private Integer likeCount; private Integer commentCount; private Integer deleted;
    private LocalDateTime createdAt; private LocalDateTime updatedAt;
}
