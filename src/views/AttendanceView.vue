<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isCaptchaSolved = ref(false)
const captchaToken = ref('')
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const hasRegistered = ref(false)
const userName = ref('') // Tên người điểm danh

// Trỏ về Flask Backend
const FLASK_API_URL = 'https://ticketgenerator-backend.onrender.com/api/attendance'
// const FLASK_API_URL = 'http://127.0.0.1:5000/api/attendance' // Dùng khi test Local

// Test Key của Google (Hãy thay bằng Site Key thật)
const RECAPTCHA_SITE_KEY = '6LfaFastAAAAACcdlya-pWl6IP9ZTwMylnAtTcqz'

let recaptchaWidgetId: any = null

onMounted(() => {
  // Expose the callback to the global window object so reCAPTCHA can call it
  ;(window as any).onCaptchaSuccess = (token: string) => {
    isCaptchaSolved.value = true
    captchaToken.value = token
    errorMessage.value = ''
  }
  
  ;(window as any).onCaptchaExpired = () => {
    isCaptchaSolved.value = false
    captchaToken.value = ''
  }
  
  // Hàm thực thi việc Render widget (được gọi khi API tải xong hoặc nếu API đã có sẵn)
  ;(window as any).onRecaptchaLoad = () => {
    // Chỉ render nếu widget chưa được tạo trong thẻ div này
    const widgetContainer = document.getElementById('recaptcha-widget')
    if (widgetContainer && widgetContainer.innerHTML === '') {
      try {
        recaptchaWidgetId = (window as any).grecaptcha.render('recaptcha-widget', {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: 'onCaptchaSuccess',
          'expired-callback': 'onCaptchaExpired',
          theme: 'dark' // Giao diện dark mode phù hợp với trang web
        })
      } catch (e) {
        console.error("Lỗi khi render CAPTCHA", e)
      }
    }
  }

  // Kiểm tra xem đã tải script google recaptcha chưa
  if (!(window as any).grecaptcha || !(window as any).grecaptcha.render) {
    // Nếu chưa có, tiến hành chèn script vào Head
    // Sử dụng ?onload=onRecaptchaLoad để Google tự động gọi lại hàm trên khi script đã sẵn sàng 100%
    const script = document.createElement('script')
    script.id = 'recaptcha-script'
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  } else {
    // Nếu chuyển qua lại giữa các Tab (chuyển route), script đã tải rồi thì chỉ cần render lại
    ;(window as any).onRecaptchaLoad()
  }
})

onBeforeUnmount(() => {
  // Dọn dẹp callback
  delete (window as any).onCaptchaSuccess
  delete (window as any).onCaptchaExpired
  delete (window as any).onRecaptchaLoad
})

const submitAttendance = async () => {
  if (!isCaptchaSolved.value) {
    errorMessage.value = 'Vui lòng hoàn thành CAPTCHA trước khi đăng ký.'
    return
  }

  if (!userName.value.trim()) {
    errorMessage.value = 'Vui lòng nhập họ và tên của bạn.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(FLASK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: captchaToken.value,
        name: userName.value.trim()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Lỗi từ máy chủ. Vui lòng thử lại sau.')
    }
    
    successMessage.value = data.message || 'Đăng ký xem thuyết trình thành công! Cảm ơn bạn.'
    
    // Hiển thị màn hình báo thành công sau 3 giây (nhưng không lưu localStorage)
    setTimeout(() => {
      hasRegistered.value = true
    }, 3000)
    
  } catch (error: any) {
    errorMessage.value = error.message
    // Reset captcha sau khi lỗi để người dùng thử lại
    if ((window as any).grecaptcha && recaptchaWidgetId !== null) {
      (window as any).grecaptcha.reset(recaptchaWidgetId)
      isCaptchaSolved.value = false
      captchaToken.value = ''
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="items-start flex-grow w-full transition-all duration-700 mt-4 flex justify-center">
    <!-- Form Section (Card) -->
    <div class="w-full max-w-lg bg-[#1D0E36]/40 rounded-2xl border border-white/10 p-6 md:p-8 shadow-card backdrop-blur-xl relative overflow-hidden group transform-gpu">
      <!-- Inner Highlight -->
      <div class="absolute inset-0 rounded-2xl shadow-inner-highlight pointer-events-none"></div>
      
      <h2 class="text-2xl font-semibold tracking-tight mb-4 text-white">Đăng ký xem chung kết SiviHack 2026</h2>
      
      <div v-if="hasRegistered" class="relative z-10 flex flex-col items-center justify-center text-center py-8">
        <div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 class="text-white text-xl font-semibold mb-3">Bạn đã đăng ký thành công!</h3>
        <p class="text-[#BBA8D6] text-base font-light">Cảm ơn bạn đã quan tâm. Hẹn gặp lại bạn tại buổi thuyết trình của SiviHack 2026.</p>
      </div>

      <div v-else>
        <p class="text-[#BBA8D6] text-sm mb-8 font-light leading-relaxed">
          Buổi thuyết trình SiviHack 2026 có giới hạn số lượng chỗ ngồi. Vui lòng nhấn xác nhận để đăng ký giữ chỗ.
        </p>
        
        <div class="flex flex-col items-center space-y-6 relative z-10">
          
          <!-- Tên người tham gia -->
          <div class="w-full flex flex-col space-y-2">
            <label class="text-white text-sm font-medium">Họ và tên của bạn</label>
            <input 
              type="text" 
              v-model="userName" 
              class="w-full bg-[#2A164A]/60 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] transition-all"
              placeholder="Nhập họ tên đầy đủ..."
            />
          </div>

          <!-- Google reCAPTCHA v2 -->
          <div class="w-full flex justify-center py-2 relative min-h-[78px]">
            <div id="recaptcha-widget" class="transform scale-90 sm:scale-100 origin-center transition-all duration-300"></div>
            <!-- Loading indicator for captcha -->
            <div v-if="!isCaptchaSolved && !errorMessage" class="absolute inset-0 flex items-center justify-center -z-10 text-[#BBA8D6]/50 text-sm">
            </div>
          </div>

          <button 
            @click="submitAttendance"
            :disabled="isLoading || !isCaptchaSolved"
            :class="[
              'w-full text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 relative overflow-hidden group',
              (isLoading || !isCaptchaSolved) ? 'bg-[#2E1B7F]/50 opacity-50 cursor-not-allowed' : 'bg-[#2E1B7F] shadow-button-glow hover:bg-[#482EC2] active:scale-[0.98]'
            ]"
          >
            <!-- Shine Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Đang xử lý...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              Đăng ký tham gia
            </span>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p>{{ errorMessage }}</p>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-start gap-3 animate-in fade-in duration-300">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p>{{ successMessage }}</p>
        </div>
      </div>
    </div>
  </main>
</template>
