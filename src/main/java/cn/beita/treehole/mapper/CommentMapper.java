package cn.beita.treehole.mapper;
import cn.beita.treehole.model.Comment;
import org.apache.ibatis.annotations.*;
import java.util.List;
@Mapper public interface CommentMapper {
 @Insert("INSERT INTO comment(post_id,user_id,parent_id,content) VALUES(#{postId},#{userId},#{parentId},#{content})") @Options(useGeneratedKeys=true,keyProperty="id") int insert(Comment c);
 @Select("SELECT c.*,u.nickname,u.avatar_url FROM comment c JOIN user_account u ON u.id=c.user_id WHERE c.post_id=#{postId} AND c.deleted=0 ORDER BY c.created_at ASC") List<Comment> findByPost(Long postId);
 @Update("UPDATE comment SET deleted=1 WHERE id=#{id} AND user_id=#{userId} AND deleted=0") int delete(@Param("id")Long id,@Param("userId")Long userId);
}
