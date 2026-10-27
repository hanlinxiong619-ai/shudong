CREATE DATABASE IF NOT EXISTS beita_treehole DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE beita_treehole;
CREATE TABLE user_account (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(64) NOT NULL UNIQUE,
  nickname VARCHAR(80) NOT NULL DEFAULT '匿名用户',
  avatar_url VARCHAR(500),
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE board (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  group_type ENUM('MARKET','TREEHOLE') NOT NULL,
  sort_no INT NOT NULL DEFAULT 0,
  enabled TINYINT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
CREATE TABLE login_token (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token_user(user_id),
  CONSTRAINT fk_token_user FOREIGN KEY(user_id) REFERENCES user_account(id)
) ENGINE=InnoDB;
CREATE TABLE post (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  board_id BIGINT NOT NULL,
  title VARCHAR(160),
  content TEXT NOT NULL,
  images JSON,
  campus VARCHAR(40),
  contact VARCHAR(120),
  estimated_price DECIMAL(12,2),
  view_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  deleted TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_post_board_time(board_id, deleted, created_at),
  INDEX idx_post_hot(board_id, deleted, like_count, view_count),
  FULLTEXT KEY ft_post_text(title, content),
  CONSTRAINT fk_post_user FOREIGN KEY(user_id) REFERENCES user_account(id),
  CONSTRAINT fk_post_board FOREIGN KEY(board_id) REFERENCES board(id)
) ENGINE=InnoDB;
CREATE TABLE post_like (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_post_like(post_id,user_id),
  CONSTRAINT fk_like_post FOREIGN KEY(post_id) REFERENCES post(id),
  CONSTRAINT fk_like_user FOREIGN KEY(user_id) REFERENCES user_account(id)
) ENGINE=InnoDB;
CREATE TABLE comment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  content VARCHAR(1000) NOT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comment_post(post_id, deleted, created_at)
) ENGINE=InnoDB;
INSERT INTO board(code,name,group_type,sort_no) VALUES
('second_hand','二手市场','MARKET',1),('part_time','兼职发布','MARKET',2),('rental','租房交易','MARKET',3),('help','打听求助','MARKET',4),('lost_found','失物寻物','MARKET',5),
('vent','吐槽','TREEHOLE',1),('confide','倾诉','TREEHOLE',2),('wish','心愿','TREEHOLE',3),('gossip','树洞','TREEHOLE',4);
