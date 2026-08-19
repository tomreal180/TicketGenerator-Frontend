<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const dob = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const pdfUrl = ref<string | null>(null)
const downloadedFilename = ref('ticket.pdf')

const downloadTicket = async () => {
  isLoading.value = true
  errorMessage.value = ''
  pdfUrl.value = null
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-ticket', {
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
  <div class="min-h-screen relative bg-background-base text-[#F4F0FA] flex flex-col font-sans">
    
    <!-- Ambient Background Layers -->
    <div class="fixed inset-0 bg-radial-fade z-0"></div>
    <div class="fixed inset-0 bg-noise z-0 mix-blend-overlay"></div>
    <div class="fixed inset-0 bg-grid-overlay z-0"></div>
    
    <!-- Animated Glowing Blobs (Purple & Cyan inspired by SiviCamp) -->
    <div class="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#482EC2]/30 rounded-full blur-[120px] animate-float z-0 pointer-events-none"></div>
    <div class="fixed top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#FF3366]/10 rounded-full blur-[100px] animate-float-delayed z-0 pointer-events-none"></div>
    <div class="fixed top-[40%] right-[-10%] w-[500px] h-[700px] bg-[#00E5FF]/10 rounded-full blur-[120px] animate-float z-0 pointer-events-none"></div>

    <div class="relative z-10 flex-grow flex flex-col max-w-6xl mx-auto w-full px-6 md:px-12 py-16 md:py-32">
      
      <!-- Header -->
      <header class="mb-16 md:mb-24 text-center flex flex-col items-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/50 bg-accent/20 mb-8 backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]"></span>
          <span class="text-xs font-mono text-[#F4F0FA] tracking-widest uppercase">SiviCamp 2026</span>
        </div>
        
        <h1 class="text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-tight mb-6 bg-gradient-to-b from-white via-[#E2D9F3] to-[#8A78A8] bg-clip-text text-transparent">
          Retrieve your access.
        </h1>
        <p class="text-[#BBA8D6] text-lg md:text-xl max-w-2xl font-light">
          Enter your registered email and date of birth to securely generate and download your personalized event pass.
        </p>
      </header>

      <main class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start flex-grow">
        
        <!-- Form Section (Card) -->
        <div class="lg:col-span-5 w-full bg-[#1D0E36]/40 rounded-2xl border border-white/10 p-6 md:p-8 shadow-card backdrop-blur-xl relative overflow-hidden group">
          <!-- Inner Highlight -->
          <div class="absolute inset-0 rounded-2xl shadow-inner-highlight pointer-events-none"></div>
          
          <h2 class="text-2xl font-semibold tracking-tight mb-8 text-white">Authentication</h2>
          
          <form @submit.prevent="downloadTicket" class="space-y-6 relative z-10">
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-[#BBA8D6]">Email Address</label>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                required
                class="block w-full bg-[#0B0410]/80 border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:border-[#482EC2] focus:shadow-input-focus transition-all duration-200 placeholder:text-white/30"
                placeholder="developer@example.com"
              />
            </div>

            <div class="space-y-2">
              <label for="dob" class="block text-sm font-medium text-[#BBA8D6]">Date of Birth</label>
              <input 
                type="text" 
                id="dob" 
                v-model="dob" 
                required
                class="block w-full bg-[#0B0410]/80 border border-white/10 rounded-lg px-4 py-3 text-base text-white focus:outline-none focus:border-[#482EC2] focus:shadow-input-focus transition-all duration-200 placeholder:text-white/30"
                placeholder="DD/MM/YYYY"
              />
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full bg-[#2E1B7F] text-white py-3 px-4 rounded-lg font-medium shadow-button-glow hover:bg-[#482EC2] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 mt-4 relative overflow-hidden"
            >
              <!-- Shine Effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Authenticating...
              </span>
              <span v-else>Generate Pass</span>
            </button>
          </form>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
            <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p>{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Ticket Preview Section -->
        <div class="lg:col-span-7 w-full h-full min-h-[500px] flex flex-col">
          
          <div v-if="!pdfUrl" class="flex-grow rounded-2xl border border-white/[0.04] bg-[#1D0E36]/20 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden backdrop-blur-sm">
            <svg class="w-12 h-12 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p class="text-[#BBA8D6] font-medium text-sm">
              Your pass will appear here securely
            </p>
          </div>

          <div v-else class="flex-grow flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex-grow rounded-2xl border border-white/[0.08] bg-[#0B0410] overflow-hidden p-1 shadow-card transition-all hover:shadow-card-hover hover:border-white/[0.15] duration-300 relative group">
                <div class="absolute inset-0 shadow-inner-highlight pointer-events-none rounded-2xl"></div>
                <!-- PDF Viewer -->
                <iframe :src="pdfUrl" class="w-full h-[600px] border-0 rounded-xl bg-white" title="Ticket Preview"></iframe>
            </div>
            
            <button 
              @click="triggerDownload"
              class="self-start bg-white/10 text-white py-2 px-4 rounded-lg font-medium border-none shadow-inner-highlight hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-200 active:scale-[0.98] flex items-center gap-2 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download PDF
            </button>
          </div>
        </div>

      </main>

      <!-- Footer -->
      <footer class="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-[#BBA8D6] text-xs tracking-wider">
          <span class="text-white font-medium">SiviCamp</span> © 2026
        </p>
        <div class="flex items-center gap-2 text-xs text-[#BBA8D6]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_4px_#00E5FF]"></span>
          Systems Operational
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
</style>
