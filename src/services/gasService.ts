import { Attendee, CheckinResult, GasApiResponse, SearchTicketsResponse } from '../types/attendee';

/**
 * ==============================================================================
 * CẤU HÌNH GOOGLE APPS SCRIPT WEB APP URL
 * ==============================================================================
 * Thay thế URL bên dưới bằng URL Web App sau khi bạn Deploy (Triển khai) 
 * từ Google Apps Script (backend/Code.gs).
 * 
 * Các bước lấy URL:
 * 1. Mở dự án Google Apps Script (gắn với Google Sheet 'list')
 * 2. Chọn Triển khai (Deploy) > Triển khai mới (New deployment)
 * 3. Chọn loại: Ứng dụng web (Web app)
 * 4. Thực thi dưới dạng: Tôi (Execute as: Me)
 * 5. Ai có quyền truy cập: Bất kỳ ai (Who has access: Anyone)
 * 6. Copy URL (có dạng https://script.google.com/macros/s/.../exec) và dán vào đây:
 */
export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyMxpCgQqxj36K8B5B214RokWOCmHNmjFPAKArlY6Q01ewpw1hl6tLTZ6OZfxfcEdCo/exec';

const STORAGE_KEY_ATTENDEES = 'tet_karlsruhe_attendees_cache';
const STORAGE_KEY_VERIFIER = 'tet_karlsruhe_verifier_name';

export class GasService {
  public readonly gasUrl: string = GAS_WEB_APP_URL;
  private verifierName: string = 'Cổng Soát Vé 1';
  private cachedAttendees: Attendee[] = [];

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    if (typeof window === 'undefined') return;

    // Dọn dẹp các khóa cấu hình cũ từ giai đoạn Demo nếu có
    localStorage.removeItem('tet_karlsruhe_use_mock');
    localStorage.removeItem('tet_karlsruhe_gas_url');

    this.verifierName = localStorage.getItem(STORAGE_KEY_VERIFIER) || 'Cổng Soát Vé 1';

    const cached = localStorage.getItem(STORAGE_KEY_ATTENDEES);
    if (cached) {
      try {
        this.cachedAttendees = JSON.parse(cached);
      } catch {
        this.cachedAttendees = [];
      }
    }
  }

  /**
   * Xóa toàn bộ bộ nhớ tạm (cache danh sách khách và dữ liệu demo cũ)
   */
  clearLocalCache() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_ATTENDEES);
      localStorage.removeItem('tet_karlsruhe_use_mock');
      localStorage.removeItem('tet_karlsruhe_gas_url');
    }
    this.cachedAttendees = [];
  }

  saveSettings(verifier: string) {
    this.verifierName = verifier.trim() || 'Cổng Soát Vé 1';
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VERIFIER, this.verifierName);
    }
  }

  getGasUrl(): string {
    return this.gasUrl;
  }

  getVerifierName(): string {
    return this.verifierName;
  }

  private saveLocalCache() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ATTENDEES, JSON.stringify(this.cachedAttendees));
    }
  }

  // Chuẩn hóa ngày sinh về định dạng chuẩn duy nhất dd/MM/yyyy (ví dụ: 18/01/2002)
  public normalizeDate(d: string): string {
    if (!d) return '';
    const clean = d.trim().replace(/[./]/g, '-');
    const parts = clean.split('-');
    if (parts.length === 3) {
      // Nếu là YYYY-MM-DD (vd 2002-01-18 từ web gửi lên) -> chuyển thành dd/MM/yyyy (18/01/2002)
      if (parts[0].length === 4) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${day}/${month}/${year}`;
      }
      // Nếu là DD-MM-YYYY (vd 18-01-2002) -> chuyển thành dd/MM/yyyy (18/01/2002)
      if (parts[0].length <= 2 && parts[2].length === 4) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${day}/${month}/${year}`;
      }
    }
    return clean;
  }

  /**
   * Helper gửi yêu cầu HTTP POST tới Google Apps Script Web App
   * Dùng 'Content-Type': 'text/plain;charset=utf-8' để tránh bị trình duyệt gửi CORS OPTIONS preflight
   */
  private async postToGas<T>(payload: Record<string, any>): Promise<GasApiResponse<T>> {
    // Gửi action trên cả URL query string lẫn body để đảm bảo Apps Script luôn đọc được action
    const url = payload.action
      ? (this.gasUrl.includes('?') 
          ? `${this.gasUrl}&action=${encodeURIComponent(payload.action)}` 
          : `${this.gasUrl}?action=${encodeURIComponent(payload.action)}`)
      : this.gasUrl;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      redirect: 'follow',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Lỗi kết nối máy chủ Google Apps Script (${res.status})`);
    }

    return await res.json();
  }

  /**
   * Fetch all attendees list from Google Apps Script via HTTP POST
   */
  async fetchAttendees(forceRefresh = false): Promise<Attendee[]> {
    if (!forceRefresh && this.cachedAttendees.length > 0) {
      return [...this.cachedAttendees];
    }

    try {
      const json = await this.postToGas<Attendee[]>({
        action: 'getAttendees',
      });

      if (json.success && Array.isArray(json.data)) {
        this.cachedAttendees = json.data.map((a) => ({
          ...a,
          dob: this.normalizeDate(a.dob),
        }));
        this.saveLocalCache();
        return this.cachedAttendees;
      } else {
        throw new Error(json.error || 'Dữ liệu trả về không hợp lệ');
      }
    } catch (err: any) {
      console.warn('Lỗi khi tải danh sách từ GAS, sử dụng dữ liệu tạm:', err);
      if (this.cachedAttendees.length > 0) {
        return [...this.cachedAttendees];
      }
      throw err;
    }
  }

  /**
   * Check in attendee by QR Code via HTTP POST
   */
  async checkInByCode(code: string): Promise<CheckinResult> {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return {
        status: 'invalid',
        message: 'Mã QR rỗng hoặc không đọc được.',
      };
    }

    try {
      const json = await this.postToGas<{ attendee: Attendee; alreadyCheckedIn: boolean }>({
        action: 'checkInByCode',
        code: trimmedCode,
        verifier: this.verifierName,
      });

      if (!json.success) {
        return {
          status: 'not_found',
          message: json.message || 'Không tìm thấy vé trong danh sách sự kiện!',
          error: json.error,
        };
      }

      const attendee = json.data?.attendee;
      if (!attendee) {
        return {
          status: 'not_found',
          message: 'Không tìm thấy thông tin người tham gia.',
        };
      }
      attendee.dob = this.normalizeDate(attendee.dob);

      // Update local cache
      const index = this.cachedAttendees.findIndex((a) => a.ticketCode === attendee.ticketCode || a.id === attendee.id);
      if (index !== -1) {
        this.cachedAttendees[index] = attendee;
      } else {
        this.cachedAttendees.unshift(attendee);
      }
      this.saveLocalCache();

      if (json.data?.alreadyCheckedIn) {
        return {
          status: 'already_checked_in',
          message: `Vé này ĐÃ CHECK-IN trước đó lúc ${attendee.checkInTime || 'trước'}!`,
          attendee,
          checkedAt: attendee.checkInTime,
        };
      }

      return {
        status: 'success',
        message: 'Soát vé thành công! Chào mừng quý khách.',
        attendee,
        checkedAt: attendee.checkInTime,
      };
    } catch (err: any) {
      console.error('GAS checkInByCode error:', err);
      return {
        status: 'invalid',
        message: 'Lỗi kết nối tới máy chủ Google Apps Script: ' + (err.message || 'Mất mạng'),
        error: err.message,
      };
    }
  }

  /**
   * Tìm kiếm tất cả các vé của một người theo Email và Ngày sinh
   * (Phục vụ hiển thị đầy đủ danh sách vé nếu mua nhiều lần)
   */
  async searchTicketsByDetails(email: string, dob: string): Promise<SearchTicketsResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDob = this.normalizeDate(dob);

    if (!cleanEmail || !cleanDob) {
      return {
        success: false,
        tickets: [],
        error: 'Vui lòng nhập đầy đủ Email và Ngày sinh.',
      };
    }

    try {
      const json = await this.postToGas<Attendee[]>({
        action: 'getTicketsByDetails',
        email: cleanEmail,
        dob: cleanDob,
      });

      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
        if (json.error?.includes('action') || json.error?.includes('Chưa chỉ định action')) {
          return {
            success: false,
            tickets: [],
            error: 'Máy chủ Google Apps Script đang chạy bản triển khai cũ (chưa cập nhật action mới). Hãy vào Apps Script > Triển khai > Quản lý bản triển khai > Sửa thành "Phiên bản mới (New version)"!',
          };
        }
        return {
          success: false,
          tickets: [],
          error: json.error || 'Không tìm thấy vé nào với Email và Ngày sinh đã nhập.',
        };
      }

      const tickets: Attendee[] = json.data.map((t) => ({
        ...t,
        dob: this.normalizeDate(t.dob),
      }));

      // Cập nhật vào cache
      tickets.forEach((ticket) => {
        const idx = this.cachedAttendees.findIndex((a) => a.id === ticket.id || a.ticketCode === ticket.ticketCode);
        if (idx !== -1) {
          this.cachedAttendees[idx] = ticket;
        } else {
          this.cachedAttendees.unshift(ticket);
        }
      });
      this.saveLocalCache();

      return {
        success: true,
        tickets,
        message: json.message || `Tìm thấy ${tickets.length} vé của khách hàng này.`,
      };
    } catch (err: any) {
      console.error('GAS searchTicketsByDetails error:', err);
      return {
        success: false,
        tickets: [],
        error: 'Lỗi kết nối tới máy chủ Google Apps Script: ' + (err.message || 'Mất mạng'),
      };
    }
  }

  /**
   * Check in attendee by specific Ticket ID
   */
  async checkInById(ticketId: string): Promise<CheckinResult> {
    const cleanId = ticketId.trim();
    if (!cleanId) {
      return {
        status: 'invalid',
        message: 'Thiếu mã vé cần check-in.',
      };
    }

    try {
      const json = await this.postToGas<{ attendee: Attendee; alreadyCheckedIn: boolean }>({
        action: 'checkInById',
        ticketId: cleanId,
        verifier: this.verifierName,
      });

      if (!json.success || !json.data?.attendee) {
        return {
          status: 'not_found',
          message: json.message || 'Không thể check-in cho mã vé này!',
          error: json.error,
        };
      }

      const attendee = json.data.attendee;
      attendee.dob = this.normalizeDate(attendee.dob);

      // Cập nhật cache
      const index = this.cachedAttendees.findIndex((a) => a.ticketCode === attendee.ticketCode || a.id === attendee.id);
      if (index !== -1) {
        this.cachedAttendees[index] = attendee;
      } else {
        this.cachedAttendees.unshift(attendee);
      }
      this.saveLocalCache();

      if (json.data?.alreadyCheckedIn) {
        return {
          status: 'already_checked_in',
          message: `Vé này ĐÃ CHECK-IN trước đó lúc ${attendee.checkInTime || 'trước'}!`,
          attendee,
          checkedAt: attendee.checkInTime,
        };
      }

      return {
        status: 'success',
        message: `Soát vé thành công cho mã vé ${attendee.ticketCode}!`,
        attendee,
        checkedAt: attendee.checkInTime,
      };
    } catch (err: any) {
      console.error('GAS checkInById error:', err);
      return {
        status: 'invalid',
        message: 'Lỗi kết nối tới Google Apps Script: ' + err.message,
        error: err.message,
      };
    }
  }

  /**
   * Check in attendee by Email & Date of Birth via HTTP POST (Manual Check-in)
   */
  async checkInByDetails(email: string, dob: string): Promise<CheckinResult & { tickets?: Attendee[]; multipleTickets?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDob = this.normalizeDate(dob);

    if (!cleanEmail || !cleanDob) {
      return {
        status: 'invalid',
        message: 'Vui lòng nhập đầy đủ Email và Ngày sinh.',
      };
    }

    try {
      const json = await this.postToGas<any>({
        action: 'checkInByDetails',
        email: cleanEmail,
        dob: cleanDob,
        verifier: this.verifierName,
      });

      if (!json.success) {
        return {
          status: 'not_found',
          message: json.message || 'Không tìm thấy người tham gia với Email và Ngày sinh đã nhập!',
          error: json.error,
        };
      }

      // Trường hợp có nhiều vé
      if (json.multipleTickets && Array.isArray(json.data)) {
        const tickets: Attendee[] = json.data.map((t: Attendee) => ({
          ...t,
          dob: this.normalizeDate(t.dob),
        }));
        return {
          status: 'idle',
          message: json.message || `Tìm thấy ${tickets.length} vé. Vui lòng chọn vé cần check-in.`,
          multipleTickets: true,
          tickets,
        };
      }

      const attendee = json.data?.attendee;
      if (!attendee) {
        return {
          status: 'not_found',
          message: 'Không tìm thấy thông tin vé.',
        };
      }
      attendee.dob = this.normalizeDate(attendee.dob);
      const index = this.cachedAttendees.findIndex((a) => a.id === attendee.id || a.email.toLowerCase() === cleanEmail);
      if (index !== -1) {
        this.cachedAttendees[index] = attendee;
      } else {
        this.cachedAttendees.unshift(attendee);
      }
      this.saveLocalCache();

      if (json.data?.alreadyCheckedIn) {
        return {
          status: 'already_checked_in',
          message: `Khách này ĐÃ CHECK-IN trước đó lúc ${attendee.checkInTime || 'trước'}!`,
          attendee,
          checkedAt: attendee.checkInTime,
        };
      }

      return {
        status: 'success',
        message: 'Soát vé thủ công thành công!',
        attendee,
        checkedAt: attendee.checkInTime,
      };
    } catch (err: any) {
      console.error('GAS checkInByDetails error:', err);
      return {
        status: 'invalid',
        message: 'Lỗi khi gọi Google Apps Script: ' + err.message,
        error: err.message,
      };
    }
  }
}

export const gasService = new GasService();
