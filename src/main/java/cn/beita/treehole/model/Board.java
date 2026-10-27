package cn.beita.treehole.model;

import lombok.Data;

@Data
public class Board {
    private Long id;
    private String code;
    private String name;
    private String groupType;
    private Integer sortNo;
    private Integer enabled;
}
