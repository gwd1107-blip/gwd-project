# iTop（Combodo）产品调研简报

> 导语：本简报调研"CMDB 优先"的开源 ITSM 产品 iTop：其 CMDB 驱动设计理念、可配置数据模型与对象关系机制、ITIL 工单流程（事件/请求/问题/变更）、门户设计、XML Delta 声明式扩展机制、许可证与社区、优缺点，以及 CMDB×工单联动对自研系统的借鉴价值。

**调研员：调研员_iTop | 调研日期：2026-07-21 | 用途：自研 ITSM 服务台（对标 ManageEngine SDP）产品调研**

---

## 一、产品概览

| 项目 | 内容 |
|---|---|
| 厂商 | Combodo（法国 IT 服务公司，iTop 由其赞助、主导和支持） |
| 定位 | 开源、Web 化、ITIL 合规的 ITSM + CMDB 一体化平台，全称 IT Operations Portal |
| 技术栈 | PHP + MySQL/MariaDB（AMP 栈），自研 ORM 抽象层，Web 安装无需命令行 |
| 当前版本 | 3.2.x（LTS）；GitHub 仓库 1,149 stars / 291 forks / 60 open issues，开发活跃（最近 push：2026-07-21） |
| 许可证 | **AGPL-3.0**（2.0 版本起由 GPL/LGPL 变更为 AGPL） |
| 生态 | iTop Hub（官方扩展商店）、iTop University（培训文档）、SourceForge 论坛（定制类帖子 2700+ 条）、GitHub（Combodo 组织下大量官方扩展仓库） |

来源：[GitHub Combodo/iTop](https://github.com/Combodo/iTop)、[itophub.io/about-itop](https://www.itophub.io/page/about-itop)、[combodo.com](https://combodo.com/)

**一句话定性**：iTop 是"CMDB 优先"的 ITSM —— 配置项（CI）及其关系是一等公民，工单流程建立在 CMDB 之上，而非事后挂接。

---

## 二、CMDB 驱动的设计理念

1. **核心定位**：官方明言 iTop 为"管理共享基础设施的复杂性"而设计，核心能力是"分析事件或变更对服务和合同的影响"（impact analysis）。
2. **一切皆为对象**：服务器、PC、网络设备、应用方案、业务流程、人员、团队、组织、位置、合同、服务——全部是 CMDB 中的对象，通过关系互相连接。工单、SLA、合同也建在同一对象模型上。
3. **单一仓库**：CI、工单、服务目录、合同在同一数据模型内，通过外键和链接类（lnkXxxToYyy 多对多关系类）关联，天然支持"这台数据库宕机 → 影响哪些服务 → 影响哪些客户合同"的级联查询。
4. **图形化影响分析**：任何 CI 或工单可查看 impacts/depends on 关系图（Graphviz 渲染），这是 iTop 的招牌功能。
5. **数据质量保证**：内置 Consistency Audit（一致性审计）检查数据质量；Data Synchronization（数据同步引擎）支持从外部数据源（监控、云平台、AD 等）联邦导入 CI 并保持同步，官方提供 Azure/Graph、Proxmox 等 Data Collector。

来源：[itophub 数据模型文档](https://www.itophub.io/wiki/page?id=latest:datamodel:start)、[combodo 12 个降本案例](https://combodo.com/itop/12-cases-cost-reduction-itop/)

---

## 三、数据模型（可配置 CMDB）

### 3.1 模块化数据模型

CMDB 按域拆分为 5 个模块，安装时可选：

- **itop-config-mgmt（核心，必装）**：服务器、软件、应用方案、组织、人员、团队、位置
- **itop-endusers-devices（可选）**：PC、电话、打印机、外设
- **itop-virtualization-mgmt（可选）**：虚拟机、Hypervisor、Farm
- **itop-storage-mgmt（可选）**：SAN、NAS、存储系统、卷、FC 接口
- **itop-datacenter-mgmt（可选）**：机柜、机架、电源连接

服务管理有两种互斥口味：**Service Management for Enterprises**（单一企业共享基础设施）与 **Service Management for Providers**（服务商按客户隔离基础设施）。服务目录为三级结构：**Service Family → Service → Service Subcategory**（Service Family 对增强门户为必选）；客户合同（Customer Contract）连接客户组织与服务，SLA 挂在合同上。

### 3.2 对象关系机制

- **外键（ExternalKey）**：可带 OQL 过滤器（如 `SELECT Location AS L WHERE L.org_id = :this->org_id`），实现级联下拉（选了组织后位置列表自动过滤）。
- **链接集（AttributeLinkedSet / LinkedSetIndirect）**：1:N 与 N:N 关系，N:N 通过独立的链接类承载（如 `lnkContactToTicket`、`lnkFunctionalCIToTicket`），删除策略可配（DEL_AUTO / DEL_MANUAL）。
- **对象查询语言 OQL**：类 SQL 的对象查询语言，贯穿搜索、通知收件人计算、过滤器、REST API。

来源：[iTop Customization](https://www.itophub.io/wiki/page?id=latest:customization:datamodel)、[XML Data Model Reference](https://www.itophub.io/wiki/page?id=latest:customization:xml_reference)

---

## 四、工单流程（核心调研点）

安装时可二选一：**Simple Ticketing**（统一简化工单）或 **ITIL Compliant Tickets**（区分 User Request 与 Incident）。变更管理同样有 Simple / ITIL 两种模块。

### 4.1 事件管理（Incident）

- **状态机**：New → Assigned → (Escalated TTO / Pending / Escalated TTR) → Resolved → Closed，共 7 个状态。
- **关键字段**：Organization、Caller、Origin（mail/monitoring/phone/portal）、Impact（个人/服务/部门）、Urgency（critical/high/medium/low）、Priority（**自动计算，只读**）、Team/Agent、Resolution code（assistance/bug fixed/hardware repair/software patch 等）、User satisfaction。
- **状态-字段约束矩阵**：每个状态下每个字段是 隐藏（H)/只读（R/O)/必填（M) 都有明确定义。例如 Resolved 状态下 Resolution code 和 Solution 变为必填；Service 在 Resolved 前必填。这是 iTop 流程严谨性的核心机制。
- **父子级联**：事件可设 Parent incident。父事件日志更新自动同步到所有子事件；**父事件解决时自动解决全部子事件**（"cascade resolution"级联解决，适合一台核心设备故障引发大量工单的场景）。
- **关联**：可链接 Problem（查根因）和 Change（如需打补丁）。

### 4.2 用户请求（User Request / 服务请求）

- **状态机（12 态，含审批分支）**：New → **Waiting for approval → Approved / Rejected** → Assigned / Dispatched → Escalated TTO / Pending / Escalated TTR / Redispatched → Resolved → Closed。
- **审批引擎**：工单进入 New 时，检查服务子类（Service Subcategory）是否配置了审批规则（Approval Rule）；支持**两级审批**，逐级通知审批人；审批邮件含**免登录审批链接**；审批超时时限按 Coverage Window 计算，超时后按规则配置"自动批准/自动拒绝"。

### 4.3 问题管理（Problem）

- **状态机（极简 4 态）**：New → Assigned → Resolved → Closed。
- 定位：聚焦根因调查，与事件"尽快恢复服务"区分；根因未明时提供 workaround。
- 与 Known Error、FAQ 模块联动形成知识沉淀；CI 和联系人关联需手动维护（与事件/变更不同）。

### 4.4 变更管理（Change，ITIL V3 三类变更）

| 类型 | 流程特点 | 状态机 |
|---|---|---|
| **Normal Change** | 走完整 CAB 评审流程 | New → Validated/Rejected（受理评审）→ Assigned → Planned and scheduled → Approved/Not approved（CAB 批准）→ Implemented → Monitored → Closed（**10 态**） |
| **Emergency Change** | ECAB 快速审批，跳过受理环节 | New → Assigned → Planned → Approved → Implemented → Monitored → Closed |
| **Routine Change** | 预批准的标准变更，无审批环节 | New → Assigned → Planned → Implemented → Monitored → Closed |

- **三类角色**：Change Implementor（实施）、Change Supervisor（跟进）、Change Manager（批准），每类变更字段中有 Team/Agent + Supervisor team/Supervisor + Manager team/Manager 六组人员字段。
- **关键字段**：Outage（是否中断，必填）、Fallback plan（回退方案，Planned 状态起必填）、Approval comment、Reject reason、Start/End date（计划窗口）。
- 变更只有 Private Log（私有日志），门户不可见。

### 4.5 SLA / TTO / TTR 机制（重点）

- **双计时器（StopWatch）**：TTO（Time To Own，响应时限）= 工单未指派的累计时间；TTR（Time To Resolve，解决时限）= 非 Pending 且非 Resolved 的累计时间。**Pending（挂起）状态自动暂停 TTR**——这是"挂起不计入 SLA"的标准实现。
- **时限计算来源**：SLT（Service Level Target）按 SLA × 请求类型 × 优先级定义；结合 Coverage Window（服务时间窗口）和 Holiday（节假日）计算；基础版按 24×7 计算。
- **自动升级**：cron 驱动的 `cron.php` 检查 SLA，超时自动将状态改为 Escalated TTO / Escalated TTR；累计时间达 75% 时工单显示黄色，超时显示红色。
- **SLA 留痕**：每个工单记录 TTO/TTR deadline、cumulated、passed(y/n)、overrun 秒数，供报表分析。
- **优先级自动计算**：Impact × Urgency 矩阵自动得出 Priority（只读，不可手改）。
- **派单约束（Delivery Model）**：可分派给哪些团队由客户组织的 Delivery Model 决定——选择客户组织后，团队列表被严格限定为该客户交付模型中定义的团队。

### 4.6 自动化（Trigger + Action）

- **触发器类型**：对象创建/更新/删除、进入/离开某状态、门户更新、TTO/TTR 阈值到达（75%/100%）。
- **动作类型**：邮件（HTML 模板 + `$this->xxx$` 占位符 + 状态：生产中/测试中/停用）、内部 News、Webhook（通用/REST API/Slack/Rocket.Chat/Google Chat/MS Teams）。
- **收件人用 OQL 定义**：如"通知所有关联 CI 的联系人"：`SELECT Person AS P JOIN lnkContactToFunctionalCI AS L1 ... JOIN lnkFunctionalCIToTicket AS L2 ...`。
- 付费版额外提供：自动关单、自动派单、提醒管理、重复性对象创建等。

来源：[Incident 模块文档](https://www.itophub.io/wiki/page?id=latest:datamodel:itop-incident-mgmt-itil)、[Change 模块文档](https://www.itophub.io/wiki/page?id=latest:datamodel:itop-change-mgmt-itil)、[User Request 模块文档](https://www.itophub.io/wiki/page?id=latest:products:professional:itop-request-mgmt)、[Notifications 文档](https://www.itophub.io/wiki/page?id=latest:admin:notifications)

---

## 五、门户设计（End-User Portal）

- **增强门户（Enhanced Customer Portal，2.3+）**：独立于后台控制台的最终用户入口；浏览三级服务目录（Service Family 为门户必选层级）、按服务子类提交请求、查看自己的进行中/已解决请求、FAQ/已知错误查询。
- **免登录审批**：审批人通过邮件内嵌链接直接批准/拒绝，无需登录 iTop。
- **门户可定制性**：整个门户由 XML 定义，可做：砍掉某功能（纯 XML）、定义全新门户类型（如一线支持门户）、品牌化改版（XML+CSS）、加特定功能（XML+PHP/TWIG）。官方商店还有"Mosaic 服务目录视图"等门户美化扩展，及第三方"Portal new look"现代化皮肤。
- **门户与工单联动**：门户来源的工单 Origin 字段自动标记为 portal；私有日志（Private Log）对门户不可见，公共日志（Public Log）可见——**双日志机制**区分对内沟通与对用户回复。

来源：[Customize the Customer Portal](https://www.itophub.io/wiki/page?id=latest:customization:portal)、[itophub store](https://store.itophub.io/)

---

## 六、扩展机制（XML 数据模型定制 —— 最值得借鉴的技术设计）

1. **元数据驱动架构**：应用建立于 ORM 抽象层上，"Meta Data Model" 用 XML 描述，安装时**编译**为 PHP 类。类、字段、菜单、仪表盘、用户角色（Profile）、生命周期状态机全部在 XML 中定义。
2. **XML Delta（差量定制）**：扩展模块的 XML 只需声明与标准模型的**差异**（`_delta="redefine"` 等指令），即可给标准类（如 Server）加字段、改表单、改生命周期，**无需 fork 代码**，升级时定制自动保留——这是 iTop 可维护性的关键设计。
3. **模块结构**：`module.xxx.php`（模块声明+依赖）+ `datamodel.xxx.xml`（数据模型）+ 字典文件（多语言）；扩展放 `extensions/` 目录。
4. **多环境 + Toolkit**：生产环境与 toolkit 环境隔离；Toolkit 先编译校验 XML 一致性、预览数据库 Schema 变更，确认后才应用到生产环境。
5. **生命周期可编程**：状态机、状态间迁移、迁移时调用的方法均在 XML 定义；字段约束（H/R/O/M 矩阵）随状态自动切换；OQL 过滤器中的 `:this->field` 依赖自动驱动表单级联刷新。
6. **集成接口**：REST/JSON API（OQL 查询/对象 CRUD）、Webhook、CSV/Excel 批量导入导出、邮件创建工单、Data Synchronization 引擎（数据联邦）。

来源：[iTop Customization](https://www.itophub.io/wiki/page?id=latest:customization:datamodel)、[XML Reference](https://www.itophub.io/wiki/page?id=latest:customization:xml_reference)

---

## 七、许可证与社区

- **社区版**：AGPL-3.0，免费、用户数不限，功能完整覆盖 CMDB + 全 ITIL 流程。注意：若自研系统借鉴其代码或深度集成需评估 AGPL 传染性；仅借鉴设计思想无风险。
- **商业模式**：Combodo 销售 SaaS 托管、订阅支持（Standard/Operational/Industrial 三档）、Designer（低代码图形化定制工具，分 Pro/Developer 两级）及付费扩展；**价格与用户数无关**。
- **生态注意点**：部分官方扩展已从开源转为 Combodo 商业许可（如 Customized request form 新版）；iTop Hub 是扩展分发中心。
- **社区规模**：GitHub 1,149 stars / 291 forks / 50+ 贡献者；SourceForge 论坛活跃（定制板块 2768 帖）；有中、英、法、德、日等 15 种语言；第三方生态有 TeemIp（IPAM/DDI，基于 iTop）、ITOMIG（AI 扩展）等衍生项目。
- **第三方评分**：G2 约 4.3/5（样本仅约 7 条，样本量小）、Capterra 约 4.4/5。

来源：[GitHub API 数据](https://github.com/Combodo/iTop)、[combodo.com/offers-services](https://combodo.com/offers-services/)、[openmsp.ai 开源 ITSM 盘点](https://www.openmsp.ai/blog/open-source-itsm)、[Capterra iTOP 页](https://www.capterra.com/p/163429/ITOP/)

---

## 八、优缺点

**优点**
1. CMDB 与 ITSM 深度一体，影响分析/级联解决是同级开源产品（GLPI、osTicket）不具备的。
2. ITIL 流程严谨度极高：三类变更生命周期、字段级状态约束矩阵、双计时器 SLA、两级审批，开箱即用。
3. XML Delta 元数据架构：定制与升级不冲突，可维护性远优于改源码的开源产品。
4. 社区版无用户数限制，功能不设墙。
5. 双门户（控制台 + 终端用户门户）+ 双日志（公共/私有）设计贴合服务台场景。

**缺点**
1. **UI 陈旧**：Capterra 用户评价"UI too outdated, old tables"；后台控制台交互偏传统（社区版无 Designer 低代码工具，定制需手写 XML）。
2. **CMDB 靠人工/同步维护，无自动发现**：无原生 agent 自动发现资产（需搭配 GLPI Agent/OCS/Data Collector），长期易腐化——这是 CMDB 项目失败的常见原因。
3. **学习曲线陡**：服务目录、合同、SLA、Delivery Model 必须先建模才能开工单；社区支持弱于 GLPI。
4. PHP + MySQL 传统单体架构；G2 评论样本少，国际声量小于 GLPI/ServiceDesk Plus。
5. 部分好用的官方扩展已转商业许可。

来源：[itsmdaily 评测](https://www.itsmdaily.com/helpdesk-combodo-itop-service-desk-review/)、[Capterra](https://www.capterra.com/p/163429/ITOP/)、[openmsp.ai](https://www.openmsp.ai/blog/it-inventory-management-open-source)

---

## 九、对自研系统的可借鉴点（重点：CMDB × 工单联动）

1. **统一对象模型**：CI、工单、服务、合同、SLA 建在同一领域模型内，工单通过外键/关系表直接挂 CI，天然支持影响分析与根因追溯。自研系统应在一期就设计好 `Ticket ↔ CI` 多对多关联表和 `CI ↔ CI` 依赖关系表，而非事后补丁。
2. **状态机 + 字段约束矩阵驱动表单**：工单每个状态下每个字段的可见性/只读/必填由状态机元数据声明，而非硬编码 if-else。自研系统可将"状态 × 字段 × 约束（H/RO/M）"做成配置表，既严谨又可配。
3. **SLA 双计时器 + 挂起暂停**：TTO/TTR 分离、Pending 暂停计时、按 Coverage Window/节假日折算、75%/100% 阈值变色、超时自动升级状态并留痕（deadline/cumulated/overrun）——可直接照搬到自研 SLA 引擎设计。
4. **Impact × Urgency 矩阵自动定优先级**：优先级只读、由矩阵推导，避免工程师随手标优先级，保证 SLA 计算一致性。
5. **父子工单级联解决**：核心设备故障引发工单风暴时，父单解决自动级联解决子单并同步日志——实现成本低、价值高。
6. **审批引擎解耦**：审批规则挂服务目录（子类）而非全局；免登录审批链接；超时默认动作（自动批准/拒绝）；两级审批。
7. **Trigger（何时）与 Action（做什么）分离的通知架构**：触发器类型枚举化（进入状态/离开状态/阈值/门户更新），动作可复用、可排序、有"测试中"状态，收件人用查询语言动态计算。
8. **Delivery Model 约束派单范围**：客户/组织 → 可用团队列表由交付模型决定，防止错派。
9. **元数据/声明式定制**：XML Delta 思想可转化为自研系统的"低代码表单/流程配置层"——核心模型稳定，差异配置可随版本升级保留。
10. **反面教训**：自动资产发现与 CMDB 数据保鲜必须一期考虑（数据同步/审计机制），否则 CMDB 一年即成"数据垃圾场"；UI 现代化（尤其工单列表与门户）是用户满意度的决定性因素。

---

**未能核实的信息**：G2 具体评分样本量极小（约 7 条），参考价值有限；iTop 3.2 社区版门户的完整功能清单未逐页核实（以官方定制文档和商店扩展推断）；Designer 工具为付费功能，未实际验证其能力边界。
