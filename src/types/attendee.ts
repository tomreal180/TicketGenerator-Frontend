export type CheckinStatus = 'success' | 'already_checked_in' | 'not_found' | 'invalid' | 'idle' | 'loading';

export type TicketType = 'VIP' | 'Standard' | 'Student' | 'Child' | 'Organizer' | 'Guest' | string;

export interface Attendee {
  id: string; // Ticket code or unique ID
  ticketCode: string;
  fullName: string;
  dob: string; // YYYY-MM-DD or DD/MM/YYYY
  email: string;
  amountOfTicket: number; // AMOUNTOFTICKET: Số lượng vé đăng ký
  ticketType: TicketType; // TypeofTicket
  notes?: string; // Note
  isPaid?: boolean; // PAY_COL: Trạng thái thanh toán
  isEmailSent?: boolean; // SENTEMAIL_COL: Trạng thái đã gửi email
  registrationTime?: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  checkedInBy?: string; // Verifier name/device
}

export interface CheckinResult {
  status: CheckinStatus;
  message: string;
  attendee?: Attendee;
  checkedAt?: string;
  error?: string;
}

export interface GasApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
  multipleTickets?: boolean;
}

export interface SearchTicketsResponse {
  success: boolean;
  tickets: Attendee[];
  message?: string;
  error?: string;
}

export interface CheckinStats {
  total: number;
  checkedIn: number;
  remaining: number;
  percent: number;
  vipTotal: number;
  vipCheckedIn: number;
}
