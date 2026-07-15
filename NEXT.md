# 严方俊个人网站 · 当前状态与待办

> 最近更新：2026-07-16

## 当前状态

- ✅ **已上线** https://zsnmfj-tech.github.io （2026-07-15 上线）
- 仓库：github.com/zsnmfj-tech/zsnmfj-tech.github.io
- 本地：`D:\yfj\02-work\AI\Codex\personal-site`（Astro）
- 内容：3 篇（律所 WorkBuddy / 具身数据 / 龙岗机器人沙龙）
- 部署：push main 自动上线（CI 已修通：Node 22 + npm install + Pages Source=GitHub Actions）

## 更新网站的方式

往 `src/content/notes/` 丢一个 md（frontmatter: title / deck / date / type / tags），然后：

```
git add . && git commit -m "新文章" && git push
```

1-2 分钟后线上更新，不用碰代码。

## 待办（按优先级）

- [ ] 补「读书」栏（目前 0 篇，首页显示「即将开始」）
- [ ] 论文 / 展会栏各补更多篇
- [ ] 栏目列表页（点栏目进完整列表，而非停在首页锚点）
- [ ] 加 RSS + sitemap
- [ ] About 单独详情页
- [ ] 博文系列第 2 篇（新行业），同步上网站
- [ ] dark mode
- [ ] 自定义域名

## 已知环境坑（已修，备忘）

- astro v7 需 Node ≥ 22.12（CI 用 node-version: 22）
- 本地 dev 要 `astro dev --host`（Windows IPv6/IPv4 问题，已写进 package.json）
- CI 用 `npm install` 不用 `npm ci`（跨平台 optional 依赖 @emnapi）
- GitHub Pages 的 Source 必须是 "GitHub Actions"
