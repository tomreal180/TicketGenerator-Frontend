import { Attendee, CheckinResult, GasApiResponse } from '../types/attendee';

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
export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwgrczEWhLytzgQKmqL9jHnReMU4LyrBodU2GOKzWrbC4zAIRz1HEsnsd_2Lm_rGeXi/exec';

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
    const res = await fetch(this.gasUrl, {
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
   * Check in attendee by Email & Date of Birth via HTTP POST (Manual Check-in)
   */
  async checkInByDetails(email: string, dob: string): Promise<CheckinResult> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDob = this.normalizeDate(dob);

    if (!cleanEmail || !cleanDob) {
      return {
        status: 'invalid',
        message: 'Vui lòng nhập đầy đủ Email và Ngày sinh.',
      };
    }

    try {
      const json = await this.postToGas<{ attendee: Attendee; alreadyCheckedIn: boolean }>({
        action: 'checkInByDetails',
        email: cleanEmail,
        dob: cleanDob,
        verifier: this.verifierName,
      });

      if (!json.success || !json.data?.attendee) {
        return {
          status: 'not_found',
          message: json.message || 'Không tìm thấy người tham gia với Email và Ngày sinh đã nhập!',
          error: json.error,
        };
      }

      const attendee = json.data.attendee;
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
