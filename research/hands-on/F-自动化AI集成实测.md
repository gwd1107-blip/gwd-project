# 模块 F：自动化 / AI / 集成 —— 实测报告

> 环境：ManageEngine ServiceDesk Plus **云版（中国区数据中心 servicedeskplus.cn）**，Enterprise 试用（30 天），组织：河北恒讯达信息科技有限公司。
> 实测时间：2026-07（界面静态版本号 Jul_08_2026）。截图统一存于 `shots/F-*.jpg`。

---

## ① Timer Actions / Data Archival / Delegation

### Timer Actions（定时动作）→ 云版名为「计划」 ✅已验证（形态有差异）
- 路径：**设置 → 自动化 → 计划**（`AdminDetails.cc?forwardTo=schedule`）。
- 列表列为：计划名称 / 下次运行 / 状态；按钮「新建计划」。
- 新建计划表单 = 名称 + 描述 + **自定义函数（选择一个自定义函数）** + **配置日程表**（截图 `F-schedule-new.jpg`）。
- 结论：云版没有 On-Prem 那种"对请求定时执行规则动作"的 Timer Actions 页面，而是**定时调度 Deluge 自定义函数**的 Scheduler 形态。与资料中"Timer Actions（延时补偿）"的描述**不完全一致**，属云版差异化实现。

### Data Archival（数据归档） ✅已验证
- 路径：**设置 → 数据管理 → 数据归档**（截图 `F-dataarchive.jpg`）。
- 规则：请求状态为「关闭的」与「关闭日期」早于「1 年」（可选时长）；支持「允许例外」（OR 条件组排除特定请求不归档）。

### Delegation（缺席自动移交/委派） ✅已验证
- 路径：**设置 → 自动化 → 委派**（截图 `F-delegation.jpg`）。
- 启用委派开关；委派请求所有权：不执行操作 / 移动到未指派；基于的请求委派时点：创建日 / 到期日 / 分配时间。
- 指派审批：不执行操作 / 到机构角色。
- 四个附加选项：技术员可在不可用时设置委派、请求人可为不可用状态设置委派、允许审批中的 ad-hoc 委派、Allow original approver to take action on delegated approvals（最后一项界面未汉化）。

---

## ② Custom Functions（自定义函数 / Deluge） ✅已验证
- 路径：**设置 → 开发者空间 → 自定义函数**。列表列：自定义函数 / 应用到 / 相关的工作流 / **语言** / 状态；按钮：新建自定义函数、动作、导入示例函数、检查使用状态。顶部有函数用途下拉（默认"请求业务规则条件"）。提示"只有 SDAdmin 可以创建第一个自定义函数"（截图 `F-customfunc.jpg`）。
- **Deluge 编辑器**（截图 `F-customfunc-new.jpg`）：函数签名 `bool myFunction(Map requestObj, Map context)`；左侧拖拽式语法片段面板 + 右侧代码区 + 「语法助手」开关。
- **invokeurl 调外部 API ✅**：左侧「集成」分组内置片段（逐项提取自 DOM）：
  - `webhook`：`<variable> = invokeurl [url: <expression> type: <request_type> parameters: <expression> headers: <expression>];`
  - `zoho integration`：`zoho.<service>.<action>(<params>)`
  - `invoke API`：`invokeapi [service:… path:… type:… parameters:… headers:…]`
  - `FTP/SFTP` 片段
  - 另有 基础（set variable/info）、条件（if/else）、集合（Collection）分组。
- **Save and Test ✅**：编辑器底部按钮为「保存」与「**保存并执行脚本**」（云版文案，功能等价 Save and Test）。

---

## ③ Sandbox 沙箱 ✅已验证
- 路径：**设置 → 数据管理 → Sandbox**。说明文案：隔离测试环境，可安全配置/测试/监视自动化规则（业务规则、SLA、表单规则、触发器、自定义操作等），**Sandbox 配置可随时部署到生产帐户**（截图 `F-sandbox.jpg`）。
- 点击「创建sandbox」后台创建成功（提示"正在创建Sandbox"），随后顶栏实例切换器出现「**Sandbox账户 河北恒讯达信息科技有限公司**」入口（与生产实例并列）。
- 验证→发布流程：界面文案确认"先沙箱配置、后部署生产"的两段式；因时间所限未逐一点开沙箱内发布向导，部署动作的存在以官方文案+实例切换器为证。

---

## ④ Ask Zia 对话实测 ✅已验证（多轮、交互卡片）
- 入口：左侧导航 Ask Zia（`askZia.do`），全页对话界面。首次使用需在 **设置 → Zia → 聊天机器人 → Ask Zia** 打开启用开关（截图 `F-askzia-enable2.jpg`）。
- 快捷动作条：创建一个事件 / 创建服务请求 / 搜索解决方案 / 我的已逾期请求 / 更新请求状态 / …（截图 `F-askzia-main.jpg`）。
- **第 1 轮（查工单）**：问"我目前有多少个未解决的请求？请列出来"→ Zia 直接内嵌返回一个**可交互的请求列表卡片**（列：主题/ID/用户名称/状态/优先级/逾期时间/技术员/工作组/模板；操作按钮：提取/关闭/指派/删除），数据为空（符合新租户实际）。回答带 👍/👎 反馈与重新生成按钮（截图 `F-zia-q1.jpg`）。
- **第 2 轮（建单）**：发"帮我创建一个事件请求，主题：【测试】Zia建单测试…"→ Zia 弹出**「选择模板」卡片**（Default Request / Mail Fetching / New Joinee / Printer problem / Unable to browse），进入分步引导式建单（截图 `F-zia-q2.jpg`）。模板选择控件为 select2 下拉，合成点击未成功提交，**未最终完成建单**（❓建单闭环未走通，但多轮上下文理解与引导式交互已证实）。
- 页脚声明："Ask Zia由Zia提供支持，结果可能不正确，请对响应进行评估审核。"

---

## ⑤ GenAI 功能清单（中国区云版可用性）【核心必核】 ✅已验证（设置层）
- 路径：**设置 → Zia → 人工智能 → GenAI功能**（`forwardTo=genai_features`），另有「聚类分析」标签页（实测为空白页）。
- 实测可见 9 个 GenAI 功能卡片（均带独立开关，初始全关；截图 `F-zia-genai.jpg`）：
  1. **回复协助**（基于输入查询或情绪自动创建响应）
  2. **对话摘要**（基于最近会话、解决方法和注释生成摘要）
  3. **工作流协助**（询问 Zia 生成/优化/汇总/建议工作流步骤）
  4. **文本助手**（富文本编辑器内 AI 建议）
  5. **检查列表生成器**（AI 智能检查清单）
  6. **自定义脚本生成器**（为表单验证和字段级动作生成自定义脚本）
  7. **解决方案生成**（从技术员提示创建知识库文章，含主题、关键字）
  8. **解决方法协助**（生成详细的请求解决方法）
  9. **请求自动审批**（基于审批人响应自动批准，带"查看预测"）
- 每张卡片底部"可通过以下获取-"后跟 **Zia 与 DeepSeek 两个提供商图标**——与全球版资料（Zia/ChatGPT/Azure OpenAI）**不符**，中国区为 Zia + DeepSeek 组合。
- **启用实测**：点击「对话摘要」「自定义脚本生成器」开关均可打开（变绿）；开启「自定义脚本生成器」时弹出**按功能配置 AI 提供者**的对话框（"AI提供者 / 自定义脚本生成器"，截图 `F-genai-enabled.jpg`）——即每个 GenAI 功能可独立选择底层模型。对话框选项与 Ask Zia 相同：Zia-zlabs-qwen35-35B-v1 / DeepSeek（禁用徽标）。因浏览器合成事件无法通过应用的最终提交校验（提示"选择一个AI提供者以继续"，radio 程序化勾选不被认可），提供商确认未提交成功，但**弹窗机制与选项已完整验证**。
- 结论：资料所列"工作流生成/解决方案生成/摘要/回复/脚本"五类 GenAI 能力**在中国区云版全部存在且开关可打开**；底层模型统一走 Zoho 托管 Qwen3.5-35B（或将来开放 DeepSeek）。生成质量、配额/计费未实测。

---

## ⑥ LLM 提供商设置【必核】 ✅已验证 —— 与资料重大出入
- 入口：设置 → Zia → 聊天机器人 → Ask Zia，开启后标题行出现「技术提供者」标识，⋮ 菜单 → **「配置AI提供者」**（截图 `F-askzia-kebab.jpg`、`F-ai-provider.jpg`）。
- 中国区实际可选提供商仅 2 个：
  1. **Zia-zlabs-qwen35-35B-v1**（默认勾选；说明"由Zoho托管的大语言模型(LLM)确保数据隐私与安全"）——即 Zoho 托管的**通义千问 Qwen3.5-35B** 衍生模型；
  2. **DeepSeek**（"提供高效、能力强大的大语言模型的AI提供商"）——当前显示**「禁用」**徽标，不可选。
- **没有 ChatGPT、没有 Azure OpenAI 选项**（全球版资料中的三选项在中国区不成立）；弹窗内**无自带 API key（BYOK）输入项**，仅"选择AI提供者即同意其服务条款"的确认式选择。
- 结论：中国区 LLM 栈为 Zoho 托管 Qwen + DeepSeek（暂禁用），不支持自带 key、不支持切换海外模型。

---

## ⑦ REST API V3 / OAuth / Webhook（未深入，待补）
- 设置中存在「开发者空间」分组：自定义菜单、自定义小部件、自定义函数、**连接（dreConnections，Zoho 式 OAuth Connection）**、全局变量、自定义模块。
- 帮助菜单含 API/用户指南入口（help.sdpondemand.com）。Webhook 事件类型清单、Authtoken vs OAuth2 细节本轮未完成实测，标记 ❓待补。

---

## ⑧ 集成目录（未深入，待补）
- 设置中存在「集成」（`forwardTo=ThirdPartyIntegrations`）与「扩展程序」（Marketplace，`forwardTo=marketplaceExtensions`）两个入口；另有 SCCM集成、Zoho Analytics、ZOHO Survey、短信设置等独立菜单项。集成市场实际可见清单（AD/LDAP、Teams/Slack/企微/钉钉、OpManager、Zoho Flow 等）本轮未完成清点，标记 ❓待补。

---

## 附：Zia MCP Tools 清单【必核】 ⛔中国区云版未找到对应界面
- 已排查位置：设置全量菜单（约 110 个 `forwardTo` 入口，无一含 MCP/工具/授权字样）、设置 → Zia 分组（仅「人工智能」「聊天机器人」两项）、聊天机器人 → Ask Zia 页 ⋮ 菜单（仅「配置AI提供者」）、**聊天机器人自定义**页（`forwardTo=zia_customization`，为 Ask Zia 首页面板的可视化定制器：主页/请求两个预览标签 + 「定制」按钮编辑快捷动作，截图 `F-zia-customization.jpg`）、Ask Zia 对话页全部可交互元素。
- 实测可见的"工具/动作"层：Ask Zia 的**预置快捷动作**（创建一个事件、创建服务请求、搜索解决方案、我的已逾期请求、更新请求状态、更多动作…）+ 对话内可交互卡片（请求列表卡的 提取/关闭/指派/删除 按钮）——这些即是 Zia 当前可调用的动作面；**未发现 v15200 资料所述的 MCP Tools 逐项清单与逐项授权开关界面**。
- 判断：MCP Tools（逐项授权）能力**尚未在中国区数据中心此租户开放**，或仅在全球版/更新构建中提供。标记 ⛔未找到（建议后续用全球 DC 账号复验）。
