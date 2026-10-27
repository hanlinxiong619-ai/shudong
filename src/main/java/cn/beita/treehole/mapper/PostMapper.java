package cn.beita.treehole.mapper;
import cn.beita.treehole.model.Post;
import org.apache.ibatis.annotations.*;
import java.util.List;
@Mapper public interface PostMapper {
    @Insert("INSERT INTO post(user_id,board_id,title,content,images,campus,contact,estimated_price) VALUES(#{userId},#{boardId},#{title},#{content},CAST(#{images} AS JSON),#{campus},#{contact},#{estimatedPrice})")
    @Options(useGeneratedKeys=true,keyProperty="id") int insert(Post post);
    @Select("SELECT p.*,b.code board_code,b.name board_name,u.nickname,u.avatar_url FROM post p JOIN board b ON b.id=p.board_id JOIN user_account u ON u.id=p.user_id WHERE p.id=#{id} AND p.deleted=0") Post findById(Long id);
    @Select("<script>SELECT p.*,b.code board_code,b.name board_name,u.nickname,u.avatar_url FROM post p JOIN board b ON b.id=p.board_id JOIN user_account u ON u.id=p.user_id WHERE p.deleted=0 <if test='boardCode!=null and boardCode!=\"\"'>AND b.code=#{boardCode}</if> <if test='groupType!=null and groupType!=\"\"'>AND b.group_type=#{groupType}</if> <if test='campus!=null and campus!=\"\"'>AND p.campus=#{campus}</if> ORDER BY <choose><when test='sort==\"hot\"'>(p.like_count*5+p.comment_count*3+p.view_count)/(TIMESTAMPDIFF(HOUR,p.created_at,NOW())/24+1) DESC</when><otherwise>p.created_at DESC</otherwise></choose> LIMIT #{offset},#{pageSize}</script>")
    List<Post> findPage(@Param("boardCode") String boardCode,@Param("groupType") String groupType,@Param("campus") String campus,@Param("sort") String sort,@Param("offset") int offset,@Param("pageSize") int pageSize);
    @Update("UPDATE post SET deleted=1 WHERE id=#{id} AND user_id=#{userId} AND deleted=0") int softDelete(@Param("id") Long id,@Param("userId") Long userId);
    @Update("UPDATE post SET view_count=view_count+1 WHERE id=#{id} AND deleted=0") int incrementView(Long id);
    @Update("UPDATE post SET like_count=like_count+1 WHERE id=#{id} AND deleted=0") int incrementLike(Long id);
    @Update("UPDATE post SET like_count=GREATEST(like_count-1,0) WHERE id=#{id} AND deleted=0") int decrementLike(Long id);
    @Select("SELECT COUNT(*) FROM post_like WHERE post_id=#{postId} AND user_id=#{userId}") int liked(@Param("postId") Long postId,@Param("userId") Long userId);
    @Insert("INSERT INTO post_like(post_id,user_id) VALUES(#{postId},#{userId})") int addLike(@Param("postId") Long postId,@Param("userId") Long userId);
    @Delete("DELETE FROM post_like WHERE post_id=#{postId} AND user_id=#{userId}") int removeLike(@Param("postId") Long postId,@Param("userId") Long userId);
    @Select("SELECT p.*,b.code board_code,b.name board_name,u.nickname,u.avatar_url FROM post p JOIN board b ON b.id=p.board_id JOIN user_account u ON u.id=p.user_id JOIN post_like l ON l.post_id=p.id WHERE l.user_id=#{userId} AND p.deleted=0 ORDER BY l.created_at DESC LIMIT #{offset},#{pageSize}") List<Post> findLiked(@Param("userId") Long userId,@Param("offset") int offset,@Param("pageSize") int pageSize);
    @Select("SELECT p.*,b.code board_code,b.name board_name,u.nickname,u.avatar_url FROM post p JOIN board b ON b.id=p.board_id JOIN user_account u ON u.id=p.user_id WHERE p.user_id=#{userId} AND p.deleted=0 ORDER BY p.created_at DESC LIMIT #{offset},#{pageSize}") List<Post> findMine(@Param("userId") Long userId,@Param("offset") int offset,@Param("pageSize") int pageSize);
    @Select("SELECT p.*,b.code board_code,b.name board_name,u.nickname,u.avatar_url FROM post p JOIN board b ON b.id=p.board_id JOIN user_account u ON u.id=p.user_id WHERE p.deleted=0 AND (p.title=#{q} OR p.content=#{q}) ORDER BY p.created_at DESC LIMIT 50") List<Post> exactSearch(String q);
    @Select("SELECT p.*,b.code board_code,b.name board_name,u.nickname,u.avatar_url FROM post p JOIN board b ON b.id=p.board_id JOIN user_account u ON u.id=p.user_id WHERE p.deleted=0 AND (p.title LIKE CONCAT('%',#{q},'%') OR p.content LIKE CONCAT('%',#{q},'%')) ORDER BY p.created_at DESC LIMIT 50") List<Post> fuzzySearch(String q);
}
