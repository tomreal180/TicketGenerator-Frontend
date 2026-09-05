<script setup lang="ts">
import { ref, computed } from 'vue'

const email = ref('')
const dob = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const pdfUrl = ref<string | null>(null)
const downloadedFilename = ref('ticket.pdf')
const API_URL = 'https://ticketgenerator-backend.onrender.com/api/generate-ticket'

const isEmailValid = computed(() => {
  if (!email.value) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const isDobValid = computed(() => {
  if (!dob.value) return null
  // DD/MM/YYYY format validation
  return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/.test(dob.value)
})

const supportsPDFViewer = computed(() => {
  if (typeof navigator !== 'undefined' && 'pdfViewerEnabled' in navigator) {
    return navigator.pdfViewerEnabled
  }
  return window.innerWidth >= 768
})

const isFormValid = computed(() => {
  return isEmailValid.value === true && isDobValid.value === true
})

const formatDob = (e: Event) => {
  const input = e.target as HTMLInputElement
  let val = input.value.replace(/\D/g, '')
  
  let formatted = ''
  if (val.length > 0) formatted = val.substring(0, 2)
  if (val.length > 2) formatted += '/' + val.substring(2, 4)
  if (val.length > 4) formatted += '/' + val.substring(4, 8)
  
  dob.value = formatted
}

const lastEmail = ref('')
const lastDob = ref('')
const successMessage = ref('')

const isTicketCached = computed(() => {
  return email.value === lastEmail.value && dob.value === lastDob.value && !!pdfUrl.value
})

const downloadTicket = async () => {
  if (isTicketCached.value) {
    successMessage.value = 'Vé của bạn đã được tải thành công, vui lòng kiểm tra phần Download.'
    triggerDownload()
    setTimeout(() => { successMessage.value = '' }, 3500)
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  pdfUrl.value = null  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        dob: dob.value
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'System error. Please try again later.')
    }

    const disposition = response.headers.get('Content-Disposition')
    if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) {
            downloadedFilename.value = matches[1].replace(/['"]/g, '')
        }
    }

    const blob = await response.blob()
    pdfUrl.value = window.URL.createObjectURL(blob)
    
    // Lưu lại cache session
    lastEmail.value = email.value
    lastDob.value = dob.value
    
    // Tự động kích hoạt tải về nếu trình duyệt không hỗ trợ xem trước PDF
    if (!supportsPDFViewer.value) {
      setTimeout(() => triggerDownload(), 300)
    }
    
  } catch (error: any) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const triggerDownload = () => {
  if (pdfUrl.value) {
    const a = document.createElement('a')
    a.href = pdfUrl.value
    a.download = downloadedFilename.value
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
}
</script>

<template>
  <main :class="['items-start flex-grow w-full transition-all duration-700 mt-4', pdfUrl ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12' : 'flex justify-center']">
    <!-- Form Section (Card) -->
    <div :class="['w-full bg-[#1D0E36]/40 rounded-2xl border border-white/10 p-6 md:p-8 shadow-card backdrop-blur-xl relative overflow-hidden group transition-all duration-700', pdfUrl ? 'lg:col-span-5' : 'max-w-lg']">
      <!-- Inner Highlight -->
      <div class="absolute inset-0 rounded-2xl shadow-inner-highlight pointer-events-none"></div>
      
      <h2 class="text-2xl font-semibold tracking-tight mb-8 text-white">Xác thực thông tin</h2>
      
      <form @submit.prevent="downloadTicket" class="space-y-6 relative z-10">
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-[#BBA8D6]">Địa chỉ Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            :class="[
              'block w-full bg-[#0B0410]/80 border rounded-lg px-4 py-3 text-base text-white focus:outline-none transition-all duration-200 placeholder:text-white/30',
              isEmailValid === true ? 'border-green-500 focus:border-green-500 focus:shadow-[0_0_0_1px_#22c55e,0_0_0_4px_rgba(34,197,94,0.2)]' : 
              isEmailValid === false ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_1px_#ef4444,0_0_0_4px_rgba(239,68,68,0.2)] text-red-300' : 
              'border-white/10 focus:border-[#482EC2] focus:shadow-input-focus'
            ]"
            placeholder="nguoidung@example.com"
          />
        </div>

        <div class="space-y-2">
          <label for="dob" class="block text-sm font-medium text-[#BBA8D6]">Ngày sinh</label>
          <input 
            type="text" 
            id="dob" 
            v-model="dob" 
            @input="formatDob"
            maxlength="10"
            required
            :class="[
              'block w-full bg-[#0B0410]/80 border rounded-lg px-4 py-3 text-base text-white focus:outline-none transition-all duration-200 placeholder:text-white/30',
              isDobValid === true ? 'border-green-500 focus:border-green-500 focus:shadow-[0_0_0_1px_#22c55e,0_0_0_4px_rgba(34,197,94,0.2)]' : 
              isDobValid === false ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_1px_#ef4444,0_0_0_4px_rgba(239,68,68,0.2)] text-red-300' : 
              'border-white/10 focus:border-[#482EC2] focus:shadow-input-focus'
            ]"
            placeholder="DD/MM/YYYY"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading || !isFormValid"
          :class="[
            'w-full text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 mt-4 relative overflow-hidden group',
            (isLoading || !isFormValid) ? 'bg-[#2E1B7F]/50 opacity-50 cursor-not-allowed' : 'bg-[#2E1B7F] shadow-button-glow hover:bg-[#482EC2] active:scale-[0.98]'
          ]"
        >
          <!-- Shine Effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Đang xác thực...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg v-if="isTicketCached" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            {{ isTicketCached ? 'Tải vé PDF' : 'Tạo vé' }}
          </span>
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-in fade-in">
        <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Success Message (Anti-spam) -->
      <div v-if="successMessage" class="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-start gap-3 animate-in fade-in duration-300">
        <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p>{{ successMessage }}</p>
      </div>

      <!-- Contact Notice -->
      <p class="mt-8 text-center text-[13px] text-[#BBA8D6]/70">
        Nếu có vấn đề trong việc nhận vé, hãy liên hệ với
        <a href="https://www.facebook.com/sividuc" target="_blank" rel="noopener noreferrer" class="text-[#00E5FF] hover:text-white font-medium underline underline-offset-2 transition-colors">
          Sividuc
        </a>
      </p>
    </div>

    <!-- Ticket Preview Section -->
    <div v-if="pdfUrl" class="lg:col-span-7 w-full h-full flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-700">
      
      <div class="flex flex-col space-y-6 w-full">
        
        <!-- Desktop / Supported PDF Viewer -->
        <div v-if="supportsPDFViewer" class="w-full rounded-2xl border border-white/[0.08] bg-[#0B0410] overflow-hidden p-1 shadow-card transition-all hover:shadow-card-hover hover:border-white/[0.15] duration-300 relative group">
            <div class="absolute inset-0 shadow-inner-highlight pointer-events-none rounded-2xl"></div>
            <iframe :src="pdfUrl" class="w-full h-[600px] border-0 rounded-xl bg-white" title="Ticket Preview"></iframe>
        </div>
            
        <!-- Unsupported Browser Success Fallback -->
        <div v-else class="w-full bg-[#1D0E36]/40 rounded-2xl border border-white/10 p-8 shadow-card backdrop-blur-xl flex flex-col items-center justify-center text-center">
          <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h3 class="text-white text-lg font-semibold mb-2">Vé đã tạo thành công!</h3>
          <p class="text-[#BBA8D6] text-sm">Hệ thống đang tự động tải vé về thiết bị của bạn. Bạn cũng có thể bấm nút Tải vé PDF bên form nếu quá trình tự động gặp lỗi.</p>
        </div>
      </div>
    </div>
  </main>
</template>
