# SDP 用户体验与产品形态调研简报

> 导语：本简报梳理 ServiceDesk Plus 的最终用户自助门户、技术员工作台、移动端、报表与仪表盘、多实例 ESM、多语言多时区、部署方式与版本定价，回答"用户看到什么、管理员怎么配、钱怎么收"三个层面的对标问题。

**角色标签：调研员_SDP体验与版本** · 调研日期：2026 年初（基于当前可访问公开资料） · 用途：自研 ITSM 服务台对标

---

## 1. 最终用户自助门户（Self-Service Portal）

**来源**：[卓豪官网-自助服务门户](https://www.zohocorp.com.cn/manageengine/products/service-desk/self-service-portal.html)、[用户指南](https://www.manageengine.cn/products/service-desk/help/userguide/)

**核心功能点：**

- **服务目录展示**：门户首页以服务目录形式呈现可申请的服务（按角色/权限个性化显示），用户以"购物车式"体验选择服务，降低理解门槛。服务模板支持拖拽配置，可绑定审批流、SLA、自动指派规则、任务清单。
- **工单创建与追踪**：用户可自助提交请求（无需技术员介入）、随时查看自己所有请求的处理状态与审批进度，并接收自动通知提醒。支持富文本与附件。
- **知识库自助**：门户集成知识库，用户可搜索已知解决方案自行处理常见问题，实现"工单分流（ticket deflection）"；知识库支持任意格式文本与附件。
- **公告与通知**：管理员可在门户发布全公司公告或针对特定用户的技术故障通知。
- **密码自助**：与 ADSelfService Plus 集成，支持最终用户自助重置 AD 密码、解锁账户（双因素认证保障安全），显著减少密码重置类工单。
- **自定义域**：可在组织自有域名的自定义 URL 下发布门户。
- **协作入口扩展**：可通过 Zoho Cliq 等协作工具创建/查看工单；云版提供 AI 虚拟支持代理（Ask Zia，可选 Zia LLM / ChatGPT / Azure OpenAI 引擎）。
- **个性化**：用户可在 Personalize 中自选显示语言、时区、日期/时间格式、颜色主题、字体。

**界面特点**：面向非技术用户的消费级 UI；门户与工单流程强调"少填表、多模板"；新版 UI 持续改版（如 Puvi 字体、列表/经典视图颜色个性化）。

---

## 2. 技术员工作台（工单视图与队列管理）

**来源**：[官网-帮助台功能](https://www.manageengine.com/products/service-desk/helpdesk-tour.html)、[版本更新说明](https://www.manageengine.com/products/service-desk/update-servicedesk-plus-latest-version.html)、[帮助台软件页](https://www.zohocorp.com.cn/manageengine/products/service-desk/help-desk-software.html)

**工单视图：**

- **列表视图 + 看板视图（Kanban View）**：新版（on-prem build 11138+）引入交互式看板，单窗口汇总全部工单；支持拖拽改变状态、优先级、重新指派技术员；可按状态/优先级/技术员分组，按到期时间、创建时间排序。
- **自定义视图与筛选**：技术员可创建可定制视图（如"我的未结工单"），按站点、组、技术员、时间筛选；支持动态值 `$CURRENT_USER` 做登录人维度的过滤。
- **工单详情页**：完整请求历史（audit history）、任务列表、备注、工作日志（worklog 计时）、审批状态、关联资产/CI；状态支持自定义（如"等待供应商"、"待审批"）。
- **应用内通知**：14000 版本起提供 in-app notification，技术员在使用应用时实时收到工单事件提醒；可配置通知音。

**队列管理与自动化：**

- **邮件转工单**：自动解析邮件生成工单并路由。
- **业务规则（Business Rules）**：基于工单参数（分类、优先级、请求人等）的条件动作，实现自动分类、路由到对应技术员/支持组。
- **技术员自动指派（Tech Auto-Assign）**：支持**轮询（Round Robin）**和**负载均衡（Load Balancing）**两种算法，考虑技术员可用性；可设置例外规则排除特定工单或技术员。指派链路为：业务规则 → 分类默认指派 → 自动指派兜底。
- **SLA 与多级升级**：自定义 SLA，逾期前主动多级升级（escalation）；支持 OLA（运营级协议，MSP 版 14201 新增）。
- **智能通知**：工单各阶段向技术员和用户发送自定义邮件/SMS 提醒。
- **预防性维护任务**：按周期自动生成带预定义参数的工单。
- **远程控制**：从工单内发起远程桌面（Windows RDP、轻量代理、VNC、Dameware 等第三方集成）。
- **优先级矩阵**：基于影响度×紧急度自动定优先级（Enterprise 版）。

---

## 3. 移动端

**来源**：[官方 Android App 页](https://www.manageengine.com/products/service-desk/self-service/help-desk-software-android-app.html)

- 提供 **iOS 和 Android 原生应用**（早期资料提到 Windows 版，当前以 iOS/Android 为主），on-prem 与云版均支持。
- 技术员端能力：创建/编辑/认领/指派/解决工单；筛选请求、查看待办任务；用 **worklog** 记录处理耗时；应用内通知技术员并与最终用户对话；创建可定制的请求视图。
- 最终用户也可通过移动端提交与追踪工单。
- 提供公开 demo 服务器（demo/demo）供试用体验。

---

## 4. 报表与仪表盘

**来源**：[官方报表介绍](https://help.servicedeskplus.com/reports/service-desk-reports.html)、[仪表盘定制指南](https://www.manageengine.com/products/service-desk/reports/servicedesk-plus-dashboard.html)

**预置报表**：覆盖帮助台（请求量趋势、技术员绩效、SLA 合规、满意度）、问题/变更、资产（软件已购 vs 已装、按厂商/类别、硬件/软件摘要、审计历史）等数百张开箱即用报表。

**自定义报表（四类）**：

1. **Custom Report（表格式/矩阵式）**：向导式选择显示列、分组、过滤，含请求度量报表（Request Metrics）。
2. **Query Report（查询报表）**：直接编写 SQL 查询底层数据库（社区大量共享 SQL，如按模板统计事件、状态停留时长）。
3. **Scheduled Report**：按计划（一次性/每日等）自动生成并邮件发送给指定收件人。
4. **Flash 报表**（早期版本称呼，实时摘要）。

**导出**：CSV / XLS / PDF。

**仪表盘**：

- 首页仪表盘由 **widget** 组成（表格 widget 可直接内嵌活跃工单队列+快捷操作按钮；图表 widget 汇总开放/待处理/已解决/临近 SLA 违约工单）。
- 支持将任意报表添加为 widget，多 tab 组织，public/private 可见性设置。
- 深度分析可集成 **Analytics Plus（原 Zoho Reports）**，ESM 场景下可跨全部实例统一分析。

---

## 5. 多实例与企业服务管理（ESM）

**来源**：[ESM 官方页](https://www.manageengine.com/products/service-desk/itsm/enterprise-service-management.html)、[ESM 许可 FAQ](https://www.manageengine.com/products/service-desk/on-premises/faq/esm-license-management.html)、[定价页 ESM FAQ](https://www.manageengine.com/products/service-desk/pricing.html)

- **实例模型**：通过右上角 **ESM Directory** 创建独立服务台实例，**最多同时运行 15 个实例**；每个实例数据、流程、管理员自治，可分别选版本（Standard/Professional/Enterprise）与计费周期。
- **统一 ESM 门户**：最终用户在一个门户中看到自己有权限的所有部门服务台（IT、HR、行政/设施、财务、法务），统一提交与追踪。
- **快速启用**：基于预置模板（IT、HR、Facilities 默认实例）60 秒内拉起新部门服务台；再用低代码/无代码工具定制自动化、工作流、门户。
- **部门模板化能力**：IT=资产/CMDB；HR=入离职工作流；Facilities=空间管理（space management）模块（房间预订等）。
- **跨部门编排**：内置 iPaaS（Zoho Flow 驱动），可编排跨系统流程（如 Zoho People 建档 → Microsoft Entra ID 开户 → Zoho Sign 签署）。
- **许可规则**：每个实例按技术员数+IT 资产数单独计费；**仅允许一个实例使用免费版额度**；每个实例有 30 天免费试用；可单实例购买 add-on。
- 实例间数据迁移：通过实例级备份/恢复工具导出导入。

---

## 6. 多语言与多时区

**来源**：[支持语言列表](https://www.manageengine.com/products/service-desk/on-premises/supported-languages.html)、[Personalize 文档](https://help.sdpondemand.com/personalization)、[通用设置](https://help.servicedeskplus.com/configurations/general/configuring-general-settings.html)

- **43+ 种界面语言**（含简体中文、繁体中文、日、韩、法、德、西、阿等；含 RTL 从右到左语言支持）。安装包统一，界面按浏览器默认语言显示，用户可随时切换。
- **云版定价区分 English-only 与 Multilingual 套餐**（MSP 版定价页可见），on-prem 不区分。
- **时区**：三级配置——组织级默认时区（Personalize your help desk）→ 用户个人时区（Personalize：显示语言、时区、日期/时间格式、邮件签名）→ 管理员可"覆盖用户个性化时区"做全局强制。14000 版新增全局配置统一修改全员时区/日期/时间格式。
- 跨时区注意点：用户个人资料时区与设备时区不一致会导致时间显示偏差（官方社区有说明）。

---

## 7. 部署方式

**来源**：[安装指南](https://www.manageengine.cn/products/service-desk/help/adminguide/introduction/installation-and-getting-started.html)、[KYS 产品页](https://kysinfotech.in/product/manageengine-servicedesk-plus/)

- **双模式**：本地部署（On-Premises，可完全离线运行，数据自主）与云 SaaS（ServiceDesk Plus Cloud / On-Demand，数据中心分布 US/EU/IN/AU/JP 等）。
- **On-prem 环境**：Windows Server 2019/2022；Linux（RHEL 7+、Ubuntu 20+、CentOS 8+、Debian 10+）。数据库：PostgreSQL（默认捆绑）、MSSQL 2016–2022（历史版本支持 MySQL）。浏览器：Chrome、Firefox、Edge。硬件起步建议约 4 核 / 16GB RAM / 500GB。
- **安装时选版本**：同一安装包，安装向导中选择 Standard/Professional/Enterprise。
- 可选高可用：双机热备（Failover，付费 add-on）。

---

## 8. 版本功能差异与定价模式

**来源**：[官方定价页](https://www.manageengine.com/products/service-desk/pricing.html)、[中文版本对比](http://zohocorp.com.cn/manageengine/products/service-desk/sdp-editions.html)、[Desk365 定价分析](https://www.desk365.io/blog/manageengine-servicedesk-plus-pricing/)

**版本定位：**

| 版本 | 定位 | 云版起价（USD，按年付） |
|---|---|---|
| Standard | IT 帮助台（事件、知识库、SLA、自助门户、报表、业务规则、自动指派） | $13/技术员/月；**≤5 技术员免费**（不限工单数、不限最终用户数，但全组织仅一个实例可用免费额度） |
| Professional | Standard + IT 资产管理（资产发现、代理扫描、分布式资产、采购、合同、软件合规、远程桌面共享） | $27/技术员/月 |
| Enterprise | Professional + 全 ITSM（变更/发布、问题、CMDB、服务目录、项目管理、优先级矩阵） | $67/技术员/月 |

**On-prem 年付参考**（USD）：Standard 10 技术员 $1,195/年；Professional 2 技术员+250 节点 $495/年；Enterprise 2 技术员+250 节点 $1,195/年；免费版 5 技术员。量大阶梯至 200 技术员 $11,995–$35,995/年。

**Add-on（年付，英文版）**：服务目录 $1,195、问题管理 $1,195、项目管理 $1,195、变更与发布管理 $2,395（Standard/Professional 可补购后升级至接近 Enterprise）；Live Chat 三版均可加购。

**计费维度**：技术员数（管理员也计入）+ IT 资产数（仅 Professional/Enterprise）；**最终用户数不限**。月付/年付可选，年付有折扣；随时升降级。付费用户含 24×5 免费技术支持；免费版用户需付 $35/技术员/年购买支持。

---

## 9. 无法完全核实的信息

- 云版最新各语言套餐的确切价差、以及 AI（Zia/GenAI）功能在各版本的具体包含边界（官方称"零额外成本"，但部分 AI 引擎如 Azure OpenAI 需自带 key）——建议询价确认。
- SaaSrat、SoftwareSuggest 等第三方给出的 $8/$16/$49 价格与官网 $13/$27/$67 不一致，以官网为准。
- 中文站点部分页面（如安装指南提到 MySQL）对应旧版本，当前新版以 PostgreSQL/MSSQL 为准。

## 10. 对自研产品的启示（简）

- **核心借鉴**：门户=服务目录+知识库+工单追踪三件套；技术员端=列表/看板双视图+三级自动指派（规则→分类→轮询/负载兜底）；报表=预置+向导自定义+SQL 查询+定时推送四层；ESM=多实例自治+统一门户+按实例计费。
- **差异化机会**：SDP 的 AI、iPaaS 编排深度耦合 Zoho 生态，自研可在国内 IM（企微/钉钉）入口、国产数据库适配、更轻的部署上做优势。

---

*以上为结构化调研简报，供编排者整合。所有关键数据点均已标注来源 URL；价格类信息以官网当前页面为准，后续实测时建议复核。*
