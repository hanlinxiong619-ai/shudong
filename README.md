# 贝塔树洞后端（微信小程序版）

这是按原 Beita 功能重新规划的非营利校园树洞后端。当前第一阶段已完成项目骨架和数据库基础设计，明确不包含微信支付。

## 功能范围

- 微信小程序登录（`wx.login` code 换取 OpenID/Session）
- 集市板块：二手市场、兼职发布、租房交易、打听求助、失物寻物
- 树洞板块：吐槽、倾诉、心愿、树洞
- 发帖、删帖、帖子详情、浏览量
- 点赞/取消点赞，评论/删除评论
- 新发、最热、精选列表
- 先关键词精确匹配，再标题/正文模糊匹配
- 用户个人发布、点赞、评论列表

## 目录

- `db/schema.sql`：数据库、板块、用户、帖子、点赞、评论表
- `src/main/java`：Spring Boot 代码（后续按模块实现）
- `src/main/resources/application.yml`：本地数据库配置

## 约定的接口

```text
POST /api/auth/wx-login
GET  /api/boards
GET  /api/posts?board=vent&sort=new&page=1&pageSize=20
GET  /api/posts/{id}
POST /api/posts
DELETE /api/posts/{id}
POST /api/posts/{id}/views
POST /api/posts/{id}/like
DELETE /api/posts/{id}/like
GET  /api/posts/{id}/comments
POST /api/posts/{id}/comments
DELETE /api/comments/{id}
GET  /api/search?q=关键词
```

后续实现顺序：认证 → 板块 → 帖子 → 点赞/浏览 → 评论 → 搜索 → 热榜 → 管理和内容安全。

## 本地运行

1. 确认 `E:\mysql` 的 MySQL 服务正在运行，并设置当前 MySQL 密码，例如 PowerShell 执行 `$env:MYSQL_ROOT_PASSWORD='你的密码'`。
2. 执行 `scripts/init-db.ps1` 初始化数据库。
3. 执行 `scripts/run-dev.ps1` 启动后端，地址为 `http://127.0.0.1:8802`。
4. 使用 `code=dev-test-user` 调用登录接口进行本地测试。
