# -*- coding: utf-8 -*-
"""
批量把 Markdown 里的 CSDN 远程图片本地化 —— 两阶段流程（本轮增强）。

阶段1（下载）：按图片在正文里出现的先后顺序，给每个「唯一 URL」分配编号
              {head}_{i}.{ext}，带 Referer 头逐个下载到 images/ 目录。
              失败的 URL 不进映射（保留原远程链接，不替换）。
阶段2（替换）：全部下载结束后，再逐个把正文里「已成功下载」的远程链接
              替换成相对路径 images/{head}_{i}.{ext}，每替换一处打印一行。

命名规则：
    文件名 = f"{head}_{i}.{ext}"
      - head：每次运行时交互式询问，作为这批图片的统一前缀（一般填文章名/标识）
      - i   ：爬取顺序，从 1 开始自增；同一篇里重复出现的 URL 复用同一编号
      - ext ：从原 URL 取真实后缀，取不到默认 .png

用法:
    python csdn_image_scraper.py --src 文章.md [--images 目录] [--out 新.md] [--head 标识]
    - 不给 --head 时，运行后会弹出「请输入文件名头(head):」询问；给了则跳过（便于脚本化）。
    - 不给 --out 时就地覆盖源文件；给了 --out 则写到新文件。

其它行为：
    - 自动跳过 data: 开头的 base64 占位图（正则只匹配 http(s)）
    - 用 Referer 头伪装成 csdn 站内请求，破解 403 防盗链
    - 某张图下载失败：正文里该链接原样保留，可事后单独处理
"""
import os, re, sys, argparse, requests

# 匹配 markdown 图片语法 ![alt](url)，只取 http(s) 开头的真实图（跳过 data: 占位图）
IMG_RE = re.compile(r"(!\[[^\]]*\]\()(https?://[^\s)]+)(\))")

HEADERS = {
    "Referer": "https://blog.csdn.net/",
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/120.0.0.0 Safari/537.36"),
}


def ask_head(default="img"):
    """运行时询问头（head）。stdin 非交互（管道/重定向）时用 default。"""
    if not sys.stdin.isatty():
        return default
    try:
        h = input("请输入文件名头(head，作为这批图片的统一前缀): ").strip()
    except EOFError:
        h = ""
    # 去掉路径分隔等非法字符，避免污染文件名
    h = re.sub(r'[\\/:*?"<>|\s]+', "_", h).strip("_")
    return h or default


def ext_from_url(url):
    base = url.split("/")[-1].split("?")[0].split("#")[0]
    _, ext = os.path.splitext(base)
    ext = ext.lower()
    if ext not in (".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".ico"):
        ext = ".png"
    return ext


def collect_unique_urls(md_text):
    """按出现顺序收集正文里所有唯一 http(s) 图片 URL（重复的只留第一次）。"""
    seen, order = set(), []
    for m in IMG_RE.finditer(md_text):
        url = m.group(2)
        if url not in seen:
            seen.add(url)
            order.append(url)
    return order


def download_all(urls, images_dir, head):
    """阶段1：逐个下载。返回 {url: 相对路径} 映射（仅成功的）及 ok/fail 计数。"""
    os.makedirs(images_dir, exist_ok=True)
    mapping, ok, fail = {}, 0, 0
    total = len(urls)
    for i, url in enumerate(urls, start=1):
        fn = "%s_%d%s" % (head, i, ext_from_url(url))
        rel = "images/" + fn            # 相对 md 所在目录
        dest = os.path.join(images_dir, fn)

        if os.path.exists(dest):        # 已存在则复用，不再下载
            mapping[url] = rel
            ok += 1
            print("[下载 %d/%d] 已存在，复用 -> %s" % (i, total, rel))
            continue

        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                with open(dest, "wb") as f:
                    f.write(r.content)
                mapping[url] = rel
                ok += 1
                print("[下载 %d/%d] 成功 -> %s" % (i, total, rel))
            else:
                fail += 1
                print("[下载 %d/%d] 失败(%s)，保留原链接 -> %s" % (i, total, r.status_code, url))
        except Exception as e:
            fail += 1
            print("[下载 %d/%d] 异常(%s)，保留原链接 -> %s" % (i, total, e, url))
    return mapping, ok, fail


def replace_all(md_text, mapping):
    """阶段2：下载全部结束后，逐个把成功下载的 URL 替换为相对路径，失败的保留。"""
    replaced = {"n": 0}

    def repl(m):
        pre, url, post = m.group(1), m.group(2), m.group(3)
        if url in mapping:
            replaced["n"] += 1
            print("[替换] %s -> %s" % (url, mapping[url]))
            return pre + mapping[url] + post
        return m.group(0)               # 未成功下载 -> 原样保留

    new_text = IMG_RE.sub(repl, md_text)
    return new_text, replaced["n"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="源 markdown 文件")
    ap.add_argument("--images", default=None, help="图片落地目录，默认 <源目录>/images")
    ap.add_argument("--out", default=None, help="输出 md 路径，默认就地覆盖源文件")
    ap.add_argument("--head", default=None, help="文件名头；不给则运行时询问")
    a = ap.parse_args()

    head = a.head if a.head else ask_head()
    src_dir = os.path.dirname(os.path.abspath(a.src))
    images_dir = a.images or os.path.join(src_dir, "images")

    text = open(a.src, encoding="utf-8").read()

    # —— 阶段1：下载完毕 ——
    urls = collect_unique_urls(text)
    print("共发现 %d 个图片地址，开始下载……" % len(urls))
    mapping, ok, fail = download_all(urls, images_dir, head)

    # —— 阶段2：逐个替换正文链接 ——
    print("下载完毕，开始逐个替换正文中的图片链接……")
    new_text, replaced = replace_all(text, mapping)

    out = a.out or a.src
    with open(out, "w", encoding="utf-8") as f:
        f.write(new_text)
    print("完成：下载成功 %d / 失败 %d，正文替换 %d 处，落地目录 %s，head=%s -> %s"
          % (ok, fail, replaced, images_dir, head, out))


if __name__ == "__main__":
    main()
