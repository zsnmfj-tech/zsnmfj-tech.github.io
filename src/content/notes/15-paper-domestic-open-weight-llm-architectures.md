---
title: "国内主流开放权重模型架构对比"
deck: "从 Kimi K3、DeepSeek-V4-Pro、GLM-5.2、MiniMax M3 到 Qwen3.5，比较五种百万上下文架构如何保存历史、检索信息、传递深层特征并控制 MoE 计算成本。"
date: 2026-07-31
type: "论文"
tags: ["大模型", "模型架构", "开放权重"]
readtime: "约 18 分钟"
---

把上下文窗口扩到一百万 token 后，标准 Transformer 的两笔账都会迅速变大：预填充阶段需要处理接近平方增长的注意力计算，解码阶段还要长期保存并反复读取 KV Cache。国内新一代旗舰模型给出的答案并不相同。有的把历史压进固定大小的递归状态，有的保留历史 KV 但只检索少量 token 或块，还有的同时维护局部原文、细粒度记忆和全局摘要。

截至 2026 年 7 月 31 日，Kimi K3、DeepSeek-V4-Pro、GLM-5.2、MiniMax M3 和 Qwen3.5-397B-A17B 正好代表五种不同取舍。它们都使用稀疏 MoE 扩大参数容量，架构分歧主要发生在三个位置：序列方向如何处理百万 token，深度方向如何让信息跨层流动，以及开放权重之后能否承担实际部署成本。

这里还需要区分两个常被混用的词。五个模型都公开了权重，但许可证并不相同。DeepSeek 与 GLM 使用 MIT，Qwen 使用 Apache 2.0；Kimi 和 MiniMax 采用各自的社区许可证并附带商业条件。下文统一称为开放权重模型，涉及商业使用时仍应以每个仓库的最新许可文本为准。

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/domestic-llm/architecture_routes_mobile.svg" width="390" height="850"><img src="/images/domestic-llm/architecture_routes.svg" alt="五个国内开放权重模型分成状态压缩、稀疏检索和多尺度压缩三条长上下文路线" loading="lazy" width="760" height="480"></picture><figcaption>图 1：五种架构可以归入三条长上下文路线，底层共同使用稀疏 MoE，把总参数容量与每个 token 的计算量分开。</figcaption></figure>

## 01 参数规模只说明了一半

五个模型都把总参数与激活参数分开。总参数描述模型需要存储和分布式加载多少权重，激活参数更接近每处理一个 token 时真正参加计算的模型容量。两者不能互相替代：17B 激活参数不意味着 397B 权重可以按普通 17B 稠密模型部署。

| 模型 | 总参数 / 激活参数 | 上下文 | 模态 | 权重许可 |
| --- | --- | --- | --- | --- |
| Kimi K3 | 2.8T / 104B | 1,048,576 | 文本、图像 | Kimi K3 License |
| DeepSeek-V4-Pro | 1.6T / 49B | 1,048,576 | 文本 | MIT |
| GLM-5.2 | 744B / 40B* | 1,048,576 | 文本 | MIT |
| MiniMax M3 | 约 428B / 约 23B | 1,048,576 | 文本、图像、视频 | MiniMax Community License |
| Qwen3.5-397B-A17B | 397B / 17B | 原生 262,144，可扩展至约 1,010,000 | 文本、图像、视频 | Apache 2.0 |

\* GLM-5 技术报告给出的 744B/40B 不计词嵌入和输出层；GLM-5.2 延续这套主干并加入 IndexShare。把这些层计入后会得到更大的估算值，因此不同资料中会同时出现 744B、约 753B 等数字。

Kimi K3 的 2.8T 总参数和 104B 激活参数都明显高于另外四个模型。它追求的是大容量与长程智能体能力，部署时要承担更高的单 token 计算和专家并行通信成本。Qwen3.5 旗舰只激活 17B，MiniMax M3 约为 23B，更强调稀疏激活带来的推理经济性。DeepSeek-V4-Pro 与 GLM-5.2 位于中间，但前者的长上下文结构复杂度明显更高。

上下文数字也要分清口径。Kimi、DeepSeek、GLM 和 MiniMax 的开放权重配置都把最大位置设到约 1M；Qwen3.5-397B-A17B 的原生窗口是 262K，官方模型卡提供把它扩到约 1.01M 的配置。能接收一百万 token，只代表模型和推理系统允许这段序列进入，不代表其中每个细节都能被无损记住和稳定推理。

## 02 三条路线在处理同一笔长上下文成本

**状态压缩路线**由 Kimi K3 和 Qwen3.5 代表。大部分层不为每个历史 token 保留完整 KV，而是把新信息持续写进固定大小的递归状态。少数全局注意力层仍然查看原始历史，用来补偿递归记忆对精确字符串、数字和代码细节的覆盖。

**稀疏检索路线**由 GLM-5.2 和 MiniMax M3 代表。两者保留历史 KV，再用轻量索引器挑出一小部分候选。GLM 以 token 为粒度选择 Top-2048，MiniMax 以 128-token 块为粒度、为每个 GQA 组选择 16 个块。精确 Softmax 注意力只作用于被选中的候选。

**多尺度压缩路线**由 DeepSeek-V4-Pro 代表。它保留最近 128 个 token 的原始局部窗口，把每 4 个 token 压成细粒度 CSA 条目，再把每 128 个 token 压成 HCA 全局条目。局部原文、动态检索和全局摘要同时存在，KV 占用最低的一侧也带来最高的系统复杂度。

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/domestic-llm/long_context_mechanisms_mobile.svg" width="390" height="1120"><img src="/images/domestic-llm/long_context_mechanisms.svg" alt="Kimi、DeepSeek、GLM、MiniMax 和 Qwen 五种长上下文机制的处理链路" loading="lazy" width="760" height="570"></picture><figcaption>图 2：五个模型减少注意力成本的位置不同。递归状态压缩历史，稀疏检索限制每次读取的候选，多尺度方案同时压缩条目数量和表示粒度。</figcaption></figure>

## 03 Kimi K3 同时改造序列、深度和专家空间

Kimi K3 有 93 层主干，其中 69 层使用 Kimi Delta Attention（KDA），24 层使用门控多头潜注意力（Gated MLA）。KDA 通过递归状态处理长历史，MLA 周期性回看完整 token 序列。这个组合与 Qwen3.5 的混合注意力方向接近，但 K3 还对深度信息流和 MoE 通信做了额外改造。

Attention Residuals（AttnRes）允许当前层从词嵌入和更早的网络块中加权读取信息。普通残差连接主要沿相邻层向前传递状态，93 层网络中的早期特征要经过很长路径才能到达后部；AttnRes 为深度方向增加了直接检索路径。它作用于不同网络深度产生的表示，不处理 token 之间的关系。

K3 每层拥有 896 个路由专家，每个 token 选择 16 个，另有 2 个共享专家。Stable LatentMoE 先把表示压缩到潜空间，再完成专家通信与计算，目标是降低 2.8T 模型在专家并行中的带宽压力。总参数很大并不等于每次都运行 2.8T，但 104B 激活参数仍是五个模型中最高的一档。

这套结构适合把模型能力上限、长程任务和深层信息流放在优先位置。代价同样直接：完整权重、激活计算和跨卡通信都很重；KDA 的固定状态会压缩历史；自定义许可证也需要在产品化前单独审查。它更像数据中心级旗舰，而不是可以由普通工作站承担的本地模型。

## 04 DeepSeek-V4-Pro 用三种粒度保存历史

DeepSeek-V4-Pro 有 61 层、1.6T 总参数和 49B 激活参数。每个 MoE 层包含 384 个路由专家，每个 token 选择 6 个，再加 1 个共享专家。前三个 MoE 层采用 Hash 路由，后续层使用常规的动态路由。

长上下文部分由 CSA、HCA 和局部滑动窗口组成。Compressed Sparse Attention（CSA）先以 4:1 比例压缩 KV，再由 Lightning Indexer 选择 Top-1024 条目执行稀疏注意力。Heavily Compressed Attention（HCA）以 128:1 压缩历史，不做 Top-K，而是对全部高度压缩条目运行稠密注意力。额外的 128-token 滑动窗口保留最近原文，负责局部代码结构、标点和短距离关系。

三种粒度分别承担局部精确关系、较细的远程检索和持续的全局视野。官方技术报告估算，在 1M 上下文下，V4-Pro 的单 token 推理 FLOPs 为 DeepSeek-V3.2 的 27%，KV Cache 为其 10%。这些数字是相对官方上一代模型的估算，不应直接换算成与其他四个模型的绝对速度排名。

深度方向采用四路 Manifold-Constrained Hyper-Connections（mHC）。每层不再只有一条残差流，而是从四路状态中组合输入，再把输出写回多路状态。约束矩阵被限制在双随机矩阵集合内，用来控制深层网络中的数值放大。训练优化器也从以 AdamW 为主转向大部分矩阵参数使用 Muon。

DeepSeek 的方案把架构、数值稳定性、稀疏索引和推理内核放在一起设计。它显著压缩百万上下文的 KV 条目，也引入了 CSA、HCA、局部窗口、异构 KV 管理和 mHC 等多套机制。128:1 的全局压缩无法保留逐字细节，部署系统还必须同时处理多种 KV 形态。

## 05 GLM-5.2 复用相邻层的检索结果

GLM-5.2 的 78 层主干包含 3 个稠密前馈层和 75 个 MoE 层。每个 MoE 层有 256 个路由专家，每个 token 选择 8 个，再运行 1 个共享专家。注意力沿用 DSA：轻量索引器先扫描历史并选出 Top-2048 token，核心注意力只对这些候选计算。

稀疏注意力省掉了大范围的核心注意力计算，索引器自身仍然要扫描历史。相邻层的 Top-K 结果往往很接近，GLM-5.2 因此加入 IndexShare，每四个稀疏注意力层只让一个 Full 层运行完整索引器，随后三个 Shared 层复用它的候选集合。各层仍保留自己的 Q、K、V 和注意力权重，只共享“看哪些 token”的结果。

官方模型卡称，这一改动在 1M 上下文下把每 token FLOPs 降低 2.9 倍。配置文件同时显示，MTP 层也会共享索引，以提高投机解码的接受长度。

IndexShare 的工程价值来自改动集中。模型仍使用 DSA 和 MLA 推理栈，不需要把全部历史压成递归状态或多级摘要。它的风险也集中在索引器：候选之外的信息无法被后续核心注意力恢复，相邻四层共享候选还减少了逐层改变检索范围的自由度。

## 06 MiniMax M3 先选块，再读取块内原始 KV

MiniMax M3 有约 428B 总参数、23B 激活参数和 60 层主干。前三层使用稠密前馈网络，后续 MoE 层配置 128 个路由专家、Top-4 和 1 个共享专家。官方配置中的 128 个专家与部分二手对比资料写出的 256 个不同，这里以前者为准。

MiniMax Sparse Attention（MSA）建立在 GQA 之上。模型有 64 个 Query 头和 4 个 KV 头，每个 GQA 组运行独立的 Index Branch。历史序列按 128 token 划成块，每个查询与 GQA 组选择 16 个块，随后对最多 2048 个原始 KV token 执行精确 Softmax 注意力。

块级选择更适合 GPU 的矩阵计算，也允许不同 GQA 组分别关注代码定义、用户约束、图像 token 或错误日志。官方论文还为它设计了不计算指数函数的 Top-K 与 KV-outer 稀疏内核。在论文的 109B 实验模型上，MSA 在 1M 上下文把注意力 FLOPs 降低 28.4 倍；这个实验验证的是 MSA 机制，不等同于 M3 整体推理速度。

MSA 主要减少每次读取和计算的 KV，并没有取消完整历史 KV Cache。某个块只要有一个 token 被命中，块内其余 token 也会一起读取；固定的 16 块预算还可能漏掉候选。与之对应的好处是，被选内容仍保留原始 KV，不需要依赖递归状态或 128:1 摘要重建细节。

M3 从训练初期同时处理文本、图像和视频，适合把长上下文稀疏检索与多模态输入放在同一条路径里。MiniMax Community License 允许商业使用，但要求署名、通知，并对达到特定营收门槛的产品要求另行书面授权，不能按 MIT 或 Apache 2.0 理解。

## 07 Qwen3.5 用三层递归记忆搭配一层全注意力

Qwen3.5-397B-A17B 的 60 层主干按固定节奏排列：三层 Gated DeltaNet 后接一层门控全注意力，共有 45 层线性注意力和 15 层全注意力。DeltaNet 通过固定大小的矩阵状态持续更新历史，全注意力层保留对原始 token 的精确访问。

DeltaNet 层在更新长期状态前，还使用宽度为 4 的因果卷积处理局部模式。全注意力层采用 32 个 Query 头和 2 个 KV 头，每 16 个 Query 头共享一套 K/V；只有四分之一层保存完整注意力 KV，加上 GQA 后进一步控制缓存大小。

每层配置 512 个路由专家，每个 token 选择 10 个，再运行 1 个共享专家。397B 总参数中大部分位于专家池，官方给出的激活参数约为 17B。这个数字降低了单 token 的稀疏计算量，完整部署仍要存放 397B 权重并处理专家并行。

Qwen3.5 还把视觉编码器、语言主干与 MRoPE 统一起来，原生处理图像、视频和文本。开放旗舰的默认上下文是 262,144 token，官方给出扩展到约 1,010,000 token 的方法。DeltaNet、因果卷积和状态缓存依赖专用内核，缺少优化实现时，理论上的线性注意力优势不一定会转化为实际吞吐。

Qwen 这条路线的另一个特点是模型家族覆盖面。旗舰之外还有更小的 MoE 与稠密版本，许可证为 Apache 2.0，Transformers、vLLM 和 SGLang 等部署栈也有明确支持。真正需要中小规模私有部署时，选择同一家族的小模型通常比设法压缩 397B 旗舰更现实。

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/domestic-llm/depth_and_moe_mobile.svg" width="390" height="980"><img src="/images/domestic-llm/depth_and_moe.svg" alt="五个模型在深度信息流与 MoE 专家配置上的差异" loading="lazy" width="760" height="510"></picture><figcaption>图 3：五个模型都使用 MoE，但专家数量、激活比例和深度连接不同。Kimi 的 AttnRes 与 DeepSeek 的 mHC 还把扩展方向从序列带到了网络深度。</figcaption></figure>

## 08 百万上下文不是同一种能力

这五种机制都在压低长上下文成本，但它们丢失信息的方式不同。KDA 和 DeltaNet 把历史写入固定状态，后来的更新可能覆盖早期细节；CSA 与 HCA 先压缩表示和条目数量，细粒度信息可能在进入注意力前已经消失；DSA 与 MSA 保留候选的原始或低秩 KV，未被索引器选中的内容又无法参与本轮注意力。

单点检索测试只验证模型能否在长序列里找到一个明显目标。代码仓库分析、研究资料整合和长程 Agent 更依赖多次检索、跨段关系和状态更新。一次命中不代表一百万 token 内的多跳推理同样可靠。实际评测应至少区分四件事：精确字符串召回、跨文档推理、持续指令遵循，以及长时间生成后的状态一致性。

KV Cache 也不能只看有没有保留。Qwen 和 Kimi 的递归层减少了逐 token KV，周期性全注意力层仍保留历史；MiniMax 保存完整 KV，只减少每次读取范围；GLM 的索引器仍扫描长历史；DeepSeek 压缩得最深，却需要管理多种粒度和精度的 KV 条目。硬件、内核和批处理方式会决定架构优势能否落到墙钟时间上。

## 09 选型要从约束开始

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/domestic-llm/selection_guide_mobile.svg" width="390" height="890"><img src="/images/domestic-llm/selection_guide.svg" alt="根据多模态、许可证、本地部署和架构研究目标选择模型的条件图" loading="lazy" width="760" height="460"></picture><figcaption>图 4：架构特征只能缩小候选范围，最终仍要用自己的长文档、代码库、Agent 轨迹和部署硬件做验证。</figcaption></figure>

**需要原生多模态**时，候选主要是 Kimi K3、MiniMax M3 和 Qwen3.5。Kimi 把能力容量和长程 Agent 放在前面，MiniMax 侧重块稀疏多模态，Qwen 提供更完整的尺寸梯度与部署生态。三者的许可证和硬件成本差异很大，不能只比较模型能力。

**需要标准宽松许可证**时，Qwen3.5 的 Apache 2.0、DeepSeek-V4-Pro 与 GLM-5.2 的 MIT 更直接。Kimi K3 License 和 MiniMax Community License 都允许一定范围的商业使用，同时附带额外条件，正式产品需要核对最新文本。

**研究百万上下文架构**时，DeepSeek 适合观察多尺度 KV 压缩与异构缓存，GLM 适合观察 token 级稀疏检索和跨层索引复用，MiniMax 适合观察块稀疏注意力及 GPU 内核共设计，Kimi 与 Qwen 则提供两种递归状态加周期性全注意力的实现。

**需要本地或中小规模私有部署**时，这五个旗舰都不是普通工作站级模型。激活参数只描述每个 token 的计算路径，不会自动消除总权重、专家通信和 KV Cache。Qwen 家族提供多个较小版本，更容易把同一架构方向落到有限硬件；其余四个模型的开放旗舰主要面向多机多卡环境。

**需要真实业务选型**时，公开跑分只能作为起点。更有区分度的测试是把真实代码仓库、长文档和工具链放进目标部署框架，记录首 token 延迟、持续解码速度、KV 占用、跨卡通信、检索漏召回和长任务成功率。架构决定可能的优势，也决定要专门测哪些失败方式。

## 10 五个模型正在重写信息流

这轮国内旗舰模型有一个共同方向：继续用 MoE 扩大容量，同时避免让每个 token 承担全部参数和全部历史。它们没有收敛到同一种长上下文结构，反而形成了清晰分工。

Kimi K3 把扩展范围从序列延伸到网络深度与专家空间；DeepSeek-V4-Pro 同时维护局部原文、细粒度记忆和全局摘要；GLM-5.2 通过跨层复用索引减少稀疏注意力里的重复工作；MiniMax M3 保留块内原始 KV，并把稀疏模式与 GPU 执行方式一起设计；Qwen3.5 用固定比例的 DeltaNet 与全注意力组合，把同一方向覆盖到多种模型尺寸和原生多模态。

百万上下文的工程问题已经从“窗口能否拉长”变成“历史以什么形式留下、什么时候读取、丢失哪些细节、硬件能否高效执行”。理解这些信息流差异，比记住一次跑分排名更能解释五个模型适合什么，也更能解释它们会在哪里出错。

---

**Kimi K3**：[官方仓库与模型说明](https://github.com/MoonshotAI/Kimi-K3)；[Kimi K3: Open Frontier Intelligence](https://arxiv.org/abs/2607.24653)。

**DeepSeek-V4-Pro**：[官方模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro)；[DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://arxiv.org/abs/2606.19348)。

**GLM-5.2**：[官方模型卡](https://huggingface.co/zai-org/GLM-5.2)；[GLM-5 技术报告](https://arxiv.org/abs/2602.15763)；[IndexCache / IndexShare 论文](https://arxiv.org/abs/2603.12201)。

**MiniMax M3**：[官方模型卡](https://huggingface.co/MiniMaxAI/MiniMax-M3)；[MiniMax Sparse Attention](https://arxiv.org/abs/2606.13392)。

**Qwen3.5**：[官方模型卡与配置](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)。
