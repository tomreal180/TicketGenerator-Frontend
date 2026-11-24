<script setup lang="ts">
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Mail, 
  Calendar, 
  Tag, 
  QrCode,
  FileText,
  Ticket
} from 'lucide-vue-next';
import { CheckinResult } from '../types/attendee';

defineProps<{
  result: CheckinResult;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
}>();

const getTicketTypeBadgeClass = (type?: string) => {
  switch (type) {
    case 'VIP':
      return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    case 'Student':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Child':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Organizer':
      return 'bg-red-100 text-red-800 border-red-300 font-bold';
    default:
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
};
</script>

<template>
  <div class="w-full">
    <!-- 1. IDLE STATE -->
    <div 
      v-if="result.status === 'idle'" 
      class="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center text-stone-500 shadow-sm"
    >
      <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
        <QrCode class="w-7 h-7" />
      </div>
      <h3 class="text-base font-semibold text-stone-700">Chờ quét vé</h3>
      <p class="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
        Hướng camera vào mã QR của người tham gia hoặc nhập Email & Ngày sinh ở tab Soát vé thủ công để kiểm tra.
      </p>
    </div>

    <!-- 2. LOADING STATE -->
    <div 
      v-else-if="result.status === 'loading'" 
      class="bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-md"
    >
      <div class="inline-block w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-3"></div>
      <h3 class="text-base font-bold text-stone-800">Đang đối chiếu dữ liệu...</h3>
      <p class="text-xs text-stone-500 mt-1">
        Đang gửi yêu cầu xác thực tới máy chủ Google Apps Script
      </p>
    </div>

    <!-- 3. SUCCESS STATE -->
    <div 
      v-else-if="result.status === 'success'"
      class="bg-white border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-xl"
    >
      <!-- Top banner -->
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <CheckCircle2 class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-sm tracking-wide uppercase">CHECK-IN THÀNH CÔNG</h3>
            <p class="text-xs text-emerald-100">Vé hợp lệ • Chúc mừng năm mới</p>
          </div>
        </div>
        <button 
          @click="emit('clear')"
          class="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Xong / Quét tiếp
        </button>
      </div>

      <!-- Attendee Information Card -->
      <div class="p-5 sm:p-6" v-if="result.attendee">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <span class="text-xs font-semibold text-stone-400 uppercase tracking-wider">Họ và Tên</span>
            <h2 class="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5 flex items-center gap-2">
              {{ result.attendee.fullName }}
            </h2>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span 
              :class="getTicketTypeBadgeClass(result.attendee.ticketType)"
              class="px-3 py-1 rounded-full text-xs border font-medium uppercase tracking-wide flex items-center gap-1 shadow-sm"
            >
              <Tag class="w-3 h-3" />
              Vé {{ result.attendee.ticketType }}
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs bg-stone-100 text-stone-700 font-mono font-semibold">
              #{{ result.attendee.ticketCode }}
            </span>
            <span class="px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-900 border border-amber-200 font-bold">
              {{ result.attendee.amountOfTicket || 1 }} Vé
            </span>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 text-xs sm:text-sm">

          <!-- Email -->
          <div class="flex items-center gap-2 text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <Mail class="w-4 h-4 text-stone-400 shrink-0" />
            <div class="truncate">
              <span class="text-[11px] text-stone-400 block">Email đăng ký</span>
              <span class="font-medium text-stone-800 truncate block">{{ result.attendee.email }}</span>
            </div>
          </div>

          <!-- Date of birth -->
          <div class="flex items-center gap-2 text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <Calendar class="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span class="text-[11px] text-stone-400 block">Ngày sinh (DOB)</span>
              <span class="font-medium text-stone-800">{{ result.attendee.dob }}</span>
            </div>
          </div>

          <!-- Amount of Tickets -->
          <div class="flex items-center gap-2 text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <Ticket class="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span class="text-[11px] text-stone-400 block">Số lượng vé đăng ký</span>
              <span class="font-bold text-amber-950 text-sm">{{ result.attendee.amountOfTicket || 1 }} vé</span>
            </div>
          </div>

          <!-- Check-in Time -->
          <div class="flex items-center gap-2 text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <Clock class="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span class="text-[11px] text-stone-400 block">Thời gian vào cửa</span>
              <span class="font-medium text-emerald-700 font-mono">{{ result.attendee.checkInTime || result.checkedAt }}</span>
            </div>
          </div>

          <!-- Notes if any -->
          <div v-if="result.attendee.notes" class="sm:col-span-2 flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <FileText class="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <span class="text-[11px] text-stone-400 block">Ghi chú</span>
              <span class="text-stone-700 italic">{{ result.attendee.notes }}</span>
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Xác nhận bởi: <strong class="text-stone-700">{{ result.attendee.checkedInBy || 'Hệ thống' }}</strong></span>
          <span class="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 class="w-3.5 h-3.5" />
            Đã đồng bộ Google Sheet
          </span>
        </div>
      </div>
    </div>

    <!-- 4. ALREADY CHECKED IN (WARNING) -->
    <div 
      v-else-if="result.status === 'already_checked_in'"
      class="bg-white border-2 border-amber-500 rounded-2xl overflow-hidden shadow-xl"
    >
      <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <h3 class="font-bold text-sm tracking-wide uppercase">CẢNH BÁO: ĐÃ CHECK-IN TRƯỚC ĐÓ</h3>
            <p class="text-xs text-amber-100">Vé này đã qua cổng soát vé</p>
          </div>
        </div>
        <button 
          @click="emit('clear')"
          class="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Đóng
        </button>
      </div>

      <div class="p-5 sm:p-6" v-if="result.attendee">
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
          <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-bold">{{ result.message }}</p>
            <p class="mt-1 text-amber-800 text-xs">
              Mỗi mã vé chỉ được vào cổng 01 lần duy nhất.
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <span class="text-xs text-stone-400 uppercase font-semibold">Khách tham gia</span>
            <h2 class="text-lg font-bold text-stone-800">{{ result.attendee.fullName }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <span :class="getTicketTypeBadgeClass(result.attendee.ticketType)" class="px-2.5 py-0.5 rounded-full text-xs border font-medium">
              Vé {{ result.attendee.ticketType }}
            </span>
            <span class="font-mono text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-700">
              #{{ result.attendee.ticketCode }}
            </span>
            <span class="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded">
              {{ result.attendee.amountOfTicket || 1 }} vé
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
          <div class="flex items-center gap-2 text-stone-600 bg-stone-50 p-2 rounded-lg">
            <Clock class="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span class="text-[10px] text-stone-400 block">Giờ check-in đầu tiên</span>
              <span class="font-bold text-amber-800 font-mono">{{ result.attendee.checkInTime || 'Không rõ' }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 text-stone-600 bg-stone-50 p-2 rounded-lg">
            <User class="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <span class="text-[10px] text-stone-400 block">Cổng / Người duyệt</span>
              <span class="font-medium text-stone-700">{{ result.attendee.checkedInBy || 'Chưa lưu' }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span class="text-stone-400 text-[11px] italic">
            *Để xử lý ngoại lệ hoặc điều chỉnh vé, vui lòng cập nhật trực tiếp trên Google Sheet.
          </span>
          <button 
            @click="emit('clear')"
            class="bg-stone-800 hover:bg-stone-900 text-white px-3.5 py-1.5 rounded-lg font-medium transition-colors text-center"
          >
            Quét vé tiếp
          </button>
        </div>
      </div>
    </div>

    <!-- 5. NOT FOUND / INVALID -->
    <div 
      v-else-if="result.status === 'not_found' || result.status === 'invalid'"
      class="bg-white border-2 border-red-500 rounded-2xl overflow-hidden shadow-xl"
    >
      <div class="bg-gradient-to-r from-red-600 to-rose-700 px-5 py-3 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <XCircle class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-sm tracking-wide uppercase">VÉ KHÔNG HỢP LỆ</h3>
            <p class="text-xs text-red-100">Không tìm thấy thông tin đăng ký</p>
          </div>
        </div>
        <button 
          @click="emit('clear')"
          class="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          Thử lại
        </button>
      </div>

      <div class="p-5 sm:p-6 text-center">
        <div class="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <XCircle class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-stone-800 text-base mb-1">
          {{ result.message || 'Mã vé không tồn tại trong danh sách!' }}
        </h4>
        <p class="text-xs text-stone-500 max-w-md mx-auto">
          Gợi ý: Kiểm tra xem khách đã điền đúng biểu mẫu Google Form chưa, hoặc chuyển sang tab
          <strong>"Soát vé thủ công"</strong> để tìm theo Email và Ngày sinh.
        </p>

        <div class="mt-5 flex items-center justify-center gap-3">
          <button 
            @click="emit('clear')"
            class="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-colors"
          >
            Quét lại vé khác
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
