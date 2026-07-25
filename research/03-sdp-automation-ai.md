# SDP 自动化与 AI 能力调研简报

> 导语：本简报梳理 ServiceDesk Plus 的自动化体系（可视化工作流、业务规则、触发器、自定义函数）、工单自动指派/升级/通知、审批流，以及 Zia AI 助手与 GenAI 功能矩阵、LLM 提供商策略和无代码自定义能力，是自研"自动化引擎 + AI 原生设计"的主要参照。

**角色**：调研员_SDP自动化AI ｜ **版本说明**：SDP 分 Cloud 与 On-Premises（本地部署，最新主版本 v15200）两条线，两者能力差异较大，下文分别标注。调研时间：2026 年（基于当前最新公开资料）。

---

## 一、可视化工作流（Workflow）

### 1. Request Workflows（工单工作流，v15200 起）
- 旧版 "Request Life Cycle（RLC，请求生命周期）" 在 v15200 已被废弃，全部自动迁移为 **Request Workflow**；配置入口：Admin > Automation > Workflows > Request。
- **节点式拖拽画布**：通过向画布拖入各类节点构建流程，核心节点类型包括：
  - **Start 节点**：可连接自动流转（auto transition）或手动流转（manual transition）；影响邮件/API 建单时的状态校验与默认状态。
  - **状态节点（State）**：工单状态之间的流转；支持流转前（Before）、流转中（During）、流转后（After）规则，动作包括请求补充信息、发送上下文通知、中止工单处理、调用自定义脚本等。
  - **Field Update 节点**：自动更新字段（如审批完成后自动改 Approval Status）。
  - **Approval Level 节点**：添加审批层级，最多 **20 级**。
  - **User Defined Action 节点**：自动创建子请求、任务、备注、清单（Checklist）、公告，甚至跨实例（cross-instance）创建记录。
- 可在工单详情页/列表页悬停查看**工作流执行详情与执行图（execution graph）**。
- 支持为不同模板/工单类型关联不同工作流；切换模板到新工作流会删除旧审批并自动触发新审批层级。
- 注意事项：与工作流关联后，请求关闭规则（Closure Rules）不再适用；"所有任务完成后自动关闭"需通过 User Defined Action 实现。

### 2. 变更管理可视化工作流（Visual Change Workflow Builder）
- 拖拽画布构建变更工作流，支持 **8 个自定义阶段（Stage）**，每阶段可分配各自状态。
- 变更模板与工作流关联，覆盖标准/紧急/重大变更等不同类型。
- 通过 **变更角色（Change Roles）** 提供细粒度权限：查看/编辑/批准（含 CAB 审批）。
- 变更工作流支持自定义触发器与 Deluge 自定义函数。
- 来源：https://www.manageengine.cn/products/service-desk/visual-change-workflow-builder.html

### 3. 自定义模块工作流
- v15200 起支持为**自定义模块**定义工作流与定时动作（Timer Action，延时动作）。

---

## 二、业务规则（Business Rules）与自动化引擎

### 1. Business Rules（业务规则，前置钩子 Pre-hook）
- 模型为"**条件 → 动作**"，在工单**创建/编辑时**执行（同期执行，可中止工单创建）。
- 可按**站点（Site）**差异化定义规则；支持多条件组合（AND/OR）。
- 动作包括：指派技术员/支持组、设置分类/优先级/影响度/紧急度、更新字段、执行 Custom Function（Deluge）、发送自定义邮件/短信通知。
- 支持**级联执行（Cascading）**：一条规则的结果可触发后续规则。
- v15200 起新增 **Imported 事件**（导入工单触发自动化），可与 Created 事件组合。
- 官方称规则配置得当可自动处理约 70% 的入单分派。

### 2. Custom Triggers（自定义触发器，后置钩子 Post-hook）
- 与业务规则的区别：触发器在工单**创建/编辑完成后**异步执行，可触发任务、自定义函数、通知；作用域可指定为 Requests/Approvals/Tasks 等。
- 支持 If-If / If-Else 条件结构；可执行 User Defined Action。
- 来源：https://pitstop.manageengine.com/portal/en/community/topic/business-rules-vs-triggers-what-is-the-difference

### 3. Custom Functions（自定义函数，低代码核心）
- 使用 **Deluge**（Zoho 自研脚本语言）编写，提供拖拽式 Deluge Script Editor；On-Prem 也支持 Java/Node.js/Python 类结构。
- 可从业务规则、自定义触发器、工作流节点调用；内置 `invokeurl` 直接调外部 REST API（可做双向集成、动态 Token）。
- 支持测试执行（Save and Test）与 `info` 调试输出。
- 入口：Admin > Developer Space > Custom Function（各模块独立：Request/Problem/Change 等）。
- 来源：https://www.manageengine.com/products/service-desk-msp/help/adminguide/deluge/change-custom-functions.html

### 4. 其他自动化机制
- **Priority Matrix（优先级矩阵）**：由"影响度 × 紧急度"自动推导优先级。
- **Timer Actions（定时动作）**：对请求/自定义模块记录执行延时动作。
- **Closure Rules（关闭规则）**：强制填写必填信息后才能关单；已解决状态超期自动关单。
- **Data Archival（数据归档）**：按计划自动归档历史工单。
- **自动委派（Delegation）**：技术员/审批人/请求人缺席时自动移交工单与审批。

---

## 三、工单自动指派 / 升级 / 通知

| 能力 | 关键细节 |
|---|---|
| **Technician Auto Assign** | **Round Robin（轮询）**或 **Load Balancing（负载均衡）**算法；考虑技术员可用性；支持例外规则、**备用技术员与备用审批人**；工作流模式下可设"服务请求审批通过后再派单" |
| **SLA 管理** | 响应 SLA + 解决 SLA 分开；按类别/优先级/站点/营业时间匹配多 SLA；**响应升级 1 级、解决升级最多 4 级**；主动式（违约前预警）+ 被动式（违约后）通知；升级时可自动改派组/技术员、提升优先级 |
| **Notification Rules** | 建单、更新、指派、审批请求、SLA 违约等事件自动触发邮件/短信/应用内通知；模板支持变量，v15200 起 To/Cc 可引用用户附加字段；审批提醒可排程 |
| **营业时间** | v15200 支持按站点/支持组/区域分别配置运营时间 + 特殊运营时间（如年末变更冻结期），避免误算 SLA |

来源：https://www.manageengine.com/products/service-desk/automation/ 、https://www.manageengine.com/products/service-desk/automation/service-desk-automation-ideas.html

---

## 四、审批流（Approvals）

- **多级审批**：工作流 Approval Level 节点最多 20 级；触发器可顺序添加多级审批。
- **审批动作**：批准/拒绝/要求澄清（Pending Approval / Pending Clarification 状态自动展示）；支持邮件内审批、移动端审批。
- **自动审批**：可配置 Auto Approval 规则；Zia 可**解析邮件自动审批请求/变更**（GenAI 能力）。
- **审批委派**：审批人缺席时自动移交；支持备用审批人。
- 变更模块：分阶段审批 + CAB 审批；Change Approval Summary 结构化展示各阶段/各层级的审批状态与自动审批规则。
- 限制：含"Select Approver"字段的模板不能与启用审批的工作流共存（变通：用用户引用型附加字段在 Approval Level 节点动态指定审批人）。

---

## 五、Zia AI 助手与 GenAI

### 1. Ask Zia（对话式虚拟代理）
- LLM 风格界面，**多轮上下文对话 + 多模态**（文本/语音/图片输入）。
- 面向三类角色：终端用户（问答、建单）、技术员（执行工单动作：改状态、加备注）、流程负责人（实时生成报表与洞察）。
- 能力：跨服务台搜索、提取并总结知识库文章、执行工单动作、作为统一触点。
- On-Prem v15200 的 Ask Zia 基于 **ChatGPT LLM + MCP Tools**：管理员可在 Admin > Zia > MCP Tools 中逐项启用/禁用工具能力，并按用户/组/角色授权。

### 2. LLM 提供商策略（对自研产品极有参考价值）
- 三种可选：**Zia LLM**（自研，基于开源基础模型，托管于 ManageEngine 数据中心，提示词与数据不出域）、**ChatGPT**、**Azure OpenAI**。
- **可按功能分别选择不同的 LLM 提供商**；Zia LLM 无按量付费。
- Zia Dashboards：统计 AI 采用率与 Token 消耗量。

### 3. GenAI 功能矩阵（2025 年 Cloud 大版本 + 部分下沉 On-Prem）
| 功能 | 说明 |
|---|---|
| Ask Zia Workflow Assist | 自然语言描述或图片输入 → 自动生成可视化工作流，给出自动化/条件检查建议并修复断开的节点 |
| Resolution Generator / Resolution Assist | 从对话、备注、历史工单生成解决方案草稿 |
| Solution Generator / Solution Assist | 生成完整知识库文章（含标题、关键词）；RAG 驱动，在用户建单/编辑时实时推荐解决方案 |
| Conversation Summary | 长邮件线程/工单对话一键摘要（交接、升级场景） |
| Reply Assist | 起草/改写/润色回复，多语言支持 |
| Checklist Generator | LLM 生成检查清单 |
| Script Generator | 生成自定义 JavaScript 片段（模板定制）与 Deluge 代码（低代码自动化最后一公里） |
| 富文本生成 | 全平台描述/备注等富文本辅助生成 |

### 4. 预测性 AI（Predictive，ML 模型）
- **智能分诊与指派**（Intelligent triaging & assignment）
- **变更风险预测**（Change risk prediction）
- **潜在问题预测**：相似事件聚类，提前识别 Problem
- **智能解决方案推荐**
- 2025 年数据：Zia 已交付 1500 万+ 次数据驱动预测、20 万+ 单触点自动化。

来源：https://www.manageengine.com/products/service-desk/ai/servicedesk-plus-gen-ai-release-2025.html 、https://www.manageengine.com/products/service-desk/2025-year-in-review.html 、https://www.businesswire.com/news/home/20250923070568/en/

---

## 六、无代码自定义能力

- **自定义模块（Custom Modules）**：v15200 配置页重构；支持独立配置业务规则/触发器/工作流/定时动作/报表（每模块独立 Tab）；可挂接子实体（任务、备注、清单、工作日志、提醒、会话、评论等），各有独立权限与上限配置；自定义模块详情页支持**无代码布局定制**（Admin > Layout Customization，拖拽布局）。
- **自定义表单/模板**：动态表单构建器（Dynamic Form Builder），事件/服务目录/变更/发布/自定义模块均有独立模板。
- **自定义字段（Additional Fields）**：单行文本（≤250 字符、可设长度）、数值（可设区间）、日期、下拉、单选、布尔、HTML（可启用内联图片）、用户引用型等；部分字段类型支持 PII 加密；API 字段名规则已标准化（新字段不再带 `udf_` 前缀）。
- **字段与表单规则（Field & Form Rules）**：事件驱动（页面加载/字段变更/表单提交）触发 15+ 种表单动作：显示/隐藏字段、启用/禁用、设/取消必填、增删下拉选项、预设/清空字段值、关联/显示/隐藏任务、执行 JavaScript 脚本（如 `$CS.hideField(["CATEGORY","LEVEL"])`）。
- 来源：https://www.manageengine.cn/products/service-desk/help/adminguide/configurations/helpdesk/field-form-rules.html

---

## 七、API 与第三方集成生态

### 1. API 能力
- **REST API V3**（`/api/v3/...`），覆盖请求/问题/变更/资产/CMDB/自定义模块等全部模块；支持 OAuth2 与 Technician Key 认证；可在 Deluge 中通过 `invokeurl` 调自身 API 或外部 API。
- **Webhooks** 与 Custom Functions 实现事件外推；v15200 起 Ask Zia 通过 **MCP Tools** 暴露能力（值得关注的架构方向）。

### 2. 集成生态（官方称 200+ 即插即用集成）
- **身份/目录**：Active Directory、Azure AD / Entra ID、LDAP、SAML SSO、OAuth、Okta、ADManager Plus（服务台内直接管理 AD 用户/组）。
- **邮件**：Exchange/O365、Gmail、Lotus Domino；邮件建单、邮件内审批、自动会话归组。
- **监控（告警自动转工单）**：OpManager、Applications Manager、Site24x7、Nagios 等。
- **IM/协作**：Microsoft Teams、Slack、Zoho Cliq、Zoom；Teams/Slack 内可直接处理工单通知与操作。
- **终端/资产管理**：Endpoint Central（资产、补丁、远程控制入单）、AssetExplorer、Microsoft Intune。
- **DevOps/CRM**：Jira、Azure DevOps、Salesforce、Zoho CRM。
- **集成平台**：Zoho Flow（95+ 应用无代码编排，支持 On-Prem 与 MSP 变体）；Zoho Telephony（40+ 电话服务商，应用内拨打/接听）。
- **分析**：Analytics Plus（BI 与跨平台报表）。

来源：https://www.manageengine.com/products/service-desk/help-desk-software/small-business-smbs.html 、https://www.zoho.com/flow/articles/service-desk-plus-integrations.html

---

## 八、对自研产品的关键启示（摘要）

1. **自动化分层模型清晰**：表单规则（前端交互）→ 业务规则（写入时校验/赋值）→ 触发器（写入后异步动作）→ 工作流（全生命周期编排）→ 定时动作（延时补偿），值得整体借鉴。
2. **审批与工作流解耦**：审批作为工作流节点（而非独立模块），支持 20 级、自动审批、委派、备用审批人。
3. **AI 双轨策略**：预测性 ML（分诊/风险/聚类）+ GenAI（生成/摘要/对话）并行；LLM 提供商可插拔、按功能选配，且提供私有化 LLM 选项——符合国内企业数据合规诉求。
4. **MCP Tools 暴露 AI 能力**、细粒度授权（按用户/组/角色）是较新的架构实践。
5. **低代码三角**：可视化配置 + Deluge 脚本 + REST API，覆盖从业务人员到开发者的全谱系扩展需求。

## 九、未能完全核实的信息

- 国内官网（manageengine.cn）页面与国际版内容存在滞后，部分 v15200 新特性（如 MCP Tools 的具体工具清单）仅有英文 release notes，未逐一验证界面行为。
- "Ask Zia 在 On-Prem 使用 ChatGPT" 是否支持替换为国产 LLM，公开资料未提及，无法核实。
- 各 GenAI 功能在 Cloud 与 On-Prem 之间的精确功能对等表未找到官方完整清单。

---
*简报完，供编排者整合使用。*
