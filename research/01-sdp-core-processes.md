# ManageEngine ServiceDesk Plus 核心 ITSM 流程模块调研简报

> 导语：本简报逐模块梳理 ServiceDesk Plus（SDP）的事件管理、服务目录、问题管理、变更管理、发布管理、SLA/OLA 与知识库能力，重点还原其"统一工单模型 + 可视化工作流 + 模板机制"的产品底座，是自研对标的第一手功能规格参考。

**调研员：调研员_SDP核心流程** | 调研时间：2026-06（基于当前可获取的官方文档与权威二手资料）

---

## 0. 产品定位与版本结构（背景）

ServiceDesk Plus 是 ManageEngine（卓豪/Zoho 旗下）的 ITSM 平台，分三个版本：**标准版**（事件管理、工单模板、生命周期构建器、SLA、知识库、报表）、**专业版**（+ITAM 资产管理）、**企业版**（+服务目录、问题管理、变更与发布管理、CMDB、IT 项目管理）。官网宣称通过 PinkVERIFY 认证的实践涵盖事件、问题、变更、发布与部署、请求履行、知识管理等。架构核心特点是：**所有模块共享统一的"工单（Request）模型 + 可视化工作流画布 + 模板机制"**，理解这一底座比逐模块背功能更重要。

来源：https://www.manageengine.com/tw/service-desk/ 、https://www.manageengine.cn/products/service-desk/

---

## 1. 事件管理（Incident Management）

### 1.1 功能清单
- **多渠道建单**：自助门户、邮件转工单（Email to Ticket，含自动路由）、电话代录、Zia 聊天机器人、Outlook 插件、移动端 App、监控工具集成（OpManager 告警自动转工单）。
- **工单分类体系**：三级树形结构 **Category（类别）→ Sub Category（子类别）→ Item（条目）**；若 Item 设为必填，Category/Sub Category 自动级联必填。
- **核心工单字段**：Status（状态）、Priority（优先级）、Impact（影响）、Urgency（紧急度）、Level（层级）、Mode（来源渠道）、Request Type（请求类型）、Group（支持组）、Technician（技术员）、Site（站点）、Requester（请求人）、Subject/Description、Due By Time（应完成时间，由 SLA 计算）。
- **请求人视图 vs 技术员视图**：自助门户表单不暴露 Mode、Request Type、Level、Impact、Impact Details、Urgency 等内部字段。
- **VIP 用户标识**：按职位标记 VIP，工单列表显示图标辅助人工定级。
- **自动化**：
  - **Business Rules（业务规则）**：条件触发动作（更新字段、分派、通知、执行自定义函数）；支持 If-If / If-Else 分支；可作用于工单、备注、通知。
  - **Technician Auto Assign**：Round Robin（轮询）或 Load Balancing（负载均衡）两种算法，按可用性自动派单。
  - **Notification Rules**：工单生命周期各节点的邮件/短信/移动端推送。
  - **Closure Rules（关闭规则）**：强制关闭前必填字段/必完成任务；可配置"Resolved 状态超期自动关闭"。
- **任务（Tasks）**：工单可拆解为多任务，分配给不同组/技术员，支持**任务依赖（dependencies）**（重大事件场景强调依赖排序）。
- **关联机制**：Link Requests（关联多个相似工单，父工单的备注/工时/解决方案可同步）；一键转问题单（Create a New Problem，字段自动携带）；关联变更、资产/CI。
- **其他**：工时记录（Worklog/Timer）、预防性维护任务（Preventive Maintenance，按周期自动生成工单）、解决方案检索（挂接知识库）。

### 1.2 状态机 / 生命周期
- **默认状态**：Open → On hold → Resolved → Closed（另有 Requested for Info 等）。
- **Request Life Cycle（RLC）**：拖拽画布定义状态与转换（Transition）。转换分 **Before / During / After** 三个阶段配置条件与动作：转换前校验必填字段、转换中执行动作、转换后通知；可按角色限制谁能执行某转换。RLC 绑定到事件模板，一个模板一个生命周期。
- **重要版本变化**：本地版 15200 起 RLC **已弃用**，自动迁移为统一的 **Request Workflows**（节点式：Start → State → Transition，含自动/手动转换）。新建的 SLA Due By 上限 100 天。

来源：https://www.manageengine.com/products/service-desk/automation/request-life-cycle-rlc.html 、https://www.manageengine.com/products/service-desk/itsm/it-software.html 、https://www.manageengine.com/products/service-desk/on-premises/readme-new.html 、https://help.servicedeskplus.com/configurations/helpdesk/service-catalog/service-item.html

### 1.3 优先级矩阵（Priority Matrix）
- 管理员一次性配置：Admin → Helpdesk Customizer → Priority Matrix。
- **影响（Impact）为 Y 轴 × 紧急度（Urgency）为 X 轴**，交叉单元格映射 Priority。例：Impact=Affects Business + Urgency=High → Priority=High。
- 请求人/技术员选择 Impact+Urgency 后**自动填充 Priority**；可授权技术员手动覆盖（override）。
- Impact/Urgency/Priority 的取值列表均可自定义（如 High/Medium/Normal/Low）。
- 新版增加 **Zia AI 预测优先级**（基于历史派单/定级数据训练）。

来源：https://help.servicedeskplus.com/configurations/helpdesk/priority_matrix.html 、https://www.manageengine.com/products/service-desk/itsm/itil-priority-matrix.html

---

## 2. 服务请求 / 服务目录（Service Catalog）

### 2.1 目录结构
- 两级大类：**IT 与 Business**；其下自定义 Service Category（如 Hardware），再挂服务项（Service Item，如"申请新笔记本"）。门户布局支持 Card / List / Panel 三种视图，可拖拽排序。
- **可见性控制**：按 User Group（按站点/部门/职位/名单圈人）控制"Show to Requester"。

### 2.2 服务模板（Service Template）构成
- **表单设计器**：拖拽式；字段来源为可用字段池 + 自定义字段。额外字段配额：**24 个文本 + 8 个日期时间 + 8 个数值**（通用级与目录级各一套）。
- **Resource Info（资源信息块）**：针对服务所涉资源设计问答式采集，题型为 Yes/No、下拉、复选框、纯文本；**下拉选项可与资产模块联动**；每个选项可挂成本（成本核算）。
- **Field & Form Rules（字段与表单规则）**：三个触发点——**On Form Load / On Field Change / On Form Submit**；可显隐字段、改值、校验；可用自定义脚本扩展。
- **模板可绑定**：专属工作流、SLA、任务集、支持组。

### 2.3 审批与工作流
- **最多 5 级审批**，每级可多名审批人；审批人可为技术员或有权限的请求人；支持动态变量 **$Dept_Head$**（自动指向请求人部门负责人，需预配部门主管）。
- 审批规则选项：提出即自动发审批通知（逐级推进）；须全部审批人通过（同级多人时同 Stage 内全员须通过，任一级拒绝即终止）；"审批通过前不分派技术员"。
- 任务：模板预置任务集，可配置"审批通过后自动触发任务"、任务依赖。
- 服务请求**不能通过邮件创建**（MSP 文档明确）；事件 SLA 与服务 SLA 是**两套独立配置**（见第 5 节）。

来源：https://help.servicedeskplus.com/configurations/helpdesk/service-catalog/service-item.html 、https://www.manageengine.com/products/service-desk-msp/help/adminguide/configurations/helpdesk/service-catalog/service-catalog.html 、https://www.manageengine.com/products/service-desk-msp/faq-service-catalog-modules.html

---

## 3. 问题管理（Problem Management）

### 3.1 流程节点（官方 ITIL 最佳实践工作流）
1. **检测与分类**（复用 Category→Sub Category→Item；用"Top 10 重复事件"报表发现问题线索）；
2. **定级**（问题同样有 Impact/Urgency/Priority 与优先级矩阵）；
3. **根因分析 RCA**（内置结构化分析表单：Root Cause、Impact、Symptoms 等，可附件）；
4. **解决方案 / 规避方案 / 已知错误**：Solution=永久修复，Workaround=临时方案；**问题一旦添加了 Solution 或 Workaround 即被视为 Known Error（已知错误）**，可显式"Mark as Known Error"；
5. **关闭**：Problem Closure Rules 强制必填字段完备才能关单。

### 3.2 关键机制
- **事件关联**：一个事件可关联到已有问题；从事件一键新建问题并自动带入明细；问题单可关联多个事件、变更、发布、CI（结合 CMDB 做影响分析）。
- **Problem Life Cycle**：与 RLC 同款的拖拽画布，自定义问题状态机（新版并入 Workflows）。
- **KEDB 短板（需注意）**：官方社区用户反馈 SDP 没有面向终端用户的独立"已知错误数据库"门户，"Mark as Known Error"主要供技术员内部参考 workaround——自研对标时可视为差异化机会。
- 解决方案可一键沉淀到知识库。

来源：https://www.manageengine.com/products/service-desk/itsm/itil-best-practices.html 、http://help.servicedeskplus.com/problems/problem_solutions.html 、https://pitstop.manageengine.com/portal/en/community/topic/known-errors-how-do-you-use-them 、https://www.manageengine.com/products/service-desk/itsm/it-problem-management-software.html

---

## 4. 变更管理（Change Management）

### 4.1 变更类型与角色
- 内置变更类型：**Standard（标准/预批准）、Minor、Major、Significant**；另有 Emergency（紧急）实践；类型可自定义并配色。
- 角色体系：Change Requester、Change Owner、Change Manager、Change Planning Team、Change Implementation Team、Change Review Team、CAB 成员、Change Governor（可跨阶段编辑）；可建多个 CAB（如 ECAB 紧急变更委员会、Technical CAB）。

### 4.2 默认六阶段状态机（可扩至 8 阶段）
| 阶段 | 关键状态 | 负责角色 |
|---|---|---|
| Submission 提交 | Requested → Submitted for Authorization →（Requested for Info）→ Accepted/Rejected | 提交人、直线经理 |
| Planning 规划 | Planning In Progress → Submit for Review →（RFI）→ Approved/Rejected | 规划组、Change Owner |
| Approval 审批 | Approval Pending → Approved/Rejected | CAB、Change Manager |
| Implementation 实施 | In Progress →（On Hold）→ Completed / Back Out（回退） | 实施组、Change Owner |
| Review 评审（PIR） | In Progress → Completed/Failed | 评审组 |
| Close 关闭 | Completed / Cancelled + **关闭代码（Closure Code，可自定义多级）** | Change Manager |

可视化工作流构建器支持：多阶段多状态、条件节点、字段更新、通知、审批节点。审批节点的通过条件有 5 种：**Anyone（任一人）、Everyone（全员）、First Response Action（首个响应者）、Majority（多数）、%（指定百分比）**；可配审批提醒定时器。

### 4.3 规划四要素（RFC 必填内容）
- **Impact Analysis（影响/风险分析）**：可配置风险问卷；Zia AI 基于历史变更预测风险值。
- **Rollout Plan（实施计划）/ Backout Plan（回退计划）/ Checklist（检查清单）**。
- **Change Calendar / FSC**：变更日历展示排期、冲突检测、停机公告（Downtime Announcement）。
- 变更可拆分为任务/项目执行（与项目管理模块联动）；全程时间戳审计历史（History/Property View）；从问题单可直接发起变更；变更可关联事件、问题、发布、CI。

来源：https://www.manageengine.com/products/service-desk-msp/help/adminguide/change/change_stages.html 、https://www.manageengine.com/products/service-desk/itsm/itil-best-practices.html 、https://help.sdpondemand.com/release-workflow-editor 、https://www.manageengine.com/products/service-desk/it-change-management/change-agent.html

---

## 5. 发布管理（Release Management）

- **定位**：管理新版本/升级的构建、测试、部署；与变更模块深度集成——可从变更单直接发起发布并继承文档；变更+发布共用**集成日历**防排期冲突。
- **发布类型**：Major / Minor / Emergency 等，可自定义；每种类型绑定独立工作流与发布模板、发布角色。
- **默认 9 个阶段**（最多支持 12 个阶段，阶段内状态数不限；除 Submission/Close 外可重排序）：
  1. Submission（提交：定优先级、风险、业务需求）
  2. Planning（规划：rollout/backout 计划、停机窗口）
  3. Development（开发）
  4. Testing（测试：In progress/On Hold/Completed/Failed）
  5. UAT（用户验收：Accepted/Rejected）
  6. Deployment（部署：Deployed/Failed，含停机公告）
  7. Training（培训）
  8. Review（发布后评审）
  9. Closure（关闭：Completed/Failed/Canceled + 关闭代码）
- **状态三类型**：每个状态需归类为 In Progress / Completion / Rejection，并可配置到达该状态时通知哪些发布角色。
- 发布工作流编辑器与变更一致：审批节点同样支持 Anyone/Everyone/First Response/Majority/% 五种条件。

来源：https://help.sdpondemand.com/release-stages-statuses 、https://www.manageengine.cn/products/service-desk/itil-release-management/it-release-management-software.html 、https://www.manageengine.com/products/service-desk/it-release-management/release-management-cloud.html

---

## 6. SLA / OLA 管理

### 6.1 SLA 结构（表单三段式）
1. **SLA Details**：名称、描述；
2. **SLA Rules**：**首次响应时间（Response）+ 解决时间（Resolution）**；可选"是否忽略节假日与周末"（即按运营时间/工作时间历计算）；
3. **Escalations 升级**：响应与解决时限**各最多 4 级升级**；每级可选 **Escalate Before（违约前预警，如提前 30 分钟）或 Escalate After（违约后）**；升级动作（Actions）包括：通知指定技术员/管理者、**改派组、改派技术员、提升优先级、提升 Level**。

### 6.2 两类 SLA
- **事件 SLA**：按**条件规则自动匹配**（如 Priority=High → 高优 SLA）；Admin → Incident Management → SLA。
- **服务请求 SLA**：不按条件，而是**绑定到服务模板**（静态指定），可开放给请求人自选；显示于服务表单顶部以管理期望（如"14 天内交付"）。
- 计时规则：可冻结 SLA 计时（工单等待用户回复时暂停）；按账户/站点定义运营时间（Operational Hours），可选择是否把非运营时间计入；Due By Time 上限 100 天。

### 6.3 OLA（运营级别协议）
- OLA 是 SLA 的"内部支撑协议"：**每个 SLA 最多配 5 个 OLA，每个 OLA 最多含 5 个支持组**；工单进入某组即启动该组的 OLA 计时，用于考核内部各协作组是否拖累整体 SLA。

来源：https://help.servicedeskplus.com/configurations/helpdesk/service-catalog/service-sla.html 、https://www.manageengine.com/latam/service-desk/gestion-de-incidentes-ti/como-prevenir-tickets-vencidos.html 、https://www.manageengine.com/products/service-desk-msp/service-level-agreement.html

---

## 7. 知识库（Knowledge Base / Solutions）

- **内容形态**：Solution（解决方案）、Workaround（规避方案）、FAQ；富文本 + 图片 + 附件（单附件上限 10MB）+ 视频嵌入。
- **组织方式**：按 Topic（主题）分组管理；公开（请求人门户可见）/ 私有（仅技术员）两级可见性，控制敏感信息。
- **审批机制**：新解决方案须由 Solution Approver 审批后才对请求人可见，保证质量。
- **工单联动**：技术员处理工单时可直接检索/引用知识文章；关单时一键把 Resolution 沉淀为知识文章；问题的 Solution/Workaround 可转知识库。
- **自助与智能**：门户关键词搜索（新版本接 Zia/AI 语义推荐、$AutoSuggest 变量在通知邮件中自动推荐文章）；**点赞/点踩反馈闭环**；报表统计文章使用效果（浏览量、解决率）。
- 官网案例口径的"多级目录、版本控制、NLP 语义搜索"属营销文章描述，建议实测核实。

来源：https://www.manageengine.cn/products/service-desk/knowledge-base.html 、https://www.manageengine.com/products/service-desk/itsm/knowledge-management-kpi-metrics.html 、https://www.manageengine.cn/products/service-desk/articles/sdp20250808001.html

---

## 8. 跨模块底座机制（自研对标的关键抽象）

1. **统一工单模型**：事件/服务请求/问题/变更/发布共享字段体系（状态、优先级、组、技术员、SLA、任务、附件、备注、工作日志、审批、历史）。
2. **模板 + 工作流双驱动**：每种单据类型 = 表单模板（字段/表单规则）× 生命周期工作流（状态机/转换动作/审批节点）。15200 后 RLC/PLC 统一收敛为 Workflows（State/Transition 节点图，Before/During/After 规则改为 Anytime 执行模式）。
3. **自动化三件套**：Business Rules（条件动作）、Custom Triggers（事件驱动通知/脚本）、Timer Actions（定时动作）；自定义函数支持 Deluge/Java/Node.js。
4. **审批引擎通用化**：5 级、多级多人、5 种通过条件、备份审批人、审批提醒定时器——同一套能力复用于服务请求、变更、发布。
5. **CMDB 贯穿**：事件/问题/变更/发布均可关联 CI，做影响与依赖分析。
6. **沙箱环境**：自动化与工作流变更可先在 Sandbox 验证再发布生产。

---

## 9. 信息缺口与存疑项

- **help.servicedeskplus.com 帮助站为 SPA 渲染**，直接抓取仅返回框架页；本文细节主要取自其搜索引擎可见版本、MSP 版帮助站（结构与旗舰版基本一致）及官方营销/最佳实践页。个别版本差异（本地版 vs 云端版 vs MSP 版）需实测确认。
- 事件工单**默认完整状态清单**、关闭代码的具体内置取值，官方文档未逐一列出，建议产品实测时核对。
- 知识库的"版本控制、NLP 搜索"等表述来自官方中文营销文章，非产品文档，可信度中等。
- Zia AI 相关能力（优先级预测、风险预测、审批预测）仅云端版完整提供。

**主要来源汇总**：
- https://www.manageengine.cn/products/service-desk/
- https://help.servicedeskplus.com/ （Admin Guide）
- https://help.sdpondemand.com/release-stages-statuses 、/release-workflow-editor
- https://www.manageengine.com/products/service-desk/itsm/itil-best-practices.html
- https://www.manageengine.com/products/service-desk-msp/help/adminguide/change/change_stages.html
- https://www.manageengine.com/products/service-desk-msp/faq-service-catalog-modules.html
- https://www.manageengine.com/products/service-desk/on-premises/readme-new.html
- https://www.manageengine.com/products/service-desk/automation/request-life-cycle-rlc.html

（全文字数约 3400 字，供编排者整合使用）
