<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { 
  QrCode, 
  UserCheck, 
  Users, 
  Sparkles
} from 'lucide-vue-next';

import Header from './components/Header.vue';
import ScannerTab from './components/ScannerTab.vue';
import ManualCheckinTab from './components/ManualCheckinTab.vue';
import CheckinResultCard from './components/CheckinResultCard.vue';
import AttendeesDashboard from './components/AttendeesDashboard.vue';
import SettingsModal from './components/SettingsModal.vue';

import { Attendee, CheckinResult } from './types/attendee';
import { gasService } from './services/gasService';

// Active Tab: 'scanner' | 'manual' | 'dashboard'
const activeTab = ref<'scanner' | 'manual' | 'dashboard'>('scanner');
const scannerTabRef = ref<InstanceType<typeof ScannerTab> | null>(null);

// App States
const attendees = ref<Attendee[]>([]);
const isProcessing = ref(false);
const isLoadingList = ref(false);
const isSettingsOpen = ref(false);

const gasUrl = ref(gasService.getGasUrl());
const verifierName = ref(gasService.getVerifierName());

// Check-in Result State (Displayed directly below scanner / manual form)
const checkinResult = ref<CheckinResult>({
  status: 'idle',
  message: '',
});

// Load attendees list
const loadAttendees = async (forceRefresh = false) => {
  isLoadingList.value = true;
  try {
    const list = await gasService.fetchAttendees(forceRefresh);
    attendees.value = list;
  } catch (err: any) {
    console.error('Lỗi khi tải danh sách người tham gia:', err);
  } finally {
    isLoadingList.value = false;
  }
};

// Handle QR Scan
const handleScan = async (qrData: string) => {
  if (isProcessing.value) return;
  isProcessing.value = true;
  checkinResult.value = {
    status: 'loading',
    message: 'Đang kiểm tra mã QR với Google Apps Script...',
  };

  try {
    const res = await gasService.checkInByCode(qrData);
    checkinResult.value = res;
    // Cập nhật lại danh sách nếu check-in thành công
    if (res.status === 'success') {
      loadAttendees(true);
    }
  } catch (err: any) {
    checkinResult.value = {
      status: 'invalid',
      message: 'Lỗi kiểm tra vé: ' + (err.message || 'Không xác định'),
    };
  } finally {
    isProcessing.value = false;
  }
};

// Handle Manual Check-in Success
const handleManualCheckedIn = (_attendee: Attendee) => {
  // Cập nhật lại danh sách Dashboard
  loadAttendees(true);
};

// Theo dõi khi chuyển tab để gọi hàm tương ứng và dọn trạng thái
watch(activeTab, (newTab) => {
  // Khi chuyển sang Tab Bảng Soát Vé: Tự động gọi API getAttendees để lấy danh sách mới nhất từ Google Sheet
  if (newTab === 'dashboard') {
    loadAttendees(true);
  }
  // Khi chuyển tab khác, nếu kết quả trước đó đã xong thì xóa để tab mới sạch sẽ
  if (checkinResult.value.status !== 'loading') {
    checkinResult.value = {
      status: 'idle',
      message: '',
    };
  }
});

// Clear Result card và kích hoạt lại camera nếu đang ở tab scanner
const clearResult = () => {
  checkinResult.value = {
    status: 'idle',
    message: '',
  };
  if (activeTab.value === 'scanner') {
    scannerTabRef.value?.startScanning();
  }
};

// Save Settings
const handleSaveSettings = (config: { verifierName: string }) => {
  gasService.saveSettings(config.verifierName);
  verifierName.value = gasService.getVerifierName();
};

// Xóa sạch bộ nhớ tạm (Cache) trên thiết bị
const handleClearCache = async () => {
  gasService.clearLocalCache();
  attendees.value = [];
  checkinResult.value = {
    status: 'idle',
    message: '',
  };
  await loadAttendees(true);
  alert('Đã xóa sạch bộ nhớ tạm (cache) trên thiết bị thành công!');
};

onMounted(() => {
  loadAttendees(false);
});
</script>

<template>
  <div class="min-h-screen bg-stone-100 flex flex-col font-sans pb-16">
    <!-- Top Header -->
    <Header
      :gas-url="gasUrl"
      :verifier-name="verifierName"
      @open-settings="isSettingsOpen = true"
    />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
      <!-- Navigation Tabs -->
      <div class="bg-white rounded-2xl p-1.5 shadow-md border border-stone-200 flex items-center justify-between">
        <div class="grid grid-cols-3 gap-1.5 w-full text-xs sm:text-sm font-bold">
          <!-- Tab 1: Camera Scanner -->
          <button
            @click="activeTab = 'scanner'"
            :class="activeTab === 'scanner' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
              : 'text-stone-600 hover:text-red-700 hover:bg-stone-50'"
            class="py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98"
          >
            <QrCode class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span class="truncate">Quét Camera</span>
          </button>

          <!-- Tab 2: Manual Check-in (Email + DOB) -->
          <button
            @click="activeTab = 'manual'"
            :class="activeTab === 'manual' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
              : 'text-stone-600 hover:text-red-700 hover:bg-stone-50'"
            class="py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98"
          >
            <UserCheck class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span class="truncate">Soát Thủ Công</span>
          </button>

          <!-- Tab 3: Attendees List & Dashboard -->
          <button
            @click="activeTab = 'dashboard'"
            :class="activeTab === 'dashboard' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' 
              : 'text-stone-600 hover:text-red-700 hover:bg-stone-50'"
            class="py-3 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98"
          >
            <Users class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span class="truncate">Bảng Soát Vé</span>
          </button>
        </div>
      </div>

      <!-- VIEW 1: SCANNER TAB -->
      <div v-show="activeTab === 'scanner'" class="space-y-6">
        <ScannerTab
          ref="scannerTabRef"
          :is-processing="isProcessing"
          :is-active-tab="activeTab === 'scanner'"
          @scan="handleScan"
        />

        <!-- RESULT AREA (Always below camera/form as requested) -->
        <div class="pt-2">
          <div class="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>Kết quả xác thực từ Google Apps Script</span>
          </div>
          <CheckinResultCard
            :result="checkinResult"
            @clear="clearResult"
          />
        </div>
      </div>

      <!-- VIEW 2: MANUAL CHECK-IN TAB (Email + DOB) -->
      <div v-show="activeTab === 'manual'" class="space-y-6">
        <ManualCheckinTab
          @checked-in="handleManualCheckedIn"
        />
      </div>

      <!-- VIEW 3: ATTENDEES LIST & DASHBOARD -->
      <div v-show="activeTab === 'dashboard'">
        <AttendeesDashboard
          :attendees="attendees"
          :is-loading="isLoadingList"
          @refresh="loadAttendees(true)"
        />
      </div>
    </main>

    <!-- Settings Modal -->
    <SettingsModal
      :is-open="isSettingsOpen"
      :initial-gas-url="gasUrl"
      :initial-verifier-name="verifierName"
      @close="isSettingsOpen = false"
      @save="handleSaveSettings"
      @clear-cache="handleClearCache"
    />
  </div>
</template>
