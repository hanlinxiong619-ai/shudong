package cn.beita.treehole.mapper;

import cn.beita.treehole.model.Board;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface BoardMapper {
    @Select("SELECT * FROM board WHERE enabled=1 ORDER BY group_type,sort_no,id")
    List<Board> findAll();
    @Select("SELECT * FROM board WHERE code=#{code} AND enabled=1")
    Board findByCode(String code);
}
