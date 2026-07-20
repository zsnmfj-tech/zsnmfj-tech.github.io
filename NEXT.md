# 严方俊个人网站 · 状态与待办

> 最近更新：2026-07-20

## 当前状态

- ✅ **已上线** https://zsnmfj-tech.github.io
- 仓库：github.com/zsnmfj-tech/zsnmfj-tech.github.io
- 本地：`D:\yfj\02-work\AI\Codex\personal-site`（Astro）
- **内容 13 篇**：论文5(架构/训练/推理/π₀/π₀.₇) · AI商业落地2(律所/反洗钱) · 展会&活动4(具身/龙岗/WAIC Day1/Day2) · 读书·播客2(Harness/Agent演进)
- 改首页文案改 `src/site.config.ts`；加内容丢 `src/content/notes/*.md`；`git push` 自动上线
- 栏目归档、About、404、RSS、sitemap 与基础 SEO 已补齐
- GA4 访问统计代码已接入；私有分析看板与 Search Console 数据采集在独立私有仓库维护

## 待办（按优先级）

### 🟡 内容补充（素材在得到大脑录音笔记）
- [ ] 读书·播客（现 2 篇）：姚顺雨 Agent 深度访谈、罗振宇长期主义、戴雨森 AI 投资等
- [ ] AI 商业落地（现 2 篇）：加新行业（医疗/制造/教育）
- [ ] 展会&活动（现 4 篇）：Day3 或其他展会素材

### 🟢 网站功能
- [x] 栏目列表页（点"展会""论文"进入完整列表）
- [x] RSS + sitemap（订阅 + SEO）
- [x] About 详情页
- [x] 自定义 404 页面
- [ ] dark mode
- [ ] 站内搜索

### 🔵 运营
- [ ] 自定义域名
- [ ] 系列转发文案（朋友圈/同行群）
- [x] 基础 SEO（canonical、Open Graph、Twitter Card、robots）

## 已踩的环境坑（已修，备忘）
- astro v7 需 Node ≥22.12（CI workflow 用 node-version: 22）
- 本地 dev 要 `astro dev --host`（Windows IPv6，已固化 package.json）
- CI 用 `npm install` 不用 `npm ci`（跨平台 optional 依赖）
- GitHub Pages 的 Source 必须是 "GitHub Actions"
- **Markdown 内联 SVG 内部不能有空行**（md 渲染遇空行中断 HTML 块，SVG 后半段显示源码）
