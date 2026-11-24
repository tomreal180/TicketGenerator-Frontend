# Ứng Dụng Soát Vé Tết Karlsruhe 2027 🏮 (QR Ticket Scanner)

Ứng dụng web frontend hiện đại viết bằng **Vue 3 + TypeScript + Tailwind CSS** kết hợp với **Google Apps Script & Google Forms/Sheets** dùng để soát vé trong đêm hội Tết Karlsruhe 2027.

---

## 🌟 Cấu trúc 4 Phần Chính Theo Yêu Cầu

1. **Tab 1: Camera Quét Vé (QR Scanner)**
   - Sử dụng thư viện `html5-qrcode` quét camera trực tiếp mượt mà trên cả điện thoại (iOS / Android) và máy tính.
   - Hỗ trợ đổi Camera trước / sau, bật đèn Flash (Torch) khi quét trong điều kiện ánh sáng yếu của hội trường.
   - Có khung quét hiệu ứng viền vàng Tết và tia laser quét động.
   - Hỗ trợ tải ảnh mã QR lên (fallback) và **3 nút test nhanh** (Vé hợp lệ, Vé đã check-in, Vé sai mã) để người dùng thử nghiệm ngay mà không cần in vé giấy.

2. **Tab 2: Soát Vé Thủ Công (Manual Check-in)**
   - Dành cho trường hợp khách mất điện thoại, quên mã QR hoặc camera bị lóa.
   - Cho phép người soát vé nhập **Email** và **Ngày sinh** để đối soát dữ liệu với danh sách đăng ký.
   - Có nút điền mẫu thử nghiệm nhanh và gợi ý đuôi email (@gmail.com, @student.kit.edu).

3. **Phần Hiển Thị Kết Quả Check-in (Google Apps Script Response Card)**
   - Nằm ngay bên dưới phần Camera và Form Soát vé thủ công.
   - Hiển thị trực quan phản hồi từ Google Apps Script:
     - ✅ **Check-in thành công (Hợp lệ)**: Bắn pháo hoa Confetti, phát âm thanh chúc mừng, hiện Tên khách, Loại vé (VIP, SV, TC,...), Bàn/Ghế ngồi, Giờ check-in và nút hủy check-in nếu lỡ bấm nhầm.
     - ⚠️ **Đã Check-in trước đó**: Cảnh báo vé trùng, hiện rõ giờ check-in lần đầu và cổng nào đã duyệt để tránh gian lận 1 vé nhiều người vào.
     - ❌ **Vé không hợp lệ / Không tìm thấy**: Báo động âm thanh, hướng dẫn kiểm tra lại.

4. **Trang Bảng Soát Vé & Bộ Lọc Nhanh (Attendees Dashboard)**
   - **4 thẻ thống kê trực quan**: Tổng số vé đăng ký, Số người đã check-in (kèm thanh % tiến độ), Số người chưa đến, Số khách VIP đã có mặt.
   - **Bộ lọc nhanh (Quick Filters)**:
     - Lọc theo trạng thái: Tất cả / Đã check-in / Chưa đến.
     - Lọc theo Hạng vé: VIP, Sinh viên, Tiêu chuẩn, Trẻ em, Ban tổ chức.
     - Thanh tìm kiếm tức thì theo Họ tên, Email, Mã vé (#TET-...), Số điện thoại, Số bàn tiệc.
   - Bảng hiển thị thông tin chi tiết trên máy tính và dạng Thẻ (Cards) tối ưu trên điện thoại.
   - Nút thao tác **Check-in / Hủy trực tiếp** ngay trên từng hàng.
   - Nút **Xuất CSV** để tải danh sách đã soát vé ra Excel lưu trữ.

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### 1. Khởi động môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:5173`

### 2. Build ứng dụng sản xuất (Production Build)
```bash
npm run build
```

---

## 🔗 Kết Nối Google Apps Script Backend

Mã backend và hướng dẫn tích hợp chi tiết đã được viết sẵn trong thư mục `backend/`:
- `backend/Code.gs`: Mã nguồn Google Apps Script sẵn sàng triển khai (API doGet/doPost, tự động cấp mã vé, gửi email kèm mã QR khi có người điền Google Form).
- `backend/HUONG_DAN_CAI_DAT.md`: Hướng dẫn từng bước từ Google Form -> Google Sheet -> Apps Script Web App URL -> Dán vào app VueJS.
