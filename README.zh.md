# dsh-plugin-learn

[English](README.md) | 中文

一个用于 LeetCode 风格算法学习的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件，支持 **DSH 桌面端**和 **DSH Web**。

- **课程**：六个主题（哈希、双指针、滑动窗口、二分查找、栈、二叉树）。每节课包含动机、策略、带逐步推演的示例、理解检查、练习题和反思。
- **练习**：18 道真实 LeetCode 题，提供原创概述与官方题面链接，不复制题面。每道题有编辑器、“运行”与“提交”、自定义输入、笔记和提交历史。
- **评测**：代码在 Docker 容器中运行：无网络、只读文件系统，并限制内存、CPU 和进程数。判定只来自测试结果。可选的 AI 评测会给出反馈，但不能改变判定。通过表示“通过本地测试”，不等于 LeetCode 判定通过。
- **辅导**：提示逐级解锁（方向、关键观察、思路大纲、解答），解答等级需要确认。辅导对话流式回复，除非你主动要求，否则不会直接给出完整解答。
- **复习**：按你所在时区，以 1/3/7/14/30 天为间隔进行间隔重复，并有每日上限。每次复习使用经过验证的变体题，而不是重做原题。新变体由 AI 生成，必须先通过自动验证才会被使用。
- **提醒邮件**：默认关闭，需要验证邮箱并主动开启。默认只把邮件写成预览；真实 SMTP 发送需要显式配置。

讲解默认使用中文；可在“Learn → 设置”中切换为英文。

## 环境要求

- **DSH 0.2.0-rc.2 或更高、低于 0.3 的版本。** 其他版本上 DSH 会拒绝加载该插件。
- 同一台机器上运行着 **Docker**，并预先拉取一次运行器镜像：

  ```sh
  docker pull python:3.13-alpine node:24-alpine
  ```

  也可以使用“Learn → 设置 → 准备运行器”。没有 Docker 时，Learn 显示评测不可用，绝不会直接在你的电脑上运行代码。
- **可选：** 在 DSH 中配置默认模型（例如登录 DeepSeek），用于辅导、AI 评测反馈、反思反馈和生成新变体。没有模型时，“运行”“提交”、判定和预置提示仍然可用。

## 在 DSH 桌面端安装

1. 在桌面端打开 **插件**，用 GitHub 地址 `github:kapelame/dsh-plugin-learn` 安装。
   如果想用命令行，先完全退出桌面端，再运行桌面端自带的 CLI：

   ```sh
   "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop add github:kapelame/dsh-plugin-learn
   ```

2. 重新打开桌面端，在侧边栏选择 **Learn**。

## 在 DSH Web 安装

```sh
dsh plugin --profile web add github:kapelame/dsh-plugin-learn
dsh web
```

请使用你的 Web 实际启动的配置名（默认 Web 配置为 `web`），然后在侧边栏打开 **Learn**。

仓库附带预先构建好的 `lib/`，因此从 GitHub 安装时不运行构建脚本，也不需要额外的构建授权。如需可复现的安装，可固定提交：`github:kapelame/dsh-plugin-learn#<commit>`。

## 配置

插件会在你的配置中加入两行：`learn`（服务，`dsh-plugin-learn/service`）和 `learn-ui`（Remote API 与浏览器界面，`dsh-plugin-learn`）。可在配置的 `cordis.patch.yml` 中覆盖设置，例如：

```yaml
- id: learn
  config:
    dataRoot: !!js dshHomePath('learn')
    defaultLocale: en
    reviewDailyLimit: 3
    agents:
      judge: false              # 只做确定性评测，不请求 AI 反馈
      variantGeneration: true
    email:
      transport: capture        # 'smtp' 只有在 liveSendingAuthorized: true 时才发送
```

补丁会替换该行的整个 `config`，所以请保留 `dataRoot`。学习数据保存在 DSH home（默认 `~/.dsh`）下的 `learn/` 中，可在“设置”中导出为 JSON 或重置。

真实邮件需要 `email.transport: smtp`、`email.liveSendingAuthorized: true`、`email.smtp.host`/`port`/`user`，并把 SMTP 密码存为名为 `email.smtp.passwordRef` 的 DSH 凭据（默认 `DSH_LEARN_SMTP_PASSWORD`）。未使用隐式 TLS 时要求 STARTTLS。

## 隐私与模型使用

- 代码只在无网络访问的 Docker 容器中运行。隐藏测试的期望答案从不进入容器。
- 配置了默认模型时，以下操作会通过 DSH 把题目概述和你当前的代码发送给该模型：“提交”（除非 `agents.judge: false`）、提示、辅导对话、反思和变体生成。每次运行都是普通的 DSH Session，会出现在你的 Session 历史中。
- 除此之外不会有数据离开你的电脑；配置 SMTP 后的提醒邮件除外。

## 已知限制

- 运行代码需要 Docker。
- 只有在 DSH 运行且启用插件时才会发送提醒。错过的每日摘要会在当天稍晚补发，不会推迟到之后的日期。
- TypeScript 提交只剥离类型，不做类型检查。
- 辅导只看到对话中最近的十条消息。
- AI 运行进行期间，其 Session 会短暂出现在侧边栏中。
- 在桌面端，提醒邮件中的链接指向桌面端的本地服务器，其端口每次启动都会变化。请改用邮件中的验证码，或设置 `email.publicBaseUrl`。

## 从源码构建

`source/` 中的源码是三个 DSH workspace 包，使用 DSH 工具链构建，因此需要一份 DSH 代码：

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git dsh
git -C dsh checkout dsh-v0.2.0-rc.2
node scripts/build.mjs ./dsh          # 复制源码、运行 pnpm install 和 DSH 构建，然后组装 lib/
```

已安装依赖的代码可用 `--skip-install` 重新构建。测试在 DSH 代码中运行：`npx vitest run packages/experimental/learn/tests`（需要 Docker 和运行器镜像）。

课程内容位于 `content/`：每道题包含声明输入域的 YAML 元数据、参考解、独立的暴力解、可选钩子，以及由生成器构建并验证的冻结测试集（参考解与暴力解差分测试、变异体检出、边界覆盖）。

## 许可证

MIT
