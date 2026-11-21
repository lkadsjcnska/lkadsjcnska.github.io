#!/bin/bash

# v2 - complete
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
BOLD=$(tput bold)
RESET=$(tput sgr0)

confirm() {
    local prompt="$1"
    local var
    read -p "$prompt (y/N) " var
    case "$var" in
        [yY]) return 0 ;;
        [nN]) return 1 ;;
        *) echo "${RED}Invalid input${RESET}"; exit 1 ;;
    esac
}

# 检查是否在 git 仓库内
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "${RED}ERROR: Not a git repository${RESET}"
    exit 1
fi

echo "${BOLD}准备 Push...${RESET}"

# 暂存
git add . || { echo "${RED}ERROR: git add failed${RESET}"; exit 1; }

# 检查是否有变更
if git diff --cached --quiet; then
    echo "${YELLOW}没有需要提交的变更${RESET}"
    exit 0
fi

# 第一次确认：commit
if confirm "===== Continue to commit"; then
    read -p "Enter your message: " ms
    if [ -z "$ms" ]; then
        echo "${RED}ERROR: Commit message cannot be empty${RESET}"
        exit 1
    fi
else
    echo "${RED}Cancelled${RESET}"
    exit 0
fi

# 提交
git commit -m "$ms" || { echo "${RED}ERROR: git commit failed${RESET}"; exit 1; }

# 第二次确认：push
if confirm "===== Continue to push"; then
    echo "${GREEN}Pushing...${RESET}"
else
    echo "${RED}Cancelled${RESET}"
    exit 0
fi

# 推送
git push || { echo "${RED}ERROR: git push failed${RESET}"; exit 1; }

echo "${GREEN}${BOLD}✅ Done!${RESET}"