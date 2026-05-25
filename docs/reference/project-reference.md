# 百家姓平台 — 项目参考文档

> 最后更新：2026-05-25

## 项目概述

一个中国传统文化知识平台，以"百家姓"为起点，按姓氏展示历史名人及其生平事迹。经典中国风设计（宣纸底色、篆印装饰、朱红配色）。

**当前阶段：** 百家姓模块 v1 MVP

**代码仓库：** `/Users/szh/Desktop/baijiaxingProject`

---

## 技术栈

| 层 | 选型 | 原因 |
|---|------|------|
| 框架 | Nuxt 3 (Vue 3 + Nitro) | 前后端一体，SSR 对 SEO 友好 |
| 语言 | TypeScript | 前后端统一 |
| 数据库 | PostgreSQL (Neon) | Serverless 友好，免费额度 0.5 GB，自带连接池 |
| ORM | Drizzle ORM (postgres.js) | 类型安全，轻量，无需代码生成 |
| 样式 | Tailwind CSS + 自定义主题 | 中国风配色（朱红/墨黑/米白/琥珀金） |
| 部署 | 待定 | 当前仅本地开发 |
| 字体 | Noto Serif SC + Ma Shan Zheng | Google Fonts，中文衬线 + 毛笔书法 |

### 为什么选 Neon 而不是 Supabase 或 Vercel Postgres

- **Neon**：serverless 架构，零流量自动休眠；连接池内置，Drizzle 原生支持；任何平台都能连。免费 0.5 GB 对 MVP 足够。
- Supabase 需要直连，serverless 场景下连接池是问题。
- Vercel Postgres 只能在 Vercel 项目内访问，部署灵活性差。

---

## 数据库

### 连接信息

| 项目 | 值 |
|------|-----|
| 提供商 | [Neon](https://neon.tech) |
| Region | ap-southeast-1 (Singapore) |
| 数据库名 | neondb |
| 连接字符串 | 见 `.env` 文件 |
| Schema 管理 | drizzle-kit push |

### 表结构

#### surnames（姓氏）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID (PK) | 自动生成 |
| `name` | VARCHAR(10) | 姓氏（如"李"） |
| `pinyin` | VARCHAR(50) | 拼音（如"Lǐ"） |
| `rank` | INTEGER | 百家姓排名 |
| `origin` | TEXT | 姓氏起源 |
| `ancestor` | VARCHAR(100) | 得姓始祖 |
| `junwang` | TEXT[] | 郡望地区数组 |
| `tanghao` | VARCHAR(200) | 堂号 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

索引：`name`（唯一）、`pinyin`、`rank`

#### celebrities（名人）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID (PK) | 自动生成 |
| `surname_id` | UUID (FK → surnames.id) | 所属姓氏，级联删除 |
| `name` | VARCHAR(100) | 名人姓名 |
| `dynasty` | VARCHAR(50) | 朝代 |
| `birth_year` | INTEGER | 生年（可空） |
| `death_year` | INTEGER | 卒年（可空） |
| `birthplace` | VARCHAR(200) | 籍贯（可空） |
| `image_url` | TEXT | 画像 URL（可空，暂未使用） |
| `summary` | TEXT | 一句话简介 |
| `biography` | TEXT | 生平介绍 |
| `works` | TEXT | 代表作品 / 主要功绩 |
| `anecdotes` | TEXT | 轶事典故（可空） |
| `external_links` | JSONB | `[{label, url}]` 外部链接 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

索引：`surname_id`、`dynasty`

---

## API 端点

所有端点返回 JSON。

### 姓氏

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/surnames` | GET | 姓氏列表，支持 `?pinyin=&rank_min=&rank_max=&junwang=&page=&pageSize=` |
| `/api/surnames/[id]` | GET | 单个姓氏详情，**包含关联名人列表**（按朝代排序） |

### 名人

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/celebrities` | GET | 名人列表，支持 `?surname_id=&dynasty=&page=&pageSize=` |
| `/api/celebrities/[id]` | GET | 单个名人详情，包含关联姓氏信息 |

### 搜索

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/search` | GET | 全局搜索，`?q=` 同时搜索姓氏（name, pinyin）和名人（name, summary） |

### 查询参数说明

- `pinyin`: 拼音首字母前缀匹配（如 `?pinyin=L` 返回所有 L 开头的姓氏）
- `rank_min` / `rank_max`: 排名范围过滤
- `junwang`: 郡望地区精确匹配（使用 PostgreSQL `arrayContains`）
- `dynasty`: 朝代精确匹配
- `page`: 页码（从 1 开始）
- `pageSize`: 每页条数（surnames 默认 200，celebrities 默认 50，上限 100）

---

## 页面路由与渲染模式

| 路由 | 页面 | 渲染 |
|------|------|------|
| `/` | 首页：姓氏网格 + 拼音导航 + 搜索栏 | SSR + CSR |
| `/surname/[id]` | 姓氏详情：大字姓氏、起源、郡望、名人列表（Tab 切换） | SSR |
| `/celebrity/[id]` | 名人详情：姓名、生平、作品、轶事、外部链接 | SSR |
| `/search?q=` | 搜索结果：姓氏 + 名人混合展示，筛选面板 | CSR |

> 注意：路由使用 `[id]`（UUID）而非 `[name]`，与最初设计文档不同。这是因为同一姓氏只有一个条目，用 UUID 定位更精确。

---

## 组件树

```
layouts/
  default.vue            — 全局布局（顶栏导航 + 页脚）

components/
  SurnameCard.vue        — 单个姓氏卡片（毛笔墨字 + 拼音 + 排名）
  SurnameGrid.vue        — 姓氏网格容器（响应式：4→6→8→10 列）
  PinyinNav.vue          — 拼音 A-Z 导航条
  SearchBar.vue          — 搜索栏（支持 v-model，与路由同步）
  FilterPanel.vue        — 筛选面板（朝代 + 排名范围 + 郡望地区）
  CelebrityCard.vue      — 名人卡片（头像占位 + 简介 + 朝代标签）
  CelebrityList.vue      — 名人列表（按朝代分组）
  SurnameHeader.vue      — 姓氏大字 + 基本信息（排名/堂号/郡望标签）
  ProseBlock.vue         — 长文排版块（标题 + 首行缩进、pre-line）

pages/
  index.vue              — 首页
  surname/[id].vue       — 姓氏详情
  celebrity/[id].vue     — 名人详情
  search.vue             — 搜索结果
```

---

## 数据内容

### 当前覆盖

- **30 个姓氏**：赵、钱、孙、李、周、吴、郑、王、冯、陈、韩、杨、朱、何、张、孔、曹、苏、马、杜、刘、黄、谢、宋、沈、徐、林、郭、梁、司马
- **73 位名人**：涵盖先秦至近现代，代表性人物包括孔子、李白、杜甫、苏轼、曹操、韩信、孙武、司马迁、王羲之等
- **13 个朝代**：先秦、秦汉、三国、晋、南北朝、隋、唐、五代十国、宋、元、明、清、近现代

### 数据维护

- 种子脚本：`server/db/seed.ts`
- 种子数据：`server/db/seed-data.ts`
- 运行方式：`npm run db:seed`（会先清空再插入）
- 每条名人数据包含：生平传记（200-500 字）、代表作品、轶事典故、外部链接

---

## 本地开发

### 前置条件

- Node.js ≥ 20（`.nvmrc` 指定 22）
- Neon 数据库连接（`.env` 中配置）

### 首次启动

```bash
cd /Users/szh/Desktop/baijiaxingProject
nvm use 22                      # 切换到 Node 22
npm install                     # 安装依赖
npx drizzle-kit push            # 推送 schema 到 Neon
npm run db:seed                 # 种子数据
npm run dev                     # 启动开发服务器 → http://localhost:3000
```

### 常用命令

```bash
npm run dev          # 开发服务器（热更新）
npm run build        # 生产构建
npm run preview      # 预览生产构建
npm run db:migrate   # 推送 schema 变更
npm run db:seed      # 重新种子数据（会清空现有数据）
```

---

## 已知限制

1. **数据量**：30 姓氏 + 73 名人，计划扩展到 100 姓氏 + 300+ 名人
2. **无用户系统**：没有登录/注册/收藏/评论功能
3. **无管理后台**：数据通过 seed 脚本和直接 SQL 操作管理
4. **图片**：`image_url` 字段已定义但名人头像暂未填充
5. **全文搜索**：当前使用 `ILIKE`，未使用 PostgreSQL 全文搜索（GIN + tsvector），数据量大了需要升级
6. **无分页 UI**：API 支持分页但前端页面未实现分页控件
7. **移动端体验**：响应式基础已做，但未深度优化触屏交互
8. **未部署**：`.env.example` 已创建，`vercel.json` 待定

---

## 下一步方向

### 短期（v1 完善）
- 扩展数据至 100 姓氏 + 300+ 名人
- 添加姓氏和名人的分页/无限滚动
- 填充名人头像 `image_url`
- 移动端体验优化

### 中期
- 部署到 Vercel（需配置 Neon 环境变量）
- PostgreSQL 全文搜索（GIN 索引 + tsvector）
- 数据管理后台（增删改查）
- 用户系统（OAuth 登录）

### 长期
- 书籍典籍模块
- 历史史诗模块
- 数据爬取 + 人工审核管道
- 社区贡献功能

---

## 关键决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 路由参数 | UUID 而非 name | 姓氏唯一，但多音字和复姓用拼音做 URL 不友好；UUID 是永久的 |
| 数据库 | SQLite → PostgreSQL | SQLite 在 serverless/Vercel 环境不可用；Neon 提供免费 PostgreSQL |
| ORM 驱动 | better-sqlite3 → postgres.js | PostgreSQL 原生驱动，支持连接池，Drizzle 官方推荐 |
| 种子数据 | 纯手写 | 数据质量优先于数量；每个名人的传记、轶事都经过人工编写 |
| 样式方案 | Tailwind @layer components | 自定义组件类（如 `.surname-card`）封装在 Tailwind 层中，保持 HTML 干净 |
| 搜索实现 | `ILIKE` 模式匹配 | 当前数据量下足够；数据量过万后切换 PostgreSQL 全文搜索 |
| 渲染策略 | 内容页 SSR，搜索页 CSR | 内容页对 SEO 友好；搜索页交互性强，CSR 体验更好 |
