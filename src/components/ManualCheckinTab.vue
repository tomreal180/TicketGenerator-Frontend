<script setup lang="ts">
import { ref } from 'vue';
import { Mail, Calendar, Search, X, UserCheck } from 'lucide-vue-next';

defineProps<{
  isProcessing: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', data: { email: string; dob: string }): void;
}>();

const email = ref('');
const dob = ref('');
const errorMessage = ref('');

const handleSubmit = () => {
  errorMessage.value = '';
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

  emit('submit', { email: cleanEmail, dob: cleanDob });
};

const handleClear = () => {
  email.value = '';
  dob.value = '';
  errorMessage.value = '';
};

// Quick domain append helper
const appendDomain = (domain: string) => {
  if (!email.value.includes('@')) {
    email.value += domain;
  }
};
</script>

<template>
  <div class="space-y-5">
    <!-- Manual Check-in Form Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-stone-200">
      <div class="flex items-center gap-3 pb-4 mb-5 border-b border-stone-100">
        <div class="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
          <UserCheck class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-stone-800">Soát vé thủ công</h2>
          <p class="text-xs text-stone-500">
            Dành cho khách không có mã QR, mất email vé hoặc camera không nhận diện được.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
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

        <!-- Error Message Banner -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {{ errorMessage }}
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 pt-2">
          <button
            type="submit"
            :disabled="isProcessing"
            class="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95"
          >
            <span v-if="isProcessing" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <Search v-else class="w-4 h-4" />
            <span>{{ isProcessing ? 'Đang đối soát...' : 'Kiểm tra & Check-in vé' }}</span>
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
  </div>
</template>
