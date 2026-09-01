<!--
  Global Error & Notification Modal Component for Montage Auto Studio.
  Provides a programmatically-invoked Promise-based alert/notification modal dialog (show method).
-->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm">
    <div class="bg-white p-8 w-full max-w-sm relative rounded-[2rem] shadow-2xl mx-4 border border-neutral-200 animate-modal-scale-in">
      <div class="text-center space-y-4">
        <div 
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center mx-auto font-mono text-xl font-bold',
            isInfo ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
          ]"
        >
          {{ isInfo ? 'i' : '!' }}
        </div>
        <div>
          <h3 class="text-lg font-black uppercase tracking-tight text-dark">Notification</h3>
          <p class="text-xs text-neutral-500 font-medium mt-2 leading-relaxed whitespace-pre-line">
            {{ message }}
          </p>
        </div>
        <div class="pt-2">
          <button 
            @click="closeModal" 
            type="button" 
            class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-3.5 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-sm focus:outline-none"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Programmatic modal trigger exposing Promise resolution upon user acknowledgment
import { ref } from 'vue';

const isOpen = ref(false);
const message = ref('');

const isInfo = ref(false);
let resolvePromise = null;

const sanitizeErrorMessage = (msg, infoMode) => {
  if (!msg) return 'An unexpected system error occurred. Please try again.';
  const str = String(msg);
  
  // Log full raw error trace to browser developer console for debugging
  if (!infoMode) {
    console.error('[Montage Studio System Error]:', msg);
  }
  
  // Intercept and sanitize technical, Prisma, and database tracebacks
  if (
    str.includes('prisma.') ||
    str.includes('PrismaClient') ||
    str.includes('findUnique') ||
    str.includes('database server') ||
    str.includes('DATABASE_URL') ||
    str.includes('ep-curly-unit') ||
    str.includes('.aws.neon.tech') ||
    str.includes('/data/users/') ||
    str.includes('Invocation in') ||
    str.includes('ConnectorError') ||
    str.includes('500')
  ) {
    return 'Database connection is currently unavailable. Please try again in a few moments or contact support.';
  }
  
  return str;
};

const show = (msg, infoMode = false) => {
  message.value = sanitizeErrorMessage(msg, infoMode);
  isInfo.value = infoMode;
  isOpen.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const closeModal = () => {
  isOpen.value = false;
  if (resolvePromise) resolvePromise();
};

defineExpose({ show, closeModal });
</script>
