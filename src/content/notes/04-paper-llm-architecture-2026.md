---
title: "大模型核心架构 2026:从注意力进化到下一代"
deck: "拆解 2026 主流大模型架构:注意力、位置编码、归一化激活、MoE,以及 Transformer 之外的下一代。"
date: 2026-07-16
type: "论文"
tags: ["大模型", "架构"]
readtime: "约 15 分钟"
---

搞懂大模型,先搞懂它的骨架。这篇把 2026 主流大模型的架构选型拆成四块——注意力、位置编码、归一化激活、MoE——讲清每个设计背后的工程权衡,以及 Transformer 之外的下一代可能在哪。

## 引子:架构演化的两条主线

大模型架构的所有创新,几乎都在回答同一个问题:**怎么在「表达力」和「效率」之间找到新的平衡点。**

- 表达力:模型要足够复杂,才能抓住语言里的长程依赖、歧义、多步推理。
- 效率:模型要足够省,才能训得起、部署得起、响应得快。

2017 年 Transformer 之后,每一次架构改动,本质都是发现旧方案某个隐藏假设,然后打破它。到 2026,主流架构选型已经基本收敛,差异主要在规模和是否用 MoE。但下一代(稀疏注意力、SSM、原生多模态)正在改写规则。

这篇沿四条线展开:**注意力、位置编码、归一化与激活、稀疏专家(MoE)**,最后看主流选型和未来。

## 01 Transformer 骨架:为什么是 Decoder-Only

原始 Transformer 是为机器翻译设计的,分 Encoder(理解输入)和 Decoder(生成输出)。但语言模型的核心任务是**生成**——给定前文,续写下一个词,Encoder 并非必需。GPT 做了个关键决定:**只留 Decoder**,参数全用于生成,自回归结构与语言线性天然契合。

一个 Transformer Block 的结构是这样:

<svg viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d2" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d2)" opacity="0.5"/>
  <text x="30" y="34" fill="#1B365D" font-size="12" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="2">FIGURE 2</text>
  <text x="120" y="34" fill="#504e49" font-size="12" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="2">TRANSFORMER BLOCK (DECODER-ONLY)</text>
  <line x1="30" y1="46" x2="450" y2="46" stroke="#1B365D" stroke-width="0.8"/>
  <text x="240" y="78" fill="#141413" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">输入 Token 向量</text>
  <line x1="240" y1="88" x2="240" y2="108" stroke="#504e49" stroke-width="1.2"/><path d="M236 104 L240 108 L244 104" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="150" y="108" width="180" height="40" rx="6" fill="#E4ECF5" stroke="#1B365D" stroke-width="1"/>
  <text x="240" y="133" fill="#1B365D" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">RoPE 旋转位置编码</text>
  <line x1="240" y1="148" x2="240" y2="168" stroke="#504e49" stroke-width="1.2"/><path d="M236 164 L240 168 L244 164" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="120" y="168" width="240" height="90" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
  <text x="240" y="195" fill="#141413" font-size="16" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Self-Attention</text>
  <text x="240" y="216" fill="#6b6a64" font-size="12" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">GQA / MLA</text>
  <text x="240" y="238" fill="#b08442" font-size="11" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">每个位置看见所有位置</text>
  <line x1="240" y1="258" x2="240" y2="278" stroke="#504e49" stroke-width="1.2"/><path d="M236 274 L240 278 L244 274" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="160" y="278" width="160" height="36" rx="6" fill="#fff" stroke="#504e49" stroke-width="1"/>
  <text x="240" y="301" fill="#141413" font-size="13" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">RMSNorm (Pre-Norm)</text>
  <line x1="240" y1="314" x2="240" y2="334" stroke="#504e49" stroke-width="1.2"/><path d="M236 330 L240 334 L244 330" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="120" y="334" width="240" height="96" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
  <text x="240" y="362" fill="#141413" font-size="16" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">FFN · SwiGLU</text>
  <text x="240" y="384" fill="#6b6a64" font-size="12" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">Feed-Forward Network</text>
  <text x="240" y="406" fill="#b08442" font-size="12" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">“知识存储器” · 占参数 2/3</text>
  <line x1="240" y1="430" x2="240" y2="450" stroke="#504e49" stroke-width="1.2"/><path d="M236 446 L240 450 L244 446" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="240" y="472" fill="#141413" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">下一层 / 输出</text>
  <line x1="30" y1="510" x2="450" y2="510" stroke="#e8e6dc" stroke-width="0.8"/>
  <text x="30" y="536" fill="#1B365D" font-size="11.5" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">读图</text>
  <text x="30" y="556" fill="#504e49" font-size="11" font-family="TsangerJinKai02, Georgia, serif">Attention 负责“信息在哪、取多少”，FFN 负责“知识存储”。两者各自带残差连接，梯度能沿主干直通，这是堆几十上百层还能稳定训练的前提。</text>
</svg>

三个关键件:

- **Self-Attention**:让序列里每个位置都能直接「看到」其他所有位置,动态决定从哪里取多少信息。感受野天然全局,还能并行计算。代价是计算和显存随序列长度平方增长(O(n²))。
- **残差连接 + 归一化**:每个子层输出是「输入 + 变换」,梯度沿主干直通。这是堆几十上百层还能稳定训练的前提。
- **FFN(前馈网络)**:长期被低估。它更像一个**键值存储器**——模型的事实性知识大量编码在 FFN 权重里,占整个模型参数约 2/3,是真正的"知识仓库"。

## 02 注意力进化树:从 MHA 到 MLA

注意力机制的核心痛点:**KV Cache 是推理延迟的头号杀手。** 推理时每生成一个词,都要缓存之前所有词的 Key/Value,显存随序列长度线性涨。一个 70B 模型、8192 长度,KV Cache 能吃掉几十 GB。于是注意力沿「怎么压缩 KV Cache」这条线进化:

<svg viewBox="0 0 960 580" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d1" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d1)" opacity="0.55"/>
  <text x="80" y="40" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 1</text>
  <text x="210" y="40" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">注意力 KV CACHE 进化路线</text>
  <line x1="80" y1="54" x2="920" y2="54" stroke="#1B365D" stroke-width="0.8"/>
  <text x="150" y="96" fill="#141413" font-size="24" font-weight="500" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">MHA</text>
  <text x="150" y="118" fill="#6b6a64" font-size="12" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">Multi-Head</text>
  <text x="150" y="136" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">GPT-2/3 · LLaMA 1</text>
  <g font-family="JetBrains Mono, Consolas, monospace" font-size="9" fill="#faf9f5" text-anchor="middle">
    <rect x="96" y="160" width="26" height="26" rx="3" fill="#1B365D"/><text x="109" y="177">Q1</text><rect x="124" y="160" width="26" height="26" rx="3" fill="#b08442"/><text x="137" y="177">K1</text><rect x="152" y="160" width="26" height="26" rx="3" fill="#6b6a64"/><text x="165" y="177">V1</text>
    <rect x="96" y="192" width="26" height="26" rx="3" fill="#1B365D"/><text x="109" y="209">Q2</text><rect x="124" y="192" width="26" height="26" rx="3" fill="#b08442"/><text x="137" y="209">K2</text><rect x="152" y="192" width="26" height="26" rx="3" fill="#6b6a64"/><text x="165" y="209">V2</text>
    <rect x="96" y="224" width="26" height="26" rx="3" fill="#1B365D"/><text x="109" y="241">Q3</text><rect x="124" y="224" width="26" height="26" rx="3" fill="#b08442"/><text x="137" y="241">K3</text><rect x="152" y="224" width="26" height="26" rx="3" fill="#6b6a64"/><text x="165" y="241">V3</text>
  </g>
  <text x="150" y="276" fill="#504e49" font-size="11" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">每头独立 KV</text>
  <text x="150" y="306" fill="#1B365D" font-size="10" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="1">KV CACHE</text>
  <rect x="90" y="316" width="120" height="14" rx="2" fill="#1B365D"/>
  <text x="150" y="350" fill="#141413" font-size="13" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">100%  最大</text>
  <path d="M220 200 L260 200" stroke="#504e49" stroke-width="1.2"/><path d="M256 196 L260 200 L256 204" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="370" y="96" fill="#141413" font-size="24" font-weight="500" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">MQA</text>
  <text x="370" y="118" fill="#6b6a64" font-size="12" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">Multi-Query</text>
  <text x="370" y="136" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">PaLM · Falcon</text>
  <g font-family="JetBrains Mono, Consolas, monospace" font-size="9" fill="#faf9f5" text-anchor="middle">
    <rect x="316" y="160" width="26" height="20" rx="3" fill="#1B365D"/><text x="329" y="174">Q1</text>
    <rect x="316" y="184" width="26" height="20" rx="3" fill="#1B365D"/><text x="329" y="198">Q2</text>
    <rect x="316" y="208" width="26" height="20" rx="3" fill="#1B365D"/><text x="329" y="222">Q3</text>
    <rect x="316" y="232" width="26" height="20" rx="3" fill="#1B365D"/><text x="329" y="246">Q4</text>
  </g>
  <rect x="372" y="184" width="52" height="44" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
  <rect x="372" y="184" width="26" height="44" rx="3" fill="#b08442"/><rect x="398" y="184" width="26" height="44" rx="3" fill="#6b6a64"/>
  <text x="398" y="246" fill="#504e49" font-size="10" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">共享 K·V</text>
  <line x1="342" y1="170" x2="372" y2="200" stroke="#504e49" stroke-width="0.8"/><line x1="342" y1="194" x2="372" y2="206" stroke="#504e49" stroke-width="0.8"/><line x1="342" y1="218" x2="372" y2="212" stroke="#504e49" stroke-width="0.8"/><line x1="342" y1="242" x2="372" y2="220" stroke="#504e49" stroke-width="0.8"/>
  <text x="370" y="276" fill="#504e49" font-size="11" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">所有 Q 共享 1 组</text>
  <text x="370" y="306" fill="#1B365D" font-size="10" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="1">KV CACHE</text>
  <rect x="330" y="316" width="80" height="14" rx="2" fill="#b08442"/>
  <text x="370" y="350" fill="#141413" font-size="13" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">≈1/h  质量掉</text>
  <path d="M440 200 L480 200" stroke="#504e49" stroke-width="1.2"/><path d="M476 196 L480 200 L476 204" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="590" y="96" fill="#141413" font-size="24" font-weight="500" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">GQA</text>
  <text x="590" y="118" fill="#6b6a64" font-size="12" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">Grouped-Query</text>
  <text x="590" y="136" fill="#1B365D" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">LLaMA 2/3 · Mistral · 主流</text>
  <g font-family="JetBrains Mono, Consolas, monospace" font-size="9" fill="#faf9f5" text-anchor="middle">
    <rect x="536" y="160" width="26" height="20" rx="3" fill="#1B365D"/><text x="549" y="174">Q1</text>
    <rect x="536" y="184" width="26" height="20" rx="3" fill="#1B365D"/><text x="549" y="198">Q2</text>
    <rect x="536" y="216" width="26" height="20" rx="3" fill="#1B365D"/><text x="549" y="230">Q3</text>
    <rect x="536" y="240" width="26" height="20" rx="3" fill="#1B365D"/><text x="549" y="254">Q4</text>
  </g>
  <rect x="586" y="160" width="26" height="44" rx="3" fill="#b08442"/><rect x="614" y="160" width="26" height="44" rx="3" fill="#6b6a64"/>
  <rect x="586" y="216" width="26" height="44" rx="3" fill="#b08442"/><rect x="614" y="216" width="26" height="44" rx="3" fill="#6b6a64"/>
  <line x1="562" y1="170" x2="586" y2="178" stroke="#504e49" stroke-width="0.8"/><line x1="562" y1="194" x2="586" y2="190" stroke="#504e49" stroke-width="0.8"/><line x1="562" y1="226" x2="586" y2="234" stroke="#504e49" stroke-width="0.8"/><line x1="562" y1="250" x2="586" y2="246" stroke="#504e49" stroke-width="0.8"/>
  <text x="590" y="288" fill="#504e49" font-size="11" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">分组共享 · 折中</text>
  <text x="590" y="306" fill="#1B365D" font-size="10" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="1">KV CACHE</text>
  <rect x="550" y="316" width="80" height="14" rx="2" fill="#1B365D"/>
  <text x="590" y="350" fill="#141413" font-size="13" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">≈g/h  主流</text>
  <path d="M660 200 L700 200" stroke="#504e49" stroke-width="1.2"/><path d="M696 196 L700 200 L696 204" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="810" y="96" fill="#141413" font-size="24" font-weight="500" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">MLA</text>
  <text x="810" y="118" fill="#6b6a64" font-size="12" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">Multi-head Latent</text>
  <text x="810" y="136" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">DeepSeek-V2 / V3</text>
  <rect x="744" y="166" width="34" height="30" rx="3" fill="#b08442"/><rect x="780" y="166" width="34" height="30" rx="3" fill="#6b6a64"/>
  <text x="777" y="212" fill="#6b6a64" font-size="9" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">完整 K·V</text>
  <path d="M814 181 L842 181" stroke="#504e49" stroke-width="1.2"/><path d="M838 177 L842 181 L838 185" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="842" y="166" width="26" height="30" rx="4" fill="#1B365D" stroke="#141413" stroke-width="1.2"/>
  <text x="855" y="184" fill="#faf9f5" font-size="9" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">cKV</text>
  <text x="855" y="212" fill="#1B365D" font-size="9" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">潜向量</text>
  <text x="810" y="240" fill="#b08442" font-size="11" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">压缩 ≈90%</text>
  <text x="810" y="260" fill="#504e49" font-size="11" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">用时解压 · 质量不掉</text>
  <text x="810" y="306" fill="#1B365D" font-size="10" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="1">KV CACHE</text>
  <rect x="780" y="316" width="60" height="14" rx="2" fill="#1B365D"/>
  <text x="810" y="350" fill="#141413" font-size="13" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">极小  最快</text>
  <line x1="80" y1="390" x2="920" y2="390" stroke="#e8e6dc" stroke-width="0.8"/>
  <text x="80" y="416" fill="#1B365D" font-size="12" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">读图</text>
  <text x="80" y="438" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">Q（墨蓝）是查询头，K（暖棕）/ V（灰）是要缓存的键值。从 MHA 到 MLA，本质是一场“怎么把 KV Cache 压到最小、又不掉质量”的工程接力。</text>
  <text x="80" y="460" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">GQA 靠“分组共享”成了 2023-2024 的事实主流；MLA 靠“低秩压缩成潜向量”把显存再砍一刀，是 DeepSeek 推理成本显著更低的核心原因。</text>
</svg>

- **MHA**:原始方案,每头独立 K/V,表达力最强,KV Cache 最大。
- **MQA**:所有头共享一组 K/V,KV 压到 1/h,但质量损失明显。
- **GQA**:折中,头分组、组内共享 K/V。**2023-2024 的事实主流**,LLaMA 2/3、Mistral、Qwen、Gemma 全用。
- **MLA**:DeepSeek-V2 的方案,把 KV 压到一个低维「潜向量」缓存,用时再解压,省约 90% 且基本不掉质量。这是 DeepSeek 推理成本显著低于同规模模型的核心原因。

光压 KV 还不够,计算顺序也得优化。**Flash Attention** 不改数学,只重新组织计算——全程在 GPU 片上缓存算完,中间结果不写回显存,显存从 O(n²) 降到 O(n),快 2-4 倍。1/2/3 代已成所有主流训练框架标配。2025 年新出现的 **Native Sparse Attention(NSA)** 走得更远:让注意力在硬件层面就稀疏,只算真正重要的 token 对。

## 03 位置编码:RoPE 凭什么一统江湖

Self-Attention 本身感知不到顺序(打乱输入,输出也只是相应打乱),所以必须额外注入位置信息。位置编码也经历了一条演化线:

<svg viewBox="0 0 960 440" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d3" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d3)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 3</text>
  <text x="190" y="38" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">RoPE 直觉  与  长上下文扩展阶梯</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <text x="240" y="86" fill="#141413" font-size="16" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">RoPE:用旋转编码位置差</text>
  <g transform="translate(150,110)">
    <circle cx="90" cy="80" r="70" fill="none" stroke="#d9d2c2" stroke-width="0.8" stroke-dasharray="2 3"/>
    <line x1="90" y1="80" x2="40" y2="50" stroke="#1B365D" stroke-width="2"/>
    <circle cx="40" cy="50" r="3.5" fill="#1B365D"/>
    <text x="20" y="46" fill="#1B365D" font-size="12" font-family="JetBrains Mono, Consolas, monospace">q (位置 m)</text>
    <line x1="90" y1="80" x2="150" y2="40" stroke="#b08442" stroke-width="2"/>
    <circle cx="150" cy="40" r="3.5" fill="#b08442"/>
    <text x="150" y="32" fill="#b08442" font-size="12" font-family="JetBrains Mono, Consolas, monospace">k (位置 n)</text>
    <text x="90" y="172" fill="#504e49" font-size="11.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">两个向量各自旋转，内积自然包含</text>
    <text x="90" y="190" fill="#141413" font-size="12.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">位置差 (m − n)</text>
  </g>
  <line x1="470" y1="86" x2="470" y2="360" stroke="#e8e6dc" stroke-width="0.8"/>
  <text x="690" y="86" fill="#141413" font-size="16" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">上下文扩展:8K → 10M</text>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="510" y="116" width="80" height="34" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="550" y="138" fill="#141413" font-size="13" text-anchor="middle">8K</text>
    <text x="550" y="166" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">基座模型</text>
    <line x1="595" y1="133" x2="625" y2="133" stroke="#504e49" stroke-width="1.2"/><path d="M621 129 L625 133 L621 137" fill="none" stroke="#504e49" stroke-width="1.2"/>
    <rect x="630" y="116" width="100" height="34" rx="4" fill="#E4ECF5" stroke="#1B365D" stroke-width="1"/><text x="680" y="138" fill="#1B365D" font-size="13" text-anchor="middle">128K</text>
    <text x="680" y="166" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">PI / NTK 缩放</text>
    <line x1="735" y1="133" x2="765" y2="133" stroke="#504e49" stroke-width="1.2"/><path d="M761 129 L765 133 L761 137" fill="none" stroke="#504e49" stroke-width="1.2"/>
    <rect x="770" y="116" width="110" height="34" rx="4" fill="#1B365D"/><text x="825" y="138" fill="#faf9f5" font-size="13" text-anchor="middle">1M ~ 10M</text>
    <text x="825" y="166" fill="#1B365D" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">YaRN / LongRoPE</text>
    <rect x="510" y="206" width="120" height="34" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="570" y="228" fill="#141413" font-size="12" text-anchor="middle">绝对编码 (旧)</text>
    <text x="570" y="256" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">超长就崩</text>
    <rect x="650" y="206" width="120" height="34" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="710" y="228" fill="#141413" font-size="12" text-anchor="middle">ALiBi</text>
    <text x="710" y="256" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">距离惩罚</text>
    <rect x="790" y="206" width="120" height="34" rx="4" fill="#b08442"/><text x="850" y="228" fill="#faf9f5" font-size="12" text-anchor="middle">RoPE ✓</text>
    <text x="850" y="256" fill="#b08442" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">当前统一方案</text>
  </g>
  <text x="690" y="300" fill="#504e49" font-size="11.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">低频维度管长程，高频维度管局部；YaRN 分频率处理，</text>
  <text x="690" y="320" fill="#504e49" font-size="11.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">把上下文从 8K 一路推到 Llama 4 Scout 的 10M。</text>
</svg>

- **绝对位置编码**:给每个位置一个固定向量,训练时见过最长 512/1024,超过就崩。
- **ALiBi**:在注意力分数里按距离加线性惩罚("近的更相关"),外推性更好。
- **RoPE(旋转位置编码)**:不加位置向量,用旋转矩阵变换 Q 和 K,让它们的内积自然包含「位置差」信息。**当前几乎所有主流模型的标准选择**。赢在三点:只依赖位置差(天然支持外推)、不同频率维度处理不同尺度、能和 Flash Attention 高效配合。

RoPE 直接在更长序列上推理也会掉(没见过的旋转角度),所以有一套**长上下文扩展**方案:位置插值(PI)→ NTK-aware 缩放 → **YaRN**(分频率处理,效果最好)→ LongRoPE(扩到 1M+)。靠这套,上下文从 8K 扩到 128K、1M、甚至 10M(Llama 4 Scout)。

## 04 归一化与激活:砍掉一切不必要的部分

这两个选择体现了大模型工程化的典型思路——**能砍就砍,砍完没掉就砍**。

- **归一化**:原始 Transformer 用 Post-Norm(归一化在残差之后),深层不稳。现代大模型全面转向 **Pre-Norm**(归一化在子层之前),残差通路上的梯度不受归一化影响,训得更深更稳。进一步,**RMSNorm** 把 LayerNorm 里的「均值中心化」砍掉,只做 RMS 归一化——均值中心化贡献微乎其微,去掉后计算少 7-10%,效果相当。LLaMA 全系、Mistral、DeepSeek 全用 RMSNorm。
- **激活函数**:ReLU → GeLU → **SwiGLU**。SwiGLU 把 FFN 改成门控结构(两个并行变换,一个门控一个信息流,逐元素相乘),同等算力下效果一致更好。PaLM、LLaMA 全系都用。

到 2026,「**Pre-Norm + RMSNorm + SwiGLU + 无 bias**」已经是不成文的默认组合。

## 05 MoE:让参数量和计算量解耦

稠密模型每处理一个词,所有参数都参与计算——参数越多,算得越久。**MoE(混合专家)**打破这个绑定:把 FFN 换成 N 个并行专家,每次只激活 Top-K 个。

<svg viewBox="0 0 960 460" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d4" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d4)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 4</text>
  <text x="190" y="38" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">MOE 路由:稀疏激活</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <rect x="80" y="180" width="110" height="48" rx="6" fill="#1B365D"/>
  <text x="135" y="210" fill="#faf9f5" font-size="15" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Token</text>
  <line x1="190" y1="204" x2="240" y2="204" stroke="#504e49" stroke-width="1.2"/><path d="M236 200 L240 204 L236 208" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="240" y="172" width="120" height="64" rx="6" fill="#E4ECF5" stroke="#1B365D" stroke-width="1.2"/>
  <text x="300" y="200" fill="#1B365D" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Router</text>
  <text x="300" y="220" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">打分 · 选 Top-K</text>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <line x1="360" y1="190" x2="430" y2="110" stroke="#504e49" stroke-width="0.8"/>
    <rect x="430" y="92" width="90" height="44" rx="5" fill="#b08442"/><text x="475" y="119" fill="#faf9f5" font-size="13" text-anchor="middle">专家 1 ★</text>
    <line x1="360" y1="196" x2="430" y2="160" stroke="#504e49" stroke-width="0.8" stroke-dasharray="2 2"/>
    <rect x="430" y="142" width="90" height="44" rx="5" fill="#faf9f5" stroke="#d9d2c2" stroke-width="1"/><text x="475" y="169" fill="#6b6a64" font-size="13" text-anchor="middle">专家 2</text>
    <line x1="360" y1="204" x2="430" y2="210" stroke="#504e49" stroke-width="0.8" stroke-dasharray="2 2"/>
    <rect x="430" y="192" width="90" height="44" rx="5" fill="#faf9f5" stroke="#d9d2c2" stroke-width="1"/><text x="475" y="219" fill="#6b6a64" font-size="13" text-anchor="middle">专家 3</text>
    <line x1="360" y1="212" x2="430" y2="260" stroke="#504e49" stroke-width="0.8"/>
    <rect x="430" y="242" width="90" height="44" rx="5" fill="#b08442"/><text x="475" y="269" fill="#faf9f5" font-size="13" text-anchor="middle">专家 4 ★</text>
    <line x1="360" y1="218" x2="430" y2="310" stroke="#504e49" stroke-width="0.8" stroke-dasharray="2 2"/>
    <rect x="430" y="292" width="90" height="44" rx="5" fill="#faf9f5" stroke="#d9d2c2" stroke-width="1"/><text x="475" y="319" fill="#6b6a64" font-size="13" text-anchor="middle">…专家 N</text>
  </g>
  <line x1="520" y1="114" x2="600" y2="190" stroke="#b08442" stroke-width="1.4"/>
  <line x1="520" y1="264" x2="600" y2="218" stroke="#b08442" stroke-width="1.4"/>
  <rect x="600" y="180" width="110" height="48" rx="6" fill="#1B365D"/>
  <text x="655" y="210" fill="#faf9f5" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">加权合并</text>
  <line x1="710" y1="204" x2="760" y2="204" stroke="#504e49" stroke-width="1.2"/><path d="M756 200 L760 204 L756 208" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="820" y="210" fill="#141413" font-size="15" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">输出</text>
  <line x1="60" y1="370" x2="900" y2="370" stroke="#e8e6dc" stroke-width="0.8"/>
  <text x="60" y="396" fill="#b08442" font-size="12" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">DeepSeek 三项创新</text>
  <text x="60" y="418" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">① 细粒度专家：专家做小、数量增多，组合更丰富　② 共享专家：少量始终激活，处理通用知识　③ 无辅助损失均衡：用 bias 动态调负载，不干扰主任务</text>
  <text x="60" y="438" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">DeepSeek-V3：总参 671B，每词只激活 37B —— 参数量和计算量解耦，是 MoE 的核心价值。</text>
</svg>

意义:一个 MoE 模型能在和稠密模型相同的计算预算下,拥有数倍参数,学更多知识。Mixtral 8×7B 总参 47B、每词只激活 13B;DeepSeek-V3 总参 671B、每词只激活 37B。

MoE 最大的工程挑战是**负载均衡**——Router 偏爱少数专家,其他专家形同虚设。DeepSeek-V3 提出「无辅助损失」均衡:给 Router 加可学习 bias,动态调各专家负载,避免辅助损失干扰主任务。加上**细粒度专家**、**共享专家**、**MTP(多 token 预测)**,共同让 DeepSeek-V3 在 671B 规模下训练成本仅约 557 万美元。

MoE 不是免费午餐:多机训练专家分布在不同卡,token 路由要跨卡通信;部分专家可能始终不被选中(专家坍塌);推理时即使只激活少数专家,所有专家权重都得常驻显存。

## 06 当前主流选型:收敛与分歧

把前几节合起来,2026 主流大模型的架构选型高度收敛:

<svg viewBox="0 0 960 420" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d5" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d5)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 5</text>
  <text x="190" y="38" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">2026 主流架构选型</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="120" y="80" width="280" height="40" rx="5" fill="#1B365D"/><text x="260" y="106" fill="#faf9f5" font-size="14" text-anchor="middle">RoPE 旋转位置编码</text>
    <rect x="120" y="128" width="280" height="40" rx="5" fill="#1B365D"/><text x="260" y="154" fill="#faf9f5" font-size="14" text-anchor="middle">RMSNorm (Pre-Norm)</text>
    <rect x="120" y="176" width="280" height="40" rx="5" fill="#1B365D"/><text x="260" y="202" fill="#faf9f5" font-size="14" text-anchor="middle">SwiGLU 激活 · 无 bias</text>
    <rect x="120" y="224" width="280" height="40" rx="5" fill="#1B365D"/><text x="260" y="250" fill="#faf9f5" font-size="14" text-anchor="middle">GQA  或  MLA 注意力</text>
  </g>
  <text x="260" y="294" fill="#141413" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">主流共识(几乎所有新模型)</text>
  <line x1="400" y1="172" x2="470" y2="120" stroke="#504e49" stroke-width="1.2"/>
  <line x1="400" y1="172" x2="470" y2="224" stroke="#504e49" stroke-width="1.2"/>
  <rect x="470" y="96" width="190" height="50" rx="6" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
  <text x="565" y="120" fill="#141413" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Dense FFN</text>
  <text x="565" y="138" fill="#6b6a64" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">LLaMA 3.1 · Qwen 2.5 · Gemma 3</text>
  <rect x="470" y="200" width="190" height="50" rx="6" fill="#b08442"/>
  <text x="565" y="224" fill="#faf9f5" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">MoE 稀疏专家</text>
  <text x="565" y="242" fill="#faf9f5" font-size="10.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">DeepSeek-V3 · Llama 4 · Mixtral</text>
  <text x="760" y="120" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">差异主要在</text>
  <text x="760" y="142" fill="#141413" font-size="12" font-family="TsangerJinKai02, Georgia, serif">① 规模</text>
  <text x="760" y="162" fill="#141413" font-size="12" font-family="TsangerJinKai02, Georgia, serif">② 是否上 MoE</text>
  <text x="760" y="200" fill="#b08442" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">改动最大：</text>
  <text x="760" y="222" fill="#504e49" font-size="12" font-family="TsangerJinKai02, Georgia, serif">DeepSeek 用 MLA</text>
  <text x="760" y="242" fill="#504e49" font-size="12" font-family="TsangerJinKai02, Georgia, serif">替 GQA、细粒度 MoE</text>
  <line x1="60" y1="330" x2="900" y2="330" stroke="#e8e6dc" stroke-width="0.8"/>
  <text x="60" y="356" fill="#1B365D" font-size="12" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">读图</text>
  <text x="60" y="378" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">四件套（RoPE + RMSNorm + SwiGLU + GQA/MLA）已是事实共识。分歧只剩：要不要把 Dense FFN 换成 MoE。</text>
  <text x="60" y="398" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">DeepSeek 是目前对这套共识改动最大的代表——推理成本压到同规模最低。</text>
</svg>

## 07 下一代:Transformer 之外的可能性

Transformer 注意力有两个根本局限:O(n²) 复杂度,以及推理时 KV Cache 随序列增长。下一代架构在尝试别的路:

<svg viewBox="0 0 960 440" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d6" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d6)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="13" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 6</text>
  <text x="190" y="38" fill="#504e49" font-size="13" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">下一代:三种序列建模范式</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="80" y="80" width="250" height="56" rx="6" fill="#1B365D"/><text x="205" y="114" fill="#faf9f5" font-size="17" text-anchor="middle">Transformer (Attention)</text>
    <text x="205" y="160" fill="#141413" font-size="13" text-anchor="middle">每个 token 看所有 token</text>
    <rect x="80" y="176" width="250" height="32" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="205" y="197" fill="#1B365D" font-size="12" text-anchor="middle">优势：全局精确检索</text>
    <rect x="80" y="216" width="250" height="32" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="205" y="237" fill="#b08442" font-size="12" text-anchor="middle">代价：O(n²) + KV Cache 涨</text>
    <rect x="80" y="264" width="250" height="32" rx="4" fill="#E4ECF5" stroke="#1B365D"/><text x="205" y="285" fill="#1B365D" font-size="11.5" text-anchor="middle">代表：LLaMA / DeepSeek / 绝大多数</text>

    <rect x="355" y="80" width="250" height="56" rx="6" fill="#b08442"/><text x="480" y="114" fill="#faf9f5" font-size="17" text-anchor="middle">SSM (Mamba / Mamba2)</text>
    <text x="480" y="160" fill="#141413" font-size="13" text-anchor="middle">固定隐状态 · 逐步更新</text>
    <rect x="355" y="176" width="250" height="32" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="480" y="197" fill="#1B365D" font-size="12" text-anchor="middle">优势：O(n) · KV Cache 不涨</text>
    <rect x="355" y="216" width="250" height="32" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="480" y="237" fill="#b08442" font-size="12" text-anchor="middle">代价：无法全局寻址</text>
    <rect x="355" y="264" width="250" height="32" rx="4" fill="#E4ECF5" stroke="#1B365D"/><text x="480" y="285" fill="#1B365D" font-size="11.5" text-anchor="middle">代表：Mamba · 线性注意力 GLA</text>

    <rect x="630" y="80" width="250" height="56" rx="6" fill="#504e49"/><text x="755" y="114" fill="#faf9f5" font-size="17" text-anchor="middle">混合 (Hybrid)</text>
    <text x="755" y="160" fill="#141413" font-size="13" text-anchor="middle">SSM 层 + Attention 层 交替</text>
    <rect x="630" y="176" width="250" height="32" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="755" y="197" fill="#1B365D" font-size="12" text-anchor="middle">优势：长程效率 + 精确检索</text>
    <rect x="630" y="216" width="250" height="32" rx="4" fill="#faf9f5" stroke="#141413" stroke-width="1"/><text x="755" y="237" fill="#b08442" font-size="12" text-anchor="middle">代价：大规模待验证</text>
    <rect x="630" y="264" width="250" height="32" rx="4" fill="#E4ECF5" stroke="#1B365D"/><text x="755" y="285" fill="#1B365D" font-size="11.5" text-anchor="middle">代表：Jamba · Zamba</text>
  </g>
  <line x1="60" y1="330" x2="900" y2="330" stroke="#e8e6dc" stroke-width="0.8"/>
  <text x="60" y="356" fill="#1B365D" font-size="12" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">趋势</text>
  <text x="60" y="378" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">SSM 在“大海捞针”式精确检索上仍落后同规模 Transformer；混合架构看起来两全其美，是下一代的有力候选。</text>
  <text x="60" y="398" fill="#504e49" font-size="11.5" font-family="TsangerJinKai02, Georgia, serif">叠加 原生多模态（Llama 4 / Gemma 3 从底座就处理文本+视觉）和 Native Sparse Attention，架构演进远没到终局。</text>
</svg>

## 08 Test-Time Compute 对架构的反推

2024 年后,推理模型(o1/o3、DeepSeek-R1)崛起,模型在推理时生成超长思维链。这对架构提出新要求:思维链动辄数千上万步,KV Cache 压力剧增——**MLA、稀疏注意力这类压缩方案变得更关键**;超长自回归生成对显存管理要求更高;训练目标也要支持多步骤自我修正(MTP、过程奖励)。这些问题还没标准答案,但已是下一代架构研究的前线。

## 结:架构是约束,也是自由度

回头看,规律很清楚:**每一次架构创新,都是在发现旧方案的某个隐藏假设,然后打破它。**

以为必须有 Encoder?Decoder-Only 照样好。以为每个头都要独立 KV?GQA 证明可以共享。以为归一化必须做均值?RMSNorm 去掉几乎无损。以为稠密激活是必须的?MoE 让参数量和计算量解耦。以为必须用注意力?SSM 提供另一条路。

架构设计不是找最优解,而是在**表达力、训练稳定性、推理效率、部署成本**之间,根据当下的算力和任务,做最合理的权衡。

> 下一篇我们离开架构,进入训练范式:从预训练,到 RLHF、DPO,再到让推理能力涌现的 GRPO/RLVR。

---

**参考资料**:Attention Is All You Need (2017) · GQA (2023) · DeepSeek-V2/V3 技术报告 · RoPE/RoFormer (2021) · YaRN (2023) · Flash Attention 1/2/3 · Mamba (2023) · NSA (2025)
