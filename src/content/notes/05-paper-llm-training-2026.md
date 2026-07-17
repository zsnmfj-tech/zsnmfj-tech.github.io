---
title: "大模型训练范式综述:从预训练到 RLVR"
deck: "拆解主流大模型训练的两段式流程——预训练打地基,后训练塑行为;讲清对齐方法从 RLHF 到 RLVR 的演化逻辑。"
date: 2026-07-16
type: "论文"
tags: ["大模型", "训练"]
readtime: "约 15 分钟"
---

架构决定了模型"能做什么",训练决定了模型"做成什么样"。上一篇讲了主流架构,这篇讲主流训练。一个大模型从无到有,基本是两段式:**预训练打地基**(让模型获得语言和知识能力),**后训练塑行为**(让模型会好好回答、会思考)。这篇系统讲清这两段,以及后训练方法这几年从 RLHF 演化到 RLVR 的内在逻辑。

## 01 引言:训练的两段式

主流大模型的训练,可以简单看成两个目标分两段完成:

- **能力**:模型要"有本事"——懂语言、有知识、会推理。这一段叫**预训练**。
- **对齐**:模型要"听指挥"——问什么答什么、不说脏话、不胡编、按要求格式输出。这一段叫**后训练(对齐)**。

这两个目标其实是存在矛盾的:预训练追求"把全网数据学全",后训练追求"在特定场景下表现得当"。所以它们分开做——预训练先让模型变强,后训练再引导到正确的方向。

<svg viewBox="0 0 960 280" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="t1" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#t1)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 1</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">主流训练的两段式</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="60" y="90" width="200" height="90" rx="8" fill="#1B365D"/>
    <text x="160" y="120" fill="#faf9f5" font-size="20" text-anchor="middle">预训练</text>
    <text x="160" y="142" fill="#d8d2bf" font-size="14.5" text-anchor="middle">海量文本 · 预测下一个词</text>
    <text x="160" y="162" fill="#b08442" font-size="14.5" text-anchor="middle">目标:获得能力</text>
    <line x1="265" y1="135" x2="305" y2="135" stroke="#504e49" stroke-width="1.4"/><path d="M301 131 L305 135 L301 139" fill="none" stroke="#504e49" stroke-width="1.4"/>
    <rect x="310" y="90" width="150" height="90" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="385" y="120" fill="#141413" font-size="18" text-anchor="middle">SFT 指令微调</text>
    <text x="385" y="142" fill="#6b6a64" font-size="14" text-anchor="middle">教它“按指令回答”</text>
    <text x="385" y="162" fill="#6b6a64" font-size="14" text-anchor="middle">目标:会对话</text>
    <line x1="465" y1="135" x2="505" y2="135" stroke="#504e49" stroke-width="1.4"/><path d="M501 131 L505 135 L501 139" fill="none" stroke="#504e49" stroke-width="1.4"/>
    <rect x="510" y="90" width="200" height="90" rx="8" fill="#b08442"/>
    <text x="610" y="120" fill="#faf9f5" font-size="20" text-anchor="middle">对齐(RLHF/DPO/RLVR)</text>
    <text x="610" y="142" fill="#faf9f5" font-size="14.5" text-anchor="middle">奖励 / 偏好 / 可验证</text>
    <text x="610" y="162" fill="#faf9f5" font-size="14.5" text-anchor="middle">目标:听指挥、变安全</text>
    <line x1="715" y1="135" x2="755" y2="135" stroke="#504e49" stroke-width="1.4"/><path d="M751 131 L755 135 L751 139" fill="none" stroke="#504e49" stroke-width="1.4"/>
    <rect x="760" y="90" width="140" height="90" rx="8" fill="#1B365D"/>
    <text x="830" y="120" fill="#faf9f5" font-size="18" text-anchor="middle">部署</text>
    <text x="830" y="142" fill="#d8d2bf" font-size="14" text-anchor="middle">（可选：蒸馏</text>
    <text x="830" y="158" fill="#d8d2bf" font-size="14" text-anchor="middle">到小模型）</text>
  </g>
  <text x="160" y="208" fill="#504e49" font-size="14.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">最贵 · 几周到几月</text>
  <text x="385" y="208" fill="#504e49" font-size="14.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">较便宜</text>
  <text x="610" y="208" fill="#504e49" font-size="14.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">中等到较贵</text>
  <text x="830" y="208" fill="#504e49" font-size="14.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">便宜</text>
  <line x1="60" y1="232" x2="900" y2="232" stroke="#e8e6dc"/>
  <text x="60" y="258" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">读图:预训练最贵(海量数据 + 巨大算力),决定模型能力上限;SFT 和对齐相对便宜,决定模型行为。近年来最强的变化都发生在最右边那块(对齐)。</text>
</svg>

有意思的是,近几年训练侧最大的变化,几乎都发生在最右边那块(对齐)。下面逐段讲。

## 02 预训练:预测下一个词

预训练的目标简单到让人怀疑:**预测下一个词**(next token prediction)。给模型一段文本的前 N 个词,让它猜第 N+1 个,猜错就调整参数。

为什么这么简单的目标能涌现出推理、写代码、做类比这些复杂能力?至今没有完全的理论解释,但经验上:**只要模型足够大、数据足够多,这种"猜下一个词"的训练会自发涌现出各种能力**。模型为了把下一个词猜准,被迫学会了语法、事实、逻辑、甚至推理。

支撑这套做法的是 **Scaling Law(缩放定律)**:模型能力随参数量、数据量、算力呈可预测的幂律提升。这条经验定律是过去几年"把模型做大"的根本依据——只要按比例放大,能力就会跟着涨(尽管最近争议它在某些维度上是否在放缓)。

预训练的工程现实是:**很贵**。要训一个旗舰模型,需要万亿级的 token、几千张 GPU、跑几周到几个月,成本动辄上千万美元。这也是为什么预训练的优化(数据质量、训练效率、更省的架构如 MoE)这么受重视——每省一点,就是大笔钱。

## 03 后训练:为什么要对齐

预训练完的模型,只是个强大的"续写机器":你给它"中国的首都是",它续写"北京";但你给它"请用三句话介绍量子力学",它可能续写出一段奇怪的、不像回答的内容。因为它学的是"网络文本接下来会接什么",不是"怎么当一个好助手"。

后训练(对齐)要解决的,就是把这个强大的续写机器,引导成一个**会好好回答、符合人类意图、安全可控的助手**。具体要解决几件事:

- **指令遵循**:你说"总结这段话",它真去总结,而不是续写。
- **偏好对齐**:多个合理回答里,选人类更喜欢的那个(更有用、更安全、更诚实)。
- **安全**:不输出有害内容、不胡编(幻觉)。
- **格式/风格**:按要求的格式和语气输出。

怎么做到?核心是给模型一个**信号**,告诉它"这样回答好,那样不好"。这个信号怎么来、怎么用,就是对齐方法的演化主线。

## 04 对齐方法:RLHF → DPO → RLVR

对齐方法这几年演化了三代,每代都在简化上一代、或者解决上一代的痛点。

<svg viewBox="0 0 960 460" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="t2" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#t2)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 2</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">对齐方法三接力</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="60" y="74" width="270" height="40" rx="5" fill="#faf9f5" stroke="#141413"/><text x="195" y="100" fill="#141413" font-size="19" text-anchor="middle">RLHF / PPO</text>
    <text x="60" y="140" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">信号来源</text><text x="60" y="158" fill="#141413" font-size="15">人类打分 → 训奖励模型</text>
    <text x="60" y="186" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">要几个模型</text><text x="60" y="204" fill="#b08442" font-size="15">4 个(策略/参考/奖励/价值)</text>
    <text x="60" y="232" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">痛点</text><text x="60" y="250" fill="#141413" font-size="15">贵、不稳、要大量人工标注</text>
  </g>
  <g stroke="#504e49" stroke-width="1.4" fill="none"><path d="M335 94 L370 94"/><path d="M366 90 L370 94 L366 98"/></g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="375" y="74" width="270" height="40" rx="5" fill="#1B365D"/><text x="510" y="100" fill="#faf9f5" font-size="19" text-anchor="middle">DPO</text>
    <text x="375" y="140" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">信号来源</text><text x="375" y="158" fill="#141413" font-size="15">人类偏好对(好回答 vs 差回答)</text>
    <text x="375" y="186" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">要几个模型</text><text x="375" y="204" fill="#1B365D" font-size="15">2 个(策略/参考)</text>
    <text x="375" y="232" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">改进</text><text x="375" y="250" fill="#141413" font-size="15">干掉奖励模型,离线、稳定</text>
  </g>
  <g stroke="#504e49" stroke-width="1.4" fill="none"><path d="M650 94 L685 94"/><path d="M681 90 L685 94 L681 98"/></g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="690" y="74" width="210" height="40" rx="5" fill="#b08442"/><text x="795" y="100" fill="#faf9f5" font-size="19" text-anchor="middle">GRPO / RLVR</text>
    <text x="690" y="140" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">信号来源</text><text x="690" y="158" fill="#141413" font-size="15">可验证奖励(数学/代码有标准答案)</text>
    <text x="690" y="186" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">要几个模型</text><text x="690" y="204" fill="#b08442" font-size="15">2 个,且奖励不用人</text>
    <text x="690" y="232" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">突破</text><text x="690" y="250" fill="#141413" font-size="15">无需人类反馈,能涌现推理</text>
  </g>
  <line x1="60" y1="285" x2="900" y2="285" stroke="#e8e6dc"/>
  <text x="60" y="312" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">演化逻辑:信号来源从“人类打分”→“人类偏好对”→“机器可验证的标准答案”,需要的模型越来越少、人工标注越来越少、训练越来越自动化。</text>
  <text x="60" y="334" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">关键转折是 RLVR:对数学和代码这类有标准答案的任务,奖励可以自动判定(对就是 1、错就是 0),完全不需要人类反馈。这把对齐从“耗人力”变成了“吃算力”。</text>
  <text x="60" y="356" fill="#b08442" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">代价:RLVR 只适用于有标准答案的领域。开放式对话、价值观对齐,还是离不开人类反馈(或 AI 反馈)。</text>
</svg>

**第一代:RLHF / PPO**。最早的方案(InstructGPT、ChatGPT 用的)。做法是:让人类给模型回答打分 → 用这些打分训练一个"奖励模型" → 再用强化学习(PPO)优化大模型去拿高分。问题是它**很贵**:训练时要同时跑 4 个模型(策略、参考、奖励、价值),不稳,还要大量人工打分数据。

**第二代:DPO(直接偏好优化)**。关键洞察:RLHF 那套"先训奖励模型再强化学习"的流程,其实可以**用数学等价的方式直接转成一个监督学习问题**,绕过奖励模型和 RL。只需要人类标注的"偏好对"(同一个问题的好回答 vs 差回答)。结果:只要 2 个模型、离线、稳定得多,大幅降低了门槛。Llama 3 等很多模型用迭代 SFT + DPO。

**第三代:GRPO / RLVR(可验证奖励的强化学习)**。这是最大的转折。对于**数学、代码这类有标准答案的任务**,奖励可以自动判定——答案对就是 1、错就是 0,根本不需要人类打分。这把对齐从"耗人力"变成了"吃算力"。DeepSeek 用 GRPO 做出了 R1,证明了它的威力。

演化逻辑很清晰:**信号来源越来越自动化**(人类打分 → 偏好对 → 机器可验证),**需要的模型越来越少**,人工标注越来越少。代价是 RLVR 只适用于有标准答案的领域;开放式对话、价值观对齐,还是离不开人类(或 AI)反馈。

## 05 RLVR 与 reasoning 涌现

第三代方法最惊人的发现,是 DeepSeek-R1 揭示的:**纯靠可验证奖励的强化学习,能让模型自发涌现出推理能力**——会自我反思、会换思路、会在思维链里自我检查,而这些行为**从没被显式教过**。

<svg viewBox="0 0 960 400" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="t3" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#t3)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 3</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">RLVR 如何让推理涌现</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="60" y="90" width="140" height="50" rx="6" fill="#1B365D"/><text x="130" y="120" fill="#faf9f5" font-size="17" text-anchor="middle">一个数学/代码题</text>
    <line x1="205" y1="115" x2="245" y2="115" stroke="#504e49" stroke-width="1.2"/><path d="M241 111 L245 115 L241 119" fill="none" stroke="#504e49" stroke-width="1.2"/>
    <rect x="250" y="80" width="180" height="70" rx="6" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="340" y="108" fill="#141413" font-size="16" text-anchor="middle">采样 N 个回答</text>
    <text x="340" y="128" fill="#6b6a64" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">（含思维链）</text>
    <line x1="435" y1="115" x2="475" y2="115" stroke="#504e49" stroke-width="1.2"/><path d="M471 111 L475 115 L471 119" fill="none" stroke="#504e49" stroke-width="1.2"/>
    <rect x="480" y="80" width="180" height="70" rx="6" fill="#E4ECF5" stroke="#1B365D" stroke-width="1.2"/>
    <text x="570" y="108" fill="#1B365D" font-size="16" text-anchor="middle">自动验证(对/错)</text>
    <text x="570" y="128" fill="#6b6a64" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">有标准答案,无需人</text>
    <line x1="665" y1="115" x2="705" y2="115" stroke="#504e49" stroke-width="1.2"/><path d="M701 111 L705 115 L701 119" fill="none" stroke="#504e49" stroke-width="1.2"/>
    <rect x="710" y="80" width="190" height="70" rx="6" fill="#b08442"/>
    <text x="805" y="108" fill="#faf9f5" font-size="16" text-anchor="middle">奖励强化对的回答</text>
    <text x="805" y="128" fill="#faf9f5" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">更新模型</text>
  </g>
  <path d="M805 155 Q 805 200 470 200 Q 130 200 130 145" fill="none" stroke="#504e49" stroke-width="1.2" stroke-dasharray="4 3"/>
  <path d="M126 149 L130 145 L134 149" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="470" y="222" fill="#6b6a64" font-size="14.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">循环 · 模型越来越会做对</text>
  <line x1="60" y1="250" x2="900" y2="250" stroke="#e8e6dc"/>
  <text x="60" y="278" fill="#b08442" font-size="16" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">涌现:没人教过,模型自己学会了</text>
  <text x="60" y="304" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">• 在思维链里自我反思(“等等,这个思路不对,换个方法”)</text>
  <text x="60" y="326" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">• 多步验证、回溯、尝试不同路径</text>
  <text x="60" y="348" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">• 把难题拆成子问题逐步解决</text>
  <text x="60" y="376" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">关键:奖励只看“最终答案对不对”,但模型为了拿分,自发长出了这些推理行为。这就是 reasoning 的“涌现”。</text>
</svg>

机制是这样:给模型一道数学题 → 让它采样很多个带思维链的回答 → 自动验证哪个答案对(有标准答案)→ 强化那些答对的回答。奇妙的是,**奖励信号只看"最终答案对不对",但模型为了拿到奖励,自发长出了反思、回溯、拆解问题这些推理行为**——而这些行为从没被显式教过。这就是 reasoning 的"涌现"。

这一发现的意义在于:它把"教模型推理"这件事,从"需要大量带推理过程的标注数据",变成了"只要有足够多能自动判对错的题"。这极大地降低了训出推理模型的门槛,也是 o1、R1 这类推理模型能做出来的技术基础。

## 06 蒸馏:把大模型能力传给小模型

训出一个强大的推理模型(几百上千亿参数)很贵,而部署它也很贵。**蒸馏**解决的是后一半:让小模型也获得大模型的推理能力。

做法很直觉:用大推理模型生成大量高质量的推理轨迹(思维链),把这些轨迹当成训练数据,去 SFT(监督微调)一个小模型。结果是:小模型虽然参数少得多,但在推理任务上接近大模型的表现。

<svg viewBox="0 0 960 320" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="t4" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#t4)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 4</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">蒸馏:大模型能力 → 小模型</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="80" y="100" width="180" height="100" rx="8" fill="#1B365D"/>
    <text x="170" y="132" fill="#faf9f5" font-size="19" text-anchor="middle">大推理模型</text>
    <text x="170" y="156" fill="#d8d2bf" font-size="14.5" text-anchor="middle">几百亿~千亿参数</text>
    <text x="170" y="178" fill="#b08442" font-size="14.5" text-anchor="middle">能力:会深度推理</text>
    <line x1="265" y1="150" x2="320" y2="150" stroke="#504e49" stroke-width="1.4"/><path d="M316 146 L320 150 L316 154" fill="none" stroke="#504e49" stroke-width="1.4"/>
    <rect x="325" y="110" width="230" height="80" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="440" y="138" fill="#141413" font-size="17" text-anchor="middle">生成海量推理轨迹</text>
    <text x="440" y="160" fill="#6b6a64" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">思维链 · 解题过程</text>
    <line x1="560" y1="150" x2="615" y2="150" stroke="#504e49" stroke-width="1.4"/><path d="M611 146 L615 150 L611 154" fill="none" stroke="#504e49" stroke-width="1.4"/>
    <rect x="620" y="100" width="180" height="100" rx="8" fill="#b08442"/>
    <text x="710" y="132" fill="#faf9f5" font-size="19" text-anchor="middle">小模型(经 SFT)</text>
    <text x="710" y="156" fill="#faf9f5" font-size="14.5" text-anchor="middle">几亿~几十亿参数</text>
    <text x="710" y="178" fill="#faf9f5" font-size="14.5" text-anchor="middle">能力:接近大模型推理</text>
  </g>
  <line x1="60" y1="240" x2="900" y2="240" stroke="#e8e6dc"/>
  <text x="60" y="268" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">意义:推理能力可以被“打包”进小模型,在手机、边缘设备上低成本部署。DeepSeek-R1 就蒸馏出了 1.5B 到 70B 一系列小模型。</text>
  <text x="60" y="290" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">代价:小模型的能力有上限,且学的是大模型的“输出”,很难超过老师。但在性价比上,蒸馏是当前把推理能力落地的最务实路径。</text>
</svg>

意义:推理能力可以被"打包"进小模型,在手机、边缘设备上低成本部署。DeepSeek-R1 就蒸馏出了 1.5B 到 70B 一系列小模型,让推理能力在端侧可用。这是当前把强大能力低成本落地的最务实路径。代价是:小模型能力有上限,学的是大模型的"输出",很难超过老师。

## 07 主流训练流程综合

一个主流大模型从零到部署,大致是这样一条路:

1. **预训练**:海量文本上预测下一个词,获得基础能力。最贵的一段。
2. **SFT(指令微调)**:用"指令-回答"数据教模型按指令对话,让它从续写机器变成助手。
3. **对齐**:用 RLHF/DPO(开放式任务)或 RLVR(有标准答案的任务)做偏好优化,让它更有用、更安全、更会推理。
4. (可选)**蒸馏**:把大模型能力传给小模型,便于部署。

这几步的相对成本和作用各不相同:预训练决定能力上限(最贵),SFT 和对齐决定行为质量(相对便宜但很关键),蒸馏决定落地成本。近几年最活跃的创新,几乎都集中在对齐这一段——因为它是性价比最高的能力提升点。

## 08 演化方向

训练范式还在快速演化,几个明显方向:

- **self-play / AI 反馈**:用模型自己生成数据、自己给自己反馈(Constitutional AI 这类),进一步减少对人工标注的依赖。
- **合成数据**:用强模型生成高质量训练数据喂给下一代,数据从"采集"变成"生产"。
- **Test-Time Compute 的训练侧**:怎么训练模型,让它在推理时懂得"多想一会儿"(分配更多计算给难题)。这是 o1/R1 这类推理模型的核心训练目标。
- **对齐的自动化**:从 RLHF 的全人工,到 DPO 的偏好对,到 RLVR 的全自动,趋势是让对齐越来越少依赖人。

## 09 结语:从"教说话"到"教思考"

回头看训练范式的演化,主线很清晰:**从教模型"好好说话",到教模型"好好思考"**。

早期的对齐(RLHF)解决的是"让模型当一个有礼貌、有用的助手"——这是教说话。而 RLVR 和 reasoning model 解决的是"让模型会推理、会解决难题"——这是教思考。这背后是信号来源的自动化(从人类反馈到可验证奖励),让训练规模能跟着算力一起涨,而不是被人力标注卡住。

下一篇我们离开训练,进入推理与部署:模型训好了,怎么让它又快又省地跑起来。

---

**参考资料**:InstructGPT (2022) · DPO (2023) · DeepSeek-R1 (2025) · GRPO / DeepSeekMath · Constitutional AI (Anthropic) · Scaling Laws for LLMs
