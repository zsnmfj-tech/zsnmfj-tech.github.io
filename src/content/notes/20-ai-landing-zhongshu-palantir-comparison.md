---
title: 从 Ontology 到动态本体：Palantir 与中数睿智如何把 AI 接进企业运营
deck: 两家公司都在大模型与业务系统之间建立可执行的业务语境，但产品架构、Ontology 重点、交付方法与公开证据并不相同。
date: 2026-09-01
type: AI商业落地
tags:
  - AI
  - 企业落地
  - Ontology
  - 动态本体
  - AI-FDE
readtime: 约 18 分钟
draft: false
---

一台压缩机突然振动异常。AI 要进入这次维修，回答“可能是什么原因”只是起点。它还得确认是哪台设备、当前状态是否仍在恶化，调出历史工单和安全规程，判断谁有权停机，备件是否可用，再把批准后的处置写回维修系统。

这类任务揭开了企业 AI 最难的一层。模型与数据之间可以用检索连接，模型与真实业务动作之间却隔着对象、关系、规则、权限和责任。Palantir 与中数睿智都在填补这块空白。前者以 Ontology、AIP 和 FDE 为主线，后者把动态本体、智能体应用、进化引擎、因果智能和 AI-FDE 组织成一套面向本土行业的产品组合。

把中数睿智叫作“中国版 Palantir”很省事，也会遮住最值得研究的部分。两家公司面对的是同一类工程难题，走的却不是一条完全相同的路。本文只比较截至 2026 年 9 月公开可见的产品架构、交付方法和案例证据，不比较估值、收入或未披露的能力。

<div class="pull">企业 AI 的分水岭，在于系统能否在业务约束下完成一次可审计、可撤回、可复用的动作。</div>

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/zhongshu-palantir-comparison/01-enterprise-ai-middle-layer-mobile.svg" width="390" height="1040"><img src="/images/zhongshu-palantir-comparison/01-enterprise-ai-middle-layer.svg" alt="企业业务系统经过对象、关系、规则、状态与权限层连接模型和智能体，再执行受控动作并形成反馈" loading="lazy" width="760" height="497"></picture><figcaption>图 1：数据不会自动变成可靠动作。图中流程是本文的分析框架，Palantir Ontology 与中数睿智动态本体代表两种公开实现路径，不是两家公司共同发布的架构图。</figcaption></figure>

## 01 相似之处：都在补企业 AI 的中间层

Palantir 官方把 Ontology 放在整个架构的中心。底层接入 ERP、CRM、工业数据库、实时传感器和文档，Ontology Language 把它们组织成对象、属性、关系、逻辑、动作和安全规则；Ontology Engine 负责实时订阅、查询、事务更新、批量写入与变更同步；Toolchain、AIP、应用和 Agent 再在这套运营状态之上工作。

中数睿智官网列出七款 AI 原生产品，包括智能指令、全知中枢、进化引擎、起源数据工厂、ChatBI、智能搜索和智能报告。官网另将能力分为四组：AI 应用与多智能体开发、业务建模与知识构建、模型训推与算力、面向 AI 的数据治理。公开报道还使用“智枢动态本体引擎”这一名称。由于官网没有把全部名称放进一张产品架构图，本文把它们并排归入数据、语义、执行和运营层，属于分析整理，不代表官方产品之间存在一一对应关系。

两套方案的共同判断很清楚：通用大模型不会天然理解一家企业。订单编号、设备关系、指标口径、审批责任和系统接口仍需被显式组织。只有这层业务语境稳定下来，模型更换以后，企业积累的对象定义、规则、权限和评测记录才可能继续使用。

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/zhongshu-palantir-comparison/02-solution-stack-mobile.svg" width="390" height="1420"><img src="/images/zhongshu-palantir-comparison/02-solution-stack.svg" alt="Palantir 与中数睿智从数据、业务语义、状态计算、智能体工具、治理反馈到交付方法的公开方案架构对比" loading="lazy" width="760" height="599"></picture><figcaption>图 2：两家公司都覆盖从数据到应用的链路，但产品组织方式不同。六层结构是为了便于比较而做的作者归纳；某项在本次公开材料中没有被重点描述，不代表厂商不具备这项能力。</figcaption></figure>

## 02 两套架构的重心并不相同

Palantir 的产品叙事围绕一个统一运营层展开。数据、逻辑、动作和安全不是四套松散模块，而是共同进入 Ontology。AIP 负责把大模型、Agent、评测和模型管理接到这层结构上，Foundry 处理数据与应用，Apollo 负责软件持续交付。AIP 本身并非 Palantir 自研的单一基础模型，官方文档列出了多家模型供应商和客户自有模型的接入方式。它的优势在于边界清楚，文档也把读写、权限和开发工具讲到了工程细节。

中数睿智的公开产品面更宽。起源数据工厂处理 AI 所需的数据准备，全知中枢与动态本体相关能力承载业务对象和知识，智能指令负责应用与多智能体生成，ChatBI、智能搜索和智能报告直接进入办公与经营场景，进化引擎再管理评估和持续更新。因果智能把路线继续推向干预与反事实推演，瞄准油气井控、电力运维等低容错任务。

如果只看产品名称，很容易强行找对应关系。更合适的看法是，两家公司在回答不同阶段的问题。Palantir 已经把运营本体、开发工具、权限和写回能力做成一套可被详细描述的平台体系；中数睿智公开材料更强调 AI 原生构建、行业适配、动态更新和交付提效。前者的公开技术证据更完整，后者的本土行业故事更集中，但许多效果数字仍有待客户侧验证。

## 03 Ontology 与动态本体：差别不在“一个静态、一个动态”

市场材料有时会把 Palantir Ontology 概括成静态知识模型，再用“动态本体”与它区分。这个说法经不起 Palantir 官方文档的核对。Palantir 明确描述了实时状态订阅、事务写入、Change Data Capture、动态权限和反馈闭环，还把 Ontology 称为企业“动态、持续复利”的核心。它从来不只是画一张对象关系图。

Palantir 对“动态”的处理偏向运营现场。订单状态改变、设备数据刷新、规则迭代、人员权限变化，都会影响人和 Agent 看到什么、可以做什么。对象既是语义实体，也是动作入口。系统执行调拨、审批或维修以后，结果又成为下一次判断的新状态。

中数睿智的公开材料则把更多篇幅放在本体如何被构建和演进。对象、逻辑、动作由多源数据与专家经验共同形成，AI 参与关系抽取、本体建模和智能体生成，再根据运行结果校准。2026 年发布的因果智能继续加入关联、干预与反事实，试图让系统解释“采取另一个动作会发生什么”。

这组差异不宜直接换算成功能高低。一个重心是让业务世界持续可读、可写、可治理，另一个重心是降低业务世界建模的人工成本，并把关系发现推进到因果推演。真实项目同时需要两种能力：本体不能只建得快，也要在权限和事务约束下稳定运行；系统不能只维护当前状态，还要知道知识怎样更新、错误规则怎样回滚。

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/zhongshu-palantir-comparison/03-ontology-emphasis-mobile.svg" width="390" height="1120"><img src="/images/zhongshu-palantir-comparison/03-ontology-emphasis.svg" alt="Palantir Ontology 与中数睿智动态本体在对象关系、逻辑、动作、权限、实时状态、持续评估和因果推理方面的公开材料重点" loading="lazy" width="760" height="512"></picture><figcaption>图 3：这里比较的是公开材料强调什么，不是产品能力评分。“本次材料未重点披露”不等于没有该能力，尤其不能据此反推产品的技术边界。</figcaption></figure>

因果智能还需要多一道审慎。观测数据中发现的关系不会自动成为因果关系，遗漏变量、采样偏差和先验假设都可能改变结果。专家确认、干预数据、版本管理和反事实验证仍然重要。中数睿智公开材料中的“零幻觉”“高确定性”等表述，更适合在项目里拆成误报率、漏报率、因果链复核通过率、人工接管比例和分布变化后的稳定性。

## 04 把同一个维修任务放进两套方案

假设传感器发出高温和振动告警，两套方案都会先把信号定位到设备对象，再沿着对象关系读取历史故障、备件、工单和责任人。差异主要出现在组件命名和公开的实现细节上。

在 Palantir 路线里，Ontology Engine 维护设备当前状态，函数或模型运行诊断，Action 提供创建工单、调整排产等受控操作，安全规则决定人和 Agent 能读取哪些属性、调用哪个动作。AIP 可以组织模型与工具，具体动作能否自动执行取决于配置和权限，关键写操作仍需留下明确的控制与审计记录。

在中数睿智路线里，起源数据工厂及数据治理能力准备传感器、工单和文档，动态本体连接设备、规则与动作，智能指令或行业智能体生成诊断与处置方案，场景评估和进化引擎收集人工修改与运行结果。因果引擎若进入这一步，还要说明风险如何传导，以及不同处置可能带来什么后果。

无论采用哪套平台，验收都不应停在回答准确率。还要分别验证对象定位、数据时效、权限拒绝、动作幂等、失败补偿、人工审批、结果写回和审计追溯。只要其中一环靠演示人员手工补齐，所谓端到端闭环就还没有成立。

## 05 智能体的区别，藏在能调用什么和谁来负责

Palantir AIP 已把模型管理、AIP Logic、Chatbot Studio、Evals 和 Agent 工具放进平台。Agent 可以查询 Ontology 对象、运行函数和提交预定义动作，外部 Agent 也可通过 Ontology MCP 使用受控工具。动作的权限与日志由平台执行，不由提示词临时约定。

中数睿智把应用侧拆成智能指令、ChatBI、智能搜索和智能报告。对央国企方案而言，这些入口可以覆盖制度问答、经营问数、签报与报告生成、任务督办等场景。它们能否形成一个产品体系，要看是否共享同一套对象口径、权限、运行记录和评测集，而不是界面上出现多少个智能体。

风险等级也需要逐级提高。制度检索与报告初稿出错后可以由人修改，财务问数需要统一指标和访问边界，创建维修工单还要考虑失败补偿。进入付款、生产控制或重大经营决策后，确认节点、撤回能力与责任记录比智能体的“自主程度”更重要。

## 06 同名 AI-FDE，实际说的是两件事

这组对比最容易混淆，也最能看出行业正在怎样变化。

Palantir 早期的 FDE 是 Forward Deployed Engineer，指深入客户现场的真人工程师。他们用真实数据定位问题，建立 Ontology、应用和工作流，再把反复出现的需求带回产品团队。Bootcamp 负责快速完成第一次价值验证，FDE 则把原型接入真实运营。

Palantir 现在又提供 AI FDE，官方全称是 AI-powered forward deployed engineer。这项产品在 2026 年 3 月进入正式可用阶段。它不是交付团队的新名称，而是 Foundry 内的交互式 Agent。用户用自然语言要求它修改数据管道、代码、本体、函数或应用，它在用户现有权限下工作，默认通过分支和提案提交变更，并能运行预览、测试与 CI 检查。涉及写操作时仍需要批准，厂商也提示具体功能可能因客户环境而异。

中数睿智所说的 AI-FDE 展开为 AI Foundry & Data Engineering，是公司定义的一套交付方法。AI 参与本体构建、关系抽取、智能体生成和运行校准，专家负责纠错与确认，连接器、对象模板、规则和评测集再沉淀为可复用资产。公司称这套方法可以显著缩短交付周期和人力投入，这些比例目前仍需结合统计口径验证。

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/zhongshu-palantir-comparison/04-ai-fde-mobile.svg" width="390" height="1250"><img src="/images/zhongshu-palantir-comparison/04-ai-fde.svg" alt="传统 Palantir FDE、Palantir 产品内 AI FDE 与中数睿智 AI-FDE 交付方法的三条路线对比" loading="lazy" width="760" height="555"></picture><figcaption>图 4：三条路线共享“减少从问题到上线的摩擦”这一目标，承担工作的主体却不同。Palantir AI FDE 是产品内 Agent，中数睿智 AI-FDE 是公司定义的交付方法，不能把两者当作同一类产品。</figcaption></figure>

对采购方来说，缩写怎样解释并不重要，关键是工作量有没有真的消失。如果 AI 自动完成了大部分本体建模，剩余的规则冲突、权限核对和专家复审需要多久；如果 Agent 能生成应用，数据清洗、旧系统接口和上线运维由谁负责。复杂项目最费力的部分常常集中在最后一段，完成 80% 的对象草稿不等于完成 80% 的交付。

## 07 落地实践：两条路线服务不同市场

Palantir 和中数睿智不存在企业客户竞争关系。双方的客户来源、交付环境和市场边界不同，Airbus 与国内能源项目也没有替代关系。把这些案例放在同一节，是为了观察两种方案如何进入真实业务、如何披露项目结果，不用于厂商对位或采购比较。

Palantir 与 Airbus 的合作始于 2015 年。官方材料称 Foundry 帮助 Airbus 把 A350 交付量提高 33%，合作随后从单条产线扩展到 Skywise 航空数据平台。这个案例包含具名客户、明确问题和后续扩展路径，可以看到业务本体与应用如何由生产问题延伸到行业协同。33% 来自厂商案例，公开材料没有给出完整对照方法，也无法直接换算成其他制造项目的收益。

中数睿智披露的项目集中在央国企、能源和电信。央国企 AI+ 方案以统一数据基座、结构化知识体系和智能应用集群为主，覆盖知识管理、制度问答、经营问数、报告和任务助手。能源材料更接近生产现场，公司或媒体报道提到油气危险工况识别提前 15 至 20 分钟、根因定位准确率 94%、电力故障排查效率提高近 20 倍，也提到 AI-FDE 将交付周期缩短 80%、人力成本降低 70%。这些数据仍缺少多数项目的客户名称、样本规模、测试区间和对照方法。

两组数字对应不同任务，基线和统计周期也不相同。它们应分别放回各自项目的证据链，核对数据由谁提供、怎样计算、有没有客户确认，以及后续场景是否复用了首个项目的资产。

<figure class="media-wide"><picture><source media="(max-width: 640px)" srcset="/images/zhongshu-palantir-comparison/05-evidence-and-selection-mobile.svg" width="390" height="1350"><img src="/images/zhongshu-palantir-comparison/05-evidence-and-selection.svg" alt="Palantir 与中数睿智公开案例各自的证据账本，以及企业项目从部署边界到第二场景复用的验收路径" loading="lazy" width="760" height="570"></picture><figcaption>图 5：上半部分分别记录两条路线的公开案例与证据缺口；下半部分是一套通用项目验收路径，供每个企业 AI 项目单独建立基线和验收结果。</figcaption></figure>

## 08 第二个项目检验复用能力

Palantir 的实践适合用来研究运营本体、FDE 和产品能力如何在复杂企业中持续扩展；中数睿智的实践则提供了动态本体、因果智能与 AI-FDE 在本土行业中的另一种实现。两条路线都可以建立一套检查方法，每个项目单独建立基线，观察上线前后的变化。

首个场景最好落到一个有明确动作的任务。以设备维修为例，项目需要从异常信号走到设备定位、规则判断、人员审批和工单写回，只接入完成这条链路所需的数据。系统上线以后，继续记录人工修改、失败补偿、处理时长和业务结果，避免把原型完成当成生产价值。

| 项目要验证什么 | 建议保留的证据 |
| --- | --- |
| 业务对象能否快速建立 | 对象与关系准确率、专家修改时长、冲突处理方式 |
| 动作能否安全执行 | 权限粒度、审批节点、失败补偿、回滚与审计日志 |
| 上下文能否持续更新 | 数据延迟、制度失效机制、版本差异、依赖应用是否同步 |
| Agent 是否改善业务 | 任务成功率、误报与漏报、人工接管、处理时长、上线前基线 |
| 第二个场景能否复用 | 连接器、对象模板、规则、动作接口与评测集复用比例 |
| 项目资产能否持续使用 | 数据、本体、规则、日志和应用接口的归属、导出与替换成本 |

第二个项目会暴露首个项目留下了多少可复用资产。第一套系统往往可以依靠驻场专家、预算和项目管理完成，到了第二个部门、第二家工厂或下一家同类客户，连接器、对象模板、规则和评测集如果仍要从头整理，交付效率就很难继续提高。

Palantir 把统一运营本体、真人 FDE 和产品内 AI FDE 连成一条演进路线；中数睿智希望通过动态本体、因果智能和 AI-FDE，减少行业知识建模与现场交付中的重复工作。它们服务各自的客户市场，也面对同一个产品化问题：首个项目积累的业务语境，能有多少进入下一次交付。各自路线的落地质量，最终要由这个复用比例来说明。

---

**参考资料**

- [Palantir：The Ontology system](https://www.palantir.com/docs/foundry/architecture-center/ontology-system)
- [Palantir：Ontology overview](https://www.palantir.com/docs/foundry/ontology/overview)
- [Palantir：AI Platform（AIP）](https://www.palantir.com/docs/foundry/aip)
- [Palantir：AI FDE overview](https://www.palantir.com/docs/foundry/ai-fde/overview)
- [Palantir：AI FDE security and governance](https://www.palantir.com/docs/foundry/ai-fde/security-and-governance)
- [Palantir：AI FDE best practices](https://www.palantir.com/docs/foundry/ai-fde/best-practices)
- [Palantir：AIP Chatbot Studio tools](https://www.palantir.com/docs/foundry/chatbot-studio/tools)
- [Palantir 与 Airbus 合作概览](https://www.palantir.com/assets/xrfr7uokpv1b/7uEHPTEM0MkKtBFcx2zh63/9d75da5b76439717ac95135b5012479e/Palantir-Airbus-Partnership_Overview.pdf)
- [中数睿智：AI 原生产品](https://www.zhongshuruizhi.com/cp)
- [中数睿智：央国企 AI+ 战略解决方案](https://www.zhongshuruizhi.com/Strategy)
- [新华网：中数睿智锚定智能体操作系统黄金赛道](https://www.xinhuanet.com/tech/20260427/34e2c8e0b5c44c13a29d21a1465bb0dd/c.html)
- [新华网：中数睿智“AI for Reasoning”为复杂工业场景赋能](https://www.news.cn/tech/20260718/3d6d170b8c25409691b741d592a7c10c/c.html)
- [新浪财经：中数睿智融资与行业落地报道](https://finance.sina.com.cn/jjxw/2026-08-24/doc-inipkriy6274603.shtml)
- [Judea Pearl：The Seven Tools of Causal Inference](https://ftp.cs.ucla.edu/pub/stat_ser/r481.pdf)
- [Peter Spirtes、Kun Zhang：Causal Discovery and Inference](https://link.springer.com/article/10.1186/s40535-016-0018-x)
