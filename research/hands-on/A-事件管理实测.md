# 模块A：事件管理与工单底座 — SDP Cloud（中国区 DC）实测

> 环境：https://servicedeskplus.cn（云版，Enterprise 30 天试用，组织：河北恒讯达信息科技有限公司），登录身份：技术员 ISD（1366354330@qq.com）。实测日期：2026-07-13。
> 结论标记：✅已验证 ｜ ❌与资料不符 ｜ ⛔云版不可用/未找到 ｜ ❓无法确认

## ② 三级分类树 ✅已验证
- 路径：设置 → 定制/帮助台 → 分类（`AdminDetails.cc?forwardTo=category`）。
- 页面提供 **新建分类 / 新建子分类 / 新建项目** 三个按钮 + 树状视图切换，即 Category→Sub Category→Item 三级。
- 内置 12 个一级分类：Desktop Hardware、General、Internet、Network、Operating System、Printers、Routers、Services、Software、Switches、Telephone、User Administration。
- 截图：shots/A-02-分类三级结构.jpeg
- 级联必填配置：三级级联下拉已确认（见文末"补充"节）；逐字段必填开关未展开。

## ③ 请求人视图 vs 技术员视图字段差异（部分验证）
- 技术员"新建请求"表单（`/app/itdesk/ui/requests/add`）字段齐全：**请求类型、状态、模式(Mode)、级别(Level)、影响(Impact)、影响明细、紧急度(Urgency)、优先级(Priority)**、用户名称、资产、工作组、技术员、分类/子分类/条目、主题、描述、要通知的邮件地址、附件、解决方法。
- 截图：shots/A-01-技术员新建请求表单.jpeg
- 请求人视图字段可见性：✅已在模板编辑器"用户视图"tab 实证（见文末"补充"节）——Mode/Level/Impact/Urgency 默认隐藏，优先级默认可见。

## ④ 优先级矩阵 ✅已验证
- 路径：设置 → 帮助台 → 优先级矩阵（`forwardTo=priorityMatrix`）。
- 4×4 矩阵：影响（Affects Business / Affects Department / Affects Group / Affects User）× 紧急度（High / Low / Normal / Urgent），每格下拉"选择优先级"。
- 页面底部有开关："**允许用户和技术员覆盖已有的优先级矩阵**"（说明默认由矩阵自动填充，可配置允许手工覆盖）。
- 截图：shots/A-05-优先级矩阵.jpeg

## ⑤ 事件工单状态清单与关闭代码【⚠必核】✅已验证
- 路径：设置 → 帮助台 → 状态（`forwardTo=status`）。**默认仅 5 个状态**，分两类：
  - 类型=进行中：**On Hold**（描述 Request Onhold，停止计时器=停止）、**Open**（Request Pending，计时器=运行）
  - 类型=完成：**Canceled**（Request Canceled）、**Closed**（Request Completed）、**Resolved**（"Request Resolved, waiting for approval by Requester"，即解决后待请求人确认）
- 可"新建阶段"自定义状态；状态带"停止计时器"属性（On Hold 停表）与颜色。
- 关闭代码（`forwardTo=requestClosureCode`）**内置 7 个取值**：**Cancelled / Failed / Moved / Postponed / Rejected / Success / Unable to Reproduce**（可新建）。
- 截图：shots/A-03-状态清单.jpeg、shots/A-04-关闭代码.jpeg

## ⑥ Request Workflows 工作流画布 ✅已验证（部分）
- 路径：设置 → 自动化 → 工作流（`forwardTo=incidentWorkflow`），初始 0 条；按钮：新建工作流 / 复制工作流 / **全局工作流设置** / 导出历史。
- 新建进入"新建 事件工作流编辑器"画布（`WorkflowAction.do?mode=add&module=incident`），自动触发 **Sandbox 沙箱**（创建即提示 Sandbox Creation Success）。
- 画布结构：**开始(Start) → 状态节点(State) → 结束(End)**；第一个节点必须是状态节点。
- 节点面板共 **13 种节点类型**（DOM 实测）：状态(FlowNode)、条件(Condition)、等待(WaitForCondition)、切换(Switch)、通知(Notification)、字段更新(FieldUpdate)、任务(Task)、检查列表(Checklist)、自定义函数(CustomFunction)、Webhook、计时器(Timer)、分叉(Fork)、联结(Join)。
- ❌与资料（v15200 文档口径）有出入：**没有独立的 "Approval Level" 与 "User Defined Action" 节点**；审批内嵌于状态节点/通知体系，自定义动作由"自定义函数/Webhook/计时器"承担（页面帮助原文：Automates actions, such as Notifications, Approvals, Field Updates, Tasks, Checklists, Webhooks, Custom Functions and Timer Actions）。
- 全局工作流设置：**状态可见性**（显示所有状态 / 仅显示属于工作流的状态 / 跟随引导路径）、**显示工作流的执行明细**（打开事件明细页时弹出执行明细——即执行图证据）、转换过程显示位置（右侧/中心面板）。
- 切换模板后旧审批删除行为：❓未验证（需建单实测，时间所限放弃）。
- 截图：shots/A-06/A-07/A-08/A-09/A-10、A-12-全局工作流设置.jpeg

## ⑦ 工作流启用后 Closure Rules 是否失效【⚠必核】◐部分验证
- 关闭规则页（`forwardTo=closerequestfilter`）分 6 个 tab：请求/问题/变更/发布/采购订单/任务关闭规则。
- 请求关闭规则内容：关闭必填项（模式/级别/工作组/技术员/分类/优先级/子分类/描述/条目/解决方法/工作日志/紧急度/影响/请求类型/附件/**关联的任务应关闭**/**所有的子请求需要关闭**/应完成所有关联的检查清单/Email id）；用户确认提示（含"强制关闭代码/强制关闭注释"选项）；关闭处理：手动关闭/自动关闭；"关闭与任务相关联的请求"（仅当所有关联任务完成、检查清单 100% 完成 → 状态移至 Closed/Resolved）。
- 页面上**未出现**"启用工作流后本规则失效"的显性提示；本租户尚无启用的工作流，无法观察失效行为。❓失效边界未最终确认（倾向：工作流的状态节点接管关闭路径后，关闭规则中"任务完成才允许关闭"类约束由工作流条件节点替代）。
- 截图：shots/A-11-关闭规则.jpeg

## ⑧ Business Rules 与 Custom Triggers 执行时序 ✅已验证（UI 层）
- 业务规则（`forwardTo=wfrule`）：内置 3 条（Hardware Dispatch / Network / Printer Requests）。列：业务规则名称/应用到/应用时间/**级联执行**/状态。
- 新建事件业务规则表单：执行条件仅 **创建后 / 编辑后 / 被删除** 三个时点（**没有"创建时/提交前"同步时点**）；执行区间：任何时间/在工作时间/非工作时间；"打开级联执行"开关；条件支持"匹配条件/自定义函数/无条件"三种；动作示例为字段更新（工作组=Hardware Problems），另有"使用业务规则中的值覆写的值"开关（默认禁用，即不覆盖技术员已填值）。
- 触发器（`forwardTo=wftriggers`）：列表为空，列：触发器名称/应用到/执行明细/状态。
- ❌与资料有出入/需注意：资料称"业务规则=写入时同步(pre-hook)、触发器=写入后异步"，但**云版业务规则只有'创建后'时点**，UI 上无 pre-hook 选项；同步性无法从 UI 证实。v15200 的 Imported 事件未在云版界面找到。
- 截图：shots/A-13-业务规则详情.jpeg、A-14-新建业务规则.jpeg

## ⑨ Technician Auto Assign ✅已验证
- 路径：设置 → 自动化 → 自动指派技术员（`forwardTo=TechAutoAssign`）。
- 配置项全见：启用开关；指派对象（事件 / 事故和服务请求）；**模式：循环制（轮询）/ 负荷平衡（负载均衡）**；触发时点（已创建 / 已编辑 / 创建的与编辑的）；应用范围（只对未指派的请求 / 所有请求）；**考虑技术员的可用性**（创建日/到期日必须在场）；**排除以下的技术员**（Select 多选）；**允许例外**（满足条件的请求不会被自动指派）。
- 备用技术员：❓未见"备用技术员"独立配置项。

## ⑩ 任务依赖、父子单关联、一键转问题单 ◐部分验证
- 请求列表工具栏：**编辑 / 提取 / 关闭 / 合并 / 链接请求 / 指派 / 删除**——Link Requests ✅。
- 工单详情页 tab：回复 / 会话 / 明细 / 任务 / 检查列表 / 解决方法 / 提醒 / 审批 / 工作日志 / 时间分析 / 公告 / 历史。
- 详情页"关联"面板：**链接的请求（添附）、关联的问题（新建 | 搜索）、由请求引起的变更（新建 | 添附）、发起请求的变更、关联的项目、由请求引发的发布、发起请求的发布、调用的合同、标签**——"关联的问题→新建"即一键转问题单 ✅。
- 属性面板含：生命周期 / 工作流指派位、任务进度 0/0、审批状态、逾期倒计时、工作日志计时器。
- 任务依赖（任务间前后置）：❓未能在界面直接确认——现有工单无任务、任务模板页（Default Task）未见依赖字段，需建多个任务实测（本轮放弃）。
- "Link Requests 同步备注/工时/解决方案"：❓未验证。

## ⑪ 预防性维护任务 ✅已验证
- 左侧导航有独立"维护"模块；快速动作菜单含"维护任务 - 请求 / 维护任务 - 变更"（`/app/itdesk/ui/request_maintenances/add`）。
- "新建维护任务 - 请求"为**两步向导**：①选择模板（Default Request，可预设请求类型/状态/模式/级别/影响/紧急度/优先级/请求人/资产/工作组/技术员/三级分类/主题（支持 $ 变量）/描述/通知邮件/附件/Resolution）→ ②计划（Schedule 周期设置）。即"按周期用模板自动建单"✅。
- 注意：进入该功能时界面顶部显示"Sandbox 账户"（此前创建工作流自动启用了沙箱，部分配置先落沙箱）。

## ① 多渠道建单入口 ◐部分验证
- **门户**：✅ 自助门户服务目录（`ServiceCatalog.do?mode=ServiceCatalogUI`）+ 顶部"新建请求"。
- **邮件**：✅ 设置→邮件设置下有 邮件服务器设置 / 邮件地址 / **邮箱(mailInbox)** / 垃圾过滤器 / **邮件解析命令(emailCommand)**。解析命令实测：按"邮件主题包含"（如 @SDP@）触发，正文用 `@@Category=Printer@@` 指令式语法给字段赋值（邮件建单+字段自动路由）。
- **Zia 机器人**：✅ 实测工单 #1 即为 Zia 对话建单（会话记录："帮我创建一个事件请求…"→Zia→选择模板 Printer problem→成单）。
- **移动端**：◐ 主页个人菜单有 App Store / Play Store 下载链接（iOS/Android App 存在），App 内建单未实测。
- **监控告警集成**：❓ 集成页（`forwardTo=ThirdPartyIntegrations`）当前可见：Zoho Analytics、ZOHO Survey、Outlook Actionable Messages、Microsoft Teams、Jira、Zapier、**DeepSeek**、Microsoft Intune、Microsoft Azure DevOps——**未见 OpManager / Site24x7 / Applications Manager 等监控告警原生集成**（中国区 DC 未列出，可经 Zapier/Webhook 绕行）。Microsoft Teams 集成描述明确支持"在 Teams 里创建请求"✅。

## 补充：②级联必填与③请求人视图（模板编辑器实证）
- 事件请求模板列表（`forwardTo=RequestTemplate`）：内置 5 个模板（Default Request / Mail Fetching / New Joinee / Printer problem / Unable to browse），列含"工作流/生命周期""显示给用户"。
- Default Request 模板编辑器顶部 tab：**技术员视图 / 用户视图 / 任务 / 检查列表**（另有"表单规则/表单定制"入口）。
- **用户视图（请求人）默认字段**：优先级、用户名称、资产、地点、分类、子分类、条目、主题、描述、要通知的邮件地址、创建日、逾期时间、响应时间、完成时间、附件。
- **默认不对请求人显示**（留在右侧"可用字段"区）：**模式(Mode)、状态、级别(Level)、影响(Impact)、影响明细、紧急度(Urgency)**、请求类型、工作组、技术员、响应逾期。
  → ③结论 ✅：Mode/Level/Impact/Urgency 默认对请求人隐藏（可拖入用户视图开放）；注意**优先级默认对请求人可见**。
- ②级联必填：三级分类在用户/技术员视图中均为 分类→子分类→条目 三个级联下拉 ✅（级联存在）；单字段"必填"开关在字段 hover 属性中，未逐字段展开——级联"必填"行为 ❓未逐条确认。

## 其他观察
- 请求列表为"未处理的请求/最近30天"视图，工具栏支持批量：编辑/提取/关闭/合并/链接请求/指派/删除。
- 中国区 DC 页脚：卓豪（中国）技术有限公司，ICP 备案齐全；试用期横幅"30 天后过期"。
- 创建工作流即自动启用 **Sandbox 账户**（云版沙箱与生产同界面切换），配置变更先入沙箱。

---
*实测完成：2026-07-13，模块A调研员*
