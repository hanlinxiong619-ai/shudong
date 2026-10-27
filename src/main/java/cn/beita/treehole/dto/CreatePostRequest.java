package cn.beita.treehole.dto;
import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;
@Data public class CreatePostRequest {
    @NotBlank private String boardCode;
    @Size(max=160) private String title;
    @NotBlank @Size(max=10000) private String content;
    @Size(max=40) private String campus;
    @Size(max=120) private String contact;
    private java.math.BigDecimal estimatedPrice;
    @Size(max=9) private List<String> images;
}
