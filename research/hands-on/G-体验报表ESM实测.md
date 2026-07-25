# 模块 G 实测：体验 / 报表 / ESM / 版本信息（ServiceDesk Plus 云版·中国区）

> 实测环境：https://servicedeskplus.cn （中国区数据中心），组织：河北恒讯达信息科技有限公司，账号 ISD（管理员）。实测时间：2026-07-22。截图存于 `research/hands-on/shots/`（G-01 ~ G-24）。

## ⑥ 版本与许可信息【⚠必核】

- ✅ **试用期**：顶栏常驻横幅"试用期将于 30天后过期" + "立即购买" + 客服 "CN: 400-660-8680"（`G-01-home.png`、`G-18-reports.png` 等所有截图顶部均可见）。
- ✅ **中国区数据中心实证**（多证据链）：
  - 主域 `servicedeskplus.cn`；"立即购买"链接指向 `store.zoho.com.cn`（Zoho 中国商店，页面在该网络环境下持续 Loading 未能渲染，故未能从商店页读取订阅详情）；
  - 账户页 `servicedeskplus.cn/IAMMyAccount`（Zoho Accounts 中国版，时区 `(GMT+08:00) 中国标准时间 (Asia/Shanghai)`，`G-03-iam.png`）；
  - 在线客服 `salesiq.zoho.com.cn`、静态资源 `static.zohocdn.com.cn`、ESM 集成 `directory.zoho.com.cn`。
- ❓ **当前试用版本名称（Standard/Professional/Enterprise）**：应用内"我的账户"、实例设置、公司信息页均**未直接展示版本名**；版本信息只在 store.zoho.com.cn 订阅页（未加载成功）。从功能可用面推断与 Enterprise 口径一致：ESM 目录、CMDB、探针及发现、项目管理、发布管理、聊天机器人等 Enterprise 级功能全部开放。
- ❓ **技术员数限制**：界面未见"已用 X/Y 技术员"计数；个人面板 DOM 中存在 `license-limit-warning` 容器但当前为空，试用期内未触发限制提示。按官方口径试用为 30 天全功能，技术员数未在界面标注。

## ④ ESM / 多实例【⚠云版中国区必核】——全部可用 ✅

- ✅ **ESM Directory（ESM目录）**：`https://servicedeskplus.cn/home/settings/esm`（`G-06-esm.png`）。菜单：公司信息、用户管理、自定义域、SAML认证、活动目录、机构URL、ServiceDesk实例、ESM门户。
- ✅ **"新建实例"入口**：ServiceDesk实例页（`/home/settings/portals`）右上角"新实例"按钮（`G-07-esm-instances.png`）。表单：显示名称、描述、服务类型（ServiceDesk Plus / AssetExplorer）、URL名称、实例类型、所有者、时区、访问权限（机构中的每个人 / PUBLIC）、服务URL（`G-08-new-instance.png`、`G-09b.png`）。
- ✅ **实例类型（模板）实测 4 种**：IT帮助台、设施管理台、财务服务台、HR帮助台——模板化拉起部门服务台能力在中国区可用（`G-09-instance-types.png`）。
- ✅ **统一门户**：`https://servicedeskplus.cn/home` 即 ESM 统一门户，"我们可以为您提供哪些帮助？"+ 搜索框占位"跨实例搜索内容。"+ 实例卡片陈列（`G-11-esmportal.png`）。应用顶栏有"实例"切换器（ESM门户/ESM目录/Zoho Directory）。
- ✅ **实例自治**：每实例独立 URL名称（当前 `itdesk`）、独立时区、所有者、访问权限（设置→帮助台配置→实例设置，`G-05-instance.png`）。
- ❓ **实例上限（资料称 15 个）**：界面未标注，未实际创建第二实例验证。
- ⚠️ **自定义域**：入口存在但挂警告横幅——"ServiceDesk Plus 中对此功能的支持即将结束，请使用 Zoho Directory 以获得增强功能和持续支持。"（`G-10-domain.png`）新实例表单中"服务URL"下拉在试用账号下为空（仅默认域 servicedeskplus.cn）。

## ③ 报表体系【⚠Query Report 必核】

- ✅ **模块结构**：报表首页 4 个标签——所有报表 / 深入分析 / 计划报表 / 报表设置（`G-18-reports.png`）。
- ✅ **预置报表清点**：以"文件夹 + 系统预置"组织，实测可见 **22+ 个系统文件夹、160+ 张预置报表**。抽样：常用资产报表(3)、已完成发布的报告(5)、待发布的报告(7)、所有发布的报告(8)、资产租赁(9)、解决方案(1)、请求通知(1)、请求注释(1)、已归档事件请求的报表(41)、未决的变更报表(6)、已完成的变更报表(7)、工时报表(4)、用户调查报表(8)、所有计算机(工作站和服务器)(10)、服务器(2)、软件(3)、工作站一览报表(2)、审计报表(3)、合同(7)、资产(3)、采购订单(13)、项目报表(20)（`G-18-reports.png`、`G-19-reports-bottom.png`）。
- ✅ **向导式自定义报表**："新建自定义报表"向导（`G-21-new-report.png`）：报表标题 + 类型（**表格报表 / 矩阵报表 / 概要报表 / 扫描报表** 4 种）+ 模块选择（如"请求 / 所有活动请求"）→"前进到报表向导 >>"。
- ⛔ **Query Report（SQL）云版不开放**：向导类型中**没有 SQL/查询报表选项**，报表页其他入口也未见——与本地版（On-Prem 有 Query Report）存在明确差异，为云版功能阉割点。
- ✅ **Scheduled Report 定时邮件推送**："计划报表"标签页有"新建计划报表"，列表列含 报表名称/下次计划时间/所有者/**邮件地址**——邮件推送能力确认（`G-22-scheduled.png`）。
- ✅ **仪表盘 widget**：首页仪表板预置 widget 至少 4 种形态——表格型（所有请求-技术员：未处理/搁置/逾期分列）、图表型（不同模式的未处理请求、上周的请求、违反SLA-技术员），可按"所有组"筛选、可全屏、可配置、"+New"添加（`G-02-account.png`）。首页另有日程表/技术员的可用性图表/任务/提醒/公告标签。

## ② 技术员工作台

- ✅ **列表视图**：请求模块（`/app/itdesk/ui/requests`）为新版列表 UI，视图下拉（未处理的请求）、综合过滤器、"最近30天"时间筛选；列：用户名称/技术员/工作组/状态/逾期时间；批量操作：合并/链接请求/指派/删除（`G-24-requests.png`）。
- ✅ **多视图切换**：列表页右上角有 3 个视图图标（列表 / 卡片 / 看板 三态切换器）。
- ❓ **看板拖拽改状态/优先级/指派、$CURRENT_USER 动态值**：已确认看板入口存在，拖拽与自定义视图动态值未逐项展开验证（界面可见的预置视图"未处理的请求"等即为可自定义视图体系的一部分）。
- ⚠️ 状态列显示英文 "Open"、逾期时间显示 "Jul 22, 2026" 英文日期格式——中英混杂实证（`G-24-requests.png`）。

## ① 自助门户体验

- ✅ **服务目录**：独立目录页（`/app/itdesk/ServiceCatalog.do?mode=ServiceCatalogUI`），左分类树（通用事件模板、Corporate Website、Email、Internet Access、Intranet、Payroll、VOIP or Telephone）+ 右模板卡片（Default Request、Mail Fetching、New Joinee、Printer problem、Unable to browse）（`G-12-catalog.png`）。
- ✅ **公告**：首页顶部"公告"标签 + 设置→定制→公告/公告模板 + 快速动作 公告(Ctrl+Alt+A)。
- ✅ **门户自定义（主题）**：设置→常规设置→主题设置：全局导航菜单（顶部栏/侧边栏/侧边栏Lite）、导航背景（木炭黑/白色）、首选颜色 4 色、首选字体 7 种，含"是否允许其他用户设置主题风格"开关（`G-13-themes.png`）；头像→个性化提供个人级覆盖（显示模式常亮/暗黑/系统）。
- ✅ **用户门户设置**：设置→常规设置→用户门户：为用户启用提醒、允许用户关闭已解决请求、对用户禁用缺省请求模板、显示事件审批人、自助门户显示关联工作站、邮件建单自动关联资产（`G-14-userportal.png`）；另有"用户门户定制"标签页（实测加载极慢未完成渲染，`G-15-portal-custom.png`）。导航和页脚设置入口存在。
- ✅ **自定义域**：ESM 目录层提供（见④，⚠️ 即将迁移 Zoho Directory）。
- ❓ **购物车式提单**：目录页未见明显购物车入口，未走完提单流程验证。
- ❓ **请求人视角三件套**：当前账号为管理员视角，知识库对终端用户的呈现未单独验证。

## ⑤ 移动端

- ✅ **下载入口**：头像菜单内 App Store（`itunes.apple.com/us/app/sdp-on-demand/id496792710`）+ Play Store（`com.manageengine.sdp.ondemand`）直链。⚠️ Play Store 国内不可直达，未提供国内应用市场/扫码入口。
- ❓ **移动端功能范围**：未实测 App 本体。

## ⑦ 键盘快捷键

- ✅ **入口**：顶栏帮助（?）菜单含"键盘快捷键"项（与用户指南/视频教程/新手入门/最新消息/FAQ/论坛并列）。
- ✅ **快捷键旁证**（界面各入口标注）：新建请求(Alt+W)、技术员(Alt+J)、用户(Alt+U)、解决方案(Alt+S)、问题(Alt+P)、跳转到请求(Alt+R)、公告(Ctrl+Alt+A)、发布(Ctrl+Alt+R)、变更(Ctrl+Alt+C)、项目(Ctrl+Alt+P)、新建任务(Ctrl+Alt+T)。
- ❓ 快捷键清单弹窗在脚本化点击下未能展开截取全表（入口与部分键位已确认）。

## ⑧ 界面语言与翻译质量抽样

1. **"简档"**（IAM 账户页，应为"个人资料"）——Zoho Accounts 层生硬翻译（`G-03-iam.png`）。
2. **"Maintenance Management" 整项未翻译**（设置→定制菜单，`G-04-adminhome.png`）。
3. **"App及付费选件"**（设置→常规设置）——"App"未译、表述生硬。
4. **"PUBLIC"未翻译**（新实例弹窗访问权限，`G-09b.png`）。
5. **报表向导类型名与描述错位**："概要报表"描述写"一览报表将显示…"；"扫描报表"描述写"审计报表允许您…"（`G-21-new-report.png`）。
6. **发布模块报表译名歧义**："已完成发布的报告/待发布的报告/所有发布的报告"——Release（发布）报表被译得像"已发布的报告"（`G-18-reports.png`）。
7. **状态/日期未本地化**：请求列表状态显示英文 "Open"，逾期时间显示 "Jul 22, 2026"（`G-24-requests.png`）。
8. **示例数据全英文**：服务目录分类与模板（Corporate Website、Printer problem 等，（`G-12-catalog.png`）。
9. **错误页全英文**：404 "URL not found"、参数错误 "Incorrect input format for Toshowview field"（`G-11`、`G-17`）。
10. **"技术员的可用性图表"**（首页标签）直译痕迹；"仪表板/帮助台仪表板"混用（`G-02-account.png`）。
