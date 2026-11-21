# -*- coding: utf-8 -*-
"""
富文本 -> Markdown 转换工具（串联版）
阶段一: base64 内联图落地成 images/{head}_{i}.{ext}，转 Markdown
阶段二: 自动调用 csdn_image_scraper.py 下载并替换正文中的远程图片

用法:
  python rich_text_to_md.py --html input.html --head VM
  python rich_text_to_md.py --paste --head VM
"""
import argparse
import base64
import binascii
import os
import re
import subprocess
import sys

from bs4 import BeautifulSoup
from markdownify import markdownify as md

JUNK_TEXTS = {"编辑", "Edit", "分享", "Share", "收藏", "点赞", "举报", "返回目录"}

DATA_URI_RE = re.compile(
    r"^data:image/(?P<ext>png|jpe?g|gif|webp|bmp|svg\+xml);base64,(?P<b64>.+)$",
    re.IGNORECASE | re.DOTALL,
)


def sanitize_head(head: str) -> str:
    return re.sub(r'[\\/:*?"<>|\s]+', "_", head).strip("_") or "img"


def decode_data_uri(data_uri: str):
    m = DATA_URI_RE.match(data_uri.strip())
    if not m:
        return None, None
    ext = m.group("ext").lower().replace("jpeg", "jpg").replace("svg+xml", "svg")
    raw = re.sub(r"\s+", "", m.group("b64"))
    raw += "=" * (-len(raw) % 4)
    try:
        return base64.b64decode(raw), ext
    except (binascii.Error, ValueError):
        return None, None


def extract_and_save_images(soup, images_dir, head):
    os.makedirs(images_dir, exist_ok=True)
    counter = 0
    ok = fail = 0
    cache = {}

    for img in soup.find_all("img"):
        src = (img.get("src") or "").strip()
        if not src.startswith("data:"):
            continue
        if src in cache:
            img["src"] = cache[src]
            ok += 1
            continue

        counter += 1
        data, ext = decode_data_uri(src)
        if data is None:
            print(f"[失败] 第 {counter} 张 base64 解码失败，保留原样")
            fail += 1
            continue

        fname = f"{head}_{counter}.{ext}"
        with open(os.path.join(images_dir, fname), "wb") as f:
            f.write(data)
        rel = f"images/{fname}"
        img["src"] = rel
        cache[src] = rel
        print(f"[落地] base64 -> {rel} ({len(data)} 字节)")
        ok += 1

    return ok, fail


def strip_junk(soup):
    removed = 0
    for tag in soup.find_all(string=True):
        if tag.strip() in JUNK_TEXTS:
            node = tag.parent
            while node is not None and node.name not in ("body", "html"):
                if node.name in ("button", "a", "span", "div", "i", "svg"):
                    node.decompose()
                    removed += 1
                    break
                node = node.parent
    return removed


def convert(html, images_dir, head):
    soup = BeautifulSoup(html, "html.parser")
    ok, fail = extract_and_save_images(soup, images_dir, head)
    junk = strip_junk(soup)

    text = md(
        str(soup),
        heading_style="ATX",
        bullets="-",
        code_language="python",
        strip=["script", "style"],
    )
    text = re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"
    print(f"\n[阶段一完成] 图片落地 {ok} 张，失败 {fail} 张，清理残渣 {junk} 处")
    return text


def read_clipboard_html():
    import pyperclip
    raw = pyperclip.paste()
    m = re.search(r"<!--StartFragment-->(.*)<!--EndFragment-->", raw, re.DOTALL)
    return m.group(1) if m else raw


def ask_output_path(default_path: str) -> str:
    """启动时询问保存位置，回车用默认值"""
    tip = f"\n请输入 Markdown 保存位置 [默认: {default_path}]: "
    try:
        path = input(tip).strip().strip('"').strip("'")
    except EOFError:
        return default_path
    if not path:
        return default_path
    # 只给了目录没给文件名时，补默认文件名
    if os.path.isdir(path):
        path = os.path.join(path, os.path.basename(default_path))
    # 确保父目录存在
    parent = os.path.dirname(os.path.abspath(path))
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)
    return path


def run_csdn_scraper(md_path: str, head: str):
    """阶段二：调用同目录下的 csdn_image_scraper.py 下载并替换远程图"""
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "csdn_image_scraper.py")
    if not os.path.exists(script):
        print(f"[跳过阶段二] 找不到 {script}，请手动运行下载脚本")
        return

    print(f"\n===== 阶段二：调用 csdn_image_scraper.py 下载并替换远程图 =====")
    # 用 -c 传参，head 直接给，避免它再次交互式询问
    cmd = [sys.executable, script, "--src", md_path, "--head", head]
    print("执行:", " ".join(cmd))
    result = subprocess.run(cmd)
    if result.returncode == 0:
        print("[阶段二完成] 远程图片下载与替换成功")
    else:
        print(f"[阶段二异常] 退出码 {result.returncode}，请检查上方输出")


def main():
    ap = argparse.ArgumentParser(description="富文本转 Markdown（串联下载脚本）")
    ap.add_argument("--html", help="输入 HTML 文件路径")
    ap.add_argument("--paste", action="store_true", help="从剪贴板读取富文本")
    ap.add_argument("--head", default=None, help="图片文件名前缀，如 VM")
    ap.add_argument("--images", default=None, help="图片落地目录，默认 <输出目录>/images")
    ap.add_argument("--no-scraper", action="store_true",
                    help="只转 Markdown，不调用 csdn_image_scraper.py")
    args = ap.parse_args()

    if args.paste:
        html = read_clipboard_html()
        default_out = os.path.join(os.getcwd(), "clipboard.md")
    elif args.html:
        with open(args.html, "r", encoding="utf-8") as f:
            html = f.read()
        default_out = os.path.splitext(os.path.abspath(args.html))[0] + ".md"
    else:
        ap.error("必须指定 --html 文件或 --paste 模式")
        return

    # —— 启动时先问保存位置 ——
    out_path = ask_output_path(default_out)
    out_dir = os.path.dirname(os.path.abspath(out_path))

    head = sanitize_head(args.head or input("请输入文件名头(head): "))
    images_dir = args.images or os.path.join(out_dir, "images")

    print(f"\n输出文件: {out_path}")
    print(f"图片目录: {images_dir}")
    print(f"文件名头: {head}\n")

    # —— 阶段一：转 Markdown + base64 落地 ——
    text = convert(html, images_dir, head)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"已写出 Markdown -> {out_path}")

    # —— 阶段二：自动下载并替换远程图 ——
    if not args.no_scraper:
        run_csdn_scraper(out_path, head)

    print("\n全部完成。")


if __name__ == "__main__":
    main()