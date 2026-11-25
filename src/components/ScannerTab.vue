<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  FlipHorizontal, 
  Zap, 
  ZapOff, 
  Upload, 
  AlertCircle
} from 'lucide-vue-next';

const props = defineProps<{
  isProcessing: boolean;
  isActiveTab: boolean;
}>();

const emit = defineEmits<{
  (e: 'scan', qrData: string): void;
}>();

const scannerElementId = 'qr-reader-video';
let html5QrCode: Html5Qrcode | null = null;

const isScanning = ref(false);
const cameraError = ref<string | null>(null);
const cameras = ref<{ id: string; label: string }[]>([]);
const selectedCameraId = ref<string>('');
const isTorchOn = ref(false);
const hasTorch = ref(false);

// Tự động tắt Camera khi chuyển sang tab khác và kích hoạt lại khi quay lại tab Scanner
watch(
  () => props.isActiveTab,
  async (isActive) => {
    if (!isActive) {
      await stopScanning();
    } else {
      if (!isScanning.value && !props.isProcessing) {
        await startScanning();
      }
    }
  }
);

// Initialize scanner
const initScanner = async () => {
  try {
    cameraError.value = null;
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length > 0) {
      cameras.value = devices;
      // Mặc định chọn camera sau nếu có
      const backCam = devices.find((d) => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear') || 
        d.label.toLowerCase().includes('sau')
      );
      selectedCameraId.value = backCam ? backCam.id : devices[0].id;
      if (props.isActiveTab) {
        await startScanning();
      }
    } else {
      cameraError.value = 'Không tìm thấy camera trên thiết bị này.';
    }
  } catch (err: any) {
    console.error('Camera initialization error:', err);
    cameraError.value = 'Không thể truy cập camera. Vui lòng cấp quyền máy ảnh cho trình duyệt (HTTPS hoặc localhost).';
  }
};

const startScanning = async () => {
  if (!selectedCameraId.value) return;
  cameraError.value = null;

  try {
    if (html5QrCode && isScanning.value) {
      await stopScanning();
    }

    await nextTick();
    html5QrCode = new Html5Qrcode(scannerElementId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });

    const config = {
      fps: 12,
      aspectRatio: 1.0,
    };

    await html5QrCode.start(
      selectedCameraId.value,
      config,
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (_errorMessage) => {
        // Routine scanning
      }
    );

    isScanning.value = true;

    // Check torch capability
    try {
      const track = (html5QrCode as any).getRunningTrackCapabilities?.();
      hasTorch.value = !!track?.torch;
    } catch {
      hasTorch.value = false;
    }
  } catch (err: any) {
    console.error('Start scanning error:', err);
    cameraError.value = 'Không thể khởi động camera: ' + (err.message || 'Lỗi thiết bị');
    isScanning.value = false;
  }
};

const stopScanning = async () => {
  if (html5QrCode && isScanning.value) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (e) {
      console.warn('Stop scanning error:', e);
    }
    isScanning.value = false;
  }
};

const toggleCamera = async () => {
  if (cameras.value.length < 2) return;
  const currentIndex = cameras.value.findIndex((c) => c.id === selectedCameraId.value);
  const nextIndex = (currentIndex + 1) % cameras.value.length;
  selectedCameraId.value = cameras.value[nextIndex].id;
  await startScanning();
};

const toggleTorch = async () => {
  if (!html5QrCode || !hasTorch.value) return;
  try {
    isTorchOn.value = !isTorchOn.value;
    await html5QrCode.applyVideoConstraints({
      advanced: [{ torch: isTorchOn.value } as any],
    });
  } catch (e) {
    console.warn('Torch toggle error:', e);
  }
};

// Xử lý khi quét thành công 1 mã: TẮT CAMERA NGAY LẬP TỨC
const handleScanSuccess = async (text: string) => {
  if (props.isProcessing || !isScanning.value) return;

  // 1. TẮT CAMERA NGAY LẬP TỨC để tiết kiệm pin và tránh quét trùng
  await stopScanning();

  // 2. Gửi mã quét lên App.vue xử lý
  emit('scan', text);
};

// Handle file upload fallback
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  try {
    const tempScanner = new Html5Qrcode('temp-qr-reader');
    const result = await tempScanner.scanFile(file, true);
    handleScanSuccess(result);
  } catch (err: any) {
    alert('Không tìm thấy mã QR hợp lệ trong ảnh đã tải lên.');
  } finally {
    target.value = '';
  }
};

onMounted(() => {
  initScanner();
});

onUnmounted(() => {
  stopScanning();
});

defineExpose({
  startScanning,
  stopScanning,
  isScanning
});
</script>

<template>
  <div class="space-y-4">
    <!-- Camera Viewport Card -->
    <div class="bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-stone-800 relative">
      <!-- Top Overlay Controls -->
      <div class="absolute top-3 left-3 right-3 z-20 flex items-center justify-between text-xs text-white">
        <!-- Status indicator (nhẹ, không chạy animation liên tục) -->
        <div class="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span 
            :class="isScanning ? 'bg-emerald-400' : 'bg-stone-400'"
            class="w-2 h-2 rounded-full"
          ></span>
          <span class="font-medium tracking-wide">
            {{ isScanning ? 'Camera đang quét' : 'Camera đã tắt' }}
          </span>
        </div>

        <!-- Camera Switch & Flash Controls -->
        <div class="flex items-center gap-2">
          <!-- Torch button -->
          <button
            v-if="hasTorch"
            @click="toggleTorch"
            :class="isTorchOn ? 'bg-amber-400 text-stone-950' : 'bg-black/60 text-white'"
            class="p-2 rounded-full backdrop-blur-md border border-white/10 hover:bg-black/80 transition-colors"
            title="Bật đèn Flash"
          >
            <Zap v-if="isTorchOn" class="w-4 h-4 fill-current" />
            <ZapOff v-else class="w-4 h-4" />
          </button>

          <!-- Switch camera button -->
          <button
            v-if="cameras.length > 1"
            @click="toggleCamera"
            class="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-colors"
            title="Đổi camera trước/sau"
          >
            <FlipHorizontal class="w-4 h-4" />
          </button>

          <!-- Pause/Resume button -->
          <button
            @click="isScanning ? stopScanning() : startScanning()"
            :class="isScanning ? 'bg-black/60 text-stone-300' : 'bg-emerald-600 text-white'"
            class="p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
            :title="isScanning ? 'Tắt camera' : 'Tiếp tục quét'"
          >
            <CameraOff v-if="isScanning" class="w-4 h-4" />
            <Camera v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Video Scanner Container -->
      <div class="relative w-full aspect-square sm:aspect-[4/3] max-h-[380px] bg-stone-950 flex items-center justify-center overflow-hidden">
        <div id="qr-reader-video" class="w-full h-full object-cover"></div>

        <!-- Scanning Frame Overlay Graphic (Tối giản, nhẹ máy) -->
        <div v-if="isScanning" class="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div class="relative w-56 h-56 sm:w-64 sm:h-64">
            <!-- Corners (Tết Gold Accents) -->
            <div class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl"></div>
            <div class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl"></div>

            <!-- Center guidance text -->
            <div class="absolute inset-x-0 bottom-4 text-center">
              <span class="text-[11px] font-medium text-amber-200/90 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
                Đặt mã QR vào giữa khung
              </span>
            </div>
          </div>
        </div>

        <!-- MÀN HÌNH CHỜ KHI CAMERA ĐÃ TẮT: CÓ NÚT BẤM TIẾP TỤC QUÉT -->
        <div 
          v-if="!isScanning && !cameraError" 
          class="absolute inset-0 bg-stone-950/90 flex flex-col items-center justify-center p-6 text-center z-25"
        >
          <div class="w-14 h-14 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center mb-3 border border-stone-700 shadow-md">
            <Camera class="w-7 h-7 text-amber-400" />
          </div>
          <h4 class="text-sm font-bold text-white mb-1">Camera đang tạm dừng</h4>
          <p class="text-xs text-stone-400 mb-4 max-w-xs">
            Máy ảnh đã tự động tắt để tiết kiệm pin và chống nóng máy. Bấm nút dưới để quét vé tiếp theo.
          </p>
          <button
            @click="startScanning"
            class="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"
          >
            <Camera class="w-4 h-4" />
            <span>Tiếp tục quét mã QR</span>
          </button>
        </div>

        <!-- Camera Error Banner if failed -->
        <div v-if="cameraError" class="absolute inset-0 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertCircle class="w-12 h-12 text-amber-400 mb-3" />
          <p class="text-sm font-semibold text-white mb-2">{{ cameraError }}</p>
          <p class="text-xs text-stone-400 max-w-sm mb-4">
            Nếu chạy trên điện thoại hoặc máy tính, bạn có thể tải ảnh chụp vé lên hoặc dùng tab Soát vé thủ công.
          </p>
          <button
            @click="initScanner"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Thử lại kết nối Camera
          </button>
        </div>
      </div>

      <!-- Bottom controls / Upload file bar -->
      <div class="p-3 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs">
        <!-- Camera select dropdown if multiple -->
        <div class="flex items-center gap-2 max-w-[60%] truncate">
          <Camera class="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            v-if="cameras.length > 0"
            v-model="selectedCameraId"
            @change="startScanning"
            class="bg-stone-800 text-stone-200 text-xs rounded-lg px-2 py-1 border border-stone-700 outline-none truncate"
          >
            <option v-for="cam in cameras" :key="cam.id" :value="cam.id">
              {{ cam.label || 'Camera ' + cam.id }}
            </option>
          </select>
          <span v-else class="text-stone-400 text-xs">Chưa nhận diện camera</span>
        </div>

        <!-- Upload image fallback -->
        <label class="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700">
          <Upload class="w-3.5 h-3.5 text-amber-400" />
          <span class="font-medium text-xs">Tải ảnh QR</span>
          <input 
            type="file" 
            accept="image/*" 
            @change="handleFileUpload" 
            class="hidden" 
          />
        </label>
      </div>
    </div>

    <!-- Hidden div for file scanner utility -->
    <div id="temp-qr-reader" class="hidden"></div>
  </div>
</template>

<style scoped>
/* Ẩn hoàn toàn ô trắng và vùng che mặc định do thư viện html5-qrcode tự chèn vào DOM */
:deep(#qr-shaded-region),
:deep(#qr-shaded-region div),
:deep(#qr-reader-video__scan_region),
:deep(#qr-reader-video__scan_region div) {
  display: none !important;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

:deep(#qr-reader-video) {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  border: none !important;
}

:deep(#qr-reader-video video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
</style>
