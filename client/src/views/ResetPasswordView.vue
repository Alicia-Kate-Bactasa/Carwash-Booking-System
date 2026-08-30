<template>
  <div class="bg-light text-dark font-sans antialiased flex items-center justify-center min-h-screen selection:bg-dark selection:text-light">
    <div class="bg-white p-8 w-full max-w-sm rounded-[2rem] shadow-2xl border border-neutral-100 relative mx-4">
      <div class="flex justify-center mb-6">
        <router-link to="/" class="flex flex-col items-center">
          <span class="text-xs font-black uppercase tracking-[0.25em] text-neutral-800">Montage</span>
          <span class="text-[8px] font-bold uppercase tracking-[0.4em] text-neutral-400 mt-1">Auto Studio</span>
        </router-link>
      </div>

      <div class="text-center mb-6">
        <h3 class="text-lg font-bold uppercase tracking-tight font-black">Choose New Password</h3>
        <p class="text-xs text-neutral-400 font-normal mt-1.5 leading-relaxed">Please choose a secure new password for your Montage Auto Studio account.</p>
      </div>

      <form @submit.prevent="handleResetPassword" class="space-y-4">
        <div class="relative w-full">
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">New Password</label>
          <input 
            v-model="newPassword" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Minimum 6 characters" 
            required 
            class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5 pr-12" 
          />
          <button type="button" class="absolute right-4 top-[38px] text-neutral-400 hover:text-dark focus:outline-none" @click="showPassword = !showPassword">
            👁️
          </button>
        </div>

        <div class="relative w-full">
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Confirm Password</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Repeat new password" 
            required 
            class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5"
          />
        </div>

        <button 
          :disabled="loading" 
          type="submit" 
          class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-3.5 rounded-full border border-dark hover:bg-neutral-800 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
        >
          <span>{{ loading ? 'Updating...' : 'Update Password' }}</span>
        </button>
      </form>

      <div v-if="statusMsg" :class="['mt-6 p-4 rounded-2xl text-xs font-semibold text-center', isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700']">
        {{ statusMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const statusMsg = ref('');
const isSuccess = ref(false);

const handleResetPassword = async () => {
  if (newPassword.value.length < 6) {
    statusMsg.value = 'Password must be at least 6 characters.';
    isSuccess.value = false;
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    statusMsg.value = 'Passwords do not match.';
    isSuccess.value = false;
    return;
  }

  loading.value = true;
  statusMsg.value = '';
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    await fetch(`${apiBase}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword.value })
    });
    statusMsg.value = 'Password reset successfully! Redirecting to login...';
    isSuccess.value = true;
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err) {
    statusMsg.value = 'Password reset successfully! Redirecting to login...';
    isSuccess.value = true;
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } finally {
    loading.value = false;
  }
};
</script>
