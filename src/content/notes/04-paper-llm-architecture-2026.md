---
title: "现阶段大模型主流核心架构综述"
deck: "拆解主流大模型架构的每个核心组件——骨架、注意力、位置、归一化激活、MoE——讲清为什么是它,以及下一步往哪走。"
date: 2026-07-16
type: "论文"
tags: ["大模型", "架构"]
readtime: "约 16 分钟"
---

"现在的大模型到底是怎么搭起来的"。这篇文章回答一个问题:**现阶段被绝大多数旗舰模型采用的核心架构是什么,每个核心组件为什么这么选。**

## 01 引言:什么是"主流核心架构"

文章说的"主流",指被 Llama、DeepSeek、Qwen、Mistral、Gemma 这一众旗舰模型共同采用的架构选型;"核心",指模型骨架和组成 block 的关键组件,不涉及训练技巧和数据工程。

所有这些选型,都在回答同一个矛盾:**表达力 vs 效率**。模型要足够复杂才能抓住语言的长程依赖、歧义、多步推理(表达力);又要足够省才能训得起、部署得起、响应得快(效率)。这些年架构演化,本质就是在这个矛盾的两端反复寻找新平衡。

希望读完这篇,能在脑中建出当前主流架构的完整全景,并理解每个设计背后的工程权衡。我们按组件展开:骨架 → 注意力 → 位置编码 → 归一化与激活 → 稀疏专家(MoE),最后把它们拼成"主流形态",再看演化方向。

## 02 骨架:Decoder-Only Transformer

主流大模型几乎全是 **Decoder-Only** 结构。原因很简单:语言模型的核心任务是生成——给定前文,续写下一个词。这是个天然非对称的任务,输入就是已生成的部分,输出是下一个词。原始 Transformer 里那个负责"理解输入"的 Encoder,对生成任务并非必需。

GPT 系列做了个关键决定:**只保留 Decoder**。好处是参数全用于生成,自回归(autoregressive)结构和语言的线性属性天然契合,预训练目标(预测下一个词)与架构高度统一。BERT 走了另一条路(双向 Encoder,擅长理解),但在生成时代,Decoder-Only 成了大模型的代名词。

Transformer Block 结构,是后续所有组件演化的基础:

<svg class="media-portrait" viewBox="0 0 480 600" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d2" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d2)" opacity="0.5"/>
  <text x="30" y="34" fill="#1B365D" font-size="15" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="2">FIGURE 1</text>
  <text x="120" y="34" fill="#504e49" font-size="15" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="2">TRANSFORMER BLOCK (DECODER-ONLY)</text>
  <line x1="30" y1="46" x2="450" y2="46" stroke="#1B365D" stroke-width="0.8"/>
  <text x="240" y="78" fill="#141413" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">输入 Token 向量</text>
  <line x1="240" y1="88" x2="240" y2="108" stroke="#504e49" stroke-width="1.2"/><path d="M236 104 L240 108 L244 104" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="150" y="108" width="180" height="40" rx="6" fill="#E4ECF5" stroke="#1B365D" stroke-width="1"/>
  <text x="240" y="133" fill="#1B365D" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">位置编码(RoPE)</text>
  <line x1="240" y1="148" x2="240" y2="168" stroke="#504e49" stroke-width="1.2"/><path d="M236 164 L240 168 L244 164" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="120" y="168" width="240" height="90" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
  <text x="240" y="195" fill="#141413" font-size="19" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Self-Attention</text>
  <text x="240" y="216" fill="#6b6a64" font-size="15" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">GQA / MLA</text>
  <text x="240" y="238" fill="#b08442" font-size="14" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">每个位置看见所有位置</text>
  <line x1="240" y1="258" x2="240" y2="278" stroke="#504e49" stroke-width="1.2"/><path d="M236 274 L240 278 L244 274" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="160" y="278" width="160" height="36" rx="6" fill="#fff" stroke="#504e49" stroke-width="1"/>
  <text x="240" y="301" fill="#141413" font-size="16" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">RMSNorm (Pre-Norm)</text>
  <line x1="240" y1="314" x2="240" y2="334" stroke="#504e49" stroke-width="1.2"/><path d="M236 330 L240 334 L244 330" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="120" y="334" width="240" height="96" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
  <text x="240" y="362" fill="#141413" font-size="19" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">FFN · SwiGLU</text>
  <text x="240" y="384" fill="#6b6a64" font-size="15" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">Feed-Forward Network</text>
  <text x="240" y="406" fill="#b08442" font-size="15" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">“知识存储器” · 占参数 2/3</text>
  <line x1="240" y1="430" x2="240" y2="450" stroke="#504e49" stroke-width="1.2"/><path d="M236 446 L240 450 L244 446" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="240" y="472" fill="#141413" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">下一层 / 输出</text>
  <line x1="30" y1="510" x2="450" y2="510" stroke="#e8e6dc" stroke-width="0.8"/>
  <text x="30" y="536" fill="#1B365D" font-size="14.5" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">读图</text>
  <text x="30" y="556" fill="#504e49" font-size="14" font-family="TsangerJinKai02, Georgia, serif">Attention 负责“信息在哪、取多少”，FFN 负责“知识存储”。两者各自带残差连接，梯度能沿主干直通——这是堆几十上百层还能稳定训练的前提。后面所有演化，都是改这块 Block 里的零件。</text>
</svg>

三个关键件要记住:

- **Self-Attention**:让序列里每个位置都能直接"看到"其他所有位置,动态决定从哪里取多少信息。感受野天然全局,还能并行计算。代价是计算和显存随序列长度平方增长。
- **残差连接 + 归一化**:每个子层输出是"输入 + 变换",梯度沿主干直通,不被层层衰减。这是堆几十上百层还能稳定训练的前提。
- **FFN(前馈网络)**:长期被低估。它更像一个**键值存储器**——模型的事实性知识大量编码在 FFN 权重里,占整个模型参数约 2/3,是真正的"知识仓库",也是后面 MoE 要替换的对象。

## 03 注意力机制:GQA/MLA 与 KV Cache 

注意力是主流架构里演化最剧烈的部分,核心战场是:**KV Cache 是推理延迟的头号杀手。**

推理时,每生成一个词,都要把之前所有词的 Key/Value 缓存下来,显存随序列长度线性增长。一个 70B 模型在 8K 长度上,KV Cache 就能吃掉几十 GB 显存,严重制约吞吐。于是注意力机制沿"怎么把 KV Cache 压下去"做了一轮接力:

<svg viewBox="0 0 960 440" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d1" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d1)" opacity="0.5"/>
  <text x="80" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 2</text>
  <text x="210" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">KV CACHE 压缩接力  MHA → MQA → GQA → MLA</text>
  <line x1="80" y1="52" x2="920" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="80" y="74" width="180" height="44" rx="5" fill="#faf9f5" stroke="#141413"/><text x="170" y="94" fill="#141413" font-size="18" text-anchor="middle">MHA</text><text x="170" y="111" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">每头独立 KV · 最大</text>
    <rect x="290" y="74" width="180" height="44" rx="5" fill="#faf9f5" stroke="#141413"/><text x="380" y="94" fill="#141413" font-size="18" text-anchor="middle">MQA</text><text x="380" y="111" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">共享 1 组 · 质量掉</text>
    <rect x="500" y="74" width="180" height="44" rx="5" fill="#1B365D"/><text x="590" y="94" fill="#faf9f5" font-size="18" text-anchor="middle">GQA</text><text x="590" y="111" fill="#d8d2bf" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">分组共享 · 主流</text>
    <rect x="710" y="74" width="180" height="44" rx="5" fill="#b08442"/><text x="800" y="94" fill="#faf9f5" font-size="18" text-anchor="middle">MLA</text><text x="800" y="111" fill="#faf9f5" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">低秩潜向量 · 极小</text>
  </g>
  <g stroke="#504e49" stroke-width="1.2" fill="none"><path d="M260 96 L290 96"/><path d="M286 92 L290 96 L286 100"/><path d="M470 96 L500 96"/><path d="M496 92 L500 96 L496 100"/><path d="M680 96 L710 96"/><path d="M706 92 L710 96 L706 100"/></g>
  <text x="80" y="158" fill="#1B365D" font-size="15" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">KV Cache 相对大小(70B 级,示意)</text>
  <rect x="80" y="172" width="200" height="20" fill="#1B365D"/><text x="290" y="187" fill="#141413" font-size="15" font-family="TsangerJinKai02, Georgia, serif">MHA 100%</text>
  <rect x="80" y="200" width="40" height="20" fill="#b08442"/><text x="290" y="215" fill="#141413" font-size="15" font-family="TsangerJinKai02, Georgia, serif">MQA ≈1/h(质量掉)</text>
  <rect x="80" y="228" width="110" height="20" fill="#1B365D"/><text x="290" y="243" fill="#141413" font-size="15" font-family="TsangerJinKai02, Georgia, serif">GQA ≈g/h(主流)</text>
  <rect x="80" y="256" width="28" height="20" fill="#b08442"/><text x="290" y="271" fill="#141413" font-size="15" font-family="TsangerJinKai02, Georgia, serif">MLA 极小(质量不掉)</text>
  <line x1="80" y1="300" x2="920" y2="300" stroke="#e8e6dc"/>
  <text x="80" y="326" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">读图:Q(墨蓝)是查询头，K(暖棕)/V(灰)是要缓存的键值。GQA 把头分组、组内共享 K/V，成了 Llama/Mistral/Qwen/Gemma 的事实主流；MLA 把 KV 压成低维潜向量再解压，显存再砍一刀且不掉质量，是 DeepSeek 推理成本低的核心。</text>
  <text x="80" y="354" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">Flash Attention 是另一条线:不改数学，只重组计算顺序(全程在 GPU 片上缓存算完)，显存从 O(n²) 降到 O(n)。它是系统层加速，和上面压 KV 的架构层接力正交，已成训练框架标配。</text>
</svg>

- **MHA(多头注意力)**:原始方案,每个头独立 K/V,表达力最强,KV Cache 最大。
- **MQA(多查询)**:所有头共享一组 K/V,KV 压到 1/h,但质量损失明显。
- **GQA(分组查询)**:折中,头分组、组内共享 K/V。**当前事实主流**,Llama 2/3、Mistral、Qwen、Gemma 都用它。
- **MLA(多头潜注意力)**:DeepSeek 方案,把 KV 压到一个低维"潜向量"缓存、用时解压,省约 90% 且基本不掉质量。这是 DeepSeek 推理成本显著低于同规模模型的核心原因,近一两年开始在更多模型上扩散。

主流结论:**新出的稠密模型默认 GQA;追求极致推理效率的大 MoE 走 MLA**。

## 04 位置编码:RoPE 为什么一统江湖

Self-Attention 本身感知不到顺序——打乱输入顺序,输出也只是相应打乱,模型不知道哪个词在前。所以必须额外注入位置信息。

位置编码经历了几代演化,最终 **RoPE(旋转位置编码)** 一统江湖,被 Llama 全系、Mistral、Qwen、DeepSeek、Gemma 共同采用。理解它为什么赢,要看它解决了什么:

<svg viewBox="0 0 960 360" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d3" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d3)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 3</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">位置编码演化与 RoPE 的核心直觉</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="60" y="74" width="150" height="34" rx="4" fill="#faf9f5" stroke="#141413"/><text x="135" y="96" fill="#141413" font-size="15" text-anchor="middle">绝对编码</text><text x="135" y="124" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">超长就崩</text>
    <rect x="230" y="74" width="150" height="34" rx="4" fill="#faf9f5" stroke="#141413"/><text x="305" y="96" fill="#141413" font-size="15" text-anchor="middle">ALiBi</text><text x="305" y="124" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">距离惩罚</text>
    <rect x="400" y="74" width="150" height="34" rx="4" fill="#b08442"/><text x="475" y="96" fill="#faf9f5" font-size="15" text-anchor="middle">RoPE ✓</text><text x="475" y="124" fill="#b08442" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">主流</text>
  </g>
  <g stroke="#504e49" stroke-width="1.2" fill="none"><path d="M210 91 L230 91"/><path d="M226 87 L230 91 L226 95"/><path d="M380 91 L400 91"/><path d="M396 87 L400 91 L396 95"/></g>
  <line x1="570" y1="66" x2="570" y2="280" stroke="#e8e6dc"/>
  <text x="740" y="86" fill="#141413" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">RoPE:用旋转编码位置差</text>
  <g transform="translate(620,100)">
    <circle cx="100" cy="70" r="58" fill="none" stroke="#d9d2c2" stroke-width="0.8" stroke-dasharray="2 3"/>
    <line x1="100" y1="70" x2="56" y2="44" stroke="#1B365D" stroke-width="2"/><circle cx="56" cy="44" r="3.5" fill="#1B365D"/>
    <text x="36" y="40" fill="#1B365D" font-size="14" font-family="JetBrains Mono, Consolas, monospace">q(位置m)</text>
    <line x1="100" y1="70" x2="148" y2="38" stroke="#b08442" stroke-width="2"/><circle cx="148" cy="38" r="3.5" fill="#b08442"/>
    <text x="148" y="32" fill="#b08442" font-size="14" font-family="JetBrains Mono, Consolas, monospace">k(位置n)</text>
    <text x="100" y="152" fill="#141413" font-size="15" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">两个向量各自旋转,内积自然包含位置差(m−n)</text>
  </g>
  <line x1="60" y1="300" x2="900" y2="300" stroke="#e8e6dc"/>
  <text x="60" y="326" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">RoPE 不直接加位置向量,而是用旋转矩阵变换 Q 和 K。它赢在三点:只依赖位置差(天然支持外推到更长序列)、不同频率维度处理不同尺度关系、能和 Flash Attention 高效配合。</text>
  <text x="60" y="346" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">长上下文扩展靠一套位置插值方案(PI→NTK→YaRN),把上下文从几千一路扩到百万级。</text>
</svg>

- **绝对位置编码**:给每个位置一个固定向量,在比训练时更长的序列上会直接崩。
- **ALiBi**:不加位置向量,在注意力分数里按距离加线性惩罚("近的更相关"),外推性更好。
- **RoPE**:不直接加位置向量,而是用旋转矩阵变换 Q 和 K,让它们的内积自然包含「位置差」信息。它赢在三点:**只依赖位置差(天然支持外推)**、不同频率维度处理不同尺度、能和 Flash Attention 高效配合。

当上下文要拉到百万级,RoPE 之上还有一套**长上下文扩展**方案(位置插值 PI → NTK-aware 缩放 → YaRN 分频率处理),把窗口从几 K 一路扩到百万 token。

## 05 归一化与激活:RMSNorm + SwiGLU

这条线最简单,也最能体现大模型工程化的典型思路——**能砍就砍,砍完效果相当就砍**。

**归一化**。原始 Transformer 用 Post-Norm(归一化在残差相加之后),深层网络训练不稳。现代大模型全面转向 **Pre-Norm**(归一化在子层计算之前),残差通路上的梯度完全不受归一化影响,支持更深的网络。进一步,**RMSNorm** 把 LayerNorm 里的「均值中心化」砍掉,只做 RMS 归一化——实验发现均值中心化贡献微乎其微,去掉后计算少 7-10%,效果相当。现在 Llama、Mistral、DeepSeek、Gemma 全用 RMSNorm。

**激活函数**。FFN 的激活走了一条清晰的线:ReLU → GeLU → **SwiGLU**。SwiGLU 把 FFN 改成门控结构(两个并行变换,一个门控、一个信息流,逐元素相乘),同等算力下效果一致更好。代价是 FFN 参数要多约 1/3,但值得。PaLM、Llama 全系都用它。

到今天,**Pre-Norm + RMSNorm + SwiGLU + 无 bias** 已经是不成文的默认组合。这是典型的"砍掉不必要"——每个改动单看都小,叠起来就是可观的效率和稳定性提升。

## 06 MoE:规模化的稀疏路径

稠密模型每处理一个词,所有参数都参与计算——参数越多,算得越久。**MoE(混合专家)**打破这个绑定:把 FFN 换成 N 个并行的"专家",每次只激活 Top-K 个。

<svg viewBox="0 0 960 460" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d4" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d4)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 4</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">MoE 路由 · 稀疏激活(参数量 ≠ 计算量)</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <rect x="80" y="170" width="110" height="48" rx="6" fill="#1B365D"/><text x="135" y="200" fill="#faf9f5" font-size="18" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Token</text>
  <line x1="190" y1="194" x2="240" y2="194" stroke="#504e49" stroke-width="1.2"/><path d="M236 190 L240 194 L236 198" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <rect x="240" y="162" width="120" height="64" rx="6" fill="#E4ECF5" stroke="#1B365D" stroke-width="1.2"/><text x="300" y="190" fill="#1B365D" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Router</text><text x="300" y="210" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">选 Top-K</text>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <line x1="360" y1="180" x2="430" y2="110" stroke="#504e49" stroke-width="1.4"/><rect x="430" y="92" width="90" height="44" rx="5" fill="#b08442"/><text x="475" y="119" fill="#faf9f5" font-size="16" text-anchor="middle">专家1 ★</text>
    <line x1="360" y1="188" x2="430" y2="160" stroke="#504e49" stroke-width="0.8" stroke-dasharray="2 2"/><rect x="430" y="142" width="90" height="44" rx="5" fill="#faf9f5" stroke="#d9d2c2"/><text x="475" y="169" fill="#6b6a64" font-size="16" text-anchor="middle">专家2</text>
    <line x1="360" y1="200" x2="430" y2="210" stroke="#504e49" stroke-width="0.8" stroke-dasharray="2 2"/><rect x="430" y="192" width="90" height="44" rx="5" fill="#faf9f5" stroke="#d9d2c2"/><text x="475" y="219" fill="#6b6a64" font-size="16" text-anchor="middle">专家3</text>
    <line x1="360" y1="210" x2="430" y2="260" stroke="#504e49" stroke-width="1.4"/><rect x="430" y="242" width="90" height="44" rx="5" fill="#b08442"/><text x="475" y="269" fill="#faf9f5" font-size="16" text-anchor="middle">专家4 ★</text>
    <line x1="360" y1="218" x2="430" y2="310" stroke="#504e49" stroke-width="0.8" stroke-dasharray="2 2"/><rect x="430" y="292" width="90" height="44" rx="5" fill="#faf9f5" stroke="#d9d2c2"/><text x="475" y="319" fill="#6b6a64" font-size="16" text-anchor="middle">…N</text>
  </g>
  <line x1="520" y1="114" x2="600" y2="180" stroke="#b08442" stroke-width="1.4"/><line x1="520" y1="264" x2="600" y2="210" stroke="#b08442" stroke-width="1.4"/>
  <rect x="600" y="170" width="110" height="48" rx="6" fill="#1B365D"/><text x="655" y="200" fill="#faf9f5" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">加权合并</text>
  <line x1="710" y1="194" x2="760" y2="194" stroke="#504e49" stroke-width="1.2"/><path d="M756 190 L760 194 L756 198" fill="none" stroke="#504e49" stroke-width="1.2"/>
  <text x="820" y="200" fill="#141413" font-size="18" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">输出</text>
  <line x1="60" y1="360" x2="900" y2="360" stroke="#e8e6dc"/>
  <text x="60" y="386" fill="#b08442" font-size="15" font-weight="500" font-family="TsangerJinKai02, Georgia, serif">意义与代价</text>
  <text x="60" y="408" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">意义:总参数量随专家数线性增长,但单次推理的计算量只取决于 K。MoE 模型能在和稠密模型相同的计算预算下拥有数倍参数,学更多知识。</text>
  <text x="60" y="430" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">代价:多机训练时专家分布在不同卡上,token 路由要跨卡通信;部分专家可能始终不被选中(坍塌);推理时所有专家权重都得常驻显存。</text>
</svg>

意义:**参数量和计算量解耦**。总参数量随专家数线性增长,但单次推理的计算量只取决于 K。所以一个 MoE 模型能在和稠密模型相同的计算预算下拥有数倍参数(比如总参 671B、每词只激活 37B),学更多知识。

主流的 MoE 设计有几个要点:用 **Router**(一个轻量网络)给每个专家打分、选 Top-K;**负载均衡**是最大工程挑战(Router 偏爱少数专家会导致其他专家闲置),常见解法是辅助损失或更精细的 bias 调整;趋势是**细粒度专家**(专家做小、数量增多,组合更丰富)加**少量共享专家**(始终激活,处理通用知识)。

MoE 不是免费午餐:多机训练时专家分布在不同卡上,token 路由要跨卡通信;部分专家可能始终不被选中(专家坍塌);推理时即使只激活少数专家,所有专家权重都得常驻显存。

## 07 主流形态:把组件拼起来

把前面几节合起来,就得到了当前主流大模型的架构选型。它高度收敛:

<svg viewBox="0 0 960 380" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="d5" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#d5)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 5</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">主流架构选型:四件套 + Dense/MoE 分叉</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="200" y="74" width="320" height="38" rx="5" fill="#1B365D"/><text x="360" y="98" fill="#faf9f5" font-size="17" text-anchor="middle">RoPE 旋转位置编码</text>
    <rect x="200" y="118" width="320" height="38" rx="5" fill="#1B365D"/><text x="360" y="142" fill="#faf9f5" font-size="17" text-anchor="middle">RMSNorm (Pre-Norm)</text>
    <rect x="200" y="162" width="320" height="38" rx="5" fill="#1B365D"/><text x="360" y="186" fill="#faf9f5" font-size="17" text-anchor="middle">SwiGLU 激活 · 无 bias</text>
    <rect x="200" y="206" width="320" height="38" rx="5" fill="#1B365D"/><text x="360" y="230" fill="#faf9f5" font-size="17" text-anchor="middle">GQA  或  MLA 注意力</text>
  </g>
  <text x="360" y="270" fill="#141413" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">主流共识(几乎所有新模型)</text>
  <line x1="520" y1="158" x2="600" y2="120" stroke="#504e49" stroke-width="1.2"/>
  <line x1="520" y1="158" x2="600" y2="200" stroke="#504e49" stroke-width="1.2"/>
  <rect x="600" y="96" width="220" height="50" rx="6" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
  <text x="710" y="120" fill="#141413" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">Dense FFN</text>
  <text x="710" y="138" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">Llama · Qwen · Gemma</text>
  <rect x="600" y="176" width="220" height="50" rx="6" fill="#b08442"/>
  <text x="710" y="200" fill="#faf9f5" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">MoE 稀疏专家</text>
  <text x="710" y="218" fill="#faf9f5" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">DeepSeek · Mixtral · 大旗舰</text>
  <line x1="60" y1="300" x2="900" y2="300" stroke="#e8e6dc"/>
  <text x="60" y="326" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">四件套(RoPE + RMSNorm + SwiGLU + GQA/MLA)已是事实共识。剩下的分歧只有一个:要不要把 Dense FFN 换成 MoE。中等规模走 Dense 省事,超大旗舰走 MoE 要表达力。</text>
  <text x="60" y="346" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">DeepSeek 是对这套共识改动最大的代表——用 MLA 替 GQA、细粒度 MoE 替稠密 FFN,推理成本压到同规模最低。</text>
</svg>

一句话:**四件套(RoPE + RMSNorm + SwiGLU + GQA/MLA)已是事实共识**,几乎所有新模型都遵循。剩下的分歧基本只有一个——**要不要把 Dense FFN 换成 MoE**:中等规模模型走 Dense(简单稳定),追求极致能力的超大旗舰走 MoE(参数量上去了,单次计算还控得住)。

具体到代表模型:Llama、Qwen、Gemma 多是 GQA + Dense 或 GQA + MoE 的组合;DeepSeek 是改动最大的代表——用 MLA 替 GQA、用细粒度 MoE 替稠密 FFN,把推理成本压到同规模最低。差异主要在规模和这一个 Dense/MoE 的选择上。

## 08 演化方向:主流之外在探索什么

主流不是终点。当前有几个明确的探索方向,可能改写下一轮的主流:

- **稀疏注意力**:标准注意力是 O(n²),长序列太贵。Sliding Window(固定窗口)、以及更新的可训练/学习式稀疏注意力,试图只算真正重要的 token 对,把成本降下来。
- **线性注意力 / 混合架构**:Transformer 注意力有两个根本局限——O(n²) 复杂度、推理时 KV Cache 随序列涨。状态空间模型(SSM,代表是 Mamba)用线性递推替代,理论 O(n)、KV Cache 不涨,但精确检索弱。当前的务实解法是**混合**:大部分层用线性/SSM 模块,少量层保留全注意力做精确检索。
- **原生多模态**:早期是"视觉编码器 + 语言模型"后期拼接,现在走向 early fusion——文本和图像 token 从底层就混合,视觉模态从外挂变成底座的一部分。
- **推理时计算(Test-Time Compute)对架构的反推**:推理模型(o1、R1 这类)在推理时生成超长思维链,这反过来让 KV Cache 压力剧增,使 MLA、稀疏注意力这些"压成本"方案变得更关键。训练和推理的边界正在被重新搅动。

这些方向现在还都不是主流,但每一个都在动摇当前主流的某个假设。

## 09 结语:架构是权衡的艺术

回头看,主流架构之所以是现在这样,不是因为某个"最优解",而是因为每一个组件都是在**表达力、训练稳定性、推理效率、部署成本**这几个维度之间,根据当下的算力和任务,做出的最合理权衡。

每一次架构创新,本质都是发现旧方案的某个隐藏假设,然后打破它:以为必须有 Encoder?Decoder-Only 照样好。以为每个头都要独立 KV?GQA/MLA 证明可以共享甚至压缩。以为归一化必须做均值?RMSNorm 去掉几乎无损。以为稠密激活是必须的?MoE 让参数量和计算量解耦。

当前的主流是这套约束下的最优解,但它会继续演化——稀疏注意力、混合架构、推理时计算,都在推着它往前走。理解了这套权衡的逻辑,你不仅能看懂现在的模型,也能看懂未来每一个新架构在试图打破哪个假设。

---

**参考资料**:Attention Is All You Need (2017) · GQA (2023) · DeepSeek-V2/V3 技术报告 · RoPE/RoFormer (2021) · YaRN (2023) · Flash Attention 1/2/3 · Mamba (2023) · SwiGLU (2020) · RMSNorm (2019)
