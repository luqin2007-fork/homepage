# luqin2007 自定义代码审核报告

## 概述

本次审核覆盖 luqin2007 在 gethomepage/homepage 基础上新增/修改的 18 个文件，共计约 1435 行新增代码。

---

## 1. 安全问题 🔴

### 1.1 密码明文传输 (严重)
**文件**: `src/components/tab.jsx:33`, `src/pages/index.jsx:574`

```javascript
// 密码通过 URL 参数明文传输
const res = await fetch(`/api/config/validateTab?type=${type}&tab=${slugifyAndEncode(tab)}&password=${password}`);
```

**问题**: 密码出现在 URL 中会被浏览器历史记录、服务器日志、代理日志等记录。

**建议**: 改用 POST 请求，将密码放在请求体中。

```javascript
const res = await fetch('/api/config/validateTab', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type, tab: slugifyAndEncode(tab), password })
});
```

### 1.2 密码明文比对 (严重)
**文件**: `src/pages/api/config/validateTab.js:5`, `src/pages/api/manage/verifyPassword.js:6`

```javascript
const result = getTabPassword(type, decodeURIComponent(tab)) === password;
```

**问题**: 密码以明文存储和比对，没有使用哈希。

**建议**: 使用 bcrypt 或 argon2 进行密码哈希比对。

### 1.3 无输入验证
**文件**: `src/pages/api/config/isTabHasPassword.js`, `src/pages/api/config/validateTab.js`

**问题**: API 端点没有验证 `type` 参数是否为合法值（`bookmarkTabs` 或 `serviceTabs`），可能导致意外行为。

**建议**: 添加参数验证。

---

## 2. 代码质量问题 🟡

### 2.1 重复代码 - getHost 函数
**文件**: `src/components/bookmarks/sublistDialog.jsx:88-96`, `src/components/bookmarks/item.jsx:89-97`

两个文件中有完全相同的 `getHost` 函数。

**建议**: 提取到 `src/utils/url.js` 中复用。

```javascript
// src/utils/url.js
export function getHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    if (url.includes('//')) url = url.substring(url.indexOf('//') + 2);
    if (url.includes('/')) url = url.substring(0, url.indexOf('/'));
    return url;
  }
}
```

### 2.2 Context Provider 未使用 initial 参数
**文件**: `src/utils/contexts/localmode.jsx:5`, `src/utils/contexts/bookmark.jsx:5`

```javascript
export function LocalModeProvider({ initial, children }) {
    const [localMode, setLocalMode] = useState(false);  // initial 未使用
```

**建议**: 移除未使用的 `initial` 参数，或使用它初始化状态。

### 2.3 硬编码的魔法数字
**文件**: `src/components/bookmarks/list.jsx:9`

```javascript
if (bookmarks.length >= 5) classes = 'grid grid-cols-1 md:grid-cols-2 ...'
```

**建议**: 将 `5` 提取为配置常量。

### 2.4 useEffect 缺少依赖
**文件**: `src/pages/index.jsx:306-314`

```javascript
useEffect(() => {
  if (!activeTab) {
    const initialTab = asPath.substring(asPath.indexOf("#") + 1);
    setActiveTab(initialTab === "/" ? slugifyAndEncode(tabs["0"]) : initialTab);
  }
  if (!activeBookmarkTab) {
    setActiveBookmarkTab(slugifyAndEncode(bookmarkTabs["0"]));
  }
});  // 缺少依赖数组
```

**问题**: 没有依赖数组，每次渲染都会执行。

**建议**: 添加正确的依赖数组。

### 2.5 命名不一致
- `PasswordPrompt` vs `passwordPrompt.jsx` - 文件名与组件名大小写不一致
- `SublistDialog` - "Sublist" 是否应该统一为 "SubList"

---

## 3. 性能问题 🟡

### 3.1 每次 Tab 点击都发请求
**文件**: `src/components/tab.jsx:38-47`

```javascript
const handleTabClick = async () => {
  const resHasPassword = await fetch(`/api/config/isTabHasPassword?...`);
  // ...
};
```

**问题**: 每次点击 Tab 都会请求密码状态，即使配置未变化。

**建议**: 
1. 在 `getStaticProps` 时预加载密码状态
2. 或使用 SWR 缓存密码状态

### 3.2 大型 useMemo 依赖数组
**文件**: `src/pages/index.jsx:316-477`

`servicesAndBookmarksGroups` 的 useMemo 有 16 个依赖项，且返回大量 JSX。

**建议**: 拆分为更小的组件，减少重渲染范围。

---

## 4. 功能建议 💡

### 4.1 与上游 Homepage Auth 集成
上游已实现完整的认证系统 (#6769)，包括 OIDC 和密码登录。当前的 Tab 密码功能可以考虑：
- 使用上游的 SessionProvider 进行认证
- 或保留 Tab 级别的密码，但使用上游的认证基础设施

### 4.2 局域网模式优化
**文件**: `src/components/services/item.jsx:19-21`

当前通过 `useMemo` 在每次渲染时判断 localMode，建议：
- 在配置加载时一次性解析
- 支持通过环境变量切换默认模式

### 4.3 管理功能完善
**文件**: `src/components/toggles/manage.jsx`

当前管理按钮只有图标，没有 tooltip 或无障碍标签。

**建议**: 添加 `title` 和 `aria-label` 属性。

---

## 5. 待办事项清理

| 文件 | 问题 |
|------|------|
| `src/pages/api/manage/verifyPassword.js:5` | `// TODO` 注释未完成 |

---

## 6. 优化优先级

| 优先级 | 项目 | 预计工作量 |
|--------|------|-----------|
| P0 | 密码传输加密（POST 请求） | 1 小时 |
| P0 | 密码哈希存储 | 2 小时 |
| P1 | API 参数验证 | 30 分钟 |
| P1 | 提取重复 getHost 函数 | 30 分钟 |
| P2 | Tab 密码状态缓存 | 1 小时 |
| P2 | useEffect 依赖修复 | 30 分钟 |
| P3 | 命名一致性 | 30 分钟 |
| P3 | 管理按钮无障碍 | 15 分钟 |

---

## 总结

luqin2007 的自定义功能（书签子菜单、Tab 密码、局域网模式）设计合理，但存在**密码安全**方面的严重问题需要优先修复。代码质量方面主要是重复代码和依赖管理的小问题。建议优先处理 P0 级别的安全问题。
