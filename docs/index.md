---
icon: lucide/rocket
---

# 快速开始

完整文档请访问 [zensical.org](https://zensical.org/docs/)。

## 命令

* [`zensical new`][new] - 创建一个新项目
* [`zensical serve`][serve] - 启动本地 Web 服务器
* [`zensical build`][build] - 构建你的站点

  [new]: https://zensical.org/docs/usage/new/
  [serve]: https://zensical.org/docs/usage/preview/
  [build]: https://zensical.org/docs/usage/build/

## 示例

### 提示块 (Admonitions)

> 前往 [文档](https://zensical.org/docs/authoring/admonitions/)

!!! note

    这是一个**提示 (note)** 块。用它来提供有用的信息。

!!! warning

    这是一个**警告 (warning)** 块。小心！

### 折叠块 (Details)

> 前往 [文档](https://zensical.org/docs/authoring/admonitions/#collapsible-blocks)

??? info "点击展开查看更多信息"

    此内容在点击展开前是隐藏的。
    非常适合用于常见问题解答（FAQ）或长篇解释。

## 代码块 (Code Blocks)

> 前往 [文档](https://zensical.org/docs/authoring/code-blocks/)

``` python hl_lines="2" title="代码块"
def greet(name):
    print(f"Hello, {name}!")  # (1)!


greet("Python")
```

1.  > 前往 [文档](https://zensical.org/docs/authoring/code-blocks/#code-annotations)

    代码注释允许为代码行添加备注。

代码也可以进行行内高亮：`#!python print("Hello, Python!")`。

## 内容选项卡 (Content tabs)

> 前往 [文档](https://zensical.org/docs/authoring/content-tabs/)

=== "Python"

    ``` python
    print("Hello from Python!")
    ```

=== "Rust"

    ``` rs
    println!("Hello from Rust!");
    ```

## 图表 (Diagrams)

> 前往 [文档](https://zensical.org/docs/authoring/diagrams/)

``` mermaid
graph LR
  A[开始] --> B{出错了吗?};
  B -->|是| C[呃...];
  C --> D[调试];
  D --> B;
  B ---->|否| E[耶!];
```

## 脚注 (Footnotes)

> 前往 [文档](https://zensical.org/docs/authoring/footnotes/)

这里有一句话带有脚注。[^1]

将鼠标悬停在上面即可查看提示。

[^1]: 这是脚注内容。


## 格式化 (Formatting)

> 前往 [文档](https://zensical.org/docs/authoring/formatting/)

- ==这是标记（高亮）==
- ^^这是插入（下划线）^^
- ~~这是删除（删除线）~~
- H~2~O (化学式下标)
- A^T^A (数学上标)
- ++ctrl+alt+del++ (键盘按键)

## 图标与表情符号 (Icons, Emojis)

> 前往 [文档](https://zensical.org/docs/authoring/icons-emojis/)

* :sparkles: `:sparkles:` (✨)
* :rocket: `:rocket:` (🚀)
* :tada: `:tada:` (🎉)
* :memo: `:memo:` (📝)
* :eyes: `:eyes:` (👀)

## 数学公式 (Maths)

> 前往 [文档](https://zensical.org/docs/authoring/math/)

$$
\cos x=\sum_{k=0}^{\infty}\frac{(-1)^k}{(2k)!}x^{2k}
$$

!!! warning "需要配置"
    请注意，MathJax 是通过本页面的 `script` 标签引入的，并且没有在生成的默认配置中进行配置，这是为了避免将其包含在不需要它的页面中。如果你的页面比这些简单的起始页面更需要数学公式，请参阅文档了解如何在所有页面上进行配置的详细信息。

<script id="MathJax-script" src="https://unpkg.com/mathjax@3/es5/tex-mml-chtml.js"></script>
<script>
  window.MathJax = {
    tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"]], processEscapes: true, processEnvironments: true },
    options: { ignoreHtmlClass: ".*|", processHtmlClass: "arithmatex" }
  };
  document$.subscribe(() => {
    MathJax.startup.output.clearCache()
    MathJax.typesetClear()
    MathJax.texReset()
    MathJax.typesetPromise()
  })
</script>

## 任务列表 (Task Lists)

> 前往 [文档](https://zensical.org/docs/authoring/lists/#using-task-lists)

* [x] 安装 Zensical
* [x] 配置 `zensical.toml`
* [x] 编写令人惊叹的文档
* [ ] 部署到任何地方

## 工具提示 (Tooltips)

> 前往 [文档](https://zensical.org/docs/authoring/tooltips/)

[悬停在我上面][example]

  [example]: https://example.com "我是一个工具提示！"
