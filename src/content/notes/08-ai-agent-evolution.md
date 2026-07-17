---
title: AI Agent 演进史:从逻辑智能体到 Language Agent,再到专家智能体
deck: 苏玉访谈整理——Agent 的三阶段演化、OpenClaw 浪潮,以及下一步的专家智能体。
date: 2026-07-17
type: 读书·播客
tags:
  - AI
  - Agent
readtime: 约 14 分钟
---

Agent 是 2026 年 AI 领域最高频的词之一。但 Agent 到底是什么、怎么演化到今天、下一步往哪走?最近听了一期讲得很透的播客访谈——主持人晓珺对话**苏玉**(俄亥俄州立大学计算机系教授、NeoCognition 创始人、2025 斯隆研究奖得主),他从 Agent 的定义讲到完整演化史,再到自己的创业判断。苏玉从语义解析方向出身,见证了 Agent 领域的完整演化。

## 01 Agent 不是新概念

很多人以为 Agent 是 ChatGPT 之后才有的新东西。苏玉一上来就纠正:**Agent 贯穿了 AI 发展的始终**,不是新概念。

要成为 Agent,只需满足三个核心要素:**是有边界的独立实体、需要在特定外界环境中工作、会开展有目的性的活动以达成目标**。按这个定义,自然界里所有动物都算 Agent,人类是其中智能最先进的一个。AI 诞生之初,研究者的梦想就是造出"人造 Agent"。

只不过早期目标定得太高、超出当时技术能力,导致 AI 领域分化成了计算机视觉、自然语言处理、推理等多个子领域,各自发展。直到近年大模型出现,这些子领域才开始重新聚合,Agent 这个最初的梦想才重新变得可实现。

苏玉还给了个判断 Agent 能力的框架,很实用:一个合格的 Agent 要具备两样东西——**记忆**(广义的,涵盖知识的表达、获取、更新、遗忘,包括语义、情景、过程性记忆)和**自主性**(感知→推理→决策→执行四个环节)。后面看不同阶段的 Agent,都可以用"记忆和自主性各做到哪一步"来衡量。

## 02 演化三阶段:逻辑 → 神经 → 语言

苏玉把 Agent 的演化分成三个阶段,脉络非常清晰:

<svg viewBox="0 0 960 400" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="a1" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#a1)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 1</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">AGENT 演化三阶段</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="60" y="78" width="270" height="240" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="195" y="106" fill="#141413" font-size="19" text-anchor="middle">① 逻辑智能体</text>
    <text x="195" y="128" fill="#6b6a64" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">1950s - 1990s</text>
    <line x1="90" y1="140" x2="300" y2="140" stroke="#e8e6dc"/>
    <text x="195" y="166" fill="#1B365D" font-size="15.5" text-anchor="middle">代表:专家系统</text>
    <text x="80" y="194" fill="#504e49" font-size="14">专家知识 → 一阶逻辑 → 推理引擎</text>
    <text x="80" y="224" fill="#b08442" font-size="14">局限:逻辑表达力有限</text>
    <text x="80" y="244" fill="#b08442" font-size="14">知识获取瓶颈(人工转写)</text>
    <text x="80" y="276" fill="#141413" font-size="14">→ 直接导致 80-90s AI 寒冬</text>
    <text x="80" y="300" fill="#6b6a64" font-size="13" font-family="JetBrains Mono, Consolas, monospace">《AIMA》Russell &amp; Norvig 1995</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="345" y="78" width="270" height="240" rx="8" fill="#E4ECF5" stroke="#1B365D" stroke-width="1.2"/>
    <text x="480" y="106" fill="#1B365D" font-size="19" text-anchor="middle">② 神经网络 Agent</text>
    <text x="480" y="128" fill="#6b6a64" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">2000 - 2020</text>
    <line x1="375" y1="140" x2="585" y2="140" stroke="#e8e6dc"/>
    <text x="480" y="166" fill="#1B365D" font-size="15.5" text-anchor="middle">代表:AlphaGo · 游戏 AI</text>
    <text x="365" y="194" fill="#504e49" font-size="14">深度强化学习 · 参数千万~亿级</text>
    <text x="365" y="224" fill="#b08442" font-size="14">局限:只适配单一游戏</text>
    <text x="365" y="244" fill="#b08442" font-size="14">样本效率差(百万局训练)</text>
    <text x="365" y="276" fill="#141413" font-size="14">同期 NLP 语义解析扩大动作空间</text>
    <text x="365" y="300" fill="#6b6a64" font-size="13" font-family="JetBrains Mono, Consolas, monospace">很多研究者后来成 LLM/Agent 核心</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="630" y="78" width="270" height="240" rx="8" fill="#b08442"/>
    <text x="765" y="106" fill="#faf9f5" font-size="19" text-anchor="middle">③ Language Agent</text>
    <text x="765" y="128" fill="#fff" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">2020 之后 · ChatGPT 时代</text>
    <line x1="660" y1="140" x2="870" y2="140" stroke="#d8d2bf"/>
    <text x="765" y="166" fill="#faf9f5" font-size="15.5" text-anchor="middle">语言作为脚手架</text>
    <text x="650" y="194" fill="#fff" font-size="14">感知 / 推理 / 执行 全流程</text>
    <text x="650" y="224" fill="#fff" font-size="14">优势:自适应推理(越复杂越多算)</text>
    <text x="650" y="244" fill="#fff" font-size="14">语言是全能行动媒介</text>
    <text x="650" y="276" fill="#fff" font-size="14">类比:语言之于人类演化</text>
    <text x="650" y="300" fill="#fff" font-size="13" font-family="JetBrains Mono, Consolas, monospace">AI 演化的爆炸式加速点</text>
  </g>
  <line x1="60" y1="346" x2="900" y2="346" stroke="#e8e6dc"/>
  <text x="60" y="372" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">读图:三个阶段用“记忆 + 自主性”框架看,每一代都在扩大能处理的“世界”。逻辑智能体卡在知识获取,神经网络卡在通用性,Language Agent 用语言打通了感知-推理-执行,才真正接近通用。</text>
</svg>

**① 逻辑智能体(1950s-1990s)**。代表性应用是专家系统:把领域专家的知识转换成一阶谓词逻辑,再用推理引擎对新问题做逻辑推演。它有两个致命缺陷:逻辑语言的表达能力有限,覆盖不了世界上绝大多数信息;知识获取有瓶颈(人工采访专家再转写成逻辑,低效且效果差)。专家系统最终无法兑现承诺,**直接导致了 80-90 年代的 AI 寒冬**。这个阶段的总结性著作是 1995 年 Russell 和 Norvig 的《人工智能:一种现代方法》——苏玉说那本书本质上就是一本关于 Agent 的书。

**② 神经网络 Agent(2000-2020)**。深度强化学习路线,代表是 AlphaGo 和各类游戏 AI。参数规模千万到一亿级,只能适配单一或同类游戏,通用性和样本效率都很差(简单游戏也要数百万局训练才能收敛),推理是隐式的。苏玉特别提到,同期 NLP 领域发展出的**语义解析**方向(把人类语言转成机器能懂的语义表达,对接知识图谱/数据库/网站)其实扩大了 Agent 的动作空间,而很多语义解析出身的研究者,后来都成了 LLM 和 Agent 领域的核心贡献者——他本人就是其中之一。

**③ Language Agent(2020 之后)**。ChatGPT 诞生后,基于大语言模型的新一代 Agent 被定义为 Language Agent:核心特点是用**语言作为脚手架**,完成感知、推理、执行全流程。为什么语言这么关键?苏玉给了一个我认为很妙的类比:**语言的出现极大加速了人类演化,Language Agent 的出现也成为 AI 演化的爆炸式加速点**。

## 03 近三年:Language Agent 怎么一路走到 OpenClaw

苏玉按年份梳理了近三年 Language Agent 的关键节点,我整理成一条时间线:

<svg viewBox="0 0 960 340" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="a2" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#a2)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 2</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">近三年 LANGUAGE AGENT 演化时间线</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <line x1="120" y1="180" x2="880" y2="180" stroke="#504e49" stroke-width="1.4"/>
  <g font-family="JetBrains Mono, Consolas, monospace" font-size="14" fill="#1B365D" font-weight="600">
    <circle cx="170" cy="180" r="6" fill="#1B365D"/><text x="170" y="156" text-anchor="middle">2022</text>
    <circle cx="390" cy="180" r="6" fill="#1B365D"/><text x="390" y="156" text-anchor="middle">2023</text>
    <circle cx="600" cy="180" r="6" fill="#1B365D"/><text x="390" y="156" text-anchor="middle"></text>
    <circle cx="600" cy="180" r="6" fill="#1B365D"/><text x="600" y="156" text-anchor="middle">2024</text>
    <circle cx="820" cy="180" r="7" fill="#b08442"/><text x="820" y="156" text-anchor="middle">2025-26</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif" font-size="13.5" fill="#504e49">
    <text x="170" y="206" text-anchor="middle">CoT(思维链)</text>
    <text x="170" y="222" text-anchor="middle">ReAct(姚顺宇)</text>
    <text x="170" y="238" text-anchor="middle">LLM Planner/SayCan</text>
    <text x="170" y="254" fill="#6b6a64" text-anchor="middle" font-size="12.5">自适应推理 + 带环境的 Agent</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif" font-size="13.5" fill="#504e49">
    <text x="390" y="206" text-anchor="middle">Toolformer(Meta)</text>
    <text x="390" y="222" text-anchor="middle">AutoGPT(18 万星)</text>
    <text x="390" y="238" text-anchor="middle">GPT-4V · MMMU</text>
    <text x="390" y="254" text-anchor="middle">WebArena</text>
    <text x="390" y="270" fill="#6b6a64" text-anchor="middle" font-size="12.5">LLM 操作软件 + 多模态 + 基准</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif" font-size="13.5" fill="#504e49">
    <text x="600" y="206" text-anchor="middle">OSWorld(港大)</text>
    <text x="600" y="222" text-anchor="middle">UGround(OSU)</text>
    <text x="600" y="238" text-anchor="middle">视觉 + 像素级动作</text>
    <text x="600" y="254" fill="#6b6a64" text-anchor="middle" font-size="12.5">Agent 像人一样用电脑</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif" font-size="14" fill="#b08442" font-weight="600">
    <text x="820" y="206" text-anchor="middle">OpenClaw 爆火</text>
    <text x="820" y="222" text-anchor="middle" fill="#504e49" font-weight="400">编码能力突破</text>
    <text x="820" y="238" text-anchor="middle" fill="#504e49" font-weight="400">云端编码 Agent</text>
    <text x="820" y="254" fill="#6b6a64" text-anchor="middle" font-size="12.5">Agent 的 ChatGPT 时刻</text>
  </g>
  <line x1="60" y1="296" x2="900" y2="296" stroke="#e8e6dc"/>
  <text x="60" y="322" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">读图:2022 解决“能推理 + 带环境”,2023 解决“能用工具 + 多模态 + 有基准”,2024 解决“能像人操作电脑”,2025-26 编码突破后引爆 OpenClaw。每一年都在补上一块能力。</text>
</svg>

几个值得记的点:2022 年姚顺宇的 **ReAct**(把思维链扩展到带外部环境的 Agent)影响深远;2023 年 Meta 的 **Toolformer**(第一个用 LLM 操作软件)当时被微软 CTO 全公司传阅,同年 **AutoGPT** 开源爆火、成为 GitHub 历史上 star 增长最快的仓库(最高 18 万星);2024 年 OSU 的 **UGround** 提出"Agent 要像人一样用电脑",用视觉感知 + 像素级动作的方案——后来的 OpenAI Operator、OpenClaw 都采用了这套思路。

苏玉有个判断我觉得很准:**早期把 Agent 分成 Web Agent / Computer Use Agent / Coding Agent 是临时性的,最终都会收敛到"通用数字智能体"**。编程语言本身就是语言,Coding Agent 本质就属于 Language Agent,边界最终会逐步消弭。

## 04 OpenClaw:Agent 的 ChatGPT 时刻

2026 年初 OpenClaw 爆火,苏玉认为它和 ChatGPT 时刻**高度相似**:底层技术在爆火前已经发展成熟,真正引爆的是**交互形式的变革**——支持在即时通讯软件里交互、有 24 小时在线的独立运行环境、完全放开权限开源。这些让大众第一次直接摸到了 Agent 的能力,和 ChatGPT 当年让大众摸到对话能力的路径完全一致。

这次爆火已经深刻改变了全球科技公司的技术路线:OpenAI 全面转向 Agent,英伟达喊出"每个企业都需要 Agent 战略",国内大厂动作也很快,一定程度上还影响了劳动力市场的调整。

一个有意思的差异:**OpenClaw 在美国主要在开发者群体里火,在中国则更出圈、全民关注**。苏玉的解释是:中国应用层落地速度本来就快于美国,现在大模型能力已经越过"可用阈值",中国在应用层挖掘价值上有更大优势。

## 05 下一步:专家智能体

聊完过去和现在,苏玉对自己创业方向(也是他认为的下一步)的判断,是我听下来最有价值的部分。

**先说问题**:当前主流 Agent 做任务的成功率大概只有 **60%-70%**,不稳定、效率低、token 成本高。根因是什么?苏玉的判断很直接:**Agent 没有学会对应领域的"专业世界模型",所以达不到人类专家接近 100% 的成功率**。

<svg viewBox="0 0 960 340" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="a3" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#a3)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 3</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">专家智能体路径:持续学习 → 广义世界模型 → 专家</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="60" y="100" width="230" height="120" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="175" y="128" fill="#141413" font-size="17" text-anchor="middle">当前 Agent</text>
    <text x="175" y="156" fill="#b08442" font-size="25" text-anchor="middle" font-weight="600">60-70%</text>
    <text x="175" y="180" fill="#6b6a64" font-size="14" text-anchor="middle">成功率</text>
    <text x="175" y="200" fill="#6b6a64" font-size="13.5" text-anchor="middle">没学会专业世界模型</text>
  </g>
  <g stroke="#504e49" stroke-width="1.4" fill="none"><path d="M295 160 L340 160"/><path d="M336 156 L340 160 L336 164"/></g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="345" y="100" width="270" height="120" rx="8" fill="#E4ECF5" stroke="#1B365D" stroke-width="1.2"/>
    <text x="480" y="128" fill="#1B365D" font-size="17" text-anchor="middle">持续学习广义世界模型</text>
    <line x1="375" y1="140" x2="585" y2="140" stroke="#e8e6dc"/>
    <text x="480" y="166" fill="#504e49" font-size="14.5" text-anchor="middle">广义世界模型 ≠ 只有物理视觉</text>
    <text x="480" y="186" fill="#504e49" font-size="14.5" text-anchor="middle">含组织架构/工作流程/规则</text>
    <text x="480" y="206" fill="#6b6a64" font-size="13.5" text-anchor="middle">千脑智能启发 · 通用持续学习方法</text>
  </g>
  <g stroke="#504e49" stroke-width="1.4" fill="none"><path d="M620 160 L665 160"/><path d="M661 156 L665 160 L661 164"/></g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="670" y="100" width="230" height="120" rx="8" fill="#b08442"/>
    <text x="785" y="128" fill="#faf9f5" font-size="17" text-anchor="middle">专家智能体</text>
    <text x="785" y="158" fill="#fff" font-size="25" text-anchor="middle" font-weight="600">~100%</text>
    <text x="785" y="182" fill="#fff" font-size="14" text-anchor="middle">专家级成功率</text>
    <text x="785" y="202" fill="#fff" font-size="13.5" text-anchor="middle">任意领域快速生成</text>
  </g>
  <line x1="60" y1="258" x2="900" y2="258" stroke="#e8e6dc"/>
  <text x="60" y="286" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">读图:当前 Agent 卡在“似是而非”(60-70%),苏玉认为根因是没学会专业领域世界模型。他的路线是用通用持续学习方法掌握广义世界模型,最终生成任意领域的专家 Agent。</text>
  <text x="60" y="308" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">关键洞察:可靠性本质是能力问题——实习生更易出错,专家很少出错。Agent 也一样。</text>
</svg>

这里有两个关键概念:

**广义世界模型**。现在行业一说 world model,普遍局限在物理世界的视觉(下一帧预测、三维重建、路径规划)。但苏玉认为广义的 world model 是**人类智能的核心组成部分**,包含所有领域微观世界的规律——公司组织架构、工作流程、人际交互规则,都是 world model,不局限于视觉。他的公司名 NeoCognition 就来自 Jeff Hawkins《千脑智能》的理论:人脑新皮层有约 15 万个皮质柱,每个的核心功能都是学习世界模型。

**持续学习**。苏玉的判断是:持续学习的核心目标,就是学习广义的世界模型——所以这俩本质上是同一件事。现有的两条主流训练范式(RL 后训练、非参数化的 markdown 技能/自动 harness)都没真正解决这个问题。他的目标是做一套**通用的持续学习方法**,能针对任意领域快速生成专家 Agent,而不是只做某一个垂直领域。

有个洞察我很认同:**Agent 的可靠性问题,本质是能力问题**。和人类一样,实习生更容易出错、专家很少出错——Agent 不稳定,是因为它还不熟悉任务,没把任务知识转化成自身的专业能力。

## 06 行业格局与机会

苏玉对格局的判断:

**大厂布局**:当前 **Anthropic 在 Agent 领域一家独大**,给行业打了样,全球都在抄它的作业;OpenAI 在向 Agent 方向收束;Google 模型强、生态好但 adoption 偏弱;XAI 成立专门团队做 computer use(走类似特斯拉 FSD 的端到端视觉路线);贝索斯的普罗米修斯项目融了 60-70 亿美金,布局 computer use、偏制造物流基建。国内字节做了 UI tours、豆包手机端有布局,智谱的 AutoGLM 是国内较早的 computer use agent。

**普通人的机会在哪?** 苏玉的判断很鼓励人:**超级通用 Agent 更适合大模型公司做,但这个世界由几百万个垂直小世界组成**,每个领域、每个企业、甚至每个工具都需要专业化的 Agent。大模型公司天然倾向做平台型通用产品,组织架构和商业模式都不适合做专业化——所以非模型厂商和普通人都有大量机会。

**GUI 会不会被 CLI 取代?** 苏玉的判断是不会:**GUI 永远不会消失**(人是视觉动物,图形接口处理信息更快,且在验证、审计、获取信任上不可替代)。Agent 必须兼容 GUI,因为 GUI 是数字世界事实上的标准接口(99% 的服务都有 GUI),里面已经编码了大量知识和业务逻辑,Agent 直接复用比自己重新造 CLI/API 强得多,还能覆盖大量长尾场景。历史教训:语义网推了二十多年都没普及,社会系统迭代极慢,CLI 不可能全面取代 GUI。

## 07 结语:研究者的责任与未来

最后苏玉聊到 Agent 研究者的责任,我觉得是这期访谈最有温度的部分。

他说当前技术进步速度过快,**失业速度可能超过新工作岗位产生的速度**,Agent 研究者的责任是降低 Agent 的使用门槛、推动技术民主化,让每个有想法的人都能用 Agent 创造价值,**避免技术被少数巨头垄断**。

对未来的判断:可预见的未来里不会出现"AI 产生原生意图消灭人类"这种存在性风险(AI 的所有目标都是人类赋予的),但 AI 确实会带来结构性影响,**最大的问题是知识工作者岗位被替代**——如果没有足够的新岗位、也没有合理的收益再分配机制,会变成严重的社会问题。

> 让机器去理解人的语言、理解人的想法,而不是让人去像机器一样思考。

这是苏玉入行时的初心(他做语义解析,就是因为不满"人逐渐变成数字世界的奴隶"),也是 Agent 这条路最终要回答的问题。

---

**素材来源**:晓珺对话苏玉《AI Agent 创业与技术方向访谈》(2026-05-01);苏玉个人博客;Jeff Hawkins《千脑智能》
