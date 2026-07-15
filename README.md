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
type: 论文               # 四选一：读书 / 论文 / AI商业落地 / 展会
tags: [具身智能]          # 主题标签：AI / 空间智能 / 具身智能 等
readtime: 约 5 分钟
---

正文在这里，支持标准 markdown。
```

保存后，首页「最新笔记」、栏目计数、内容页会**自动更新**，不用动别的文件。

- 想暂时不上线：在 frontmatter 加 `draft: true`
- 金句样式：正文里写 `<div class="pull">这里放金句</div>`
- 栏目靠 `type` 字段分，主题靠 `tags` 字段分

## 部署到 GitHub Pages

1. 在 GitHub 建一个仓库，把这个目录 push 上去（`git init && git add . && git commit -m "init" && git remote add origin <你的仓库> && git push -u origin main`）。
2. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**。
3. 改 `astro.config.mjs`：
   - `site` 改成你的域名（用户名站点就是 `https://<用户名>.github.io`）。
   - 如果仓库名**不是** `<用户名>.github.io`，把 `base` 取消注释、改成 `'/<仓库名>/'`。
4. 推到 `main` 分支，`.github/workflows/deploy.yml` 会自动构建并上线。

地址规则：
- 仓库名 `<用户名>.github.io` → 访问 `https://<用户名>.github.io`
- 其他仓库名 → 访问 `https://<用户名>.github.io/<仓库名>`（需要配 `base`）

## 目录结构

```
src/
├── content/notes/*.md          笔记内容（在这里加新文章）
├── content.config.ts           笔记字段定义
├── pages/index.astro           首页
├── pages/notes/[...slug].astro 内容页（自动给每篇 md 生成一页）
├── layouts/                    布局
├── components/Nav.astro        导航
└── styles/global.css           样式（kami 风格）
```
