#!/usr/bin/env python3
import sys
msg = sys.stdin.read()
replacements = {
    "Auto-resolve conflicts: accept feature changes for frontend files, keep main for others":
        "Tự động giải quyết xung đột: frontend → chấp nhận thay đổi từ feature; khác → giữ bản main",
    "Auto-resolve remaining merge conflicts: keep main for non-frontend files; remove tracked node_modules_tmp and update .gitignore":
        "Tự động giải quyết xung đột còn lại: giữ bản main cho non-frontend; loại node_modules đã bị track và cập nhật .gitignore",
    "Auto-resolve: keep main version of backend/server.js (log-rate-limit-backend merge)":
        "Tự động giải quyết: giữ phiên bản main của backend/server.js (merge log-rate-limit-backend)",
    "Add backend yarn.lock (integration)":
        "Thêm backend/yarn.lock (tích hợp)",
    "Remove backend/.env from repo and add .env.example and .gitignore":
        "Loại backend/.env khỏi repo và thêm backend/.env.example; cập nhật .gitignore",
    "Resolve merge conflicts in backend files and finalize integration":
        "Giải quyết xung đột backend và hoàn tất tích hợp",
}
for k,v in replacements.items():
    msg = msg.replace(k, v)
sys.stdout.write(msg)
