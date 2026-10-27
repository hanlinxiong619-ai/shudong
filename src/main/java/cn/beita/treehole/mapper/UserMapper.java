package cn.beita.treehole.mapper;

import cn.beita.treehole.model.UserAccount;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM user_account WHERE openid=#{openid}")
    UserAccount findByOpenid(String openid);
    @Insert("INSERT INTO user_account(openid,nickname,avatar_url) VALUES(#{openid},#{nickname},#{avatarUrl})")
    @Options(useGeneratedKeys=true,keyProperty="id")
    int insert(UserAccount user);
}
