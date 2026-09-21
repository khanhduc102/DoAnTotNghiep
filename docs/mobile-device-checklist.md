# DucHome — Checklist kiểm thử Mobile trên thiết bị thật

Dùng để xác nhận luồng xác thực trên **Android** và **iPhone** thật qua Expo Go. Tick từng ô và ghi PASS / FAIL / BLOCKED vào bảng kết quả ở cuối file.

- Phạm vi: 12 test case của Task Authentication.
- Thời gian: khoảng 20 phút cho mỗi thiết bị.
- Cần có: điện thoại, máy tính chạy backend, Postman (dùng cho TC-10, 11, 12).

---

## 0. Chuẩn bị (bắt buộc làm trước)

| # | Việc cần làm | Cách kiểm tra | ✓ |
|---|---|---|---|
| P1 | Bật MySQL và backend (`cd backend`, rồi `npm run dev`) | Trên máy tính mở `http://localhost:4000/health` thấy `DUCHOME API dang chay` | ☐ |
| P2 | Điện thoại bắt Wi-Fi **cùng router** với máy tính. Máy tính đang cắm dây mạng (card Ethernet `192.168.1.2`), nên Wi-Fi của điện thoại phải phát ra từ chính router đó, **không dùng mạng Guest** | Điện thoại: Cài đặt → Wi-Fi → xem IP có dạng `192.168.1.x` | ☐ |
| P3 | Điện thoại kết nối được tới backend | Mở **trình duyệt trên điện thoại**, vào `http://192.168.1.2:4000/health`, thấy `DUCHOME API dang chay` | ☐ |
| P4 | `mobile/.env` đúng IP | Có dòng `EXPO_PUBLIC_API_URL=http://192.168.1.2:4000/api`. Nếu IP máy tính đổi thì sửa dòng này | ☐ |
| P5 | Cài **Expo Go** bản mới nhất, hỗ trợ **SDK 57** | Nếu Expo Go báo *"Project is incompatible"* thì cập nhật Expo Go | ☐ |
| P6 | Chạy Expo **có xóa cache** (bắt buộc sau mỗi lần sửa `.env`) | `cd mobile`, rồi `npx expo start -c` | ☐ |
| P7 | Mở app | **Android:** Expo Go → *Scan QR code*. **iPhone:** mở app Camera và quét QR | ☐ |
| P8 | **Chỉ iPhone:** cho phép truy cập mạng cục bộ | Khi iOS hỏi *"Expo Go muốn tìm thiết bị trên mạng cục bộ"*, chọn **Cho phép**. Lỡ từ chối thì vào Cài đặt → Expo Go → bật *Mạng cục bộ* | ☐ |

**Nếu P3 thất bại:** mọi test case phía sau đều **BLOCKED**. Xem mục 5.3 của `testing-auth.md`. Nguyên nhân thường gặp: khác mạng, mạng Guest bị cách ly thiết bị, hoặc firewall chặn.

**Đã kiểm tra sẵn trên máy tính:** backend trả lời qua `192.168.1.2`; Expo tự chọn đúng IP `192.168.1.2` (card Ethernet) để in vào mã QR, không chọn nhầm card VirtualBox `192.168.56.1`; firewall đã có rule cho phép Node.js ở cả mạng Private và Public.

---

## 1. Tài khoản dùng khi test

| Mục đích | Email | Mật khẩu |
|---|---|---|
| Đăng ký mới TENANT (TC-01) | `dt.tenant01@duchome.vn` | `123456` |
| Đăng ký mới OWNER (TC-02) | `dt.owner01@duchome.vn` | `123456` |
| Đăng nhập TENANT | `tenant1@duchome.vn` | `123456` |
| Đăng nhập OWNER | `owner1@duchome.vn` | `123456` |
| ADMIN | `admin@duchome.vn` | `123456` |

Khi test thiết bị thứ hai, đổi số trong email đăng ký (`dt.tenant02`, `dt.owner02`) để không bị báo trùng email.

> **Không dùng `tenant1` / `owner1` cho TC-09, TC-10.** Logout thu hồi token trên **mọi thiết bị**, nên sẽ làm mất phiên của các tài khoản mẫu ở những nơi khác. Các test logout dùng tài khoản vừa đăng ký.

---

## 2. Test case

### TC-01 · Đăng ký TENANT
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Màn Đăng nhập → bấm **Đăng ký** | Màn *Tạo tài khoản*, ô **Tôi muốn thuê** được chọn sẵn | ☐ |
| 2 | Bấm **Tạo tài khoản** khi chưa nhập gì | Lỗi hiện **dưới từng ô**: họ tên, email, mật khẩu | ☐ |
| 3 | Nhập mật khẩu `123456`, ô nhập lại `654321` | Dưới ô *Nhập lại mật khẩu*: *"Mật khẩu nhập lại không khớp"* | ☐ |
| 4 | Điền đúng: `Khách Thử`, `dt.tenant01@duchome.vn`, bỏ trống số điện thoại, mật khẩu `123456` hai lần → **Tạo tài khoản** | Vào thẳng **Trang chủ khách thuê**, badge *Khách thuê*, 4 ô số liệu đều bằng 0 | ☐ |

### TC-02 · Đăng ký OWNER
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Nếu đang ở Trang chủ thì **Đăng xuất** → **Đăng ký** | Màn *Tạo tài khoản* | ☐ |
| 2 | Chọn **Tôi cho thuê** | Ô *Tôi cho thuê* đổi sang viền xanh | ☐ |
| 3 | Nhập số điện thoại `123` và các trường khác hợp lệ → **Tạo tài khoản** | Dưới ô số điện thoại: *"So dien thoai khong hop le"* | ☐ |
| 4 | Sửa số điện thoại thành một số 10 chữ số, bắt đầu bằng 0 và chưa ai dùng (email `dt.owner01@duchome.vn`) → **Tạo tài khoản** | Vào **Trang chủ chủ trọ**, badge *Chủ trọ*, 6 ô số liệu | ☐ |
| 5 | Đăng xuất, đăng ký lại bằng đúng email `dt.owner01@duchome.vn` | Banner đỏ: *"Email da duoc su dung"* | ☐ |

### TC-03 · Đăng nhập TENANT
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | `tenant1@duchome.vn` / mật khẩu sai `111111` | Banner đỏ *"Email hoac mat khau khong dung"*, vẫn ở màn Đăng nhập | ☐ |
| 2 | `tenant1@duchome.vn` / `123456` | Nút hiện vòng xoay, sau đó vào **Trang chủ khách thuê**, tên *Le Minh Duc* | ☐ |
| 3 | Kéo màn hình xuống | Vòng xoay làm mới xuất hiện, số liệu tải lại, không báo lỗi | ☐ |

### TC-04 · Đăng nhập OWNER
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Đăng xuất → `owner1@duchome.vn` / `123456` | Vào **Trang chủ chủ trọ**, tên *Nguyen Van Chu*, tiêu đề *Quản lý cho thuê* | ☐ |
| 2 | Kiểm tra màn hình | 6 ô: tổng phòng, phòng trống, đang cho thuê, yêu cầu chờ, nhà trọ, hợp đồng | ☐ |

### TC-05 · ADMIN đăng nhập trên mobile bị từ chối
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Đăng xuất → `admin@duchome.vn` / `123456` | Banner đỏ *"Tài khoản quản trị vui lòng đăng nhập trên trang web quản trị."*, **vẫn ở màn Đăng nhập** | ☐ |
| 2 | Đóng hẳn app rồi mở lại (cách đóng xem TC-07) | Vẫn ở màn Đăng nhập, **không** tự vào trong. Điều này chứng minh token ADMIN không được lưu | ☐ |

### TC-06 · Token được lưu
SecureStore được mã hóa trong Keychain/Keystore nên không mở ra xem trực tiếp được. Test này kiểm chứng **gián tiếp**: token còn trong máy thì app tự đăng nhập được.
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Đăng nhập `dt.tenant01@duchome.vn` | Vào Trang chủ khách thuê | ☐ |
| 2 | Làm tiếp TC-07 và TC-08. Nếu hai test đó PASS thì TC-06 PASS | — | ☐ |

### TC-07 · Đóng app và mở lại
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Đang ở Trang chủ, **đóng hẳn Expo Go**. Android: mở danh sách ứng dụng gần đây, vuốt Expo Go đi. iPhone: vuốt lên từ đáy màn hình, vuốt Expo Go lên trên | Expo Go biến mất khỏi danh sách đa nhiệm | ☐ |
| 2 | Mở lại Expo Go → chọn dự án ở mục *Recently opened* (hoặc quét lại QR) | App khởi động, thấy vòng xoay trong chốc lát | ☐ |

### TC-08 · Tự động đăng nhập
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Ngay sau TC-07 | Vào thẳng **Trang chủ khách thuê** của `dt.tenant01`, **không** qua màn Đăng nhập | ☐ |
| 2 | *(Mở rộng)* Trên máy tính, **tắt backend** (`Ctrl + C` ở terminal backend). **Giữ nguyên** terminal `npx expo start` → đóng hẳn app → mở lại | Hiện màn Đăng nhập. Hành vi này đúng thiết kế: không hỏi được server nên chưa vào, **nhưng vẫn giữ token** | ☐ |
| 3 | Bật lại backend (`npm run dev`) → đóng hẳn app → mở lại | Tự vào lại Trang chủ. Điều này chứng minh token không bị xóa khi server tạm không truy cập được | ☐ |

> Không dùng Chế độ máy bay cho bước 2: Expo Go phải tải mã app từ máy tính qua mạng LAN, mất mạng thì app không mở được, và kết quả sẽ không phản ánh logic đăng nhập.

### TC-09 · Logout
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | Đang ở Trang chủ của `dt.tenant01` → **Đăng xuất** | Nút hiện vòng xoay, sau đó về **màn Đăng nhập** | ☐ |
| 2 | Đóng hẳn app → mở lại | Vẫn ở màn Đăng nhập, không tự vào. Token đã bị xóa khỏi máy | ☐ |

### TC-10 · Token cũ sau logout không dùng được
App không hiển thị token, nên dùng Postman làm "thiết bị thứ hai" cùng tài khoản.
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | **Điện thoại:** đăng nhập `dt.tenant01@duchome.vn` | Vào Trang chủ | ☐ |
| 2 | **Postman:** `POST http://localhost:4000/api/auth/login` với body `{"email":"dt.tenant01@duchome.vn","password":"123456"}`, copy `data.token` | 200, có token (gọi là token P) | ☐ |
| 3 | **Postman:** `GET /api/auth/me`, header `Authorization: Bearer <token P>` | 200 | ☐ |
| 4 | **Điện thoại:** bấm **Đăng xuất** | Về màn Đăng nhập | ☐ |
| 5 | **Postman:** gửi lại request ở bước 3 | **401** *"Phien dang nhap da ket thuc, vui long dang nhap lai"*. Điều này chứng minh logout trên điện thoại đã thu hồi token ở server | ☐ |
| 6 | *(Chiều ngược lại)* **Điện thoại:** đăng nhập lại. **Postman:** đăng nhập lấy token mới, gọi `POST /api/auth/logout` bằng token đó. **Điện thoại:** kéo màn hình để làm mới | Điện thoại tự quay về màn Đăng nhập, vì token trên máy đã bị thu hồi | ☐ |

### TC-11 · TENANT không gọi được API OWNER
Có hai lớp chặn: app không có đường dẫn tới màn hình OWNER, và server trả 403.
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | **Điện thoại:** đăng nhập `tenant1`, tìm trên màn hình, vuốt từ mép trái, bấm Back | Không có nút hay đường nào dẫn tới màn chủ trọ. Trên Android, Back ở màn hình gốc sẽ **ẩn/thoát app**; hành vi này bình thường, chỉ cần Back **không mở** màn Đăng nhập hay màn chủ trọ | ☐ |
| 2 | **Postman:** đăng nhập `tenant1@duchome.vn`, lấy token | 200 | ☐ |
| 3 | **Postman:** `GET /api/owner/dashboard` với token TENANT | **403** *"Ban khong co quyen truy cap chuc nang nay"* | ☐ |

### TC-12 · OWNER không gọi được API ADMIN
| Bước | Thao tác | Kết quả mong đợi | ✓ |
|---|---|---|---|
| 1 | **Điện thoại:** đăng nhập `owner1` | Chỉ có Trang chủ chủ trọ, không có chức năng quản trị | ☐ |
| 2 | **Postman:** đăng nhập `owner1@duchome.vn`, lấy token → `GET /api/admin/dashboard` | **403** *"Ban khong co quyen truy cap chuc nang nay"* | ☐ |

Có thể chạy nhanh bước Postman của TC-11 và TC-12 bằng thư mục **3. Phan quyen** trong collection `docs/postman/DucHome-Auth.postman_collection.json`.

---

## 3. Bảng kết quả

Ghi **PASS**, **FAIL** hoặc **BLOCKED** (không chạy được vì lỗi môi trường, ví dụ P3 thất bại).

| TC | Nội dung | Android | iPhone | Ghi chú |
|---|---|---|---|---|
| 01 | Đăng ký TENANT | | | |
| 02 | Đăng ký OWNER | | | |
| 03 | Đăng nhập TENANT | | | |
| 04 | Đăng nhập OWNER | | | |
| 05 | ADMIN bị từ chối trên mobile | | | |
| 06 | Token được lưu | | | |
| 07 | Đóng app và mở lại | | | |
| 08 | Tự động đăng nhập | | | |
| 09 | Logout | | | |
| 10 | Token cũ sau logout không dùng được | | | |
| 11 | TENANT không gọi được API OWNER | | | |
| 12 | OWNER không gọi được API ADMIN | | | |

Thông tin thiết bị: Android `__________` (bản Android `____`) · iPhone `__________` (bản iOS `____`) · Expo Go `____`

---

## 4. Khi có test case FAIL

Gửi lại cho người sửa lỗi 4 thứ:
1. Mã test case và **bước** bị lỗi
2. **Ảnh chụp màn hình** điện thoại
3. **Log trong terminal** đang chạy `npx expo start` (lỗi JavaScript của app hiện ở đây)
4. **Log trong terminal** đang chạy backend (dòng request tương ứng, ví dụ `POST /api/auth/login 401`)

Các triệu chứng thường gặp:

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| *"Không kết nối được máy chủ"* sau khoảng 10 giây | Sai IP trong `.env`, khác mạng Wi-Fi, firewall, hoặc sửa `.env` nhưng chưa chạy `npx expo start -c` |
| Quét QR xong Expo Go quay mãi, không tải được app | Điện thoại không tới được cổng 8081 của máy tính: khác mạng, hoặc mạng Guest |
| Chỉ iPhone không kết nối được, Android thì được | Chưa cho Expo Go quyền *Mạng cục bộ* (P8) |
| *"Project is incompatible with this version of Expo Go"* | Expo Go cũ, cần cập nhật (P5) |

---

## 5. Dọn dữ liệu sau khi test

Chạy trong MySQL Workbench:
```sql
DELETE FROM users WHERE email LIKE 'dt.%@duchome.vn';
```
