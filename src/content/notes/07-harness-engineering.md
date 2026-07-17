---
title: "Harness Engineering:让 AI Agent 在真实世界稳定工作"
deck: "一份关于 AI Agent 稳定性的读书笔记——从 Prompt 到 Context 到 Harness,模型定上限,Harness 定落地。"
date: 2026-07-17
type: "读书·播客"
tags: ["AI", "Agent"]
readtime: "约 12 分钟"
---

前段时间看到关于 **Harness Engineering** 的讲解视频,很有启发。它回答了一个困扰很多做 Agent 的人的问题:**为什么同样的模型,别人做的 Agent 能稳定跑很久、成功率很高,到自己手里就总差强人意?** 

## 01 一个反直觉的案例

视频开头讲了个真实案例,很能说明问题。

有个团队做 Agent,为了提效果已经拼尽全力:换上最好的旗舰模型、提示词改了上百版、各种参数调了个遍。结果一进真实场景,任务成功率还是**不到 70%**——时灵时不灵,莫名跑偏。

后来视频分享者协助调整,**改动最大的地方反而不是模型,也不是提示词**,而是:任务怎么拆、状态怎么管、关键步骤怎么校验、失败后怎么恢复。新版本上线,**同样的模型、同样的提示词,成功率拉到 95% 以上**。

改的部分,有一个统一的名字:**Harness**(原义是缰绳、马具、约束装置)。这个案例点破了一个被忽视的真相:**真正决定 Agent 能不能稳定跑起来的,往往不是模型本身,而是模型工程化运行系统。**

## 02 AI 工程三阶段:Prompt → Context → Harness

AI 工程三阶段演进，Prompt Engineering、Context Engineering、Harness Engineering 三个范式——它们分别解决什么问题、如何演进。

<svg viewBox="0 0 960 360" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="h1" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#h1)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 1</text>
  <text x="190" y="38" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">AI 工程三次重心迁移 · 问题逐层向外</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="80" y="86" width="240" height="170" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="200" y="116" fill="#141413" font-size="18" text-anchor="middle">Prompt</text>
    <text x="200" y="142" fill="#6b6a64" font-size="11.5" text-anchor="middle">提示词工程</text>
    <line x1="110" y1="156" x2="290" y2="156" stroke="#e8e6dc"/>
    <text x="200" y="182" fill="#1B365D" font-size="13" text-anchor="middle">问题:模型听懂了吗?</text>
    <text x="200" y="208" fill="#504e49" font-size="11.5" text-anchor="middle">塑造局部概率空间</text>
    <text x="200" y="228" fill="#504e49" font-size="11.5" text-anchor="middle">核心能力:语言设计</text>
    <text x="200" y="248" fill="#b08442" font-size="11" text-anchor="middle">天花板:解决表达,不解决信息</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="350" y="86" width="240" height="170" rx="8" fill="#E4ECF5" stroke="#1B365D" stroke-width="1.2"/>
    <text x="470" y="116" fill="#1B365D" font-size="18" text-anchor="middle">Context</text>
    <text x="470" y="142" fill="#6b6a64" font-size="11.5" text-anchor="middle">上下文工程</text>
    <line x1="380" y1="156" x2="560" y2="156" stroke="#e8e6dc"/>
    <text x="470" y="182" fill="#1B365D" font-size="13" text-anchor="middle">问题:信息够不够、对不对?</text>
    <text x="470" y="208" fill="#504e49" font-size="11.5" text-anchor="middle">合适时机送对信息(RAG/Skills)</text>
    <text x="470" y="228" fill="#504e49" font-size="11.5" text-anchor="middle">渐进式披露:按需给、分层给</text>
    <text x="470" y="248" fill="#b08442" font-size="11" text-anchor="middle">天花板:信息对了也可能执行跑偏</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="620" y="86" width="280" height="170" rx="8" fill="#b08442"/>
    <text x="760" y="116" fill="#faf9f5" font-size="18" text-anchor="middle">Harness</text>
    <text x="760" y="142" fill="#faf9f5" font-size="11.5" text-anchor="middle">运行系统工程</text>
    <line x1="650" y1="156" x2="870" y2="156" stroke="#d8d2bf"/>
    <text x="760" y="182" fill="#faf9f5" font-size="13" text-anchor="middle">问题:执行中能不能持续做对?</text>
    <text x="760" y="208" fill="#fff" font-size="11.5" text-anchor="middle">驾驭整个执行:不跑偏、跑得稳</text>
    <text x="760" y="228" fill="#fff" font-size="11.5" text-anchor="middle">出错能拉回 · 决定能否落地</text>
    <text x="760" y="248" fill="#fff" font-size="11" text-anchor="middle">Agent = Model + Harness</text>
  </g>
  <text x="60" y="288" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">读图:三者是包含关系,边界逐层扩大。Prompt 优化指令,Context 优化输入环境,Harness 优化整个运行系统。前两个主要解决“输入侧”,Harness 解决“执行侧”。</text>
  <text x="60" y="310" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">通俗类比——派新人去客户拜访:Prompt=把见面流程讲清楚;Context=备齐客户背景/报价/竞品;Harness=带 checklist、关键节点汇报、会后核实、偏差纠正、标准验收。</text>
</svg>

- **Prompt(提示词工程)**:解决"模型听懂没"。本质是用语言设计塑造一个局部概率空间——给它什么身份、什么示例、什么约束,它就沿着那个方向生成。天花板:**它解决的是表达问题,不是信息问题**。提示词写得再漂亮,也替代不了事实本身。
- **Context(上下文工程)**:解决"信息够不够、对不对"。Agent 进真实环境做事,要在合适时机把正确信息送进去(RAG、Agent Skills)。一个关键思路是**渐进式披露**:不一开始把所有工具信息全塞给模型,而是需要时动态加载——上下文优化不是"给的更多",而是"按需给、分层给、在对的时机给"。
- **Harness(运行系统工程)**:解决"执行中能不能持续做对"。就算信息给对了,模型也可能计划对、执行跑偏,或在长链路里慢慢偏航而系统没发现。Harness 驾驭整个执行:**不跑偏、跑得稳、出错能拉回**。

LangChain 工程师给了个简洁定义:**Agent = Model + Harness**,即 Harness = Agent - Model——Agent 系统里除模型本身外、所有决定能否稳定交付的东西。

## 03 ## 技术演进的宏观视角：跨越裂谷

我自己有个强烈感受:这套演化可以用 Geoffrey Moore 的《Crossing the Chasm》(跨越裂谷)来理解。

任何新技术从早期市场(技术爱好者、远见者)走向主流市场(实用主义者),中间都有一道**裂谷带**——很多技术就死在这道沟里,跨不过去就进不了大众。

大模型正卡在这道裂谷上:Prompt 和 Context 让模型在早期采用者手里玩得转(酷炫的 demo),但要进入主流市场、做大规模稳定落地,就撞上"真实世界稳定工作"这道墙。**Harness 正是跨过裂谷的那把钥匙**——它解决的是从"看起来聪明"到"可靠交付"的最后一公里。这也解释了为什么 Harness 这个词前段时间突然火起来:不是空谈方法论,而是 OpenAI、Anthropic 这些公司已经把它做进了产品和工程体系。

## 04 Harness 的六层结构

一个成熟的 Harness 可以拆成六层:

<svg viewBox="0 0 960 520" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="h2" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#h2)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 2</text>
  <text x="190" y="38" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">成熟 Harness 的六层结构</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="80" y="74" width="60" height="56" rx="5" fill="#1B365D"/><text x="110" y="108" fill="#faf9f5" font-size="20" text-anchor="middle">①</text>
    <text x="160" y="96" fill="#141413" font-size="15">信息边界管理</text>
    <text x="160" y="118" fill="#6b6a64" font-size="11.5">让模型在正确的信息边界内思考:角色目标 · 裁剪选择 · 结构化分层</text>

    <rect x="80" y="142" width="60" height="56" rx="5" fill="#1B365D"/><text x="110" y="176" fill="#faf9f5" font-size="20" text-anchor="middle">②</text>
    <text x="160" y="164" fill="#141413" font-size="15">工具系统</text>
    <text x="160" y="186" fill="#6b6a64" font-size="11.5">连真实世界做事:给什么工具 · 何时调用 · 结果提炼筛选</text>

    <rect x="80" y="210" width="60" height="56" rx="5" fill="#1B365D"/><text x="110" y="244" fill="#faf9f5" font-size="20" text-anchor="middle">③</text>
    <text x="160" y="232" fill="#141413" font-size="15">执行编排</text>
    <text x="160" y="254" fill="#6b6a64" font-size="11.5">预设执行轨道:理解目标→补信息→分析→生成→检查→修正重试</text>

    <rect x="80" y="278" width="60" height="56" rx="5" fill="#1B365D"/><text x="110" y="312" fill="#faf9f5" font-size="20" text-anchor="middle">④</text>
    <text x="160" y="300" fill="#141413" font-size="15">记忆与状态管理</text>
    <text x="160" y="322" fill="#6b6a64" font-size="11.5">分清三类:当前任务状态 · 会话中间结果 · 长期记忆与偏好</text>

    <rect x="80" y="346" width="60" height="56" rx="5" fill="#b08442"/><text x="110" y="380" fill="#faf9f5" font-size="20" text-anchor="middle">⑤</text>
    <text x="160" y="368" fill="#141413" font-size="15">评估和观测</text>
    <text x="160" y="390" fill="#6b6a64" font-size="11.5">让系统知道自己做对没:输出验收 · 环境验证 · 自动测试 · 错误归因(最易被忽视)</text>

    <rect x="80" y="414" width="60" height="56" rx="5" fill="#b08442"/><text x="110" y="448" fill="#faf9f5" font-size="20" text-anchor="middle">⑥</text>
    <text x="160" y="436" fill="#141413" font-size="15">约束、校验、失败恢复</text>
    <text x="160" y="458" fill="#6b6a64" font-size="11.5">决定能否上线:可做/不可做约束 · 输出前后校验 · 失败重试与状态回滚</text>
  </g>
  <line x1="60" y1="486" x2="900" y2="486" stroke="#e8e6dc"/>
  <text x="60" y="508" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">读图:前四层是“让模型能稳定干活”,后两层(⑤⑥,暖色)是“让系统知道自己对不对、错了能恢复”——这两层最容易被忽视,却最决定能否上线。</text>
</svg>

逐层说:

**① 信息边界管理**——让模型在正确的边界内思考。包括:角色目标定义(你是谁、任务是什么、成功标准)、信息裁剪(不是越多越好,是越相关越好)、结构化分层(规则放哪、任务放哪、状态放哪、证据放哪)。信息一乱,模型就漏重点、忘约束、自我污染。

**② 工具系统**——让模型连真实世界做事。要解决三个问题:给什么工具(太少能力不够,太多会乱用)、何时调用(不该查别乱查)、工具结果怎么喂回(几十条搜索结果别原封不动塞回去,要提炼筛选)。

**③ 执行编排**——解决"下一步做什么"。很多 Agent 的问题不是某步不会,而是不会把步骤串起来,想到哪做到哪,交付一堆半成品。要预设执行轨道:理解目标→判断信息够不够→补充→分析→生成→检查→不满足就修正重试。

**④ 记忆与状态管理**——无状态的 Agent 每轮都像失忆。要分清三类:当前任务状态、会话中间结果、长期记忆与用户偏好。混在一起系统会越来越乱。

**⑤ 评估和观测**——**这是很多团队最容易忽视的一层**。很多系统不是生成不出来,而是生成完不知道自己做的好不好。没有独立评估,Agent 就长期停留在"自我感觉良好"。包括输出验收、环境验证、自动测试、日志指标、错误归因——让系统不仅会做,还能知道自己有没有做对。

**⑥ 约束、校验、失败恢复**——**决定系统能否上线的关键**。真实环境里失败是常态(搜索不准、API 超时、文档混乱、模型误解)。成熟 Harness 要有:明确的可做/不可做约束、输出前后的校验、失败后的重试与状态回滚。

前四层是"让模型能稳定干活",后两层(⑤⑥)是"让系统知道自己对不对、错了能恢复"。**很多团队卡住,就是只做了前四层、忽视了后两层**——这恰恰是 70% 和 95% 的分水岭。

## 05 一线公司怎么落地

最有参考价值的是一线公司的真实实践,它们已经把 Harness 做进产品和工程体系。

**Anthropic 的两个典型解法**:
- **上下文焦虑**:长任务跑久了上下文占满,模型会丢细节、甚至提前着急收尾。光压缩上下文不够(负担感没消失),他们的解法是 **context reset**——换一个全新的干净 Agent 接力交接,像内存泄漏后直接重启进程再恢复状态。
- **自评失真**:模型给自己打分偏乐观,无标准答案的问题更明显。解法是 **生产验收分离**:planner(把需求扩成完整规格)、generator(逐步实现)、evaluator(像 QA 一样真实测试,操作页面、检查交互)。关键原则:**评估者要足够独立,系统才能形成"生成-检查-修复"的有效循环**。

**OpenAI 的几个实践**:
- **重新定义工程师**:人类不写代码,只负责设计环境——拆任务、Agent 失败时定位"环境缺了什么能力"、建反馈链路让 Agent 看到自己的结果。修 Agent 的核心从来不是"让它更努力",而是补缺失的结构性能力。
- **渐进式披露**:早期把所有规范塞进一个巨大文档,Agent 反而更糊涂(上下文塞满等于什么都没说)。后来改成目录页 + 子文档,Agent 先看目录、需要时再钻进去。
- **Agent 自主验证**:产研速度上来,瓶颈从"写"变成"验",人类验不过来。于是给 Agent 接浏览器(截图、点页面)、接日志指标、跑在隔离环境,让它自己跑结果、找 bug、修 bug、再验证。
- **自动治理系统**:Agent 提交太快,人类 code review 兜不住。于是把资深工程师的经验写成系统规则,不只拦截错误,还把"怎么修"反馈给 Agent 进下一轮上下文——一套可持续运行的自动治理。

**LongChat 的成果**最直观:底层模型完全不变,只改造 Harness,智能体榜单排名从 30 名外直接杀到**前五**。这大概是 Harness 价值最硬的证据。

## 06 什么场景用什么

场景划分:

<svg viewBox="0 0 960 320" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="h3" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#h3)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 3</text>
  <text x="190" y="38" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">场景与方法的对应</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="60" y="80" width="270" height="130" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="195" y="112" fill="#141413" font-size="15" text-anchor="middle">简单单轮生成</text>
    <line x1="90" y1="124" x2="300" y2="124" stroke="#e8e6dc"/>
    <text x="195" y="152" fill="#1B365D" font-size="14" text-anchor="middle">→ Prompt 最重要</text>
    <text x="195" y="178" fill="#6b6a64" font-size="11" text-anchor="middle">把话说明白就行</text>
    <text x="195" y="196" fill="#6b6a64" font-size="11" text-anchor="middle">例:写封邮件、总结一段话</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="345" y="80" width="270" height="130" rx="8" fill="#E4ECF5" stroke="#1B365D" stroke-width="1.2"/>
    <text x="480" y="112" fill="#1B365D" font-size="15" text-anchor="middle">依赖外部知识</text>
    <line x1="375" y1="124" x2="585" y2="124" stroke="#e8e6dc"/>
    <text x="480" y="152" fill="#1B365D" font-size="14" text-anchor="middle">→ Context 最关键</text>
    <text x="480" y="178" fill="#6b6a64" font-size="11" text-anchor="middle">把信息给对(RAG/Skills)</text>
    <text x="480" y="196" fill="#6b6a64" font-size="11" text-anchor="middle">例:查文档答产品配置</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="630" y="80" width="270" height="130" rx="8" fill="#b08442"/>
    <text x="765" y="112" fill="#faf9f5" font-size="15" text-anchor="middle">长链路 · 低容错</text>
    <line x1="660" y1="124" x2="870" y2="124" stroke="#d8d2bf"/>
    <text x="765" y="152" fill="#faf9f5" font-size="14" text-anchor="middle">→ Harness 必不可少</text>
    <text x="765" y="178" fill="#fff" font-size="11" text-anchor="middle">真实落地场景的核心</text>
    <text x="765" y="196" fill="#fff" font-size="11" text-anchor="middle">例:自主写代码、跑业务流程</text>
  </g>
  <line x1="60" y1="240" x2="900" y2="240" stroke="#e8e6dc"/>
  <text x="60" y="268" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">读图:不是所有任务都需要全套 Harness。简单任务靠 Prompt 就够,知识密集任务靠 Context,只有长链路、低容错的真实落地场景,Harness 才是核心。</text>
  <text x="60" y="290" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">这也是为什么“同样的模型在不同产品里表现差距很大”——差距往往不在模型,在 Harness。</text>
</svg>

不是所有任务都需要全套 Harness:简单的单轮生成,Prompt 就够;依赖外部知识的任务,Context 最关键;**只有长链路、低容错的真实落地场景,Harness 才是必不可少的核心**。这也解释了为什么"同样的模型在不同产品里表现差距很大"——差距往往不在模型,在 Harness。

## 07 结语:模型定上限,Harness 定落地

**真正决定 AI 系统上限的是模型能力,但真正决定它能否落地、能否稳定交付的,是 Harness。**

AI 落地的核心挑战,已经从"让模型看起来更聪明",转向"让模型在真实世界里稳定工作"。不能只盯着模型和提示词,"模型外面的运行系统"才是从 70% 到 95% 的关键。

> 如果前两代工程关注的是怎么让模型更会想,那 Harness 更关注的就是:怎么让模型别跑偏、跑得稳,出了错还能拉回来。

---

**素材来源**:花园老师《Harness Engineering 解析:AI Agent 稳定运行的核心》(柯南秘密花园分享,2026-04-03);Anthropic / OpenAI 公开实践;Geoffrey Moore《Crossing the Chasm》
