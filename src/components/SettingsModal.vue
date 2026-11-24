<script setup lang="ts">
import { ref } from 'vue';
import { 
  X, 
  Settings, 
  Check, 
  Globe, 
  HelpCircle,
  FileCode,
  Trash2
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  initialGasUrl: string;
  initialVerifierName: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', config: { verifierName: string }): void;
  (e: 'clear-cache'): void;
}>();

const verifierName = ref(props.initialVerifierName);
const testStatus = ref<'idle' | 'testing' | 'success' | 'error'>('idle');
const testMessage = ref('');

const handleClearCache = () => {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ bộ nhớ tạm (cache) và làm mới danh sách không?')) {
    emit('clear-cache');
  }
};

const handleSave = () => {
  emit('save', {
    verifierName: verifierName.value.trim() || 'Cổng Soát Vé 1',
  });
  emit('close');
};

const testConnection = async () => {
  const url = props.initialGasUrl.trim();
  if (!url || url.includes('PLACEHOLDER')) {
    testStatus.value = 'error';
    testMessage.value = 'Bạn chưa thay đổi URL mặc định trong file src/services/gasService.ts!';
    return;
  }

  testStatus.value = 'testing';
  testMessage.value = 'Đang gửi tín hiệu kiểm tra tới Google Apps Script...';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'ping' }),
    });

    const json = await res.json();
    if (json.success || json.status === 'ok') {
      testStatus.value = 'success';
      testMessage.value = 'Kết nối thành công tới Google Apps Script backend!';
    } else {
      testStatus.value = 'success';
      testMessage.value = 'Máy chủ phản hồi tốt (HTTP ' + res.status + ').';
    }
  } catch (err: any) {
    testStatus.value = 'error';
    testMessage.value = 'Không thể kết nối. Lưu ý triển khai Web App với quyền "Anyone" (Bất kỳ ai) và kiểm tra lại URL: ' + err.message;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div @click="emit('close')" class="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"></div>

    <!-- Modal Dialog -->
    <div class="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 z-10 transform transition-all space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-stone-100">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Settings class="w-5 h-5" />
          </div>
          <div>
            <h3 class="font-bold text-stone-900 text-base">Cấu hình hệ thống</h3>
            <p class="text-xs text-stone-400">Kết nối Google Apps Script & Thiết bị soát vé</p>
          </div>
        </div>
        <button @click="emit('close')" class="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Settings Content -->
      <div class="space-y-4 text-xs sm:text-sm">
        <!-- Verifier Name -->
        <div>
          <label class="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Tên cổng / Thiết bị soát vé
          </label>
          <input
            v-model="verifierName"
            type="text"
            placeholder="Ví dụ: Cổng Chính 1, Cổng VIP, Tình nguyện viên A"
            class="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-xs sm:text-sm"
          />
          <span class="text-[11px] text-stone-400 mt-0.5 block">
            Tên này sẽ được lưu vào cột "Người soát vé" trên Google Sheets để đối soát.
          </span>
        </div>

        <!-- Google Apps Script URL (Configured in Code) -->
        <div class="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode class="w-4 h-4 text-amber-600" />
              <span>URL Web App Google Apps Script</span>
            </label>
            <span class="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
              Cấu hình trong code
            </span>
          </div>

          <div class="p-2.5 bg-white border border-stone-200 rounded-xl break-all font-mono text-[11px] text-stone-700 select-all">
            {{ initialGasUrl }}
          </div>

          <p class="text-[11px] text-stone-500 leading-relaxed">
            Để đổi URL, hãy cập nhật hằng số <code>GAS_WEB_APP_URL</code> trong file <code>src/services/gasService.ts</code>.
          </p>

          <div class="pt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              @click="testConnection"
              :disabled="testStatus === 'testing'"
              class="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Globe class="w-3.5 h-3.5 text-stone-600" />
              <span>{{ testStatus === 'testing' ? 'Đang kiểm tra...' : 'Kiểm tra kết nối' }}</span>
            </button>

            <span v-if="testStatus === 'success'" class="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Check class="w-3.5 h-3.5" /> Kết nối tốt
            </span>
          </div>

          <!-- Test Connection Result Banner -->
          <div 
            v-if="testMessage" 
            :class="testStatus === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
            class="p-2.5 rounded-xl border text-xs font-medium"
          >
            {{ testMessage }}
          </div>
        </div>

        <!-- Cache Management -->
        <div class="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <span class="font-bold text-stone-800 text-xs block">Xóa bộ nhớ đệm (Cache máy)</span>
            <span class="text-[11px] text-stone-500">Xóa sạch danh sách cũ đã lưu tạm trên thiết bị để tải mới lại hoàn toàn.</span>
          </div>
          <button
            type="button"
            @click="handleClearCache"
            class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 active:scale-95"
            title="Xóa cache danh sách khách mời trên máy này"
          >
            <Trash2 class="w-3.5 h-3.5 text-red-600" />
            <span>Xóa Cache</span>
          </button>
        </div>

        <!-- Quick guide hint -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
          <HelpCircle class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="font-bold">Mẹo triển khai Google Apps Script:</p>
            <p class="text-[11px] text-blue-800 leading-relaxed">
              Mã backend nằm trong file <code>backend/Code.gs</code>. Chọn <strong>Deploy &gt; New deployment &gt; Web app (Execute as: Me, Who has access: Anyone)</strong>, sau đó copy URL dán vào <code>src/services/gasService.ts</code>.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors"
        >
          Đóng
        </button>
        <button
          type="button"
          @click="handleSave"
          class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
        >
          Lưu cấu hình
        </button>
      </div>
    </div>
  </div>
</template>
