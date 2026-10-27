package cn.beita.treehole.dto;
import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
@Data public class CreateCommentRequest { @NotBlank @Size(max=1000) private String content; private Long parentId; }
