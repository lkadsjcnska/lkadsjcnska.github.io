import os
import json
from pathlib import Path
import deepl


# =========================
# 配置
# =========================

DOCS_DIR = Path("docs")

OUTPUT_FILE = DOCS_DIR / "translations.json"

IGNORE_FILES = {
    "index.html",
    "translations.json"
}


# =========================
# DeepL
# =========================

DEEPL_KEY = os.environ.get("DEEPL_KEY")

if not DEEPL_KEY:
    raise RuntimeError(
        "未找到环境变量 DEEPL_KEY"
    )


translator = deepl.Translator(DEEPL_KEY)



# =========================
# 读取已有翻译
# =========================

if OUTPUT_FILE.exists():

    with open(
        OUTPUT_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        translations = json.load(f)

else:

    translations = {}



# =========================
# 获取文件列表
# =========================

files = []

for file in DOCS_DIR.iterdir():

    if not file.is_file():
        continue

    if file.name in IGNORE_FILES:
        continue

    files.append(file.name)



# =========================
# 翻译函数
# =========================

def translate_filename(name):

    """
    文件名翻译
    """

    result = translator.translate_text(
        name,
        source_lang="ZH",
        target_lang="EN-US"
    )

    return result.text



# =========================
# 处理文件
# =========================

for filename in files:


    # 已存在，跳过
    if filename in translations:

        print(
            f"[SKIP] {filename}"
        )

        continue



    print(
        f"[TRANSLATE] {filename}"
    )


    try:

        english = translate_filename(
            filename
        )


    except Exception as e:

        print(
            f"[ERROR] {filename}: {e}"
        )

        english = filename



    translations[filename] = {

        "zh-CN": filename,

        "en-US": english,

        "en-GB": english

    }



# =========================
# 保存
# =========================

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        translations,
        f,
        ensure_ascii=False,
        indent=4
    )


print()
print(
    "完成:",
    OUTPUT_FILE
)
