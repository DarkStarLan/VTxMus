#!/bin/bash

echo "========================================"
echo "VTxMus 项目快速上传脚本"
echo "========================================"
echo ""

# 检查是否已经初始化 Git 仓库
if [ ! -d .git ]; then
    echo "[1/5] 初始化 Git 仓库..."
    git init
    git branch -M main
    git remote add origin https://github.com/DarkStarLan/VTxMus.git
    echo "Git 仓库初始化完成！"
    echo ""
else
    echo "[1/5] Git 仓库已存在，跳过初始化"
    echo ""
fi

# 添加所有文件（.gitignore 会自动排除不需要的文件）
echo "[2/5] 添加文件到暂存区..."
git add .
echo "文件添加完成！"
echo ""

# 提交更改
echo "[3/5] 提交更改..."
read -p "请输入提交信息 (直接回车使用默认信息): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update project files"
fi
git commit -m "$commit_msg"
echo "提交完成！"
echo ""

# 推送到远程仓库
echo "[4/5] 推送到 GitHub..."
git push -u origin main
if [ $? -ne 0 ]; then
    echo ""
    echo "推送失败！可能需要先拉取远程更改。"
    read -p "尝试强制推送？(y/n): " force_push
    if [ "$force_push" = "y" ] || [ "$force_push" = "Y" ]; then
        git push -u origin main --force
    fi
fi
echo ""

echo "[5/5] 完成！"
echo "========================================"
echo "项目已成功上传到 GitHub！"
echo "仓库地址: https://github.com/DarkStarLan/VTxMus"
echo "========================================"
echo ""

