# 原始项目

[Github](https://github.com/gethomepage/homepage)
[Homepage](https://gethomepage.dev/)

# 修改内容

- [x] `maxGroupColumns` 设置多列书签
- [x] 书签省略 `icon` 与 `abbr` 属性时自动获取图标
- [x] 为书签添加独立的 Tab，通过 `settings.layout` 对应 `group` 中的 `bookmarkTab` 属性设置

```yaml
layout:
  _b_ai_tool:
    name: 工具
    bookmarkTab: AI
```

- [x] 书签具有二级菜单，通过 `bookmarks` 中的 `sublist` 属性配置

```yaml
- _b_ai_model:
  - 通义:
    - href: https://www.tongyi.com/
      sublist:
        DeepSeek:
          href: https://www.deepseek.com/
          icon: deepseek
        Gimini:
          href: https://gemini.google.com/app
          icon: google-gemini
        豆包:
          href: https://www.doubao.com/chat/
```

![](images/QQ20250804-182531.png)

- [x] 集成 Homepage Auth，支持细粒度权限控制

基于上游 Homepage Auth（NextAuth.js），扩展了 `protected` 属性支持，允许未登录用户浏览页面，受保护内容对匿名用户隐藏。

**环境变量：**
```bash
HOMEPAGE_AUTH_ENABLED=true
HOMEPAGE_AUTH_ALLOW_ANONYMOUS=true   # 允许匿名浏览页面
HOMEPAGE_AUTH_SECRET=your-secret
HOMEPAGE_AUTH_PASSWORD=your-password
```

**Tab 级别保护：**
```yaml
layout:
  _s_manager:
    tab: 管理
    protected: true     # 整个 Tab 需要登录
```

**Service/Bookmark 级别保护：**
```yaml
# services.yaml
- _s_web:
  - qBittorrentEE:
      href: https://qbit.luqion.cn
      icon: qbittorrent
  - Mihomo:
      href: https://mihomo.luqion.cn
      icon: clash
      protected: true   # 单个 Service 需要登录
```

```yaml
# bookmarks.yaml
- _b_help_app:
  - Homepage:
      href: https://gethomepage.dev
  - 内部文档:
      href: https://docs.internal.example.com/
      protected: true   # 单个 Bookmark 需要登录
```

**Docker 标签支持：**
```yaml
# 全局生效
labels:
  homepage.protected: "true"

# 仅指定实例生效
labels:
  homepage.instance.myinstance.protected: "true"
```

- [x] Tab 自动隐藏（autohide）

当 Tab 下没有可见的 Service/Bookmark 时自动隐藏该 Tab。

```yaml
layout:
  _s_project:
    tab: 项目
    autohide: true    # 无可见内容时隐藏
```

- [x] 切换局域网模式与网络模式

在 `services.yaml` 中可以指定一个在局域网中访问的地址，如：

```yaml
  - OpenHands:
      href: https://openhands.luqion.cn
      icon: https://openhands.luqion.cn/favicon.ico
      localHref: http://192.168.1.170:18026
      localIcon: http://192.168.1.170:18026/favicon.ico
```

可通过左下角

![](images/QQ20250904-114936.png)

按钮切换

- [ ] 在页面添加书签
- [ ] 备忘录
