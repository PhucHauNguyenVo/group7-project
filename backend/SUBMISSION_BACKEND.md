# Submission - Backend (SV1)

Tệp này là checklist và hướng dẫn nộp bài cho phần Backend (Sinh viên 1).

## Mục tiêu
- Triển khai middleware RBAC `checkRole(role)` và/hoặc `authorizeRoles(...roles)`.
- Giữ nguyên chức năng hiện có.
- Cung cấp API quản lý user (xem `routes/user.js` và `controllers/userController.js`).
- Nộp ảnh Postman test endpoint `/api/auth/refresh` và link PR.

## Files đã cập nhật
- `models/userModel.js` — thêm `moderator` vào enum `role`.
- `middleware/roleMiddleware.js` — thêm `checkRole(role)` wrapper (sử dụng `authorizeRoles`).

## Hướng dẫn test nhanh (local)
1. Chạy backend:
```powershell
cd C:\Users\nvph2\group7-project\backend
npm install
npm start
```
2. Endpoints quan trọng:
- POST `/api/auth/login` — đăng nhập, lấy access + refresh token
- POST `/api/auth/refresh` — refresh access token (test bằng Postman)
- GET `/api/users` — chỉ `admin` (dùng `protect` + `authorizeRoles('admin')`)
- PUT `/api/users/:id` — admin hoặc chính chủ (đã kiểm tra trong controller)

## Mẫu PR (Title + Body)
**Title:** Thêm Advanced RBAC & API quản lý user (backend)

**Body:**
- Thêm role `moderator` vào `User` model.
- Thêm middleware `checkRole(role)` (wrapper cho `authorizeRoles`).
- Không thay đổi logic hiện có khác.

**Checklist:**
- [ ] Endpoint `/api/auth/refresh` đã test bằng Postman (ảnh đính kèm)
- [ ] Các endpoint quản lý user (`GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`) hoạt động theo quyền
- [ ] Không phá vỡ API khác (smoke test)

## Ảnh & Báo cáo
- Lưu ảnh Postman dưới tên `postman_refresh_backend.png` và đính kèm vào PR.
- Ghi chú ngắn (nếu cần): cách gọi, sample body/headers dùng để test.

---
Nếu bạn muốn, mình có thể:
- Tạo PR mẫu (sử dụng GitHub CLI) với mô tả ở trên và đính kèm file `SUBMISSION_BACKEND.md`.
- Hoặc chạy server và kiểm tra `/api/auth/refresh` rồi chụp kết quả (nếu bạn cho phép chạy lệnh).