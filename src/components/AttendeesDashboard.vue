<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Tag, 
  Mail, 
  Calendar
} from 'lucide-vue-next';
import { Attendee, TicketType } from '../types/attendee';

const props = defineProps<{
  attendees: Attendee[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

// Filter States
const searchQuery = ref('');
const statusFilter = ref<'all' | 'checked_in' | 'pending'>('all');
const ticketTypeFilter = ref<string>('all');

// Stats Calculation
const stats = computed(() => {
  const total = props.attendees.length;
  const checkedIn = props.attendees.filter((a) => a.isCheckedIn).length;
  const pending = total - checkedIn;
  const percent = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  
  const totalTickets = props.attendees.reduce((sum, a) => sum + (Number(a.amountOfTicket) || 1), 0);
  const checkedInTickets = props.attendees.filter((a) => a.isCheckedIn).reduce((sum, a) => sum + (Number(a.amountOfTicket) || 1), 0);
  
  const vipTotal = props.attendees.filter((a) => a.ticketType === 'VIP').length;
  const vipCheckedIn = props.attendees.filter((a) => a.ticketType === 'VIP' && a.isCheckedIn).length;

  return { total, checkedIn, pending, percent, vipTotal, vipCheckedIn, totalTickets, checkedInTickets };
});

// Filtered List
const filteredAttendees = computed(() => {
  return props.attendees.filter((a) => {
    // Status filter
    if (statusFilter.value === 'checked_in' && !a.isCheckedIn) return false;
    if (statusFilter.value === 'pending' && a.isCheckedIn) return false;

    // Type filter
    if (ticketTypeFilter.value !== 'all' && a.ticketType !== ticketTypeFilter.value) {
      return false;
    }

    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchName = a.fullName.toLowerCase().includes(q);
      const matchEmail = a.email.toLowerCase().includes(q);
      const matchCode = a.ticketCode.toLowerCase().includes(q);
      const matchNote = a.notes ? a.notes.toLowerCase().includes(q) : false;
      return matchName || matchEmail || matchCode || matchNote;
    }

    return true;
  });
});

const getTicketTypeBadgeClass = (type: TicketType) => {
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

// Export to CSV
const exportToCSV = () => {
  const headers = ['Mã Vé', 'Họ Và Tên (Name)', 'Ngày Sinh (DOB)', 'Email', 'Số Lượng Vé (AMOUNTOFTICKET)', 'Loại Vé (TypeofTicket)', 'Ghi Chú (Note)', 'Đã Check-in', 'Thời Gian Check-in', 'Người Soát'];
  const rows = filteredAttendees.value.map((a) => [
    `"${a.ticketCode}"`,
    `"${a.fullName}"`,
    `"${a.dob}"`,
    `"${a.email}"`,
    `"${a.amountOfTicket || 1}"`,
    `"${a.ticketType}"`,
    `"${a.notes || ''}"`,
    `"${a.isCheckedIn ? 'ĐÃ CHECK-IN' : 'CHƯA'}"`,
    `"${a.checkInTime || ''}"`,
    `"${a.checkedInBy || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DSDaSoatVe_TetKarlsruhe2027_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Top Statistics Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Card -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Tổng vé đăng ký</span>
          <div class="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
            <Users class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 text-2xl sm:text-3xl font-black text-stone-900">{{ stats.total }}</div>
        <p class="text-[11px] text-stone-400 mt-1">Từ dữ liệu Google Sheets</p>
      </div>

      <!-- Checked-in Card -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
        <div class="absolute -right-3 -bottom-3 w-16 h-16 bg-emerald-50 rounded-full pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Đã Check-in</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black text-emerald-600">{{ stats.checkedIn }}</span>
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {{ stats.percent }}%
          </span>
        </div>
        <!-- Mini Progress bar -->
        <div class="w-full bg-stone-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" :style="{ width: `${stats.percent}%` }"></div>
        </div>
      </div>

      <!-- Pending Card -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">Chưa đến</span>
          <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 text-2xl sm:text-3xl font-black text-amber-600">{{ stats.pending }}</div>
        <p class="text-[11px] text-stone-400 mt-1">Đang chờ tại cửa</p>
      </div>

      <!-- VIP Card -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-amber-800 uppercase tracking-wider">Khách VIP</span>
          <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Tag class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 text-2xl sm:text-3xl font-black text-amber-900">
          {{ stats.vipCheckedIn }} <span class="text-sm font-semibold text-amber-600">/ {{ stats.vipTotal }}</span>
        </div>
        <p class="text-[11px] text-amber-700 mt-1">Đã có mặt tại hội trường</p>
      </div>
    </div>

    <!-- Filter & Action Bar Card -->
    <div class="bg-white rounded-3xl p-5 shadow-lg border border-stone-200 space-y-4">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <!-- Search Input -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search class="w-4 h-4" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm theo tên, email, mã vé (#TET-...), số điện thoại..."
            class="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <!-- Refresh -->
          <button
            @click="emit('refresh')"
            :disabled="isLoading"
            class="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Đồng bộ danh sách mới nhất từ Google Sheets"
          >
            <RefreshCw :class="{ 'animate-spin': isLoading }" class="w-4 h-4" />
            <span class="hidden sm:inline">Nạp lại</span>
          </button>

          <!-- Export CSV -->
          <button
            @click="exportToCSV"
            class="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors"
            title="Xuất file danh sách đã lọc ra Excel/CSV"
          >
            <Download class="w-4 h-4" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      <!-- Quick Filter Pills -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
        <!-- Status Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            @click="statusFilter = 'all'"
            :class="statusFilter === 'all' ? 'bg-white text-stone-900 font-bold shadow-sm' : 'text-stone-600 hover:text-stone-900'"
            class="px-3 py-1.5 rounded-lg transition-all"
          >
            Tất cả ({{ stats.total }})
          </button>
          <button
            @click="statusFilter = 'checked_in'"
            :class="statusFilter === 'checked_in' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-stone-600 hover:text-emerald-700'"
            class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
          >
            <CheckCircle2 class="w-3.5 h-3.5" />
            <span>Đã check-in ({{ stats.checkedIn }})</span>
          </button>
          <button
            @click="statusFilter = 'pending'"
            :class="statusFilter === 'pending' ? 'bg-amber-600 text-white font-bold shadow-sm' : 'text-stone-600 hover:text-amber-700'"
            class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>Chưa đến ({{ stats.pending }})</span>
          </button>
        </div>

        <!-- Ticket Type Dropdown -->
        <div class="flex items-center gap-2">
          <Filter class="w-3.5 h-3.5 text-stone-400" />
          <span class="text-stone-500 font-medium">Hạng vé:</span>
          <select
            v-model="ticketTypeFilter"
            class="bg-stone-50 border border-stone-300 text-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="all">Tất cả loại vé</option>
            <option value="VIP">Vé VIP</option>
            <option value="Student">Vé Sinh viên</option>
            <option value="Standard">Vé Tiêu chuẩn</option>
            <option value="Child">Vé Trẻ em</option>
            <option value="Organizer">Ban Tổ Chức</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Attendees Table View (Desktop & Tablet) -->
    <div class="hidden md:block bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-200">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
              <th class="py-3.5 px-4">Mã Vé</th>
              <th class="py-3.5 px-4">Người tham gia</th>
              <th class="py-3.5 px-4">Email</th>
              <th class="py-3.5 px-4 text-center">SL Vé</th>
              <th class="py-3.5 px-4">Hạng Vé</th>
              <th class="py-3.5 px-4">Ghi chú</th>
              <th class="py-3.5 px-4">Trạng thái</th>
              <th class="py-3.5 px-4">Thời gian vào</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr 
              v-for="attendee in filteredAttendees" 
              :key="attendee.id"
              class="hover:bg-amber-50/40 transition-colors"
            >
              <!-- Ticket Code -->
              <td class="py-3.5 px-4 font-mono font-bold text-stone-700">
                #{{ attendee.ticketCode }}
              </td>

              <!-- Attendee Name & DOB -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-stone-900 text-sm">{{ attendee.fullName }}</div>
                <div class="text-stone-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <Calendar class="w-3 h-3 text-stone-400" />
                  <span>DOB: {{ attendee.dob }}</span>
                </div>
              </td>

              <!-- Email -->
              <td class="py-3.5 px-4 text-stone-600 font-medium">
                <div class="flex items-center gap-1.5">
                  <Mail class="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span class="truncate max-w-[160px]">{{ attendee.email }}</span>
                </div>
              </td>

              <!-- Amount of Tickets -->
              <td class="py-3.5 px-4 text-center">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  {{ attendee.amountOfTicket || 1 }} vé
                </span>
              </td>

              <!-- Ticket Type -->
              <td class="py-3.5 px-4">
                <span 
                  :class="getTicketTypeBadgeClass(attendee.ticketType)"
                  class="px-2.5 py-1 rounded-full text-[11px] border shadow-xs inline-block"
                >
                  Vé {{ attendee.ticketType }}
                </span>
              </td>

              <!-- Notes -->
              <td class="py-3.5 px-4 text-stone-500 max-w-[150px] truncate" :title="attendee.notes || ''">
                <span v-if="attendee.notes" class="italic text-[11px] text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                  {{ attendee.notes }}
                </span>
                <span v-else class="text-stone-300">-</span>
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-4">
                <span 
                  v-if="attendee.isCheckedIn"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                >
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                  ĐÃ CHECK-IN
                </span>
                <span 
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200"
                >
                  <Clock class="w-3.5 h-3.5 text-stone-400" />
                  Chưa check-in
                </span>
              </td>

              <!-- Time -->
              <td class="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                <div v-if="attendee.isCheckedIn">
                  <div class="font-medium text-emerald-700">{{ attendee.checkInTime || 'Vừa xong' }}</div>
                  <div class="text-[10px] text-stone-400">{{ attendee.checkedInBy }}</div>
                </div>
                <span v-else class="text-stone-300">-</span>
              </td>
            </tr>

            <!-- Empty result row -->
            <tr v-if="filteredAttendees.length === 0">
              <td colspan="8" class="py-12 text-center text-stone-400">
                <Users class="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p class="font-medium text-stone-600">Không tìm thấy người tham gia phù hợp bộ lọc.</p>
                <p class="text-[11px] text-stone-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bấm "Tất cả".</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card View (Smartphone friendly) -->
    <div class="block md:hidden space-y-3">
      <div 
        v-for="attendee in filteredAttendees" 
        :key="attendee.id"
        class="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-1.5 font-mono text-xs">
              <span class="font-bold text-stone-500">#{{ attendee.ticketCode }}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-bold border border-amber-200">
                {{ attendee.amountOfTicket || 1 }} vé
              </span>
            </div>
            <h3 class="font-extrabold text-stone-900 text-base mt-0.5">{{ attendee.fullName }}</h3>
          </div>
          <span 
            :class="getTicketTypeBadgeClass(attendee.ticketType)"
            class="px-2 py-0.5 rounded-full text-[10px] border font-medium uppercase"
          >
            {{ attendee.ticketType }}
          </span>
        </div>

        <div class="text-xs text-stone-600 space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
          <div class="flex items-center gap-2">
            <Mail class="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span class="truncate">{{ attendee.email }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Calendar class="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Ngày sinh: {{ attendee.dob }}</span>
          </div>
          <div v-if="attendee.notes" class="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200/60">
            Ghi chú: {{ attendee.notes }}
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-stone-100">
          <div>
            <span 
              v-if="attendee.isCheckedIn"
              class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"
            >
              <CheckCircle2 class="w-3.5 h-3.5" />
              Đã vào: {{ attendee.checkInTime || 'Vừa xong' }}
            </span>
            <span 
              v-else
              class="inline-flex items-center gap-1 text-[11px] text-stone-400"
            >
              <Clock class="w-3.5 h-3.5" />
              Chưa check-in
            </span>
          </div>

          <span class="text-[10px] text-stone-400 italic">
            Chỉ xem
          </span>
        </div>
      </div>

      <div v-if="filteredAttendees.length === 0" class="bg-white rounded-2xl p-8 text-center text-stone-400">
        <Users class="w-8 h-8 mx-auto mb-2 text-stone-300" />
        <p class="font-medium text-stone-600 text-sm">Không tìm thấy người tham gia</p>
      </div>
    </div>
  </div>
</template>
