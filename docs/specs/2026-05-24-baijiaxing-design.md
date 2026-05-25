# 百家姓 · 中国姓氏名人文化平台 — 设计文档

## 项目概述

一个面向公众的中国传统文化知识平台，以"百家姓"为起点，按姓氏展示历史名人及其生平事迹。后续扩展至书籍典籍、历史史诗等内容。

**当前阶段：** 百家姓模块 MVP

## 技术栈

| 层 | 选型 | 理由 |
|---|------|------|
| 框架 | Nuxt 3 (Vue 3 + Nitro) | 前后端一体，SSR 对 SEO 友好，Vercel 一键部署 |
| 语言 | TypeScript | 前后端统一 |
| 数据库 | PostgreSQL | 关系型，姓氏↔名人关联自然，内置全文搜索 |
| 部署 | Vercel | 免费额度够 MVP，自动 HTTPS/CDN |
| 样式 | Tailwind CSS + 自定义中国风主题 | 快速开发，灵活定制 |

## 视觉风格

**古典中国风** — 宣纸底色、水墨纹理、印章装饰、传统配色（朱红/墨黑/米白），可选竖排文字元素。沉浸式传统文化体验。

## 页面与路由

| 路由 | 页面 | 渲染 |
|------|------|------|
| `/` | 首页：姓氏方块网格 + 搜索 | SSR + CSR |
| `/surname/[name]` | 姓氏详情：起源/郡望/名人列表 | SSR |
| `/celebrity/[id]` | 名人详情：画像/生平/作品/轶事 | SSR |
| `/search?q=&dynasty=&pinyin=&rank=&junwang=` | 搜索结果 | CSR |

## 数据模型

### surnames

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(10) | 姓氏（如"张"） |
| pinyin | VARCHAR(50) | 拼音（Zhāng） |
| rank | INTEGER | 百家姓排名 |
| origin | TEXT | 起源描述 |
| ancestor | VARCHAR(100) | 得姓始祖 |
| junwang | TEXT[] | 郡望（数组） |
| tanghao | VARCHAR(200) | 堂号 |
| created_at | TIMESTAMPTZ | - |
| updated_at | TIMESTAMPTZ | - |

### celebrities

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| surname_id | UUID FK → surnames.id | 所属姓氏 |
| name | VARCHAR(100) | 姓名 |
| dynasty | VARCHAR(50) | 朝代 |
| birth_year | INTEGER | 生年（可空） |
| death_year | INTEGER | 卒年（可空） |
| birthplace | VARCHAR(200) | 籍贯（可空） |
| image_url | TEXT | 画像 URL（可空） |
| summary | TEXT | 一句话简介 |
| biography | TEXT | 生平介绍 |
| works | TEXT | 代表作品/功绩 |
| anecdotes | TEXT | 轶事典故（可空） |
| external_links | JSONB | `[{label, url}]` |
| created_at | TIMESTAMPTZ | - |
| updated_at | TIMESTAMPTZ | - |

### 索引

- `surnames.name` — 唯一索引
- `surnames.pinyin` — 用于拼音筛选
- `surnames.rank` — 用于排名范围筛选
- `celebrities.surname_id` — 外键索引
- `celebrities.dynasty` — 朝代筛选
- `surnames` / `celebrities` 全文搜索列 — GIN 索引 (tsvector)

## API 路由

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/surnames` | GET | 姓氏列表，支持 `?pinyin=&rank_min=&rank_max=&junwang=` |
| `/api/surnames/[id]` | GET | 单个姓氏详情 + 关联名人列表 |
| `/api/celebrities` | GET | 名人列表，支持 `?surname_id=&dynasty=` |
| `/api/celebrities/[id]` | GET | 单个名人详情 |
| `/api/search` | GET | 全局搜索，`?q=` 同时搜索姓氏和名人 |

## 组件树

```
layouts/
  default.vue          — 全局布局：顶栏 + 页脚

pages/
  index.vue            — 首页
  surname/[name].vue   — 姓氏详情
  celebrity/[id].vue   — 名人详情
  search.vue           — 搜索结果

components/
  SurnameGrid.vue      — 姓氏方块网格
  SurnameCard.vue      — 单个姓氏卡片
  SearchBar.vue        — 搜索栏（自动完成，debounce 300ms）
  PinyinNav.vue        — 拼音 A-Z 导航
  FilterPanel.vue      — 筛选面板（朝代/排名/郡望）
  CelebrityList.vue    — 名人列表（按朝代分组）
  CelebrityCard.vue    — 名人卡片
  SurnameHeader.vue    — 姓氏大字 + 基本信息区
  ProseBlock.vue       — 长文排版（生平/轶事）
```

## 数据来源策略

MVP 阶段：手动整理前 100 个姓氏，每姓氏 3-5 位名人（约 500 条数据），存入 PostgreSQL。同时搭建爬取+审核管道，为后续扩展做准备。

长期：Wikipedia API / 百度百科爬取 + 人工审核流程，逐步覆盖全部 504 个姓氏。

## MVP 范围

**包含：**
- 首页姓氏网格（前 100 个姓氏）
- 拼音 A-Z 快捷导航
- 姓氏详情页（起源、郡望、名人列表）
- 名人详情页（全部字段）
- 搜索框（姓氏 + 名人模糊搜索）
- 筛选：拼音、朝代、排名范围、郡望
- 响应式（桌面 + 移动端）
- SSR SEO 优化

**不包含（后续迭代）：**
- 用户系统（登录/注册）
- 收藏、评论、分享
- 数据管理后台
- 数据爬取管道
- 书籍典籍模块
