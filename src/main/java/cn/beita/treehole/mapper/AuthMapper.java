package cn.beita.treehole.mapper;

import cn.beita.treehole.model.UserAccount;
import org.apache.ibatis.annotations.*;
import java.time.LocalDateTime;

@Mapper
public interface AuthMapper {
    @Insert("INSERT INTO login_token(user_id,token,expires_at) VALUES(#{userId},#{token},#{expiresAt})")
    int insertToken(@Param("userId") Long userId, @Param("token") String token, @Param("expiresAt") LocalDateTime expiresAt);
    @Select("SELECT u.* FROM login_token t JOIN user_account u ON u.id=t.user_id WHERE t.token=#{token} AND t.expires_at>NOW() AND u.status=1")
    UserAccount findUserByToken(String token);
}
