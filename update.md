# 上游更新总结 (gethomepage/homepage)

统计周期：2025-01-01 ~ 2026-06-19
上游提交数：692 次
版本发布：1.11.0 → 1.12.3 → 1.13.0 → 1.13.1 → 1.13.2

---

## 重大功能更新

### 1. Homepage Auth (#6769)
- 新增内置认证系统（OIDC 登录流程 + 简单密码登录）
- 可选的 "authenticated or not" 守卫
- 排除 healthcheck 路径的认证 (#6776)

### 2. 新增服务 Widget
| Widget | PR |
|--------|-----|
| ntfy | #6601 |
| UniFi Drive (UNAS) | #6461 |
| SparkyFitness | #6346 |
| Tracearr (Plex 活动流) | #6306 |
| Arcane | #6274 |
| Dispatcharr | #6035 |
| Dockhand | #6229 |
| Pangolin | #6065 |
| Your Spotify | #5813 |
| Backrest | #5741 |
| Unraid | #5683 |
| Filebrowser | #5546 |
| Wallos | #5562 |
| Proxmox 状态集成 | #5385 |
| Trilium | #5380 |
| Jellystat | #5185 |
| Slskd | #5045 |
| Hoarder | #4913 |
| APC UPS | #4840 |
| Firefly | #4683 |

### 3. 主要增强
- **字段高亮** (#5868): 支持 block highlighting 的 valueOnly 选项 (#6051)
- **qBittorrent v5.2.0 API 支持** (#6652)
- **Kubernetes Gateway API** (#4643)
- **UniFi Network 新 API 和 API Key** (#4860)
- **Speedtest v1.2 API** (#4695)
- **Proxmox 数据集** (#6595)
- **Dispatcharr v24 API** (#6690)
- **Crowdsec 认证解析改进** (#6419)
- **自定义 API shvl 语法** (#5020)
- **动态列表渲染** (#5012)
- **HTTP(S) Agent 缓存和 keep-alive** (#6536)

### 4. 重大变更
- **[BREAKING] Host 验证必需** (#4744)
- **Kubernetes v1.0.0 统计修复** (#4984)
- **Seerr widget 可用字段注入修复** (#6663)

---

## 依赖更新

| 依赖 | 版本变化 |
|------|----------|
| next | 16.2.3 → 16.2.6 |
| react | 19.2.4 → 19.2.5 |
| tailwindcss | 4.1.18 → 4.3.0 |
| next-i18next | 15.4.3 → 16.0.7 |
| dockerode | 4.0.10 → 5.0.0 |
| luxon | 3.6.1 → 3.7.2 |
| gamedig | 5.3.2 → 5.3.3 |
| ws | 8.18.3 → 8.20.1 |
| protobufjs | 7.5.5 → 7.5.8 |
| systeminformation | 5.30.8 → 5.31.6 |
| @headlessui/react | 2.2.9 → 2.2.10 |
| json-rpc-2.0 | 1.7.0 → 1.7.1 |

---

## CI/CD 更新
- GitHub Actions 升级（checkout 6.0.3, setup-node 6.4.0 等）
- Crowdin 翻译自动同步
- Release Drafter 配置优化
- PR 质量检查工作流
- Issue Triage 工作流

---

## Bug 修复
- 修复 cookie header 覆盖问题 (#6672)
- 修复 Seerr widget 可用字段注入 (#6663)
- 修复 PBS widget tasks 参数 (#6655)
- 修复 ntfy widget 空数据 (#6653)
- 修复 calendar hover 事件切换 (#6639)
- 修复 backdrop-blur safelist (#6617)
- 修复 Omada 认证竞态条件 (#6549)
- 修复 UniFi Drive v2 storage API (#6567)
- 修复 glances 正则表达式
- 修复 Flood 兼容性 (#6477)
- 修复 Watchtower widget 标签 (#6448)
- 修复 Seerr widget 状态 (#6329)
- 修复 qBittorrent 端点 (#6467)
- 修复 Kubernetes 节点响应 (#4752)
- 修复 pi-hole 缓存过期
- 修复 synology diskstation 内存统计 (#4880)
- 修复 kavita API body (#4948)
- 修复 speedtest 单位 (#4950)
- 修复 glances 图表重叠 (#4653)
- 修复 bing 搜索 logo (#4571)
- 修复 quick launch 嵌套服务 (#4561)
- 修复 dark/light 切换背景变白 (#4553)
