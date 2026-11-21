#!/bin/bash

# v3 - 智能降级版：HTTPS 失败自动切 SSH
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
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

# ==========================================
# 核心逻辑：HTTPS 优先，失败自动降级 SSH
# ==========================================

# 获取当前分支名
branch=$(git rev-parse --abbrev-ref HEAD)

# 获取远程 URL，判断当前是 HTTPS 还是 SSH
remote_url=$(git remote get-url origin)

push_success=false

if [[ "$remote_url" == https://* ]]; then
    # 当前是 HTTPS，先尝试 HTTPS 推送
    echo "${BLUE}[PUSH] 尝试 HTTPS 通道...${RESET}"
    if git push origin "$branch"; then
        push_success=true
    else
        echo "${YELLOW}[PUSH] HTTPS 推送失败，尝试切换至 SSH...${RESET}"
        
        # 将 HTTPS URL 转换为 SSH URL
        # 例如：https://github.com/user/repo.git -> git@github.com:user/repo.git
        ssh_url=$(echo "$remote_url" | sed -E 's|https://github.com/(.*)|git@github.com:\1|')
        
        # 临时切换远程 URL（不修改全局配置）
        git remote set-url origin "$ssh_url"
        
        # 尝试 SSH 推送（加 -o 参数避免首次连接时的 yes/no 交互）
        echo "${BLUE}[PUSH] 尝试 SSH 通道...${RESET}"
        if GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=accept-new" git push origin "$branch"; then
            push_success=true
            echo "${GREEN}[PUSH] SSH 推送成功！建议永久切换：git remote set-url origin $ssh_url${RESET}"
        fi
        
        # 无论成功失败，都恢复原始 URL（避免污染配置）
        git remote set-url origin "$remote_url"
    fi
elif [[ "$remote_url" == git@github.com:* ]]; then
    # 当前已经是 SSH，直接推
    echo "${BLUE}[PUSH] 使用 SSH 通道...${RESET}"
    if GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=accept-new" git push origin "$branch"; then
        push_success=true
    fi
else
    echo "${RED}ERROR: 未知的远程 URL 格式: $remote_url${RESET}"
    exit 1
fi

if [ "$push_success" = true ]; then
    echo "${GREEN}${BOLD}✅ Done!${RESET}"
else
    echo "${RED}${BOLD}❌ Push 失败（HTTPS 和 SSH 均不可用）${RESET}"
    exit 1
fi