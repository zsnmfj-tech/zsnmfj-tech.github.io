// 站点配置：全站的固定文案集中在这里。
// 想改首页名字、定位句、关于简介、栏目名称/描述、导航、页脚，
// 只改这个文件就行，不用碰任何 Astro 组件代码。

export const site = {
  // 作者 / 品牌
  name: '严方俊',
  siteName: '严方俊 · 实践笔记',
  homeTitle: '严方俊 · AI 落地、空间智能与具身智能的实践笔记',
  description: '严方俊的个人网站，AI 落地、空间智能与具身智能方向的实践笔记、论文阅读与观察记录。',

  // 首页 Hero
  kicker: '实践笔记 · 2026 ~ ',
  tagline: '在 AI 落地、空间智能与具身智能的交界处，记录实践、阅读与观察。',
  dirs: ['AI', '空间智能', '具身智能'],

  // 关于
  aboutTitle: '关于我',
  about: '11 年技术与管理背景，华为开发工程师到高级项目经理、项目负责人的复合经历，过去 8 年深耕 AI、大数据与云服务。现在把注意力放在三件事上：<strong>AI 行业落地、空间智能（Spatial）的新机会、具身智能的产业化</strong>。这里是我日常所学所见的沉淀地，也欢迎来聊合作与机会。',

  // 顶部导航（最后一个在移动端常驻显示）
  nav: [
    { label: '读书·播客', href: '/#reading' },
    { label: '论文', href: '/#papers' },
    { label: 'AI 商业落地', href: '/#landing' },
    { label: '展会&活动', href: '/#events' },
    { label: '关于', href: '/#about' },
  ],

  // 栏目（顺序 = 首页展示顺序；type 对应笔记 frontmatter 的 type 字段，决定计数）
  columns: [
    { id: 'reading', name: '读书·播客', desc: '技术、商业、思维的读书笔记和播客观点提炼。', unit: '篇', type: '读书·播客' },
    { id: 'papers', name: '论文阅读', desc: '大模型、空间智能、具身智能的前沿论文，翻译成人话。', unit: '篇', type: '论文' },
    { id: 'landing', name: 'AI 商业落地', desc: '一个行业一个行业拆：痛点、切入点、工具与引申思考。', unit: '个场景', type: 'AI商业落地' },
    { id: 'events', name: '展会&活动', desc: '线下沙龙、峰会的现场记录与可对接的线索。', unit: '场', type: '展会&活动' },
  ],

  // 页脚链接
  social: [
    { label: '关于', href: '/#about' },
    { label: '联系', href: '#' },
    { label: 'RSS', href: '#' },
    { label: 'GitHub', href: '#' },
  ],
};
