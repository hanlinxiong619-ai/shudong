package cn.beita.treehole;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("cn.beita.treehole.mapper")
public class TreeholeApplication {
    public static void main(String[] args) { SpringApplication.run(TreeholeApplication.class, args); }
}
