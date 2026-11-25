<script setup lang="ts">
import { ref } from 'vue';
import { 
  Mail, 
  Calendar, 
  Search, 
  X, 
  UserCheck, 
  CheckCircle2, 
  Tag, 
  RefreshCw, 
  AlertTriangle,
  AlertCircle
} from 'lucide-vue-next';
import { Attendee } from '../types/attendee';
import { gasService } from '../services/gasService';

const emit = defineEmits<{
  (e: 'checked-in', attendee: Attendee): void;
}>();

const email = ref('');
const dob = ref('');
const isSearching = ref(false);
const checkingInTicketId = ref<string | null>(null);
const tickets = ref<Attendee[]>([]);
const hasSearched = ref(false);
const errorMessage = ref('');
const successBanner = ref('');

const handleSearch = async () => {
  errorMessage.value = '';
  successBanner.value = '';
  const cleanEmail = email.value.trim().toLowerCase();
  const cleanDob = dob.value.trim();

  if (!cleanEmail) {
    errorMessage.value = 'Vui lòng nhập địa chỉ Email đăng ký!';
    return;
  }

  if (!cleanDob) {
    errorMessage.value = 'Vui lòng chọn hoặc nhập ngày sinh!';
    return;
  }

  isSearching.value = true;
  hasSearched.value = true;

  try {
    const res = await gasService.searchTicketsByDetails(cleanEmail, cleanDob);
    if (res.success && res.tickets.length > 0) {
      tickets.value = res.tickets;
    } else {
      tickets.value = [];
      errorMessage.value = res.error || 'Không tìm thấy vé nào khớp với Email và Ngày sinh đã nhập.';
    }
  } catch (err: any) {
    tickets.value = [];
    errorMessage.value = 'Lỗi kết nối máy chủ: ' + (err.message || 'Không xác định');
  } finally {
    isSearching.value = false;
  }
};

const handleCheckInTicket = async (ticket: Attendee) => {
  if (checkingInTicketId.value) return;
  checkingInTicketId.value = ticket.id;
  errorMessage.value = '';
  successBanner.value = '';

  try {
    const res = await gasService.checkInById(ticket.id);

    if (res.status === 'success') {
      // Cập nhật trạng thái vé trong danh sách hiển thị
      const idx = tickets.value.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        tickets.value[idx] = {
          ...tickets.value[idx],
          isCheckedIn: true,
          checkInTime: res.checkedAt || res.attendee?.checkInTime || 'Vừa xong',
          checkedInBy: res.attendee?.checkedInBy || gasService.getVerifierName()
        };
      }
      successBanner.value = `🎉 Check-in thành công mã vé #${ticket.ticketCode} cho khách ${ticket.fullName}!`;
      emit('checked-in', res.attendee || tickets.value[idx]);
    } else if (res.status === 'already_checked_in') {
      const idx = tickets.value.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        tickets.value[idx] = {
          ...tickets.value[idx],
          isCheckedIn: true,
          checkInTime: res.checkedAt || res.attendee?.checkInTime,
          checkedInBy: res.attendee?.checkedInBy
        };
      }
      errorMessage.value = `⚠️ Mã vé #${ticket.ticketCode} này đã được check-in trước đó!`;
    } else {
      errorMessage.value = res.message || res.error || 'Check-in thất bại, vui lòng thử lại!';
    }
  } catch (err: any) {
    errorMessage.value = 'Lỗi kết nối khi check-in: ' + (err.message || 'Không xác định');
  } finally {
    checkingInTicketId.value = null;
  }
};

const handleClear = () => {
  email.value = '';
  dob.value = '';
  errorMessage.value = '';
  successBanner.value = '';
  tickets.value = [];
  hasSearched.value = false;
};

// Quick domain append helper
const appendDomain = (domain: string) => {
  if (!email.value.includes('@')) {
    email.value += domain;
  }
};

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
  <div class="space-y-6">
    <!-- Manual Check-in Form Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-stone-200">
      <div class="flex items-center gap-3 pb-4 mb-5 border-b border-stone-100">
        <div class="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
          <UserCheck class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-stone-800">Soát vé thủ công</h2>
          <p class="text-xs text-stone-500">
            Dành cho khách không có mã QR, mất email vé hoặc có nhiều vé cần chọn check-in.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSearch" class="space-y-4">
        <!-- Email Input -->
        <div>
          <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Email người tham gia <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail class="w-4 h-4" />
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="nhap.email@example.com"
              required
              class="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all font-medium"
            />
            <button
              v-if="email"
              type="button"
              @click="email = ''"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Quick Domain Shortcuts -->
          <div class="flex items-center gap-1.5 mt-2 text-xs">
            <span class="text-[11px] text-stone-400">Gợi ý nhanh:</span>
            <button
              type="button"
              @click="appendDomain('@gmail.com')"
              class="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] transition-colors"
            >
              @gmail.com
            </button>
            <button
              type="button"
              @click="appendDomain('@student.kit.edu')"
              class="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] transition-colors"
            >
              @student.kit.edu
            </button>
            <button
              type="button"
              @click="appendDomain('@yahoo.com')"
              class="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] transition-colors"
            >
              @yahoo.com
            </button>
          </div>
        </div>

        <!-- Date of Birth Input -->
        <div>
          <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Ngày sinh <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Calendar class="w-4 h-4" />
            </div>
            <input
              v-model="dob"
              type="date"
              required
              class="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all font-medium"
            />
            <button
              v-if="dob"
              type="button"
              @click="dob = ''"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <span class="text-[11px] text-stone-400 mt-1 block">
            Ngày sinh dùng để đối chiếu xác minh danh tính người nhận vé trong form đăng ký.
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            :disabled="isSearching"
            class="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95"
          >
            <span v-if="isSearching" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <Search v-else class="w-4 h-4" />
            <span>{{ isSearching ? 'Đang tra cứu danh sách vé...' : 'Tìm kiếm & Soát vé' }}</span>
          </button>

          <button
            type="button"
            @click="handleClear"
            class="px-4 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Xóa trắng
          </button>
        </div>
      </form>
    </div>

    <!-- Error Banner -->
    <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-700 shadow-sm animate-fade-in">
      <AlertCircle class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p class="font-bold">Thông báo</p>
        <p class="text-xs text-red-600 mt-0.5">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Success Banner -->
    <div v-if="successBanner" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-sm text-emerald-800 shadow-sm animate-fade-in">
      <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
      <div>
        <p class="font-bold">Soát vé thành công</p>
        <p class="text-xs text-emerald-700 mt-0.5">{{ successBanner }}</p>
      </div>
    </div>

    <!-- DANH SÁCH VÉ TÌM THẤY -->
    <div v-if="tickets.length > 0" class="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-stone-200 space-y-5 animate-fade-in">
      <!-- Header thông tin khách hàng -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Tìm thấy {{ tickets.length }} vé
            </span>
            <span v-if="tickets.length > 1" class="text-xs text-stone-500 font-medium">
              (Người này mua nhiều lần)
            </span>
          </div>
          <h3 class="text-lg sm:text-xl font-extrabold text-stone-900 mt-1">
            {{ tickets[0]?.fullName || 'Khách tham gia' }}
          </h3>
          <p class="text-xs text-stone-500">
            Email: <span class="font-medium text-stone-700">{{ email }}</span> • Ngày sinh: <span class="font-medium text-stone-700">{{ tickets[0]?.dob }}</span>
          </p>
        </div>

        <button
          @click="handleSearch"
          :disabled="isSearching"
          class="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition-colors"
          title="Tải lại thông tin vé từ máy chủ"
        >
          <RefreshCw :class="{ 'animate-spin': isSearching }" class="w-3.5 h-3.5 text-stone-500" />
          <span>Làm mới</span>
        </button>
      </div>

      <!-- Hướng dẫn khi mua nhiều vé -->
      <div v-if="tickets.length > 1" class="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
        <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold">Người tham gia này đã đăng ký {{ tickets.length }} vé với các mã vé riêng biệt:</span>
          <p class="mt-0.5 text-amber-700">
            Mỗi lần đăng ký có một mã vé riêng. Vui lòng bấm nút <strong class="underline font-bold">"Check-in vé này"</strong> cho từng vé mà khách muốn sử dụng.
          </p>
        </div>
      </div>

      <!-- Danh sách từng thẻ vé -->
      <div class="space-y-3.5">
        <div 
          v-for="(ticket, idx) in tickets" 
          :key="ticket.id || ticket.ticketCode"
          :class="[
            ticket.isCheckedIn 
              ? 'bg-stone-50 border-stone-200 shadow-sm' 
              : 'bg-white border-2 border-emerald-500 shadow-md hover:shadow-lg'
          ]"
          class="rounded-2xl p-4 sm:p-5 border transition-all"
        >
          <!-- Top Row: Thứ tự + Mã vé + Loại vé + Số lượng vé -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
            <div class="flex items-center gap-2">
              <span class="text-xs text-stone-400 font-semibold uppercase">Vé {{ idx + 1 }}:</span>
              <span class="font-mono font-extrabold text-sm sm:text-base text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                #{{ ticket.ticketCode }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span 
                :class="getTicketTypeBadgeClass(ticket.ticketType)"
                class="px-2.5 py-0.5 rounded-full text-xs border font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <Tag class="w-3 h-3" />
                {{ ticket.ticketType }}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {{ ticket.amountOfTicket || 1 }} Vé
              </span>
            </div>
          </div>

          <!-- Middle Row: Thông tin chi tiết vé -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-3 text-xs text-stone-600">
            <div class="flex items-center gap-2">
              <span class="text-stone-400">Người đăng ký:</span>
              <span class="font-bold text-stone-800">{{ ticket.fullName }}</span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-stone-400">Thanh toán:</span>
              <span 
                :class="ticket.isPaid ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-800 bg-amber-50 border-amber-200'"
                class="font-semibold px-2 py-0.5 rounded-md border text-[11px]"
              >
                {{ ticket.isPaid ? '✓ Đã thanh toán' : 'Chưa thanh toán' }}
              </span>
            </div>

            <div v-if="ticket.notes" class="sm:col-span-2 flex items-start gap-1.5 text-stone-500 bg-stone-100/70 p-2 rounded-lg text-xs">
              <span class="font-semibold text-stone-600 shrink-0">Ghi chú:</span>
              <span class="italic">{{ ticket.notes }}</span>
            </div>
          </div>

          <!-- Bottom Row: Trạng thái & Nút Check-in -->
          <div class="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <!-- NẾU ĐÃ CHECK-IN -->
            <div v-if="ticket.isCheckedIn" class="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
              <CheckCircle2 class="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span class="font-bold">ĐÃ CHECK-IN</span>
                <span class="text-[11px] text-amber-700 block">
                  Lúc: {{ ticket.checkInTime || 'Trước đó' }} • {{ ticket.checkedInBy || 'Soát vé viên' }}
                </span>
              </div>
            </div>

            <!-- NẾU CHƯA CHECK-IN -->
            <div v-else class="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span class="font-bold">Vé hợp lệ • Chưa sử dụng</span>
            </div>

            <!-- Nút Check-in tương ứng -->
            <div>
              <button
                v-if="!ticket.isCheckedIn"
                type="button"
                @click="handleCheckInTicket(ticket)"
                :disabled="checkingInTicketId === ticket.id"
                class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <span v-if="checkingInTicketId === ticket.id" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <UserCheck v-else class="w-4 h-4" />
                <span>{{ checkingInTicketId === ticket.id ? 'Đang check-in...' : 'Check-in vé này' }}</span>
              </button>

              <button
                v-else
                type="button"
                disabled
                class="w-full sm:w-auto px-4 py-2 bg-stone-100 text-stone-400 font-semibold rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Đã soát xong</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
