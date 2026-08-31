<!--
  Forgot Password View Component for Montage Auto Studio.
  3-step password recovery flow: 1) Email address submission, 2) 6-digit OTP code verification, 3) New password update.
-->
<template>
  <div class="bg-light text-dark font-sans antialiased flex items-center justify-center min-h-screen selection:bg-dark selection:text-light py-10">
    <div class="bg-white p-8 w-full max-w-sm rounded-[2rem] shadow-2xl border border-neutral-100 relative mx-4">
      <div class="flex justify-center mb-6">
        <router-link to="/" class="flex flex-col items-center">
          <span class="text-xs font-black uppercase tracking-[0.25em] text-neutral-800">Montage</span>
          <span class="text-[8px] font-bold uppercase tracking-[0.4em] text-neutral-400 mt-1">Auto Studio</span>
        </router-link>
      </div>

      <div class="text-center mb-6">
        <h3 class="text-lg font-bold uppercase tracking-tight font-black">Reset Password</h3>
        <p class="text-xs text-neutral-400 font-normal mt-1.5 leading-relaxed">{{ subtitle }}</p>
      </div>

      <!-- Step 1: Email Form -->
      <div v-if="step === 1" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Email Address</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="e.g. client@domain.com" 
            required 
            class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5"
          />
        </div>

        <button 
          @click="handleSendOtp" 
          :disabled="loading" 
          type="button" 
          class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-3.5 rounded-full border border-dark hover:bg-neutral-800 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
        >
          <span>{{ loading ? 'Sending Code...' : 'Send Code' }}</span>
        </button>
      </div>

      <!-- Step 2: OTP Verification Section -->
      <div v-if="step === 2" class="space-y-4 mt-4 pt-4 border-t border-neutral-100">
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">6-Digit Verification Code</label>
            <button 
              @click="handleResendOtp" 
              :disabled="resendDisabled" 
              type="button" 
              class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-dark disabled:opacity-50 transition-colors"
            >
              Resend OTP
            </button>
          </div>
          <input 
            v-model="otp" 
            type="text" 
            placeholder="Enter verification code" 
            maxlength="8" 
            class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5 text-center tracking-widest"
          />
        </div>

        <button 
          @click="handleVerifyOtp" 
          :disabled="loading" 
          type="button" 
          class="w-full bg-emerald-600 text-white text-xs font-bold tracking-widest uppercase py-3.5 rounded-full hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
        >
          <span>{{ loading ? 'Verifying...' : 'Verify Code' }}</span>
        </button>
      </div>

      <!-- Step 3: New Password Section -->
      <div v-if="step === 3" class="space-y-4 mt-4 pt-4 border-t border-neutral-100">
        <div class="relative w-full">
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">New Password</label>
          <input 
            v-model="newPassword" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="Minimum 8 chars" 
            required 
            class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5 pr-12" 
          />
          <button type="button" class="absolute right-4 top-[38px] text-neutral-400 hover:text-dark focus:outline-none" @click="showPassword = !showPassword">
            👁️
          </button>
        </div>

        <div class="relative w-full">
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Confirm New Password</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Repeat new password" 
            required 
            class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5"
          />
        </div>

        <button 
          @click="handleResetPassword" 
          :disabled="loading" 
          type="button" 
          class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-3.5 rounded-full border border-dark hover:bg-neutral-800 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
        >
          <span>{{ loading ? 'Updating...' : 'Update Password' }}</span>
        </button>
      </div>

      <div v-if="statusMsg" :class="['mt-6 p-4 rounded-2xl text-xs font-semibold text-center', isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700']">
        {{ statusMsg }}
      </div>

      <div class="text-center mt-6">
        <router-link to="/" class="text-xs font-bold tracking-wider uppercase text-neutral-400 hover:text-dark transition-colors">
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// State management and API handlers for OTP generation, verification, and password updates
import { ref } from 'vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const step = ref(1);
const email = ref('');
const otp = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const resendDisabled = ref(false);
const statusMsg = ref('');
const isSuccess = ref(false);
const subtitle = ref('Enter your registered email address to receive a verification code.');

const handleSendOtp = async () => {
  if (!email.value) return;
  loading.value = true;
  statusMsg.value = '';
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to dispatch verification code.');

    step.value = 2;
    subtitle.value = `Verification code sent to ${email.value.trim()}. Please enter code below.`;
    statusMsg.value = 'Code dispatched! Check your email inbox.';
    isSuccess.value = true;
  } catch (err) {
    statusMsg.value = err.message || 'Failed to send verification code.';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};

const handleResendOtp = async () => {
  await handleSendOtp();
};

const handleVerifyOtp = async () => {
  if (!otp.value) return;
  loading.value = true;
  statusMsg.value = '';
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), otp: otp.value.trim() })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Invalid or expired 6-digit code.');

    step.value = 3;
    subtitle.value = 'Choose a secure new password for your account.';
    statusMsg.value = 'OTP code verified! Please enter your new password.';
    isSuccess.value = true;
  } catch (err) {
    statusMsg.value = err.message || 'Invalid or expired verification code.';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};

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
    const res = await fetch(`${apiBase}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), otp: otp.value.trim(), password: newPassword.value })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to update password.');

    statusMsg.value = 'Password updated successfully! Redirecting to login...';
    isSuccess.value = true;
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err) {
    statusMsg.value = err.message || 'Failed to update password.';
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
};
</script>
