<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen relative bg-background-base text-[#F4F0FA] flex flex-col font-sans">
    
    <!-- Ambient Background Layers -->
    <div class="fixed inset-0 bg-radial-fade z-0"></div>
    <div class="fixed inset-0 bg-noise z-0 mix-blend-overlay"></div>
    <div class="fixed inset-0 bg-grid-overlay z-0"></div>
    
    <!-- Animated Glowing Blobs -->
    <div class="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[#482EC2]/30 rounded-full blur-[120px] animate-float z-0 pointer-events-none"></div>
    <div class="fixed top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#FF3366]/10 rounded-full blur-[100px] animate-float-delayed z-0 pointer-events-none"></div>
    <div class="fixed top-[40%] right-[-10%] w-[500px] h-[700px] bg-[#00E5FF]/10 rounded-full blur-[120px] animate-float z-0 pointer-events-none"></div>

    <div class="relative z-10 flex-grow flex flex-col max-w-6xl mx-auto w-full px-6 md:px-12 py-8 md:py-12">
      
      <!-- Header -->
      <header class="mb-8 md:mb-12 text-center flex flex-col items-center">
        <!-- Organizer Logos -->
        <div class="flex justify-center items-center">
          <img src="./assets/vgi.svg" alt="VGI Logo" class="h-16 md:h-20 w-auto opacity-80 hover:opacity-100 transition-opacity" />
          <img src="./assets/sividuc.svg" alt="Sividuc Logo" class="h-20 md:h-24 w-auto opacity-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:scale-105 transition-all" />
          <img src="./assets/vsaf.svg" alt="VSAF Logo" class="h-16 md:h-20 w-auto opacity-80 hover:opacity-100 transition-opacity" />
        </div>

        <div class="mb-3 flex justify-center items-center">
          <img src="./assets/LOGO.svg" alt="SiviCamp 2026 Logo" class="h-28 md:h-32 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]" />
        </div>
        
        <!-- Sponsors Section -->
        <div class="mb-16 w-full max-w-4xl overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <p class="text-center text-xs font-medium tracking-widest text-[#BBA8D6]/60 uppercase mb-4">Được đồng hành cùng</p>
          <div class="flex w-max animate-marquee opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div class="flex gap-12 md:gap-16 px-6 md:px-8 items-center">
              <img src="./assets/Code4You.svg" alt="Code4You Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/VietinBank.svg" alt="VietinBank Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/NVIDIA.svg" alt="NVIDIA Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/ArticsAI.svg" alt="ArticsAI Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/Datanomiq.svg" alt="Datanomiq Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/GDG.svg" alt="GDG Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/n8n.svg" alt="n8n Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/VietnamAirlines.svg" alt="VietnamAirlines Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
            </div>
            <div class="flex gap-12 md:gap-16 px-6 md:px-8 items-center" aria-hidden="true">
              <img src="./assets/Code4You.svg" alt="Code4You Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/VietinBank.svg" alt="VietinBank Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/NVIDIA.svg" alt="NVIDIA Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/ArticsAI.svg" alt="ArticsAI Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/Datanomiq.svg" alt="Datanomiq Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/GDG.svg" alt="GDG Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/n8n.svg" alt="n8n Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
              <img src="./assets/VietnamAirlines.svg" alt="VietnamAirlines Logo" class="h-10 md:h-12 w-auto drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" />
            </div>
          </div>
        </div>

        <h1 class="text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-tight mb-4 bg-gradient-to-b from-white via-[#E2D9F3] to-[#8A78A8] bg-clip-text text-transparent">
          SiviCamp 2026
        </h1>
        <p class="text-[#BBA8D6] text-base md:text-lg max-w-2xl font-light mb-8">
          Vui lòng chọn chức năng bên dưới.
        </p>

        <!-- Navigation Switcher -->
        <div class="bg-[#1D0E36]/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex items-center gap-1 w-full max-w-md mx-auto shadow-inner">
          <router-link 
            to="/nhanve"
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 text-center"
            :class="route.path === '/nhanve' ? 'bg-[#482EC2] text-white shadow-md' : 'text-[#BBA8D6] hover:text-white hover:bg-white/5'"
          >
            Lấy vé điện tử
          </router-link>
          <router-link 
            to="/diemdanh"
            class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 text-center"
            :class="route.path === '/diemdanh' ? 'bg-[#482EC2] text-white shadow-md' : 'text-[#BBA8D6] hover:text-white hover:bg-white/5'"
          >
            Đăng ký tham gia
          </router-link>
        </div>
      </header>

      <!-- Router View for Page Content -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- Footer -->
      <footer class="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-4">
        <p class="text-[#BBA8D6] text-xs tracking-wider">
          <span class="text-white font-medium">SiviCamp</span> © 2026
        </p>
      </footer>
    </div>
  </div>
</template>

<style>
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 20s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
