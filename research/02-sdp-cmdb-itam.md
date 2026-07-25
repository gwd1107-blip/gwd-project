# SDP CMDB 与 IT 资产管理（ITAM）调研简报

> 导语：本简报梳理 ServiceDesk Plus 的 CMDB（CI 模型、关系图谱、影响分析）与 ITAM（资产发现、软硬件资产、软件许可合规、采购、合同、生命周期）能力，回答"资产—配置—采购—合同如何串成闭环"这一自研关键问题。

**调研员：调研员_SDP资产CMDB**

调研时间锚点：2026-06；以官网（manageengine.com / manageengine.cn）、官方帮助文档（help.servicedeskplus.com、help.sdpondemand.com）为主，辅以官方集成文档与少量第三方评测。

---

## 一、产品定位与模块架构

- SDP 是"ITSM + ITAM + CMDB"一体化平台，分 Standard（仅帮助台）、Professional（含 ITAM）、Enterprise（含 ITAM + CMDB/变更等项目模块）等版本；统一资产发现代理在 Professional 与 Enterprise 版可用。ITAM 能力获得 PinkVERIFY™ 认证（官方宣称）。
- 资产模块与 CMDB 的关系：**资产库是 CI 的来源之一**；CMDB 在资产之上维护 CI 之间的关系（Relationship），官方明言"没有关系的 CMDB 只是一堆 CI 的集合"。
- 资产分类体系三层：**资产类型（IT 资产 / 非 IT 资产 / 资产组件）→ 产品类型（Product Type，如工作站、服务器、路由器、打印机）→ 产品（Product，如 Dell Latitude E7450）**，产品目录（Product Catalog）集中维护。IT 资产即"节点（node）"，占用许可证计数；Expired/Disposed 状态的资产不再占用节点数但保留历史数据。
  - 来源：https://www.manageengine.com/products/service-desk/cloud/faq/asset-management.html

## 二、CMDB：CI 模型与关系图谱

**CI 类型（CI Type）模型**
- 预置 CI 类型覆盖资产（硬件/软件）、业务服务（Business Service）、IT 服务、文档、人员/部门等；支持自定义新 CI 类型。
- 支持**父子多层类型层级，子类型自动继承父类型的属性与关系**；每个 CI 类型可定义专属属性（Attribute，如服务器的 Model、Service Tag、Processor Name）。
- CI 入库方式：扫描自动同步、CSV 导入、CMDB API 导入（关系也可经 API 导入）、手动添加。

**关系（Relationship）与关系图谱（Relationship Map）**
- 关系三要素：源 CI + 关系类型 + 目标 CI（如 `ServiceDeskServer Depends on CentOS2Server`）；软件安装用 `Runs::Runs on` 表示。
- 关系类型可自定义；图谱在 CI 列表页/详情页点击图标以新窗口打开，支持 Map View / List View、缩放、全屏；List View 按关系类型分组，仅 List View 可删除关系。
- **Quick Create**：用一句话语法快速建关系，名称含空格需加双引号。
- 图谱上直接叠加显示该 CI 关联的**未决请求、问题、变更数量**，可点入查看 —— 用于影响分析（Impact Analysis）与根因定位（Root Cause）。
- 新版支持**拖拽画布**绘制依赖关系，并可把服务相关的基础设施段组织成 **Business View（业务视图）**。
- CI 与事件/问题/变更/项目/发布流程联动：任一流程关联 CI 后，干系人可一键查看依赖图；CI 变更可按角色限制权限，变更记录保留历史追溯（支持 ISO 20000 §8.2.6 配置管理要求）。
- 自动化：云版中经 Probe 或外部集成新发现的资产可按预定义条件**自动同步进 CMDB**；与 ManageEngine 全栈可观测套件（OpManager / Applications Manager 等）集成可自动发现 Layer 2 网络设备及应用依赖并同步关系。
  - 来源：https://www.manageengine.cn/products/service-desk/itil-cmdb.html ；https://www.manageengine.com/products/service-desk/itsm/it-cmdb-software.html ；https://www.manageengine.com/products/service-desk-msp/help/adminguide/cmdb/relationship_map.html ；https://www.manageengine.com/products/service-desk-msp/help/adminguide/cmdb/defining_relationships.html ；https://www.manageengine.com/iso20000/images/iso-20000.pdf

## 三、资产发现方式

1. **Agent 扫描（当前主推）**：SDP 复用 Endpoint Central（原 Desktop Central）的"统一代理（UEM agent）"扫描 Windows/Mac/Linux。随 SDP 升级自动安装 EC 服务端（30 天试用后转免费版，免费版持续提供：代理扫描、保修信息获取、代理自动升级；远程控制对 11.3 前老客户免费、新客户为加购项）。代理做**差异化扫描**（仅上传上次扫描后的变更，每 12 分钟有变更即自动上报；从 SDP 侧手动扫描同一资产有 **30 分钟锁定间隔**）。代理部署方式：AD 启动脚本、GPO、手动安装、系统镜像封装等。
2. **无代理扫描（已不推荐）**：Windows 域扫描、网络扫描（WMI/SSH/SNMP），新版官方明确不再支持 agentless scan，仅可用 Scan Scripts 兜底。
3. **分布式资产扫描**：在远程网络部署发现探针（Probe），扫描后只向中心服务器推送差异数据。
4. **条码 / 二维码扫描**：用于资产盘点与 PO 收货。
5. **导入**：CSV 导入资产、AD/LDAP 导入用户；CMDB API 导入 CI 及关系。
6. **与 Endpoint Central 集成**：EC 代理在系统启动、用户登录、手动/计划扫描后、软件安装/卸载时上报资产数据；可在 SDP 侧配置"EC 中设备移除 → SDP 标记 Disposed 或删除"；注意双向不同步——SDP 侧的修改不回写 EC。若两边同时扫描，以最新信息覆盖。EC 侧的资产告警（新硬件、商业软件装/卸、违禁软件、许可合规问题）可自动生成 SDP 工单。
  - 来源：https://help.servicedeskplus.com/asset-scan-faqs ；https://www.manageengine.com/products/desktop-central/help/configuring_desktop_central/dc-sdp-integration-features.html ；https://www.manageengine.cn/products/service-desk/it-asset-management.html ；https://www.manageengine.com/products/service-desk/desktop-central-asset-discovery-agent.html

## 四、硬件 / 软件资产管理

- **硬件**：维护工作站、服务器、路由器、防火墙、虚拟机、组件全量清单；单资产详情含所有者、用户账户、已装软件、与其他 CI 的关系、扫描历史、所有权历史、关联工单（事件/问题/变更）；支持计划性周期扫描 + 单资产扫描，发现软硬件变更（补丁、升级）并自动通知技术员。
- 资产操作：工作站可"Change as Server"转为服务器；静态组（手工圈选）与**动态组**（按 OS、内存、厂商、站点等条件自动聚合）；"Auto-assign owner"基于扫描得到的 Last Logged On User 自动分配所有人并把状态从 In Store 置为 In Use。
- **软件**：扫描自动发现软件并挂到对应工作站；软件分类为 Managed（被管）/ Freeware / Shareware / Prohibited（禁用）/ Excluded；记录软件安装/卸载的时间、用户、计算机；可抓取 Microsoft Windows 与 Office 的产品密钥；检出违禁软件自动告警/生成工单。
  - 来源：https://www.manageengine.com/products/service-desk/it-asset-management/it-asset-tracking-software.html ；https://www.manageengine.com/products/service-desk/on-premises/faq/it-asset-management.html

## 五、软件许可管理与合规

- **许可类型**：Individual、Enterprise、OEM、Concurrent、Volume、CAL、Named User、Node Locked、Trial、Free 等，可自定义；支持 Microsoft/Adobe 类**套件许可（Suite License）**统一管理。
- 许可操作：录入已购许可（数量、类型、关联厂商）→ 分配到站点/部门/工作站/用户；支持**升级/降级**（同一许可覆盖新版本或回退旧版本）；单一列表视图展示采购数、已分配数、可用数；可按站点过滤；新购许可经采购模块流转。
- **许可协议（License Agreement）**：字段含厂商、协议号（必填）、授权号、取得日期、到期日期、供应商、条款、PO 号/名称、发票号/发票日期、总成本；可添加自定义字段（单行/多行/下拉/数值/日期）；一个协议可关联多个许可，合同也可关联到许可。
- **合规**：定期扫描工作站，自动比对"已购 vs 已装"，识别过度许可/许可不足/合规三类状态；软件仪表板实时展示合规、计量、到期汇总；到期提前邮件通知；**软件计量（Software Metering）**统计使用频率，识别闲置/低频许可以优化采购（依赖 Endpoint Central 能力）。
  - 来源：https://www.manageengine.cn/products/service-desk/it-asset-management/software-license-tracking.html ；https://help.servicedeskplus.com/assets/software_licenses/license-agreement.html ；https://www.manageengine.com/products/service-desk/it-asset-management/what-is-software-license-management.html

## 六、采购管理（Purchase）

- 流程：**采购申请（PR）→ 审批 → 生成采购订单（PO）→ PO 审批（支持多级、多阶段审批）→ 发送供应商（邮件）→ 收货 → 发票与付款 → 关闭**。
- PR 可由服务请求（Service Request）直接生成并关联，可附多家报价；PR 字段：主题、建议供应商、请求日期、到期日、站点、优先级、成本中心、收货地址、明细项及预估成本。
- PO 支持：审批通过/拒绝；收货支持**全部或部分收货**（状态 Partially Received / Items Received），可用条码/QR 收货；**收货后产品自动创建为资产或耗材并与该 PO 关联**（软件许可也可从 PO 接收）。
- 财务字段：GL Code（总账代码）、成本中心（Cost Center）；发票核对并附到 PO；可登记付款信息并设置**付款提醒**通知指定技术员。
- 供应商（Vendor）库独立维护，可设自定义字段；与已取消/关闭 PO/PR、过期合同关联的供应商删除时标记为 inactive。
- 报表：按供应商、下单日期、需求日期、状态生成报表，支持计划性查询报表（按站点/供应商/订单项/审批人）。
  - 来源：https://www.manageengine.com/products/service-desk/it-asset-management/create-purchase-order.html ；https://www.manageengine.com/products/service-desk-msp/help/adminguide/purchase/purchase-request.html ；https://help.sdpondemand.com/approving-a-purchase-order ；https://www.manageengine.cn/products/service-desk/help/adminguide/purchase/receive-items.html

## 七、合同管理（Contract）

- 合同类型：预置**租赁（Lease）、维护（Maintenance）、支持（Support）、保修（Warranty）**，可自定义新类型；类型可配色，并可按技术员/组织角色控制可见性；合同 ID 可配置前缀与起始编号。
- 合同表单分三段：**合同详情**（名称、供应商、支持内容、附件）、**合同规则**（覆盖的资产、维护周期与成本）、**通知规则**；可关联资产/软件/许可，支持子合同与续订记录（续订成本）。
- 到期前自动邮件提醒（可自定义提前量与收件人，含供应商邮箱）；可配置**合同到期时自动按指定模板创建工单**，触发续签/终止流程。
- 操作：编辑、删除、打印预览、给合同所有者/供应商发邮件、全文检索。
  - 来源：https://help.sdpondemand.com/contract-settings ；https://www.manageengine.com/products/service-desk/contract-management-software.html ；https://download.manageengine.com/products/service-desk/help/ManageEngine_ServiceDeskPlus_8.1_Help_AdminGuide.pdf ；https://www.manageengine.cn/products/service-desk/pdf/emp1013.pdf

## 八、资产生命周期

- **资产状态（Asset/Resource State）**：预置 In Store（在库，新扫描/新增默认）、In Use（使用中，分配后自动切换）、In Repair（维修中）、Expired（过期）、Disposed（已处置）、Loan（借出，含租借到期提醒）等，可在 Admin 中扩展自定义状态。
- 自动化规则：分配给用户/部门/站点 → 自动 In Use；转入 Expired/Disposed → 释放节点许可证但保留历史；由 In Use 转 Disposed/Expired 时自动移除其软件许可分配、关联资产与组件。
- 财务：配置成本与折旧（**4 种折旧方法**，按产品配置），含成本中心、GL Code；保修信息经代理自动获取，租约到期提醒；完整审计历史（操作历史 + 扫描历史 + 所有权历史）。
- 官方 ITAM 方法论把生命周期定义为：需求提出 → 采购（PO/审批/付款/收货）→ 部署 → 维护/计量 → 退役处置，SDP 各模块（请求、采购、资产、合同）分别承接对应环节。
  - 来源：https://manageenginesales.co.uk/blog/track-that-asset-with-servicedesk-plus/ ；https://help.servicedeskplus.com/configurations/asset_management/configuring-product-type.html ；https://www.manageengine.com/products/service-desk/it-asset-management/what-is-itam.html

## 九、对自研产品的启示（要点）

1. CMDB 的核心差异化在"关系"而非"清单"：CI 类型继承体系 + 可自定义关系类型 + 图谱上叠加工单状态，是 MVP 必选项。
2. 状态机驱动生命周期：少量预置状态 + 自动流转规则（分配→在用、处置→释放许可计数），比大而全的状态机更易落地。
3. 发现能力解耦为"代理 + 探针 + 导入"多通道，差异化增量上报是降低带宽/服务端压力的关键设计。
4. 采购—资产—许可—合同四者以"收货自动建资产、PO 关联许可、合同关联资产与到期提醒"串成闭环，是 ITAM 价值主线。

## 十、未能核实 / 需注意

- 折旧的具体 4 种方法名称未在本次抓取的页面中展开（仅确认"4 methods"，官方配置页正文未能完整抓取）。
- 云版（On-Demand/Cloud）与本地版（On-Premises）在 CMDB 自动同步、Probe 等能力上有差异，简报中已分别注明；具体版本（v14/15xxx 构建号）功能边界需实测确认。
- "软件计量"能力主要由 Endpoint Central 侧提供，SDP 免费版集成是否完整开放未完全确认。
- PinkVERIFY 认证为官方营销表述，未独立核实。
