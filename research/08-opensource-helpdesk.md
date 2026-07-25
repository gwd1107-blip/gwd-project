# 开源工单系统调研简报：Zammad 与 osTicket（附 FreeScout、UVdesk 简评）

> 导语：本简报调研两款代表性开源帮助台/工单系统——多渠道体验见长的 Zammad 与轻量经典的 osTicket（并简评 FreeScout、UVdesk），重点还原其 SLA 语义、自动化体系、动态表单与路由设计，为自研系统的工单核心与用户体验提供参考坐标。

> 调研员_开源工单 ｜ 用途：为自研 IT 服务台（对标 ManageEngine ServiceDesk Plus）提供产品设计与功能实测参考
> 说明：本简报仅调研整理，未修改任何本地文件。GitHub 数据采集于 2026-07（API 实时值），功能描述以官方文档为主。

---

## 一、总览对比表

| 维度 | Zammad | osTicket |
|---|---|---|
| 定位 | 现代化多渠道客户服务/帮助台平台，对标 Zendesk/Freshdesk | 轻量、经典的纯工单系统，主打"把邮件/网页/电话请求转为可跟踪工单" |
| 首次发布 | 2016 年（前身是 Martin Edenhofer 参与的项目） | 2000 年代中，维护近 20 年，由 Enhancesoft（美国）公司支持 |
| 许可证 | AGPLv3（Zammad Foundation 持有） | GPLv2 |
| 技术栈 | Ruby on Rails + PostgreSQL + Redis + Elasticsearch；前端为 Vue 单页应用 | 传统 PHP（8.2–8.4）+ MySQL，Apache/Nginx/IIS，无框架重依赖 |
| 部署门槛 | 高：≥4 GB 内存，需 ES/PG/Redis 三件套，支持包安装/Docker | 极低：普通 LAMP 虚拟主机即可跑，共享主机也能装 |
| 当前版本 | 7.0（2026 年社区帖可见 7.0.0 SaaS 构建） | 1.18.2（微软商店镜像信息，2026 年） |
| GitHub | 约 5.8k stars / 1.0k forks / 451 open issues，最近 push 2026-07，非常活跃 | 约 3.8k stars / 1.8k forks / 1199 open issues，最近 push 2026-06，仍在维护 |
| 商业化 | Zammad GmbH 云托管：Starter 7€、Professional 16€、Plus 25€/agent/月 | Enhancesoft 付费云（SupportSystem）+ 商业支持；自托管免费、坐席不限 |

---

## 二、Zammad 详析

### 2.1 定位
Zammad 自我定位是"开源版 Zendesk"：把**所有客户沟通渠道收敛到一个工单视图**，强调数据主权（自托管、德国数据中心、ISO27001）。适用于中小到大型支持团队，但**不含 CMDB/资产管理、计费、合同**——它不是 PSA，也不是完整 ITSM 套件（来源：openmsp.ai 评测）。

### 2.2 多渠道工单（核心卖点）
官方云版按套餐解锁渠道，可视为其渠道清单（来源：zammad.com 定价页）：
- **邮件**：SMTP/IMAP，支持 Microsoft 365 账户接入，支持 S/MIME 签名加密。
- **网页表单（Web Form）**：可嵌入任意网站。
- **SMS、Chat（在线客服聊天）、Telegram**（Professional 档起）。
- **Facebook、WhatsApp、X(Twitter)**（Plus 档）。
- **电话**：通过 CTI 集成实现，如 sipgate 集成提供通话日志、来电弹屏、同事忙闲状态（来源：Zammad 用户文档 Glossary）。
- 同一客户跨渠道沟通合并为**一个会话线程**（"今天发邮件、明天发消息仍是同一条对话"）。

### 2.3 工单与 SLA 机制（细节）
来源：Zammad Admin Docs《SLAs》。
- **三类时限**：
  - **First Response（首次响应）**：从工单创建起算，**一次性**，转组/改 SLA 不重置；
  - **Update Time（更新间隔）**：两种模式——"between agent updates"（无论客户是否回复，坐席每 n 小时必须更新一次）与"for an agent to respond"（客户回复后才重新计时）；
  - **Solution Time（解决时限）**：从创建起算到工单进入 closed 类状态，不可重置。
- **日历（Calendar）驱动**：SLA 只在营业时间内计时，支持多套日历（如 8h/天营业时，16h 的 SLA 实际为 2 个工作日）。
- **状态冻结**：`pending close`、`pending reminder`、`closed` 状态默认不计 SLA，客户回复使工单回到 open 时会**立即按工单年龄重算并可能瞬间升级**。
- **升级（Escalation）**：到时即升级，开启通知的坐席收到提醒；内置"Escalated Tickets"概览（含未来 10 分钟内将升级的工单）；工单头部显示升级时间戳，悬停可见全部升级节点。
- **有效响应认定**：只有客户可见的公开文章（外呼电话、发给客户的邮件）算响应；内部笔记不算（可经控制台配置让公开笔记也算）。

### 2.4 自动化体系
来源：Zammad Admin Docs + elest.io 自动化教程。
- **Triggers（触发器）**：结构 = 激活器 + 条件 + 动作。
  - 激活器两类：**Action-based**（工单创建/更新时触发）与**Time-based**（满足时间条件时触发，适合做 SLA 预警升级）。
  - 条件支持 AND/OR 组合（Plus 档称 Expert-Mode），可基于组织、邮箱域、自定义字段等。
  - 动作示例：设优先级、转组、打标签、发邮件、加内部笔记。
  - **坑点**：触发器按名称字母序执行，官方建议用"01-""02-"数字前缀控制顺序。
- **Schedulers（定时任务）**：cron 式周期执行，用于关闭超期 pending 工单、发送跟进提醒等，与触发器互补。
- **Macros（宏）**：坐席手动一键执行预定义变更集（无条件的批量操作）。
- **Core Workflows（核心工作流）**：Plus 档功能，控制表单字段的显隐/必填/选项过滤（类似 ServiceDesk Plus 的业务规则）。
- 默认自带一条触发器：新工单自动回复客户确认邮件。

### 2.5 知识库
内置知识库，支持**内部（坐席）/公开（客户自助）两类文章**，Professional 档单语言、Plus 档多语言；文章被 Elasticsearch 索引可全文检索。功能定位是"够用但替代不了专业文档/wiki 系统"。

### 2.6 界面与用户体验
- 单页 Web 应用（Vue），**响应式设计**，左侧边栏聚合搜索、通知、仪表盘、概览、知识库、聊天、电话。
- **Overviews（概览）**：可自定义的工单过滤器视图，是坐席工作的主界面。
- 防冲突机制：同一工单被多人打开时左下角显示头像，有未保存修改时显示铅笔图标（agent collision 的可视化）。
- @提及、关注（watch）、内部笔记、工单合并/拆分、变更客户、审计级工单历史（合规卖点）。
- 其他：语言自动检测、文本模块（快捷短语）、签名、品牌定制。
- 注意：第三方评测对其 UI 评价不一（"现代化"vs"功能性但略显陈旧"）；**是否有官方原生移动 App 说法冲突**，可确认的是移动端靠响应式 Web，此点建议实测核实。

### 2.7 集成与安全
REST API（文档完善）、Webhook、GitHub/GitLab 集成（Plus）、Slack/Teams 通知、LDAP/AD、SAML/Shibboleth SSO（自托管还支持 Kerberos）、2FA、RBAC 角色权限、报表（Plus 可经 Grafana 直连 Elasticsearch 做深度报表）。

### 2.8 优缺点
**优点**：渠道最全的开源方案；自动化三件套（Trigger/Scheduler/Macro）设计清晰；SLA 语义严谨（日历感知、状态冻结）；全文搜索快；审计历史完备；开发活跃。
**缺点**：部署运维重（Rails+ES+PG+Redis，≥4GB 内存，官方自估运维成本每月数百欧元）；无 CMDB/资产/计费；核心工作流、多渠道、多语言 KB 在云版按档收费（自托管功能全但需自己维护）；触发器字母序执行等非直觉设计增加学习成本。

---

## 三、osTicket 详析

### 3.1 定位
"把邮件、电话、网页表单的咨询变成可跟踪工单"的经典轻量工单系统。渠道本质上只有三个：**邮件（IMAP/POP3 收取）、网页表单、坐席手工录入（电话）**，另有 API 建单。**无在线聊天、无社媒渠道**。适合预算有限、以邮件为主支持通道的 IT 团队/高校/政府机构，很多组织一跑就是 10 年以上（来源：accuwebhosting、checkthat.ai）。

### 3.2 工单核心机制（细节，来源：docs.osticket.com 官方文档）
- **Help Topics（帮助主题）**：建单入口的分类引导，每个主题可绑定：自定义票号格式、默认状态、优先级排序、**SLA 计划（可覆盖部门 SLA）**、自动分派到坐席/团队、自动回复开关、**自定义表单（选主题后动态加载对应字段）**、自定义感谢页。这是其"动态表单 + 路由"的核心设计。
- **Departments（部门）**：可嵌套父子部门（父部门可见子部门工单，反之不行）；可设 Private（对客户隐藏）；每部门可绑 SLA、值班 Schedule（优先级高于系统/SLA 排班）、Manager；可限制只能分派给本部门成员；可关闭"回复即认领"（Claim on Response）。
- **Ticket Filters（工单过滤器）**：If-Then 规则，**仅在工单创建时执行**，可设执行顺序和目标渠道（邮件/网页/API/电话/任意）。
  - 规则可匹配自定义表单字段（v1.12.5 起，但**仅网页/API 渠道**——过滤器在建单前运行，邮件工单此时还没有自定义字段值，这是明确的设计限制）。
  - 动作包括：拒绝/拉黑、自动分派坐席/团队、设置部门/主题/优先级/SLA、发送预设回复、禁用自动回复。
- **SLA Plans**：本质是"**宽限期（小时）**"模型——工单须在 N 小时内关闭，否则标记 Overdue 并触发逾期告警；可挂到部门、帮助主题、过滤器上；优先级升级依赖告警而非自动改优先级。注意：它没有 Zammad 那种"首次响应/更新/解决"三段式 SLA，**只有解决时限一个维度**（字段级细节建议实测确认）。
- **Tasks（任务）**：可挂靠在工单下或独立存在；**工单存在未完成任务时无法关闭**——这是很实用的流程控制点。
- **Thread Action**：坐席可从工单/任务的某条会话记录直接派生新工单或新任务，原线程自动保留双向引用（用于把一个多问题工单拆开处理）。
- **防冲突（Agent Collision Avoidance）**：锁定语义可配置（禁用/查看即锁/活动即锁）；"Claim on Response"开启时未分配工单自动认领给回复坐席；重开工单自动分派给最后回复人。
- **Auto-Responder**：全局/部门/帮助主题/邮箱四级可关；模板支持变量占位符如 `%{ticket.name.first}`。
- **Alerts & Notices**：新工单、新消息、内部活动、分派、转移、逾期、系统事件七类告警，模板均可编辑。
- **Tasks/Queues/搜索**：队列、列表、字段、列均可自定义；高级搜索可保存为自定义队列、含自定义字段、导出 CSV 且可选导出列。

### 3.3 客户门户与知识库
客户用**邮箱 + 工单号**即可登录查看，也可注册账号看全部关联工单；可建 FAQ/知识库供自助；门户支持 CAPTCHA；每个邮箱/用户可设最大开放工单数（防洪水）。

### 3.4 界面与用户体验
- 传统服务端渲染 PHP 界面，分 **Admin Panel / Agent Panel / Client Portal** 三个视图，功能全但**视觉明显过时**（多个第三方评测一致指出 "dated UI"）。
- 报表只有基础的 Dashboard（个人/团队工单量、SLA 达成等），无实时分析。
- 国际化靠 Crowdin 众包语言包。
- 无原生移动应用。

### 3.5 优缺点
**优点**：零成本、坐席不限量；部署极简（LAMP）；近 20 年成熟稳定；Help Topics + 动态表单 + 过滤器构成低代码的分类路由能力；自定义字段/表单/队列的灵活度高于外表观感；任务阻塞关单、Thread 拆单等细节设计务实。
**缺点**：渠道窄（无聊天/社媒/CTI）；**无时间维度自动化**（过滤器只在建单时跑，无定时任务/计划器，升级靠逾期告警）；SLA 只有单一关闭时限维度；UI 老旧；无官方 CMDB；插件靠社区（质量参差）；open issues 积压 1199 个，核心团队小。

---

## 四、简提：FreeScout 与 UVdesk

**FreeScout**（GitHub 约 4.4k stars / 693 forks / 仅 40 open issues，2026-07 仍在高频更新）
- PHP（Laravel）+ MySQL，AGPLv3；定位"开源版 Help Scout"：**邮件共享收件箱**优先，轻到极致（1GB 内存可跑，月成本 $6–12）。
- 架构为**核心 + 模块**：聊天、SLA、工作流等靠模块扩展，官方模块部分收费（如部分高级模块为付费闭源，此点建议实测核实）。
- 无 Zammad 的多渠道、Elasticsearch 全文搜索、原生移动 App；胜在白标友好、代码简单易二开、2 小时可上线。

**UVdesk**（community-skeleton 仓库约 19.4k stars，但该数字含 skeleton 项目流量，参考意义打折；最近 push 2025-10，活跃度一般）
- PHP（Symfony），OSL-3.0，印度 Webkul 出品的 open-core 产品；亮点是**电商渠道集成**（Amazon、eBay、Gmail 等）、工单流转工作流构建器、知识库。
- 社区版之外有 SaaS/企业版，开源版本功能有阉割；中文资料和社区热度明显低于前两者。

---

## 五、对自研 ITSM 服务台的可借鉴点

**从 Zammad 借鉴：**
1. **SLA 语义模型**：首次响应/更新/解决三段时限 + 日历（营业时间）感知 + pending 类状态冻结计时 + "回到 open 即按年龄重算"。这套语义可直接作为自研 SLA 引擎的规格书。
2. **自动化三层分离**：Trigger（事件驱动 if-then）/ Scheduler（时间驱动 cron）/ Macro（手动一键批操作）职责清晰，条件系统全站复用（过滤器、SLA、概览共用同一套 Object Conditions）。
3. **多渠道收敛为单一会话线程**（客户跨渠道身份合并）、CTI 来电弹屏、@提及与内部笔记的协作设计、审计级工单历史。
4. **Overviews（可保存的过滤器视图）作为坐席主工作台**。

**从 osTicket 借鉴：**
1. **Help Topics 作为分类路由枢纽**：一个实体同时挂默认状态/优先级/SLA/自动分派/动态表单/自动回复——对标 ServiceDesk Plus 的"服务目录模板"是低代码实现路径。
2. **动态自定义表单**：按主题加载字段、字段级禁用、过滤器可匹配自定义字段——自研产品的表单引擎应把"字段可参与自动化规则"作为一等公民。
3. **务实的小机制**：任务未完成禁止关单、Thread Action 拆单/派生任务并保留双向引用、回复即认领、锁定语义防冲突、单用户最大开放工单数防洪水、工单号格式可自定义。
4. **轻量优先的部署哲学**：若自研产品要走私有化交付，osTicket 证明了"单机 LAMP 即可跑"对中小客户的吸引力。

**两者的共同缺口 = 自研产品的差异化机会**：都没有 CMDB/资产管理、问题/变更管理（ITIL 全流程）、原生项目/计费能力——这正是 ManageEngine ServiceDesk Plus 的主战场，也是自研 ITSM 系统对标时应补齐的方向；同时可叠加两者都没有的时间维度自动化（Zammad 有 Scheduler，osTicket 完全没有）与更现代的中文 UX。

---

## 六、主要信息来源

- Zammad 官方仓库与文档：github.com/zammad/zammad；admin-docs.zammad.org/en/latest/manage/trigger.html；admin-docs.zammad.org/en/latest/manage/slas.html；user-docs.zammad.org/en/7.0/basics/work-with-tickets.html；zammad.com/en/solutions/zammad-for-enterprises（定价/渠道清单）
- Zammad 第三方：openmsp.ai/blog/zammad-review-for-msps；blog.elest.io（触发器教程）；freescout-installation.com/blog/freescout-vs-zammad
- osTicket 官方：github.com/osTicket/osTicket；osticket.com/features；docs.osticket.com（Tickets Settings / Departments / Help Topic / Alerts Guide / v1.12.5 Overview）
- osTicket 第三方：checkthat.ai/brands/osticket；accuwebhosting.com/blog/open-source-ticketing-systems；marketplace.microsoft.com（1.18.2 版本信息）
- 对比：blog.containerize.com（osTicket vs UVdesk）；happyfox.com 对比页
- GitHub 数据：GitHub REST API 实时查询（2026-07）

**无法完全核实、建议实测确认的点**：① Zammad 是否有官方原生移动 App（第三方说法冲突）；② osTicket SLA 是否仅"关闭时限"单维度（文档明确支持的是宽限期模型，未见三段式）；③ FreeScout 各模块的免费/付费边界；④ UVdesk 社区版与企业版的具体功能差异。

---

**给编排者的备注**：本简报约 4500 字，覆盖任务全部要求项（定位/功能/技术栈/UX/社区/优缺点/借鉴点/来源/存疑标注）。如需进入"功能实测"阶段，建议优先用 Docker 起 Zammad 实例验证触发器与 SLA 语义，用共享主机起 osTicket 验证 Help Topic 动态表单与过滤器。
