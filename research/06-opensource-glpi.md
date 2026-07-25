# GLPI 产品调研简报

> 导语：本简报调研开源 ITSM+ITAM 一体化平台 GLPI 的功能模块、技术架构（PHP/Symfony、插件机制）、插件生态、许可证与社区活跃度、优缺点，并提炼其对自研系统最有价值的可借鉴设计点（统一对象基类、关系优先数据模型、双时钟 SLA、规则引擎、实体多租户）。

**调研员：调研员_GLPI**

---

## 一、产品概览

- **名称**：GLPI（Gestionnaire Libre de Parc Informatique，法语"自由 IT 资产管理器"），2003 年起源于法国 INDEPNET 社区，现由商业公司 **Teclib'** 主导维护（社区 + 商业双轨模式）。
- **定位**：开源 ITSM + ITAM 一体化平台，是开源 ITSM 领域事实上的"重量级选手"，在欧洲、拉美公共部门和 MSP 场景有大量装机量。[来源: https://www.openmsp.ai/blog/open-source-itsm ]
- **许可证**：**GNU GPL v3**（GitHub 仓库 README 明确声明）。自托管免费、无用户/资产数量限制；Teclib 提供付费 GLPI Network 订阅（支持服务 + 高级插件 + 云托管：公有云 €19/坐席/月，私有云 €21/坐席/月，自托管订阅 €100–1000/月）。[来源: https://github.com/glpi-project/glpi ; https://blog.invgate.com/hardware-inventory-software ]
- **社区活跃度**：GitHub `glpi-project/glpi` 约 5.1k–5.6k stars（不同来源时点数据，无法精确核实当前值）；官方插件组织 `pluginsGLPI` 有 61 个仓库，多数近一周内仍在更新；GLPI 11.0.0 于 **2025-10-01** 正式发布，保持月度小版本节奏。G2 评分 4.5–4.6/5，Capterra 4.5/5。[来源: https://github.com/orgs/pluginsGLPI/repositories ; https://github.com/glpi-project/glpi/blob/11.0/bugfixes/CHANGELOG.md ]

## 二、技术架构

- **技术栈**：经典 LAMP——PHP（GLPI 10 要求 8.1–8.3）+ MariaDB ≥10.5 / MySQL ≥8.0，Web 服务器 Apache/Nginx/IIS 均可。GLPI 11 底层升级到 **Symfony 6.0 组件**，模板全面采用 **Twig**，图表库换为 ECharts，Web 根目录收敛到 `/public` 并由 `public/index.php` 统一代理请求（向现代 PHP 框架形态靠拢）。[来源: GitHub CHANGELOG 11.0.0 ; https://adg.csdn.net/694d026c5b9f5f31781acb5c.html ]
- **插件机制**：插件放入 `plugins/` 或 `marketplace/` 目录，通过 Web 界面或 CLI（`php bin/console glpi:plugin:install`）安装/激活；插件通过 **hook.php 钩子机制** 复用核心框架（实体、权限、UI）。内置 Marketplace 需免费注册 GLPI Network key 后在线安装。11 版起插件命令统一 `plugins:XXX` 前缀。[来源: https://documentation.fusioninventory.org/.../installation/ ; https://help.glpi-project.org/documentation/modules/configuration/plugins ]
- **API 与集成**：GLPI 10 起提供 REST API；**GLPI 11 新增 High-Level API（OpenAPI/Swagger 文档）、内置 OAuth2 Server（支持客户端声明与访问范围限制）、Webhooks（事件驱动 HTTP 回调）**、通知过滤。外部认证支持 LDAP、邮件服务器、CAS、x509、Web 服务器委托认证。[来源: https://www.omnicom.digital/en/2025/11/17/discover-the-new-glpi-11/ ]
- **数据模型核心**：所有业务对象继承自 `CommonDBTM`（通用数据库表映射基类），ITIL 对象（工单/问题/变更）共享 `CommonITILObject` 抽象——同一套参与者（申请人/观察者/受理人）、状态机、时间线（跟进/任务/解决方案）、审批逻辑。**"万物皆对象、对象皆可互相关联"** 是其数据模型最大特色。

## 三、功能模块细节

### 1. 工单管理（Tickets）
- 创建时区分 **Incident（事件）/ Request（服务请求）** 两类；来源渠道：自助门户、Web 表单、邮件代收（Receivers，将邮箱邮件转为工单并按规则路由到实体）、REST API。
- **字段体系**：类型、分类（ITIL Category）、请求来源、紧急度（Urgency）、影响度（Impact）、**优先级由"紧急度×影响度"矩阵自动计算**、受理组/技术人、关联资产、SLA。
- **生命周期状态机**：新建 → 处理中(已分配) → 处理中(已计划) → 等待 → 已解决 → 已关闭（用户确认或自动关闭时限到期）。[来源: https://www.reussirmonbtssio.com/guides/supervision ]
- **时间线**：跟进（Followup）、任务（Task，可计划排期）、解决方案（Solution）三段式；支持预存回复模板；工单模板可定义字段的隐藏/预填/必填。
- 自动化：**业务规则引擎**（Business Rules，条件-动作模式，如"实体=X 且来源=邮件 → 指派分类+优先级+SLA"，可设置"跳过后续规则"）；周期性工单（Recurrent tickets，如每周五自动开备份工单）；规则可配置在新增/更新时触发。[来源: GLPI 官方论坛实例 https://forum.glpi-project.org/viewtopic.php?id=293783 ]

### 2. SLA / OLA 管理
- 双时钟模型：**TTO（Time to Own，受理时限，从创建到被分配）+ TTR（Time to Resolve，解决时限，从创建到解决）**，独立配置。
- 支持 **OLA**（内部运营级别协议，部门间内部 TTO/TTR，不影响对外 SLA）。
- **日历（Calendar）机制**：SLA 时钟只在工作时间/值班时间内走动，支持节假日，多实体可配不同日历时区。
- 升级机制：SLA 级别（Escalation Levels）可定义超时前的提醒与自动动作；工单挂起（Pending）期间 TTR 自动补偿暂停时长。
- SLA 指派方式：规则自动指派 / 工单内手工选择 / 工单模板预置。[来源: https://help.glpi-project.org/tutorials/helpdesk/service_levels ; https://help.glpi-project.org/faq/glpi/service_levels ]

### 3. 问题管理（Problems）
- 概念：一个/多个同类事件的根因；字段与工单同构（申请人、观察者、受理、状态、紧急度、影响、优先级、分类）。
- 可从表单、事件、变更、资产直接创建问题；支持影响分析（评估症状找根因）；**解决后可将"已知错误"沉淀到知识库**；成本可追溯（工时+物料）；可关联工单/变更/项目。[来源: https://tic.gal/wp-content/uploads/2023/08/EN-1.GLPI-Features-Overview.pdf ]

### 4. 变更管理（Changes）
- 定义：问题解决方案的落地，或新软硬件/流程的引入；同样支持通知、指派、计划、**预算**。
- 可从事件/请求/问题创建；关联知识库与库存项；支持周期性变更（如每周三 Windows 更新评审）；**工单/问题/变更均支持审批（Approvals，11 版起只允许对未解决/未关闭对象发起审批）**。[来源: 同 TICGAL 功能白皮书 ; GitHub CHANGELOG 11.0.0 ]

### 5. 资产与 CMDB
- 资产类型极其丰富：计算机、显示器、软件及版本、许可证、网络设备、打印机（含**硒鼓/耗材计数与页数统计**）、外设、电话、SIM 卡、机架/机柜、PDU、无源设备、线缆（RJ45/光纤/USB/HDMI 及两端连接关系）。
- **DCIM 数据中心管理**：楼宇/机房图形化布局、机柜前后视图、半高/竖装 U 位、配线架、能耗与布线管理。
- **CMDB 能力**：CI 间影响/依赖关系（Impact analysis），如"集群由哪些硬件组成、影响哪些服务"；Appliance 概念可将多个库存项组合为逻辑应用；支持自定义资产类型（11 版原生支持，此前靠 GenericObject 插件）。
- 组件级拆解：计算机可拆为 CPU/内存/硬盘/BIOS 等独立组件并记录技术参数。
- **字段唯一性校验**（Fields unicity）：防止手工/导入/盘点产生重复资产。[来源: https://www.glpi-project.org/en/features/ ]

### 6. 自动盘点（Inventory）
- GLPI 10 起**原生集成动态盘点**：`front/inventory.php` 接收 OCS/FusionInventory 历史格式或新 JSON 格式，支持**部分盘点（增量更新，只传变化字段）**。
- **GLPI Agent**（官方代理，Windows/Linux/macOS/Android）可完全替代 FusionInventory Agent；网络发现、SNMP 网络设备/打印机盘点通过 Agent Toolbox 配置。
- **FusionInventory**：历史上最著名的盘点插件（GitHub 360+ stars），由"GLPI 插件 + 终端 Agent"两部分组成，支持网络发现、SNMP 远程盘点、WOL 唤醒、软件远程部署；官方已提供 GLPI Inventory 插件作为过渡 fork，新项目建议直接用原生能力。[来源: https://www.glpi-project.org/en/discover-native-glpi-inventory/ ; https://nextoolsolutions.com/en/blog/50-plugins-modulos-glpi-guia-completo ]

### 7. 知识库
- 内部知识 + 公开 FAQ 双层；文章可关联工单/问题/变更（解决方案可一键沉淀）；11 版重做"从知识库检索解决方案"的 UI；自助门户用户可自助解决简单问题。

### 8. 其他管理域（官方功能页确认的完整清单）
- **财务管理**：预算（类型/金额/周期/位置）、供应商、联系人（可导 vCard）、合同（周期/计费周期/续约方式/支持合同干预时长）。
- **辅助对象**：域名到期跟踪、证书（DNS/到期/类型/证书数据）、数据库实例（大小/实例/最近备份日期）、电话线路、文档。
- **工具类**：项目管理（任务、**甘特图与 Kanban** 双视图，可关联工单/资产/合同）、预定（Reservations，11 版新增横向时间轴视图）、提醒、RSS、报表、**保存搜索（私有/公开）**、仪表盘（内置，另可接 Metabase/SQLdashboards 插件）。
- **满意度调查**：按实体配置——触发时机（解决后 0–90 天）、触发比例、问卷有效期、满分值、低分必填评论等，可内建或外接第三方。[来源: https://help.glpi-project.org/documentation/modules/administration/entities ]

### 9. 权限与多租户
- **实体（Entities）**：层级化组织隔离，单实例服务多部门/多客户（MSP 场景）；父子实体间可合并同名元素。
- **8 种内置 Profile**：Super-admin、Admin、Supervisor、Technician、Hotliner、Observer、Read-only、Self-service；两种界面（标准界面 + 免费简化自助界面）。
- 11 版新增 **2FA**（全局/按 Profile/按组/按用户逐层配置）与替代人（Substitutes）机制。

## 四、插件生态

官方 Marketplace（plugins.glpi-project.org）+ GitHub 社区共 **100+ 插件**，官方插件组织 61 个仓库。代表性插件：

| 插件 | 作用 | 备注 |
|---|---|---|
| FormCreator | 自定义表单/服务目录/审批流 | 最热门插件（GitHub 187+ forks）；**GLPI 11 已将其能力收编进核心（原生可视化表单）** |
| Fields（附加字段） | 给任意对象加自定义字段 | 生态第二热门 |
| FusionInventory / OCS Inventory | 自动盘点 | GLPI 10+ 原生盘点已取代其核心场景 |
| DataInjection | CSV 批量导入 CMDB | 实施期必备 |
| Mreporting / Metabase | 图表报表/嵌入式 BI | 弥补原生报表不足 |
| Escalade / Behaviors / Tag | 工单升级、轻自动化、标签 | 流程增强 |
| GenericObject | 自定义对象类型 | GLPI 11 已原生支持 |
| NexTool（商业） | 模块化平台：AI 助手、智能分单、审批流、CVE 扫描等 | 第三方商业化生态样本 |

**显著趋势**：GLPI 官方持续把最成功插件的能力"收编"进核心（盘点、表单、自定义对象），降低插件依赖。[来源: https://nextoolsolutions.com/en/blog/50-plugins-modulos-glpi-guia-completo ]

## 五、界面特点

- GLPI 10 重做 UI 后摆脱"2012 年代感"；**GLPI 11（2025-10）再次大改**：全新自助门户（可定制磁贴、中央搜索栏直达 FAQ/表单）、服务目录化提单（"报告故障"/"请求服务"预置入口）、表单缩略图、预定时间轴、简化工单视图。技术侧使用 Twig 模板 + ECharts + Monaco 编辑器。
- 仍被批评的点：标准管理界面信息密度高、菜单层级宽、非 IT 用户上手需要培训。[来源: https://tic.gal/the-new-user-interface-in-glpi-11/ ; https://www.openmsp.ai/blog/it-inventory-management-open-source ]

## 六、优缺点总结（综合 G2/Capterra/社区评价）

**优点**：
1. ITAM+ITSM+CMDB 深度一体，工单可直接跳到设备维修历史，影响分析有据可依；
2. 功能覆盖面极广（30+ 模块），ITIL 流程可真实落地；
3. 完全免费、GPLv3、无坐席/资产限制，TCO 极低；
4. 实体多租户 + 细粒度 Profile，适合 MSP 与集团型企业；
5. 社区活跃 20+ 年、月度发版、插件生态成熟、45+ 语言（含中文）。

**缺点**：
1. 初始配置复杂，熟练管理员也需约一周完成正式配置，学习曲线陡；
2. **插件跨版本兼容性是社区最大抱怨**（升级 GLPI 需等插件跟进）；
3. 大数据量下性能下降，需要数据库调优；
4. 开箱自动化弱，复杂流程要靠规则引擎+插件组合搭建；
5. 移动端体验有限；报表/仪表盘需额外配置或外接 BI。[来源: https://www.openmsp.ai/blog/open-source-itsm ; https://blog.invgate.com/free-it-asset-management-software ]

## 七、对自研 ITSM 系统的可借鉴设计点

1. **统一对象基类 + ITIL 对象抽象**：用一张"ITIL 对象"抽象（工单/问题/变更共享参与者、状态机、时间线、审批、SLA 挂载点）大幅压缩代码与心智成本——这是 GLPI 二十年可维护性的根基（`CommonITILObject`/`CommonDBTM`）。
2. **关系优先的数据模型**：任何对象（资产、合同、文档、项目）都可挂载到工单/问题/变更上，形成天然 CMDB 图谱；影响分析不靠专门模块而靠通用关系表。自研时应把"任意对象关联"做成一等公民。
3. **双时钟 SLA 模型（TTO/TTR）+ 日历引擎 + OLA 分离**：响应时限与解决时限独立计时、挂起自动补偿、时钟只在工作时间走——这套设计直接可照搬，且比多数国内产品简单清晰。
4. **规则引擎做自动化基座**：条件-动作规则（收件路由、业务规则、字典清洗、SLA 指派共用同一引擎），支持排序与"跳过后续规则"。一个通用规则引擎可覆盖 80% 自动化需求。
5. **优先级 = 紧急度 × 影响度矩阵**：自动计算、避免人为主观定级，值得直接采用。
6. **实体（Entity）多租户 + Profile 双层权限**：层级组织隔离数据，Profile 控制动作权限，简化界面（自助）与标准界面分离、自助用户免费——对商业化定价模型也有参考价值。
7. **插件化思路与"核心收编"策略**：hook 机制 + 目录约定 + Marketplace；同时官方持续把最流行插件能力内化到核心，保持核心完整、生态轻盈。自研可借鉴"核心功能主干 + 插件补长尾"的边界划分。
8. **增量盘点协议**：Agent 只上报变化字段（partial inventory），服务端按 flag 局部更新——大规模终端环境下显著降低负载，自研 Agent 采集端可直接参考。
9. **工单模板/跟进模板/预存回复**：字段隐藏-预填-必填三态 + 预存回复，低成本提升坐席效率。
10. **反面教训**：插件版本兼容、UI 信息密度、大数据量性能——自研时应以 API 稳定性契约约束扩展点，并对自助端/管理端做差异化的信息密度设计。

---

**主要来源**：GitHub 官方仓库及 11.0 CHANGELOG（github.com/glpi-project/glpi）、GLPI 官方功能页（glpi-project.org/en/features）、GLPI 官方帮助中心（help.glpi-project.org，SLA/实体/插件文档）、TICGAL 官方功能白皮书 PDF、FusionInventory 官方文档、openmsp.ai / InvGate / NexTool 2026 年评测与插件指南、GLPI 官方论坛。**无法精确核实项**：GitHub 实时 star 数（各来源在 5.1k–5.6k 间）；插件市场精确插件总数（各来源称 100–300+，官方插件组织可核实为 61 个仓库）。

—— 调研员_GLPI
