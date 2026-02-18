@echo off
chcp 65001 >nul
echo ========================================
echo VTxMus 项目快速上传脚本
echo ========================================
echo.

REM 检查是否已经初始化 Git 仓库
if not exist .git (
    echo [1/5] 初始化 Git 仓库...
    git init
    git branch -M main
    git remote add origin https://github.com/DarkStarLan/VTxMus.git
    echo Git 仓库初始化完成！
    echo.
) else (
    echo [1/5] Git 仓库已存在，跳过初始化
    echo.
)

REM 添加所有文件（.gitignore 会自动排除不需要的文件）
echo [2/5] 添加文件到暂存区...
git add .
echo 文件添加完成！
echo.

REM 提交更改
echo [3/5] 提交更改...
set /p commit_msg="请输入提交信息 (直接回车使用默认信息): "
if "%commit_msg%"=="" (
    set commit_msg=Update project files
)
git commit -m "%commit_msg%"
echo 提交完成！
echo.

REM 推送到远程仓库
echo [4/5] 推送到 GitHub...
git push -u origin main
if errorlevel 1 (
    echo.
    echo 推送失败！可能需要先拉取远程更改。
    echo 尝试强制推送？(y/n)
    set /p force_push=
    if /i "%force_push%"=="y" (
        git push -u origin main --force
    )
)
echo.

echo [5/5] 完成！
echo ========================================
echo 项目已成功上传到 GitHub！
echo 仓库地址: https://github.com/DarkStarLan/VTxMus
echo ========================================
echo.
pause

