# Hoạt động 1 — Refresh Token & Session Management (Backend)

Mục tiêu: Triển khai JWT Access + Refresh token, endpoint `/api/auth/refresh`, middleware xác thực Access Token, lưu refresh token an toàn, revoke khi logout.

## File cần chú ý
- `controllers/authController.js` — login / generateTokens / refresh / logout
- `models/RefreshToken.js` — schema refresh token
- `middleware/authMiddleware.js` — `protect` middleware
- `routes/auth.js` — route `/auth/refresh` và `/auth/logout`
- `routes/user.js` — sample protected route `/users/profile`

## Cấu hình (copy `.env.example` -> `.env` và chỉnh)
```
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3001
# Optional SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=you@example.com
SMTP_PASS=app_password
```

## Test nhanh (Postman / PowerShell)
1. Start server:
```powershell
cd backend
npm install
npm run dev
```

2. Login -> lấy tokens
POST http://localhost:4000/api/auth/login
Body JSON: { "email": "user@example.com", "password": "password" }
Response: { accessToken, refreshToken }

3. Gọi route bảo vệ
GET http://localhost:4000/api/users/profile
Header: Authorization: Bearer <accessToken>

4. Refresh token
POST http://localhost:4000/api/auth/refresh
Body JSON: { "refreshToken": "<refreshToken>" }
Response: { accessToken, refreshToken }

5. Logout (revoke)
POST http://localhost:4000/api/auth/logout
Body JSON: { "refreshToken": "<refreshToken>" }

## Ghi chú kỹ thuật
- Refresh token được trả cho client (raw) nhưng **lưu dưới dạng SHA256 hash** trong DB (tăng an toàn).
- Khi refresh, backend hash incoming refresh token và tìm trong DB.
- Hiện `generateTokens()` xóa tất cả refresh token cũ cho user (single-session). Nếu muốn multi-device, thay đổi logic (không deleteMany).
- Khuyến nghị production: lưu refresh token trong HttpOnly Secure cookie thay vì localStorage để giảm XSS risk.

## Nộp
- Chụp màn hình Postman request/response cho `/api/auth/refresh` (đính kèm vào PR).
- Ghi hướng dẫn test trong PR description.
- Tạo branch: `feature/refresh-token` và push, sau đó mở PR (gắn reviewer SV2/SV3).

---
Hỗ trợ thêm: nếu bạn muốn mình đổi lưu token hashed -> thêm TTL index hoặc tạo script test `testRefresh.js`, trả lời và mình sẽ bổ sung.
