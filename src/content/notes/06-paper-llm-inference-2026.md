---
title: "大模型推理与部署综述:从 KV Cache 到端侧"
deck: "模型训好了,怎么又快又省地跑起来——KV Cache 瓶颈、PagedAttention、投机解码、量化部署、推理框架,以及 reasoning 时代的新挑战。"
date: 2026-07-16
type: "论文"
tags: ["大模型", "推理"]
readtime: "约 15 分钟"
---

前两篇讲了架构和训练:架构决定模型"能做什么",训练决定模型"做成什么样"。这篇讲最后一步——**模型训好了,怎么让它又快又省地跑起来**。推理和训练是完全不同的两套工程:训练追的是"更强",推理追的是"更省更快"。这篇系统讲清推理侧的完整工程图景。

## 01 引言:推理要解决什么

一个训好的大模型,要变成能服务用户的产品,得同时扛住三个压力:

- **延迟**:用户问一句话,模型多快能开始回答、多快答完。延迟高,体验就差。
- **吞吐**:一台服务器能同时服务多少用户。吞吐低,成本就高。
- **成本**:跑这个模型要烧多少 GPU、多少电。模型越大越贵。

这三件事常常互相打架:要低延迟就得少排队(吞吐受影响),要高吞吐就得批量处理(延迟变高),要低成本就得用更小的模型或更省的部署(可能掉质量)。推理工程的全部任务,就是在这三者之间找最优解。

而横在所有这些优化面前的同一个头号敌人,叫 **KV Cache**。

## 02 核心瓶颈:KV Cache

大模型是**自回归**生成:每次只生成一个词,下一个词依赖前面所有词。为了不算重复,推理时会把之前每个词的 Key 和 Value 向量缓存下来,这就是 **KV Cache**。

问题在于:**KV Cache 随序列长度线性增长,而且增长得很快。** 一个 70B 级模型在 8K 长度上,KV Cache 就能吃掉几十 GB 显存——比模型权重本身还大。

<svg viewBox="0 0 960 360" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="i1" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#i1)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 1</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">KV Cache:随生成线性膨胀</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="JetBrains Mono, Consolas, monospace" font-size="13">
    <text x="80" y="92" fill="#6b6a64">生成第 1 词</text>
    <rect x="80" y="100" width="24" height="24" rx="3" fill="#1B365D"/><text x="92" y="116" fill="#faf9f5" font-size="12" text-anchor="middle">K1V1</text>
    <text x="80" y="152" fill="#6b6a64">生成第 3 词</text>
    <rect x="80" y="160" width="24" height="24" rx="3" fill="#1B365D"/><text x="92" y="176" fill="#faf9f5" font-size="12" text-anchor="middle">K1V1</text>
    <rect x="108" y="160" width="24" height="24" rx="3" fill="#1B365D"/><text x="120" y="176" fill="#faf9f5" font-size="12" text-anchor="middle">K2V2</text>
    <rect x="136" y="160" width="24" height="24" rx="3" fill="#1B365D"/><text x="148" y="176" fill="#faf9f5" font-size="12" text-anchor="middle">K3V3</text>
    <text x="80" y="212" fill="#6b6a64">生成第 N 词</text>
    <rect x="80" y="220" width="24" height="24" rx="3" fill="#1B365D"/>
    <rect x="108" y="220" width="24" height="24" rx="3" fill="#1B365D"/>
    <rect x="136" y="220" width="24" height="24" rx="3" fill="#1B365D"/>
    <rect x="164" y="220" width="24" height="24" rx="3" fill="#1B365D"/>
    <rect x="192" y="220" width="24" height="24" rx="3" fill="#1B365D"/>
    <text x="230" y="236" fill="#504e49" font-size="14" font-family="TsangerJinKai02, Georgia, serif">…N 组 KV,显存随序列线性涨</text>
  </g>
  <line x1="500" y1="80" x2="500" y2="280" stroke="#e8e6dc"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <text x="720" y="100" fill="#141413" font-size="18" text-anchor="middle">为什么是头号杀手</text>
    <text x="540" y="132" fill="#504e49" font-size="15">① 显存:70B/8K 长度,KV Cache 几十 GB</text>
    <text x="540" y="156" fill="#504e49" font-size="15">② 吞吐:显存被 KV 吃掉,能并发的请求数骤减</text>
    <text x="540" y="180" fill="#504e49" font-size="15">③ 延迟:每步生成都要搬动整个 KV Cache,访存成瓶颈</text>
    <text x="540" y="218" fill="#b08442" font-size="15.5" font-weight="500">所有推理优化,几乎都是围绕“怎么治 KV Cache”展开</text>
  </g>
  <line x1="60" y1="300" x2="900" y2="300" stroke="#e8e6dc"/>
  <text x="60" y="326" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">读图:推理时模型每生成一个词,都要把历史所有词的 KV 带在身边。序列越长,KV Cache 越大,显存和访存开销越重。它是延迟、吞吐、成本三座大山共同的根源。</text>
  <text x="60" y="346" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">所以接下来的所有优化——架构压缩、系统调度、投机解码、量化——本质上都是在这座山上动刀。</text>
</svg>

KV Cache 为什么这么要命:它直接吃掉显存(并发请求数骤减),它的搬运是每步生成的访存瓶颈(延迟拉高),它的大小决定了部署成本。所以推理侧几乎所有的优化——架构压缩、系统调度、投机解码、量化——本质上都是在这座山上动刀。

## 03 架构层压缩:GQA / MLA

最根本的解法是在架构设计时就压小 KV。这就是篇一讲过的 **GQA**(分组共享 KV)和 **MLA**(DeepSeek 把 KV 压成低维潜向量)。

这里不重复展开(详见篇一),只需记住:**架构层的 KV 压缩是性价比最高的优化,它从源头减少了要缓存的东西,后面所有系统层优化都受益。** 现在的新模型几乎默认 GQA,追求极致推理效率的大 MoE 走 MLA。

## 04 系统层优化:PagedAttention 与连续批处理

架构压完了,系统调度还能再省。这一层最有影响力的创新是 **PagedAttention**(vLLM 团队提出的)。

传统做法是给每个请求预分配一段**连续**的显存空间(按它可能用到的最大长度)。问题是:请求实际长度不确定,预分配大了浪费、小了溢出,而且不同请求之间留下大量**碎片**,显存利用率很低。

<svg viewBox="0 0 960 360" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="i2" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#i2)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 2</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">PagedAttention:把显存当虚拟内存管</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <text x="240" y="84" fill="#141413" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">传统:连续预分配(碎片多)</text>
  <g font-family="JetBrains Mono, Consolas, monospace" font-size="12">
    <rect x="80" y="96" width="80" height="22" rx="2" fill="#1B365D"/><text x="120" y="111" fill="#faf9f5" font-size="12" text-anchor="middle">请求A 实际</text>
    <rect x="160" y="96" width="80" height="22" rx="2" fill="none" stroke="#b08442" stroke-dasharray="3 2"/><text x="200" y="111" fill="#b08442" font-size="12" text-anchor="middle">浪费</text>
    <rect x="80" y="124" width="50" height="22" rx="2" fill="#1B365D"/><text x="105" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">B 实际</text>
    <rect x="130" y="124" width="110" height="22" rx="2" fill="none" stroke="#b08442" stroke-dasharray="3 2"/><text x="185" y="139" fill="#b08442" font-size="12" text-anchor="middle">浪费</text>
    <rect x="80" y="152" width="120" height="22" rx="2" fill="#1B365D"/><text x="140" y="167" fill="#faf9f5" font-size="12" text-anchor="middle">请求C 实际</text>
    <rect x="200" y="152" width="40" height="22" rx="2" fill="none" stroke="#b08442" stroke-dasharray="3 2"/><text x="220" y="167" fill="#b08442" font-size="12" text-anchor="middle">浪费</text>
  </g>
  <text x="240" y="200" fill="#b08442" font-size="14.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">按最大长度预分配 · 大量碎片</text>
  <line x1="470" y1="80" x2="470" y2="240" stroke="#e8e6dc"/>
  <text x="710" y="84" fill="#141413" font-size="17" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">PagedAttention:分页块按需分配</text>
  <g font-family="JetBrains Mono, Consolas, monospace" font-size="12">
    <rect x="510" y="96" width="30" height="22" rx="2" fill="#1B365D"/><text x="525" y="111" fill="#faf9f5" font-size="11" text-anchor="middle">A</text>
    <rect x="540" y="96" width="30" height="22" rx="2" fill="#1B365D"/><text x="555" y="111" fill="#faf9f5" font-size="11" text-anchor="middle">A</text>
    <rect x="570" y="96" width="30" height="22" rx="2" fill="#b08442"/><text x="585" y="111" fill="#faf9f5" font-size="11" text-anchor="middle">B</text>
    <rect x="600" y="96" width="30" height="22" rx="2" fill="#1B365D"/><text x="615" y="111" fill="#faf9f5" font-size="11" text-anchor="middle">A</text>
    <rect x="630" y="96" width="30" height="22" rx="2" fill="#b08442"/><text x="645" y="111" fill="#faf9f5" font-size="11" text-anchor="middle">B</text>
    <rect x="660" y="96" width="30" height="22" rx="2" fill="#6b6a64"/><text x="675" y="111" fill="#faf9f5" font-size="11" text-anchor="middle">C</text>
    <rect x="690" y="96" width="30" height="22" rx="2" fill="#b08442"/><text x="705" y="111" fill="#faf9f5" font-size="11" text-anchor="middle">B</text>
    <rect x="510" y="124" width="30" height="22" rx="2" fill="#1B365D"/><text x="525" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">A</text>
    <rect x="540" y="124" width="30" height="22" rx="2" fill="#6b6a64"/><text x="555" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">C</text>
    <rect x="570" y="124" width="30" height="22" rx="2" fill="#6b6a64"/><text x="585" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">C</text>
    <rect x="600" y="124" width="30" height="22" rx="2" fill="#1B365D"/><text x="615" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">A</text>
    <rect x="630" y="124" width="30" height="22" rx="2" fill="#6b6a64"/><text x="645" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">C</text>
    <rect x="660" y="124" width="30" height="22" rx="2" fill="#1B365D"/><text x="675" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">A</text>
    <rect x="690" y="124" width="30" height="22" rx="2" fill="#6b6a64"/><text x="705" y="139" fill="#faf9f5" font-size="11" text-anchor="middle">C</text>
  </g>
  <text x="710" y="178" fill="#504e49" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">每个请求的 KV 分散在多个固定大小的页块里</text>
  <text x="710" y="200" fill="#b08442" font-size="14.5" text-anchor="middle" font-family="TsangerJinKai02, Georgia, serif">按需分页 · 无碎片 · 显存利用率接近满</text>
  <line x1="60" y1="260" x2="900" y2="260" stroke="#e8e6dc"/>
  <text x="60" y="288" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">PagedAttention 借鉴操作系统的虚拟内存分页:把 KV Cache 切成固定大小的页块,按需分配,用一张表记录每个请求的页块在哪。彻底消灭碎片,显存利用率接近满。</text>
  <text x="60" y="310" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">配套的还有连续批处理(请求随到随走,动态拼批)和 Prefill/Decode 分离(把“读题”和“答题”两阶段分到不同硬件,各自优化)。vLLM 靠这套成了最流行的推理引擎之一。</text>
</svg>

**PagedAttention** 借鉴操作系统的虚拟内存分页:把 KV Cache 切成固定大小的**页块**,按需分配,用一张表记录每个请求的页块散落在哪。这样彻底消灭碎片,显存利用率接近满。

配套还有两个重要优化:**连续批处理**(continuous batching)——请求随到随走、动态拼进同一批,不再等齐一批才处理,大幅提高吞吐;**Prefill/Decode 分离**——把"读题"(处理输入,计算密集)和"答题"(生成输出,访存密集)两阶段分到不同硬件,各自优化。

## 05 加速技术:投机解码

前面都是"省"和"调度",投机解码(Speculative Decoding)直接"提速":**让小模型先猜几个词,大模型一次性并行验证。**

<svg viewBox="0 0 960 360" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="i3" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#i3)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 3</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">投机解码:小模型猜 · 大模型验证</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="80" y="90" width="150" height="44" rx="6" fill="#b08442"/><text x="155" y="118" fill="#faf9f5" font-size="17" text-anchor="middle">小模型(草稿)</text>
    <text x="80" y="156" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">快速猜 4 个词:</text>
    <rect x="80" y="166" width="34" height="26" rx="3" fill="#faf9f5" stroke="#141413"/><text x="97" y="184" fill="#141413" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">词1</text>
    <rect x="118" y="166" width="34" height="26" rx="3" fill="#faf9f5" stroke="#141413"/><text x="135" y="184" fill="#141413" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">词2</text>
    <rect x="156" y="166" width="34" height="26" rx="3" fill="#faf9f5" stroke="#141413"/><text x="173" y="184" fill="#141413" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">词3</text>
    <rect x="194" y="166" width="34" height="26" rx="3" fill="#faf9f5" stroke="#141413"/><text x="211" y="184" fill="#141413" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">词4</text>
  </g>
  <line x1="245" y1="178" x2="320" y2="178" stroke="#504e49" stroke-width="1.4"/><path d="M316 174 L320 178 L316 182" fill="none" stroke="#504e49" stroke-width="1.4"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="325" y="90" width="150" height="44" rx="6" fill="#1B365D"/><text x="400" y="118" fill="#faf9f5" font-size="17" text-anchor="middle">大模型(验证)</text>
    <text x="325" y="156" fill="#6b6a64" font-size="14" font-family="JetBrains Mono, Consolas, monospace">一次性并行验证 4 个词:</text>
    <rect x="325" y="166" width="34" height="26" rx="3" fill="#1B365D"/><text x="342" y="184" fill="#faf9f5" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">✓</text>
    <rect x="363" y="166" width="34" height="26" rx="3" fill="#1B365D"/><text x="380" y="184" fill="#faf9f5" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">✓</text>
    <rect x="401" y="166" width="34" height="26" rx="3" fill="#1B365D"/><text x="418" y="184" fill="#faf9f5" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">✓</text>
    <rect x="439" y="166" width="34" height="26" rx="3" fill="#fff" stroke="#b08442" stroke-width="1.5"/><text x="456" y="184" fill="#b08442" font-size="14" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">✗</text>
    <text x="400" y="214" fill="#504e49" font-size="14" text-anchor="middle">猜对 3 个,第 4 个错</text>
  </g>
  <line x1="490" y1="178" x2="555" y2="178" stroke="#504e49" stroke-width="1.4"/><path d="M551 174 L555 178 L551 182" fill="none" stroke="#504e49" stroke-width="1.4"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="560" y="90" width="340" height="124" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="730" y="120" fill="#141413" font-size="17" text-anchor="middle">结果:一轮出 4 个词(而非 4 轮)</text>
    <text x="730" y="148" fill="#6b6a64" font-size="14.5" text-anchor="middle">3 个白赚 + 第 4 个由大模型修正</text>
    <text x="730" y="176" fill="#b08442" font-size="15.5" text-anchor="middle">实测 2~3 倍加速,质量无损</text>
    <text x="730" y="200" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">大模型验证是并行的,不比生成 1 个词慢多少</text>
  </g>
  <line x1="60" y1="246" x2="900" y2="246" stroke="#e8e6dc"/>
  <text x="60" y="274" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">原理:小模型便宜快速,先草拟几个词;大模型贵的不是“算一个词”,而是“搬一次 KV Cache”,所以并行验证多个词的成本和生成一个词差不多。猜对了就白赚,猜错了从错的地方用大模型重生成。</text>
  <text x="60" y="296" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">关键洞察:大模型推理的瓶颈是访存(搬 KV Cache),不是算力。投机解码用“多算”换“少搬”,正好打在这个点上。MoE 模型因为每次只激活部分专家,还演化出了专用的投机解码。</text>
</svg>

原理很巧妙:**大模型推理的瓶颈是访存(搬运 KV Cache),不是算力**。生成一个词要搬一次 KV,而并行验证多个词也大致只搬一次。所以让小模型先猜几个词、大模型一次并行验证,猜对就白赚,猜错就从错处用大模型重生成。实测 2-3 倍加速,且**质量无损**(最终输出仍由大模型保证)。这是当前最实用的纯加速手段。

## 06 量化部署:把模型压小

模型本身的权重也很大。**量化**就是把模型参数从高精度(如 16 位浮点)压到低精度(如 4 位整数 INT4),直接减小模型体积和显存占用。

- **INT4 / INT8**:权重压到 4 位或 8 位,显存降到原来的 1/4 或 1/2,推理更快,代价是轻微掉精度(通常可接受)。
- **FP8**:新的 8 位浮点格式,在精度和速度间更平衡,新一代 GPU 原生支持。
- **GGUF / llama.cpp**:专门为 CPU 和消费级硬件优化的格式和推理库,让大模型能在普通电脑甚至手机上跑。

量化的核心权衡是**精度 vs 省内存**:压得越狠越省,但掉精度越多。主流实践是权重用 INT4、激活用更高精度,在多数任务上几乎无损。

端侧部署(SLM,小语言模型)是另一个方向:与其部署一个量化后的大模型,不如直接用一个本来就小(几 B 参数)的模型,靠篇二讲的蒸馏获得接近的能力。Gemma、Phi、Qwen 的小尺寸版本就是为端侧设计的。

## 07 推理框架:各司其职

把这些技术打包成能用的推理引擎,就是各种推理框架。它们定位不同:

<svg viewBox="0 0 960 320" xmlns="http://www.w3.org/2000/svg" width="100%">
  <defs><pattern id="i4" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.9" fill="#E3E2DC"/></pattern></defs>
  <rect width="100%" height="100%" fill="#f5f4ed"/>
  <rect width="100%" height="100%" fill="url(#i4)" opacity="0.5"/>
  <text x="60" y="38" fill="#1B365D" font-size="16" font-weight="600" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">FIGURE 4</text>
  <text x="190" y="38" fill="#504e49" font-size="16" font-family="JetBrains Mono, Consolas, monospace" letter-spacing="3">推理框架定位</text>
  <line x1="60" y1="52" x2="900" y2="52" stroke="#1B365D" stroke-width="0.8"/>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="80" y="90" width="200" height="110" rx="8" fill="#1B365D"/>
    <text x="180" y="122" fill="#faf9f5" font-size="21" text-anchor="middle">vLLM</text>
    <text x="180" y="148" fill="#d8d2bf" font-size="14.5" text-anchor="middle">PagedAttention · 连续批处理</text>
    <text x="180" y="168" fill="#b08442" font-size="14.5" text-anchor="middle">通用高性能服务</text>
    <text x="180" y="188" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">最流行 · 开源</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="300" y="90" width="200" height="110" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="400" y="122" fill="#141413" font-size="21" text-anchor="middle">SGLang</text>
    <text x="400" y="148" fill="#6b6a64" font-size="14.5" text-anchor="middle">RadixAttention · 多轮优化</text>
    <text x="400" y="168" fill="#1B365D" font-size="14.5" text-anchor="middle">复杂/多轮场景强</text>
    <text x="400" y="188" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">新兴 · 结构化生成</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="520" y="90" width="200" height="110" rx="8" fill="#faf9f5" stroke="#141413" stroke-width="1.2"/>
    <text x="620" y="122" fill="#141413" font-size="21" text-anchor="middle">TensorRT-LLM</text>
    <text x="620" y="148" fill="#6b6a64" font-size="14.5" text-anchor="middle">NVIDIA 官方优化</text>
    <text x="620" y="168" fill="#1B365D" font-size="14.5" text-anchor="middle">极致 GPU 性能</text>
    <text x="620" y="188" fill="#6b6a64" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">英伟达硬件最佳搭档</text>
  </g>
  <g font-family="TsangerJinKai02, Georgia, serif">
    <rect x="740" y="90" width="160" height="110" rx="8" fill="#b08442"/>
    <text x="820" y="122" fill="#faf9f5" font-size="21" text-anchor="middle">llama.cpp</text>
    <text x="820" y="148" fill="#faf9f5" font-size="14.5" text-anchor="middle">GGUF · CPU/边缘</text>
    <text x="820" y="168" fill="#faf9f5" font-size="14.5" text-anchor="middle">端侧/消费级硬件</text>
    <text x="820" y="188" fill="#fff" font-size="13.5" text-anchor="middle" font-family="JetBrains Mono, Consolas, monospace">笔记本 · 手机</text>
  </g>
  <line x1="60" y1="240" x2="900" y2="240" stroke="#e8e6dc"/>
  <text x="60" y="268" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">选型逻辑:要高并发服务用 vLLM/SGLang(靠 PagedAttention 和连续批处理);要在英伟达硬件上榨干性能用 TensorRT-LLM;要在普通设备或边缘跑用 llama.cpp。</text>
  <text x="60" y="290" fill="#504e49" font-size="14.5" font-family="TsangerJinKai02, Georgia, serif">它们不是互斥的——同一个模型可以服务端用 vLLM、端侧用 llama.cpp,各取所需。</text>
</svg>

选型逻辑:**高并发服务**用 vLLM/SGLang(靠 PagedAttention 和连续批处理撑吞吐);**英伟达硬件上榨干性能**用 TensorRT-LLM(NVIDIA 官方深度优化);**普通设备或边缘**用 llama.cpp(CPU 友好、GGUF 格式)。它们不互斥——同一个模型可以服务端用 vLLM、端侧用 llama.cpp。

## 08 reasoning model 的推理新挑战

最后,推理侧正在出现一个新变量:**reasoning model(o1、R1、Deep Think 这类)让推理算力占比飙升。**

以前的模型,推理就是"读题 + 答题",算力开销相对固定。reasoning model 不同——它会在回答前先生成**超长的思维链**,在难题上"多想很久"。这意味着:

- **单个请求的算力成本高得多**(生成几千上万 token 的思维链)。
- **延迟变长**(用户要等模型想完)。
- **KV Cache 压力剧增**(思维链也是 token,要缓存)。

这反过来又强化了前面那些优化的价值:KV Cache 压缩(MLA/稀疏注意力)在 reasoning 场景变得更关键,投机解码、Prefill/Decode 分离也更必要。**Test-Time Compute(推理时多算 = 更强)是个新维度,但它直接加大了推理侧的工程压力**——这也是为什么推理工程这两年突然变得这么热。

## 09 结语:训练追智能,推理追效率

三篇连起来看,大模型的全貌是:**架构决定能力边界,训练把能力开发出来,推理把能力以低成本交付出去。**

训练追的是"更强"(更大的模型、更好的对齐、更会推理),推理追的是"更省更快"(更小的 KV Cache、更高的吞吐、更低的延迟)。这两条线过去是分开的,但 reasoning 时代的到来让它们开始交汇——模型在推理时"多想"能变强,但"多想"就要"多花"算力,推理工程的压力反过来又推动架构和训练做出调整。

理解了这套"架构—训练—推理"的完整链条,不仅能看懂现在的大模型,也能看懂未来每一个新进展落在哪一环、要解决什么问题。

---

**参考资料**:PagedAttention / vLLM (2023) · Flash Attention 1/2/3 · Speculative Decoding · GPTQ / AWQ / GGUF 量化 · SGLang · TensorRT-LLM · OpenAI o1 / DeepSeek-R1(Test-Time Compute)
