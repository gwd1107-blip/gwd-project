# ITSM 自研服务台系统架构建议简报

> 导语：本简报基于 ServiceDesk Plus、ServiceNow、Jira Service Management、GLPI、iTop 五大产品的公开架构资料，提出自研 ITSM 服务台的核心领域模型、模块划分、流程引擎设计、权限模型、集成方式与推荐技术栈，作为后续系统设计的参考蓝图。

**角色：调研员_架构建议** | 对标产品：ManageEngine ServiceDesk Plus、ServiceNow、Jira Service Management (JSM)、GLPI、iTop

---

## 一、主流产品架构模式速览

| 产品 | 架构核心 | 可借鉴点 |
|---|---|---|
| **ServiceDesk Plus** | 模块化单体 + ITIL 流程包（事件/问题/变更/服务目录/CMDB/资产/采购） | 业务规则引擎（条件→动作）、4 级 SLA 升级、邮件解析命令、可视化工单生命周期画布 |
| **ServiceNow** | 统一表结构：所有流程记录继承自 `task` 基表（incident/change_request/problem/sc_req_item 均为其子表）；CMDB 为 `cmdb_ci_*` 类族 + `cmdb_rel_ci` 关系表 | "基表继承"思想：一张 task 基表统一 SLA、审批、审计、报表；CI 关系单独成表（typed relationship） |
| **JSM** | Jira issue 模型 + 请求类型（Request Type 面向用户 / Issue Type 面向内部）双层映射；队列（Queue）由 JQL 驱动；SLA 目标用 JQL 条件定义 | 队列即查询（虚拟视图）、面向用户表单与内部工单解耦、SLA 用查询语言定义目标集合 |
| **GLPI** | Entity（实体）树 + Profile（权限档）二维权限模型；Ticket 为核心，Problem/Change 独立实体可互链 | 实体树天然支持多租户/多部门隔离，递归/非递归授权；邮箱收集器按收件地址路由到实体 |
| **iTop** | CMDB-first：一切皆 CI（服务器、合同、人、组织），XML 声明式扩展数据模型，影响分析为一等功能 | 数据模型可声明式扩展（不改代码加 CI 类型/字段/关系）；数据同步引擎对接外部源 |

**共识结论**：五大产品均采用「工单为中心 + CMDB 为底座 + SLA 为时间约束 + 自动化规则贯穿全生命周期」的架构。自研应以此为骨架。

---

## 二、核心领域模型建议

借鉴 ServiceNow 的继承思想，但简化为聚合根设计：

```
Ticket（工单基类，聚合根）
├── Incident（事件：影响/紧急度 → 自动算优先级，可挂为 Problem 的子单）
├── ServiceRequest（服务请求：来自服务目录，可含多级审批 + 履行任务 Task 拆分）
├── Problem（问题：关联多个 Incident，记录根因/已知错误/Workaround）
└── Change（变更：类型[标准/普通/紧急]、风险、CAB 审批、实施/回退计划、变更窗口）

CMDB
├── CI（配置项基类）→ 子类：Hardware / Software / NetworkDevice / Application / BusinessService
├── CIRelationship（关系表：source_ci, target_ci, relation_type[runs_on/depends_on/connects_to/hosts...]）→ 支撑影响分析
├── Asset（资产，侧重财务/生命周期：采购→入库→领用→维修→报废；与 CI 1:1 关联，参考 ServiceNow 的 alm/cmdb 分离）

组织与人员
├── User（请求人/技术员）、Group（支持组，工单指派的最小单位）、Department/Location、Role
├── Tenant/Site（多地点/多租户隔离单元，借鉴 GLPI Entity 树）

SLA
├── SLADefinition（适用条件、响应/解决时限、工作日历 Calendar、暂停条件）
├── SLAInstance（挂在工单上的计时器实例：start/pause/resume/stop 事件流）
├── EscalationRule（分级升级：如 50% 提醒组长、90% 提醒经理、违约升级 + 自动改派）——SDP 提供 4 级升级链

ServiceCatalog（服务目录：服务→服务项→请求表单模板→绑定专属工作流/审批/SLA）
KnowledgeBase（知识文章：分类、标签、审批发布流程、与工单解决方案互链、命中率统计）
Automation（业务规则：Trigger[创建/更新/定时/SLA阈值] + Condition + Action[改字段/指派/通知/Webhook]）
```

**关键关系**：Ticket N:1 Group / 1:1 SLAInstance / N:M CI / N:M KB文章；Incident N:1 Problem；Change N:M CI（影响评估输入）。优先级 = f(影响 × 紧急度) 矩阵自动计算，禁止手填（iTop、ServiceNow 均如此）。

---

## 三、模块划分与依赖

```
接入层：  自助门户 | 邮件网关 | REST API/Webhook | 监控告警接入 | IM 机器人（企微/钉钉/飞书）
业务层：  工单中心 → 服务目录 → ITIL流程(事件/问题/变更) → 知识库
支撑层：  CMDB/资产 ← 自动发现/导入 ; SLA引擎 ; 自动化规则引擎 ; 通知中心 ; 报表引擎
平台层：  身份认证(SSO/LDAP) | 权限(RBAC) | 流程引擎 | 审计日志 | 任务调度
```

**依赖纪律**：业务层只向下依赖支撑层；CMDB 不得依赖工单（工单引用 CI 即可）；通知中心为纯粹的消息出口，所有模块经消息队列异步调用。SDP 的教训性优点即"各 ITIL 模块数据天然打通、无需集成开发"——自研应保证共享同一数据模型而非跨服务同步。

---

## 四、流程引擎与工作流设计

1. **状态机优先，而非通用 BPMN**。工单生命周期用显式状态机建模（状态 × 迁移 × 守卫条件 × 副作用动作），SDP 与 JSM 均提供"拖放画布设计状态与迁移"的可视化生命周期编辑器，变更管理额外支持多阶段（提交→评估→审批→实施→复核）多状态嵌套。
2. **三类自动化分开实现**：
   - **业务规则**（Trigger-Condition-Action）：工单创建/更新时触发，做分类、改派、字段回填；
   - **SLA 计时器**：独立调度任务（GLPI 用 cron 每分钟扫 `slaticket` 任务），支持暂停条件（如"等待用户"挂起计时）与分级升级；
   - **审批流**：顺序/并行/会签 + CAB 多人投票，审批记录独立存表（审计要求，ServiceNow 变更迁移经验表明审批链需显式建模）。
3. **请求类型双层映射**（学 JSM）：用户看到的"请求表单"与内部"工单类型"解耦，表单字段可自定义并映射到工单字段，降低用户认知负担。
4. **优先级矩阵 + 自动指派**：指派策略支持轮询、负载均衡、技能匹配（SDP 按负荷+可用性+SLA 要求三因子）。

---

## 五、权限模型（RBAC + 多租户）

推荐 **GLPI 式二维模型**：`权限 = Profile(角色) × Entity(组织/租户节点)`。
- **Profile**：功能权限集（创建工单/审批变更/编辑CI/查看报表），预置 Self-Service、Technician、Manager、Admin 等；
- **Entity 树**：部门/站点/客户层级，授权时标注**递归/非递归**（递归 = 可见子节点数据）；
- 数据可见性 = 用户当前 Entity 上下文 + 所在 Group；工单、资产、CI 均强制带 entity_id 字段，查询层统一注入租户过滤；
- 多租户（MSP 场景）下 SLA、分类、工单模板均按 Entity 覆盖配置（GLPI/SDP-MSP 验证过的模式）；
- 认证：本地 + LDAP/AD 同步（SDP 支持 AD/LDAP 导入 + SSO；GLPI 支持按 LDAP 属性如 memberOf 自动分配 Entity 和 Profile——强烈建议实现"登录时规则映射"）；保留 SAML/OIDC SSO 扩展口。

---

## 六、集成方式

| 通道 | 设计要点 | 参考 |
|---|---|---|
| 邮件（入站） | 邮件收集器定时拉取（IMAP/POP3/EWS），命令解析器按定界符解析 `Operation=AddRequest/EditRequest/CloseRequest` 及字段（级别/类别/技术员/状态），主题含工单号则回写原单；多收件地址路由到不同 Entity | SDP 邮件解析、GLPI Mail Collector |
| 邮件/IM（出站） | 通知模板引擎（事件×角色×渠道矩阵），异步队列发送，支持企业微信/钉钉 Webhook | SDP 通知矩阵 |
| Webhook（出站） | 工单事件（created/updated/status_changed/sla_breach）注册回调，带签名与重试 | SDP Webhook、JSM Automation Webhook |
| REST API（入站） | 全资源 OpenAPI，API Token 鉴权；监控系统（Zabbix/Prometheus Alertmanager）告警→自动建单并关联 CI、告警恢复→自动关单 | SDP REST API、LogicMonitor↔ServiceNow 模板 |
| AD/LDAP | 用户/组定时同步 + 登录时属性规则映射 Entity/Profile | SDP、GLPI |
| 监控/资产发现 | 首期做"告警 Webhook 接入"即可；自动发现（Agent/网络扫描）列为二期，或预留与 GLPI Agent/OCS 对接的数据同步口（iTop 数据同步引擎模式） | iTop、GLPI |

---

## 七、推荐技术栈及理由

| 层 | 推荐 | 理由 |
|---|---|---|
| 前端 | React 18 + TypeScript + Ant Design（或 Vue3 + Element Plus，按团队熟悉度） | 工单列表/表单密集型后台 UI，组件库成熟；画布类需求（流程设计器、CI 关系图）配 React Flow |
| 后端 | 模块化单体（Spring Boot / NestJS / Django REST，三选一） | 五大产品本质都是"共享数据模型的单库系统"；初期微服务只会制造分布式事务与 CMDB 引用难题。模块边界按第三节划分，预留拆分条件 |
| 数据库 | PostgreSQL 15+ | JSONB 承载自定义字段（EAV 的替代），行级安全（RLS）可直接实现租户过滤；ticket 主表 + 类型扩展表（类表继承） |
| 搜索 | Elasticsearch / OpenSearch | 工单全文检索、知识库搜索、队列即查询；前期可用 PG 全文检索过渡 |
| 消息队列 | RabbitMQ 或 Kafka（轻量可 Redis Stream） | 通知发送、Webhook 投递、SLA 扫描、监控事件接入全部异步化 |
| 缓存/调度 | Redis（缓存 + 分布式锁）+ 持久化任务调度（xxl-job / Quartz / Celery beat） | SLA 计时器、升级扫描、邮件拉取、LDAP 同步等定时任务 |
| 对象存储 | MinIO / S3 | 工单附件、知识库图片 |
| 流程引擎 | 自研状态机（数据库定义状态迁移表 + 可视化编辑器），不引入 Camunda | 工单状态机复杂度有限，通用 BPMN 引擎过重；JSM/SDP 均为此路线 |

---

## 八、可扩展性设计

1. **声明式元数据驱动**（学 iTop ITSM Designer）：CI 类型、自定义字段、请求表单、分类树全部存元数据表，运行时动态渲染/校验，避免硬编码新字段需发版。
2. **规则引擎配置化**：Trigger-Condition-Action 存库而非代码，支持执行顺序与停用；动作集合插件化（内置改字段/指派/通知/Webhook，可扩展脚本动作）。
3. **事件总线**：核心实体变更发布领域事件（ticket.created 等），通知、Webhook、审计、报表订阅消费，新功能挂事件即可，不改核心链路。
4. **插件/集成层**：集成适配器接口（IIntegrationAdapter）统一收发协议，新增监控/IM 渠道只加适配器。
5. **归档机制**：按时间自动归档历史工单至归档表/库，归档数据仍可检索与出报表（SDP 数据归档功能），保障主库性能。
6. **横向扩展**：应用无状态化；SLA 扫描等定时任务用分布式锁防重；搜索与报表读库可与主库读写分离。

---

## 九、实施优先级建议（蓝图落地顺序）

M1：工单基类 + RBAC/Entity + 邮件建单 + 基础业务规则 → M2：SLA 引擎 + 服务目录/请求表单 + 知识库 → M3：问题/变更流程 + 审批流 + CMDB/CI 关系 → M4：自动化增强（监控接入、自动指派）+ 报表仪表盘 → M5：可视化流程设计器、资产全生命周期、多租户强化。

---

## 十、主要信息来源

- ServiceDesk Plus 功能与模块：https://www.manageengine.cn/products/service-desk/articles/sdp-itsm-fuwuguanli-gongdan.html ；帮助台特性列表：http://www.zohocorp.com.cn/manageengine/products/service-Desk/help-desk-features.html
- SDP 邮件解析/命令（官方文档）：https://www.manageengine.cn/products/service-desk/help/adminguide/ESMemailserversetting.html 、https://www.manageengine.cn/products/service-desk/email-commands.html
- SDP 自动化/集成（API+Webhook、企微/钉钉）：https://www.cnblogs.com/ADManager/p/19013269 、https://www.cnblogs.com/ADManager/p/19028324
- ServiceNow 表结构与 CMDB 数据模型：https://docs.digitalkimya.net/guides/servicenow-tables-data/ ；SLA 配置实务（官方社区）：https://www.servicenow.com/community/itsm-forum/the-complete-practitioner-s-guide-to-servicenow-slas-from/m-p/3453739 ；对象映射参考：https://clonepartner.com/blog/how-to-migrate-from-haloitsm-to-servicenow-technical-guide/
- JSM 能力（请求类型/队列/SLA/自动化/Assets）：https://open-exam-prep.com/practice/acp-420 、https://www.merito.com/vendors/atlassian/jira-service-management
- GLPI Entity-RBAC 与 LDAP 规则：https://itcko.sk/en/enhancing-it-security-with-glpis-role-based-access-control-rbac/ ；实施步骤：https://itcko.sk/en/successful-glpi-implementation-a-step-by-step-guide/
- iTop 产品数据表（Combodo 官方 PDF）：https://www.combodo.com/IMG/pdf/combodoproductsdatasheet_en.pdf ；GLPI/iTop 对比：https://www.selecthub.com/itsm-software/glpi-vs-itop/ 、https://www.openmsp.ai/blog/it-inventory-management-open-source

**可信度说明**：SDP 功能细节、GLPI 权限/邮件机制、iTop 数据模型均来自官方或一手技术文档，可信度高；ServiceNow 表结构来自第三方技术指南与官方社区帖，方向准确但字段级细节（如具体表名）建议后续以官方文档二次核实；各产品 AI 能力（Zia、Rovo 等）来自厂商宣传材料，作为趋势参考，未作为架构依据。GLPI 内部技术栈（PHP/MySQL）本轮未抓取官方仓库核实，列为待验证项，但已在推荐栈中规避对其依赖。
