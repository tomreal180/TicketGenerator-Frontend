<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Settings, Sparkles } from 'lucide-vue-next';

defineProps<{
  gasUrl: string;
  verifierName: string;
}>();

const emit = defineEmits<{
  (e: 'open-settings'): void;
}>();

const currentTime = ref('');
let timer: number | null = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <header class="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white shadow-lg border-b-4 border-amber-400 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
    <div class="absolute left-1/4 -top-10 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <!-- Logo and Event Title -->
        <div class="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 p-0.5 shadow-md flex items-center justify-center text-2xl transform hover:rotate-6 transition-transform">
              <span class="drop-shadow">🏮</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Tết Karlsruhe 2027
                  <Sparkles class="w-4 h-4 text-amber-300 inline animate-pulse" />
                </h1>
                <span class="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-amber-400 text-red-950 rounded-full shadow-sm">
                  Soát Vé
                </span>
              </div>
              <p class="text-xs text-red-200 flex items-center gap-2 font-medium">
                <span>{{ verifierName }}</span>
                <span>•</span>
                <span class="font-mono">{{ currentTime }}</span>
              </p>
            </div>
          </div>

          <!-- Mobile Quick Action Buttons -->
          <div class="flex items-center gap-1 sm:hidden">
            <button
              @click="emit('open-settings')"
              class="p-2 rounded-lg bg-red-900/40 text-amber-200 hover:bg-red-800 transition-colors"
              title="Cài đặt hệ thống"
            >
              <Settings class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Connection Status & Desktop Controls -->
        <div class="hidden sm:flex items-center gap-3">
          <!-- Backend Status Badge -->
          <div 
            class="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 shadow-sm backdrop-blur-sm"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>Google Apps Script: Kết nối trực tiếp</span>
          </div>

          <!-- Settings Button -->
          <button
            @click="emit('open-settings')"
            class="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-red-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md active:scale-95 transform"
          >
            <Settings class="w-4 h-4" />
            <span>Cài đặt</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
