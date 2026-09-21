# DUCHOME — Đặc tả REST API

> **Cách đọc tài liệu này:** ✅ là endpoint đã viết và kiểm thử xong, ⬜ là endpoint dự kiến theo lộ trình.
> Đừng gọi các endpoint ⬜ từ mobile hay admin — chúng chưa tồn tại.

**Base URL:** `http://localhost:4000/api`
**Phiên bản:** cập nhật tuần 2 (Task 2A). Xác thực dùng một JWT hạn 7 ngày, đã bỏ refresh token. 5 endpoint xác thực hoạt động, kiểm thử bằng `npm test` trong `backend/`.

---

## 1. Quy ước chung

### 1.1. Định dạng phản hồi

Mọi endpoint đều trả về cùng một cấu trúc.

Thành công:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": { }
}
```

Thất bại:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "email", "message": "Email không hợp lệ" }
  ]
}
```

Trường `errors` chỉ xuất hiện khi lỗi gắn với từng trường cụ thể (thường là lỗi 400 do validate).

### 1.2. Danh sách có phân trang

Các endpoint trả danh sách dùng chung khuôn:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "items": [],
    "pagination": { "page": 1, "limit": 10, "total": 57, "totalPages": 6 }
  }
}
```

Tham số truy vấn dùng chung: `?page=1&limit=10`.

### 1.3. Xác thực

Các endpoint cần đăng nhập phải gửi kèm header:

```
Authorization: Bearer <token>
```

Mỗi lần đăng ký hoặc đăng nhập, server cấp **một JWT duy nhất, hạn 7 ngày**, payload gồm `{ id, role }`. Hệ thống **không có refresh token**. Khi token hết hạn, server trả 401 kèm thông điệp *"Phien dang nhap da het han, vui long dang nhap lai"*, client xóa token và đưa người dùng về màn hình đăng nhập (web admin làm việc này trong `admin/src/api/client.js`).

Mỗi request, middleware `authenticate` đọc lại user trong DB. Vì vậy tài khoản bị ADMIN khóa sẽ bị chặn 403 **ngay lập tức**, kể cả khi token của họ vẫn còn hạn.

### 1.4. Bảng mã trạng thái

| Mã | Khi nào gặp |
|---|---|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu gửi lên không hợp lệ |
| 401 | Chưa đăng nhập, token sai hoặc hết hạn |
| 403 | Đã đăng nhập nhưng không đủ quyền, hoặc tài khoản bị khóa |
| 404 | Không tìm thấy dữ liệu |
| 409 | Trùng dữ liệu (email, số điện thoại, mã phòng…) |
| 500 | Lỗi ngoài dự tính của server |

### 1.5. Ký hiệu quyền truy cập

| Ký hiệu | Nghĩa |
|---|---|
| — | Không cần đăng nhập |
| 🔒 | Cần đăng nhập, mọi role |
| 👤 TENANT | Chỉ khách thuê |
| 🏠 OWNER | Chỉ chủ trọ |
| ⚙️ ADMIN | Chỉ quản trị viên |

---

## 2. Xác thực — `/auth` ✅ ĐÃ HOÀN THÀNH

### 2.1. ✅ Đăng ký

```
POST /api/auth/register
```
Quyền: —

Body:
```json
{
  "email": "tenant@duchome.vn",
  "password": "123456",
  "fullName": "Lê Minh Đức",
  "phone": "0912345678",
  "role": "TENANT"
}
```

| Trường | Bắt buộc | Ràng buộc |
|---|---|---|
| email | Có | Đúng định dạng email, tự chuyển về chữ thường |
| password | Có | 6–50 ký tự |
| fullName | Có | 2–120 ký tự |
| phone | Không | `0xxxxxxxxx` (10 số) hoặc `+84xxxxxxxxx` |
| role | Không | `OWNER` hoặc `TENANT`, mặc định `TENANT` |

Phản hồi `201`:
```json
{
  "success": true,
  "message": "Dang ky thanh cong",
  "data": {
    "user": { "id": 7, "email": "tenant@duchome.vn", "fullName": "Lê Minh Đức", "role": "TENANT", "status": "ACTIVE" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Lỗi: `409` email hoặc số điện thoại đã dùng · `400` dữ liệu sai định dạng.

> **Không thể đăng ký tài khoản ADMIN qua API này.** Truyền `role: "ADMIN"` sẽ bị chặn 400. Tài khoản quản trị chỉ tạo bằng script seed.

### 2.2. ✅ Đăng nhập

```
POST /api/auth/login
```
Quyền: —

Body: `{ "email": "...", "password": "..." }`

Phản hồi `200`: cấu trúc `{ user, token }` giống mục 2.1.

Lỗi: `401` sai email hoặc mật khẩu · `403` tài khoản bị khóa.

> Sai mật khẩu và email không tồn tại đều trả về **cùng một thông điệp** *"Email hoac mat khau khong dung"*. Đây là chủ ý: nếu phân biệt hai trường hợp, kẻ tấn công có thể dò xem email nào đã đăng ký trong hệ thống.

### 2.3. Đã bỏ: làm mới token

`POST /api/auth/refresh` đã bị gỡ ở tuần 2 theo spec Task 2A, gọi vào sẽ nhận 404. Hết hạn token thì đăng nhập lại.

### 2.4. ✅ Xem hồ sơ cá nhân

```
GET /api/auth/me
```
Quyền: 🔒

Phản hồi `200`:
```json
{
  "data": {
    "id": 1, "email": "admin@duchome.vn", "phone": "0900000001",
    "fullName": "Quản trị hệ thống", "avatar": null,
    "role": "ADMIN", "status": "ACTIVE", "createdAt": "2026-09-20T15:48:00.000Z"
  }
}
```

Trường `password` không bao giờ nằm trong phản hồi của bất kỳ endpoint nào.

### 2.5. ✅ Cập nhật hồ sơ

```
PUT /api/auth/me
```
Quyền: 🔒

Body (gửi ít nhất một trường): `{ "fullName": "...", "phone": "...", "avatar": "..." }`

Lỗi: `400` không gửi trường nào, hoặc số điện thoại sai định dạng · `409` số điện thoại đã thuộc về người khác.

Không đổi được `email` và `role` qua endpoint này.

### 2.6. ✅ Đổi mật khẩu

```
PUT /api/auth/change-password
```
Quyền: 🔒

Body: `{ "currentPassword": "123456", "newPassword": "matkhaumoi" }`

Lỗi: `400` mật khẩu hiện tại sai, hoặc mật khẩu mới trùng mật khẩu cũ.

---

## 3. Nhà trọ — `/properties` ⬜ Tuần 2

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/properties` | 🏠 OWNER | Tạo nhà trọ mới |
| GET | `/properties` | 🏠 OWNER | Danh sách nhà trọ của chính mình |
| GET | `/properties/:id` | 🔒 | Chi tiết, kèm danh sách phòng |
| PUT | `/properties/:id` | 🏠 OWNER | Sửa thông tin, chỉ chủ sở hữu |
| DELETE | `/properties/:id` | 🏠 OWNER | Xóa, chặn nếu còn phòng đang cho thuê |
| GET | `/properties/:id/service-fees` | 🔒 | Danh sách phí dịch vụ |
| POST | `/properties/:id/service-fees` | 🏠 OWNER | Thêm phí dịch vụ |
| DELETE | `/service-fees/:id` | 🏠 OWNER | Xóa phí dịch vụ |

Body tạo nhà trọ:
```json
{
  "name": "Nhà trọ Đức Home 1",
  "address": "123 Nguyễn Văn Cừ",
  "province": "Cần Thơ", "district": "Ninh Kiều", "ward": "An Khánh",
  "electricPrice": 3500, "waterPrice": 15000
}
```

> Mọi endpoint sửa/xóa đều phải kiểm tra `property.ownerId === req.user.id`, nếu không trả 403. Đây là ràng buộc bảo mật quan trọng nhất của module này.

## 4. Phòng — `/rooms` ⬜ Tuần 2

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/rooms` | 🏠 OWNER | Tạo phòng trong nhà trọ của mình |
| GET | `/rooms` | 🏠 OWNER | Danh sách phòng, lọc theo `propertyId`, `status` |
| GET | `/rooms/:id` | 🔒 | Chi tiết kèm ảnh và tiện ích |
| PUT | `/rooms/:id` | 🏠 OWNER | Sửa thông tin phòng |
| DELETE | `/rooms/:id` | 🏠 OWNER | Xóa, chặn nếu đang có hợp đồng ACTIVE |
| PUT | `/rooms/:id/amenities` | 🏠 OWNER | Gán lại toàn bộ tiện ích, body `{ "amenityIds": [1,3,5] }` |
| POST | `/rooms/:id/images` | 🏠 OWNER | Tải ảnh lên, `multipart/form-data` |
| DELETE | `/rooms/:roomId/images/:imageId` | 🏠 OWNER | Xóa một ảnh |

Body tạo phòng:
```json
{
  "propertyId": 1, "code": "P101", "area": 25.5,
  "price": 2500000, "deposit": 2500000, "maxOccupants": 2,
  "description": "Phòng có gác lửng, cửa sổ hướng Đông"
}
```

Lỗi riêng: `409` mã phòng đã tồn tại trong cùng nhà trọ.

## 5. Tải ảnh ⬜ Tuần 2

```
POST /api/rooms/:id/images
Content-Type: multipart/form-data
```
Quyền: 🏠 OWNER

| Quy định | Giá trị |
|---|---|
| Tên field | `images` (cho phép nhiều file một lần) |
| Định dạng | `.jpg`, `.jpeg`, `.png`, `.webp` |
| Dung lượng tối đa | 5 MB mỗi file (`MAX_FILE_SIZE_MB` trong `.env`) |
| Số ảnh tối đa | 10 ảnh mỗi phòng |
| Nơi lưu | `backend/uploads/`, đặt tên ngẫu nhiên tránh trùng |
| Đường dẫn trả về | `/uploads/<tên-file>` |

Ảnh được phục vụ tĩnh tại `http://localhost:4000/uploads/<tên-file>` (đã cấu hình sẵn trong `backend/src/app.js`).

## 6. Tiện ích — `/amenities` ⬜ Tuần 2

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/amenities` | — | Toàn bộ danh mục tiện ích |
| POST | `/amenities` | ⚙️ ADMIN | Thêm tiện ích |
| PUT | `/amenities/:id` | ⚙️ ADMIN | Sửa |
| DELETE | `/amenities/:id` | ⚙️ ADMIN | Xóa |

Seed đã tạo sẵn 12 tiện ích mẫu.

## 7. Tin đăng — `/posts` ⬜ Tuần 3

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/posts` | 🏠 OWNER | Đăng tin, trạng thái khởi tạo `PENDING` |
| GET | `/posts/my` | 🏠 OWNER | Tin đăng của chính mình, mọi trạng thái |
| PUT | `/posts/:id` | 🏠 OWNER | Sửa tin, tin đã duyệt sẽ quay về `PENDING` |
| DELETE | `/posts/:id` | 🏠 OWNER | Xóa tin |
| GET | `/posts/pending` | ⚙️ ADMIN | Hàng chờ duyệt |
| PUT | `/posts/:id/approve` | ⚙️ ADMIN | Duyệt, ghi `publishedAt` và `reviewedById` |
| PUT | `/posts/:id/reject` | ⚙️ ADMIN | Từ chối, body `{ "rejectReason": "..." }` |

## 8. Tìm kiếm — `/search` ⬜ Tuần 3

```
GET /api/search/posts
```
Quyền: — (khách vãng lai xem được)

| Tham số | Kiểu | Ý nghĩa |
|---|---|---|
| `keyword` | string | Tìm trong tiêu đề và mô tả |
| `province`, `district`, `ward` | string | Lọc theo khu vực |
| `minPrice`, `maxPrice` | number | Khoảng giá (VND) |
| `minArea`, `maxArea` | number | Khoảng diện tích (m²) |
| `amenityIds` | string | Danh sách id ngăn bởi dấu phẩy, VD `1,3,5` |
| `sortBy` | string | `newest` \| `priceAsc` \| `priceDesc` |
| `page`, `limit` | number | Phân trang |

Chỉ trả về tin có `status = APPROVED` và phòng có `status = AVAILABLE`.

```
GET /api/search/posts/:id
```
Chi tiết tin đăng, đồng thời tăng `viewCount` thêm 1.

## 9. Yêu cầu thuê — `/rental-requests` ⬜ Tuần 5

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/rental-requests` | 👤 TENANT | Gửi yêu cầu thuê một phòng |
| GET | `/rental-requests/my` | 👤 TENANT | Yêu cầu tôi đã gửi |
| PUT | `/rental-requests/:id/cancel` | 👤 TENANT | Tự hủy khi còn `PENDING` |
| GET | `/rental-requests/received` | 🏠 OWNER | Yêu cầu gửi tới phòng của tôi |
| PUT | `/rental-requests/:id/approve` | 🏠 OWNER | Chấp nhận |
| PUT | `/rental-requests/:id/reject` | 🏠 OWNER | Từ chối, kèm `ownerReply` |

Quy tắc nghiệp vụ:
- Chỉ gửi được yêu cầu tới phòng đang `AVAILABLE`.
- Một khách không được gửi hai yêu cầu `PENDING` cho cùng một phòng.
- Duyệt yêu cầu **không** tự tạo hợp đồng — chủ trọ tạo hợp đồng ở bước riêng, vì còn phải thỏa thuận ngày bắt đầu và tiền cọc.

## 10. Hợp đồng — `/contracts` ⬜ Tuần 5

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/contracts` | 🏠 OWNER | Tạo hợp đồng, phòng chuyển sang `RENTED` |
| GET | `/contracts` | 🏠 OWNER | Hợp đồng của các phòng tôi quản lý |
| GET | `/contracts/my` | 👤 TENANT | Hợp đồng của tôi |
| GET | `/contracts/:id` | 🔒 | Chi tiết, chỉ bên thuê, bên cho thuê hoặc ADMIN xem được |
| PUT | `/contracts/:id/terminate` | 🏠 OWNER | Chấm dứt trước hạn, phòng về `AVAILABLE` |

Khi tạo hợp đồng, server tự sinh `code` và **sao chép** `rooms.price` sang `contracts.price` để cố định giá đã ký.

## 11. Chốt số điện nước — `/meter-readings` ⬜ Tuần 6

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/meter-readings` | 🏠 OWNER | Nhập chỉ số tháng này |
| GET | `/meter-readings` | 🏠 OWNER | Lịch sử, lọc theo `contractId` |
| PUT | `/meter-readings/:id` | 🏠 OWNER | Sửa, chặn nếu đã xuất hóa đơn |

Body:
```json
{ "contractId": 1, "month": 9, "year": 2026, "electricOld": 1200, "electricNew": 1285, "waterOld": 45, "waterNew": 52 }
```

Kiểm tra bắt buộc: chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ, và mỗi hợp đồng chỉ chốt một lần cho mỗi tháng.

> Tiện lợi cho người dùng: khi nhập kỳ mới, server nên tự điền `electricOld` bằng `electricNew` của kỳ trước.

## 12. Hóa đơn — `/invoices` ⬜ Tuần 6

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/invoices/generate` | 🏠 OWNER | Sinh hóa đơn từ một bản chốt số |
| GET | `/invoices` | 🏠 OWNER | Hóa đơn của các phòng tôi quản lý |
| GET | `/invoices/my` | 👤 TENANT | Hóa đơn của tôi |
| GET | `/invoices/:id` | 🔒 | Chi tiết |
| PUT | `/invoices/:id/pay` | 🏠 OWNER | Đánh dấu đã thu tiền |

Công thức tính:

```
electricUsage  = electricNew - electricOld
electricAmount = electricUsage × properties.electricPrice
waterUsage     = waterNew - waterOld
waterAmount    = waterUsage × properties.waterPrice
serviceAmount  = tổng service_fees của nhà trọ
totalAmount    = contracts.price + electricAmount + waterAmount + serviceAmount
```

Đơn giá điện nước được **chép vào hóa đơn** tại thời điểm lập. Chủ trọ tăng giá về sau không làm thay đổi hóa đơn đã phát hành.

## 13. Thống kê — `/stats` ⬜ Tuần 8

| Method | Endpoint | Quyền | Nội dung |
|---|---|---|---|
| GET | `/stats/owner` | 🏠 OWNER | Tổng số phòng, số phòng trống, số đang thuê, doanh thu tháng, số hóa đơn chưa thu |
| GET | `/stats/owner/revenue` | 🏠 OWNER | Doanh thu 12 tháng gần nhất, dựng biểu đồ |
| GET | `/stats/admin` | ⚙️ ADMIN | Tổng người dùng theo role, tổng phòng, tin chờ duyệt, hợp đồng đang hiệu lực |

## 14. Quản trị người dùng — `/admin/users` ⬜ Tuần 8

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/admin/users` | ⚙️ ADMIN | Danh sách, lọc theo `role`, `status`, `keyword` |
| GET | `/admin/users/:id` | ⚙️ ADMIN | Chi tiết |
| PUT | `/admin/users/:id/lock` | ⚙️ ADMIN | Khóa tài khoản |
| PUT | `/admin/users/:id/unlock` | ⚙️ ADMIN | Mở khóa |

Tài khoản bị khóa vẫn đăng nhập được nhưng nhận 403 ở mọi endpoint cần xác thực — middleware `authenticate` kiểm tra `status` ở mỗi request.

---

## 15. Tài khoản dùng để thử API

Mật khẩu chung: `123456`

| Email | Vai trò |
|---|---|
| `admin@duchome.vn` | ADMIN |
| `owner1@duchome.vn` | OWNER |
| `owner2@duchome.vn` | OWNER |
| `tenant1@duchome.vn` | TENANT |
| `tenant2@duchome.vn` | TENANT |
| `tenant3@duchome.vn` | TENANT |

## 16. Thử nhanh bằng curl

Đăng nhập và lấy token:
```bash
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@duchome.vn\",\"password\":\"123456\"}"
```

Gọi endpoint cần đăng nhập:
```bash
curl http://localhost:4000/api/auth/me -H "Authorization: Bearer <dán_token_vào_đây>"
```

Kiểm tra server còn sống:
```bash
curl http://localhost:4000/health
```
