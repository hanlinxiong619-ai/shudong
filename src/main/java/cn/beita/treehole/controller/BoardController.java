package cn.beita.treehole.controller;

import cn.beita.treehole.common.ApiResponse;
import cn.beita.treehole.mapper.BoardMapper;
import cn.beita.treehole.model.Board;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {
    private final BoardMapper mapper;
    public BoardController(BoardMapper mapper) { this.mapper=mapper; }
    @GetMapping public ApiResponse<List<Board>> list() { return ApiResponse.ok(mapper.findAll()); }
}
