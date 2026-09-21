# DucHome — Hướng dẫn kiểm thử Xác thực & Phân quyền

Tài liệu bàn giao cuối tuần 2. Mô tả chi tiết từng API nằm ở [`api.md`](api.md) mục 2 và 3.

---

## 1. Danh sách API

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | — | Đăng ký, chỉ nhận `TENANT` hoặc `OWNER` |
| POST | `/api/auth/login` | — | Đăng nhập, trả JWT hạn 7 ngày. Tài khoản `LOCKED` bị 403 |
| POST | `/api/auth/logout` | 🔒 | Đăng xuất, thu hồi mọi token của tài khoản |
| GET | `/api/auth/me` | 🔒 | Thông tin người đang đăng nhập |
| PUT | `/api/auth/me` | 🔒 | Sửa họ tên, số điện thoại, ảnh đại diện |
| PUT | `/api/auth/change-password` | 🔒 | Đổi mật khẩu |
| GET | `/api/tenant/dashboard` | 👤 TENANT | Tổng quan khách thuê |
| GET | `/api/owner/dashboard` | 🏠 OWNER | Tổng quan chủ trọ |
| GET | `/api/admin/dashboard` | ⚙️ ADMIN | Tổng quan hệ thống |

**Bảng phân quyền** (đã kiểm thử tự động cả 9 ô):

| Người gọi ↓ / Nhóm route → | `/api/tenant/*` | `/api/owner/*` | `/api/admin/*` |
|---|---|---|---|
| TENANT | ✅ 200 | ⛔ 403 | ⛔ 403 |
| OWNER | ⛔ 403 | ✅ 200 | ⛔ 403 |
| ADMIN | ⛔ 403 | ⛔ 403 | ✅ 200 |
| Không có token | 401 | 401 | 401 |

---

## 2. Tài khoản mẫu

Mật khẩu chung: **`123456`**. Tạo bằng `npm run seed` trong thư mục `backend/`.

| Email | Vai trò | Dùng ở |
|---|---|---|
| `admin@duchome.vn` | ADMIN | Web admin |
| `owner1@duchome.vn` | OWNER | Mobile |
| `owner2@duchome.vn` | OWNER | Mobile |
| `tenant1@duchome.vn` | TENANT | Mobile |
| `tenant2@duchome.vn` | TENANT | Mobile |
| `tenant3@duchome.vn` | TENANT | Mobile |

> Lưu ý khi demo: logout sẽ đăng xuất tài khoản đó **trên mọi thiết bị**. Nếu đang mở cùng một tài khoản ở hai nơi, đăng xuất một nơi thì nơi kia cũng phải đăng nhập lại.

---

## 3. Kiểm thử tự động (backend)

```bash
cd backend
npm test
```

41 case, chạy khoảng 2 giây, không cần bật server trước. Test tự tạo user riêng (email bắt đầu bằng `test_`) và tự xóa khi xong.

| File | Nội dung |
|---|---|
| `tests/auth.test.js` | Đăng ký, đăng nhập, `/me`, đăng xuất, `authorize` |
| `tests/role-access.test.js` | Ma trận 3×3 trên route thật, token đã logout, tài khoản bị khóa, nội dung dashboard |

---

## 4. Kiểm thử bằng Postman

### 4.1. Chuẩn bị
1. Bật MySQL.
2. Bật backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Kiểm tra: mở `http://localhost:4000/health` phải thấy `"DUCHOME API dang chay"`.

### 4.2. Import collection
1. Mở Postman → **Import** → chọn file `docs/postman/DucHome-Auth.postman_collection.json`.
2. Collection **DucHome - Authentication** xuất hiện với 4 thư mục, tổng 23 request.

Không cần tạo Environment. Các biến `baseUrl`, `password` và các token đều là biến của collection.

### 4.3. Chạy toàn bộ một lần
Chuột phải vào collection → **Run collection** → **Run DucHome - Authentication**. Kết quả mong đợi: **23/23 test passed**.

Thứ tự thư mục có ý nghĩa: thư mục 2 lưu token vào biến, thư mục 3 dùng lại các token đó. Vì vậy hãy chạy theo đúng thứ tự 1 → 4.

### 4.4. Chạy từng request bằng tay

| Thư mục | Kiểm tra |
|---|---|
| **1. Đăng ký** | Tạo TENANT mới (201); gửi `role: ADMIN` bị chặn (400); trùng email (409); dữ liệu sai trả lỗi theo từng trường (400) |
| **2. Đăng nhập** | Ba request đăng nhập **tự lưu token** vào `tenantToken`, `ownerToken`, `adminToken`; sai mật khẩu (401); `/auth/me` có và không có token |
| **3. Phân quyền** | 9 request tương ứng 9 ô của bảng phân quyền ở mục 1, cộng một request không có token |
| **4. Đăng xuất** | Đăng xuất user vừa đăng ký ở thư mục 1, sau đó dùng lại token cũ bị 401 *"Phien dang nhap da ket thuc"* |

Muốn xem token đang lưu: bấm vào collection → tab **Variables**.

Thư mục 4 cố ý đăng xuất **user vừa tạo** chứ không đăng xuất `tenant1`, để không làm mất phiên của tài khoản mẫu mà bạn có thể đang mở trên điện thoại.

### 4.5. Thử tài khoản bị khóa (thủ công)
Hiện chưa có API khóa tài khoản (dự kiến tuần 8), nên thao tác qua MySQL Workbench:
```sql
UPDATE users SET status = 'LOCKED' WHERE email = 'tenant2@duchome.vn';
```
- Đăng nhập `tenant2` → **403** *"Tai khoan da bi khoa"*
- Token lấy được trước khi khóa → gọi `/auth/me` cũng bị **403**

Mở khóa lại:
```sql
UPDATE users SET status = 'ACTIVE' WHERE email = 'tenant2@duchome.vn';
```

### 4.6. Dọn dữ liệu do Postman tạo
Mỗi lần chạy thư mục 1 sẽ tạo thêm một user có email dạng `postman<số>@duchome.vn`. Để xóa:
```sql
DELETE FROM users WHERE email LIKE 'postman%@duchome.vn';
```

---

## 5. Kiểm thử Mobile (Expo Go)

### 5.1. Chuẩn bị
1. Máy tính và điện thoại **cùng một mạng Wi-Fi**.
2. Cài app **Expo Go** trên điện thoại. Phiên bản Expo Go phải hỗ trợ **SDK 57**, nếu Expo Go báo không tương thích thì cập nhật app.
3. Lấy IP của máy tính: chạy `ipconfig`, xem dòng **IPv4 Address** của card Wi-Fi (hiện tại là `192.168.1.2`).
4. Mở `mobile/.env`, kiểm tra dòng:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.2:4000/api
   ```
   Nếu IP thay đổi (đổi mạng, khởi động lại router), sửa dòng này và **chạy lại Expo**.
5. Bật backend (`npm run dev` trong thư mục `backend/`).
6. Thử từ trình duyệt **trên điện thoại**: mở `http://192.168.1.2:4000/health`. Không mở được thì app cũng sẽ không kết nối được, xem mục 5.3.

### 5.2. Chạy app
```bash
cd mobile
npx expo start
```
Quét mã QR bằng Expo Go (Android) hoặc bằng app Camera (iOS).

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Mở app lần đầu | Màn Đăng nhập |
| 2 | Đăng nhập `tenant1@duchome.vn` | Vào **Trang chủ khách thuê**, 4 ô số liệu |
| 3 | Kéo xuống để làm mới | Số liệu tải lại |
| 4 | Tắt hẳn app rồi mở lại | Vào thẳng Trang chủ, không phải đăng nhập lại |
| 5 | Bấm **Đăng xuất** | Về màn Đăng nhập |
| 6 | Đăng nhập `owner1@duchome.vn` | Vào **Trang chủ chủ trọ**, 6 ô số liệu |
| 7 | Đăng nhập `admin@duchome.vn` | Bị từ chối: *"Tài khoản quản trị vui lòng đăng nhập trên trang web quản trị."* |
| 8 | Sai mật khẩu | Hiện thông báo lỗi màu đỏ |
| 9 | Đăng ký: chọn **Tôi cho thuê**, điền đủ thông tin | Vào thẳng Trang chủ chủ trọ |
| 10 | Đăng ký: email sai định dạng, mật khẩu 3 ký tự | Lỗi hiện **dưới từng ô nhập** |
| 11 | Đăng ký: nhập lại mật khẩu không khớp | Lỗi dưới ô *Nhập lại mật khẩu* |
| 12 | Đang đăng nhập trên điện thoại, dùng Postman gọi logout với cùng tài khoản, rồi kéo làm mới trên app | App tự đưa về màn Đăng nhập |

### 5.3. Không kết nối được máy chủ
App báo *"Không kết nối được máy chủ"* sau khoảng 10 giây khi:
- IP trong `mobile/.env` sai → kiểm tra lại bằng `ipconfig`.
- Điện thoại và máy tính khác mạng Wi-Fi.
- Windows Firewall chặn cổng 4000. Máy hiện đã có rule cho phép *Node.js JavaScript Runtime*. Nếu vẫn bị chặn, mở PowerShell **với quyền Administrator** và chạy:
  ```
  netsh advfirewall firewall add rule name="DucHome API 4000" dir=in action=allow protocol=TCP localport=4000
  ```
- Dùng Android Emulator thay cho điện thoại thật → đổi IP thành `10.0.2.2`.

---

## 6. Kiểm thử Web Admin

```bash
cd admin
npm run dev
```
Mở `http://localhost:5173`.

| # | Thao tác | Kết quả mong đợi |
|---|---|---|
| 1 | Vào `/` khi chưa đăng nhập | Chuyển về `/login` |
| 2 | Đăng nhập `tenant1@duchome.vn` | *"Tai khoan nay khong co quyen truy cap trang quan tri"* |
| 3 | Đăng nhập `admin@duchome.vn` | Dashboard với 6 ô số liệu |
| 4 | Bấm Đăng xuất | Về `/login`; token cũ bị server từ chối |
| 5 | DevTools → Console: `localStorage.setItem('token', '<token TENANT lấy từ Postman>')` rồi tải lại `/` | Bị đẩy về `/login`, token bị xóa |

---

## 7. Các vấn đề còn tồn tại

| # | Vấn đề | Mức độ | Ghi chú / hướng xử lý |
|---|---|---|---|
| 1 | **Mobile chưa được chạy trên điện thoại thật** | Cao | Mới kiểm chứng: build bundle Android thành công, URL API được nhúng đúng, backend nhận kết nối qua IP LAN. Cần chạy các bước ở mục 5.2 |
| 2 | Logout đăng xuất trên **mọi thiết bị** | Thấp | Là hệ quả có chủ đích của cơ chế `tokenVersion`. Muốn đăng xuất riêng từng thiết bị thì cần thêm bảng lưu phiên (sửa schema) |
| 3 | Đổi mật khẩu **không** thu hồi các phiên đang mở | Trung bình | Chỉ cần thêm `tokenVersion: { increment: 1 }` vào `changePassword`. Chưa làm vì ngoài phạm vi task |
| 4 | Chưa giới hạn số lần đăng nhập sai | Trung bình | Có thể bị dò mật khẩu. Cần thêm thư viện rate limit (ví dụ `express-rate-limit`) |
| 5 | Thông báo lỗi từ backend **không dấu**, giao diện mobile **có dấu** | Thấp | Trên app sẽ thấy lẫn hai kiểu. Nên thống nhất: hoặc Việt hóa có dấu toàn bộ backend, hoặc mobile tự dịch theo mã lỗi |
| 6 | Chưa có API khóa/mở tài khoản | Thấp | Đang khóa bằng SQL (mục 4.5). Đã có trong `api.md` mục 15, dự kiến tuần 8 |
| 7 | Chưa có quên mật khẩu | Thấp | Ngoài phạm vi task. Cần dịch vụ gửi email |
| 8 | Test chạy trên chính database `duchome` đang dev | Thấp | Dữ liệu test tự dọn. Muốn tách riêng thì tạo `duchome_test` |
| 9 | Web admin lưu token trong `localStorage` | Thấp | Nếu trang bị chèn script (XSS) thì token có thể bị đọc. Chấp nhận được với phạm vi đồ án |
| 10 | IP trong `mobile/.env` phải sửa tay mỗi khi đổi mạng | Thấp | Tiện lợi khi demo: đặt IP tĩnh cho máy tính trong router |
| 11 | `npm audit` báo lỗ hổng ở các gói phụ thuộc gián tiếp (backend, mobile) | Thấp | Phần lớn đến từ công cụ dev. Chưa xử lý vì `audit fix --force` sẽ nâng major version của Prisma |
