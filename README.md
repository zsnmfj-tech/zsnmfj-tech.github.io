# 严方俊 · 个人网站

AI 落地、空间智能与具身智能方向的实践笔记。基于 Astro，内容是 markdown，托管在 GitHub Pages。

## 本地预览

```bash
npm install
npm run dev      # 打开 http://localhost:4321
```

构建：

```bash
npm run build    # 产物在 dist/
npm run preview  # 预览构建结果
```

## 加一篇新笔记（最常用的操作）

在 `src/content/notes/` 新建一个 `.md` 文件：

```md
---
title: 标题
deck: 一句话摘要（首页和列表会显示）
date: 2026-07-20
type: 论文               # 四选一：读书·播客 / 论文 / AI商业落地 / 展会&活动
tags: [具身智能]          # 主题标签：AI / 空间智能 / 具身智能 等
readtime: 约 5 分钟
---

正文在这里，支持标准 markdown。
```

保存后，首页「最新笔记」、栏目归档、栏目计数和内容页会**自动更新**，不用动别的文件。

- 想暂时不上线：在 frontmatter 加 `draft: true`
- 金句样式：正文里写 `<div class="pull">这里放金句</div>`
- 栏目靠 `type` 字段分，主题靠 `tags` 字段分

### 文章图片与图注

普通 Markdown 图片会跟随正文宽度：

```md
![准确描述图片内容的替代文字](/images/example.jpg)
```

需要宽图和图注时使用：

```html
<figure class="media-wide">
  <img src="/images/example.jpg" alt="准确描述图片内容的替代文字" loading="lazy" width="1600" height="900">
  <figcaption>图 1：图片说明与来源</figcaption>
</figure>
```

竖版 SVG 或信息图加 `class="media-portrait"`，避免被放得过宽。图片请填写真实的 `width`、`height` 和 `alt`，正文以下图片建议保留 `loading="lazy"`。

## 部署到 GitHub Pages

1. 在 GitHub 建一个仓库，把这个目录 push 上去（`git init && git add . && git commit -m "init" && git remote add origin <你的仓库> && git push -u origin main`）。
2. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**。
3. 改 `astro.config.mjs`：
   - `site` 改成你的域名（用户名站点就是 `https://<用户名>.github.io`）。
   - 如果仓库名**不是** `<用户名>.github.io`，把 `base` 取消注释、改成 `'/<仓库名>/'`。
4. 推到 `main` 分支，`.github/workflows/deploy.yml` 会自动构建并上线。

如需启用网站访问统计，在仓库 **Settings → Secrets and variables → Actions → Variables** 新增
`PUBLIC_GA_MEASUREMENT_ID`，值为 GA4 Measurement ID（格式 `G-...`）。未配置或格式无效时，
网站不会加载 GA4 脚本。
该 Measurement ID 必须属于私有看板中 `GA4_PROPERTY_ID` 对应 Property 下的网站数据流，
数据流网址必须为 `https://zsnmfj-tech.github.io/`。

地址规则：
- 仓库名 `<用户名>.github.io` → 访问 `https://<用户名>.github.io`
- 其他仓库名 → 访问 `https://<用户名>.github.io/<仓库名>`（需要配 `base`）

## 目录结构

```
src/
├── content/notes/*.md          笔记内容（在这里加新文章）
├── content.config.ts           笔记字段定义
├── pages/index.astro           首页
├── pages/about.astro           About 页面
├── pages/columns/[id].astro    栏目归档页
├── pages/notes/[...slug].astro 内容页（自动给每篇 md 生成一页）
├── pages/rss.xml.ts            RSS 订阅
├── pages/sitemap.xml.ts        站点地图
├── layouts/                    布局
├── components/                 导航与共享文章列表
└── styles/global.css           全站样式
```
