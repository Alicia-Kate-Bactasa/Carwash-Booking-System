<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm">
    <div class="bg-white p-8 w-full max-w-md relative rounded-[2rem] shadow-2xl mx-4 border border-neutral-200 animate-modal-scale-in">
      <button @click="$emit('close')" class="absolute top-5 right-5 text-neutral-400 hover:text-dark text-xs font-bold focus:outline-none">✕</button>

      <!-- Modal Mode Title Header -->
      <div class="text-center mb-6">
        <h3 class="text-xl font-bold uppercase tracking-tight text-dark">
          {{ isRegister ? 'Register Account' : 'Member Access' }}
        </h3>
        <p class="text-xs text-neutral-400 font-medium mt-1">
          {{ isRegister ? 'Create your new Montage Studio account' : 'Sign in with your registered credentials' }}
        </p>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex items-center space-x-2 bg-neutral-100 p-1 rounded-full mb-6 text-xs font-bold uppercase tracking-wider">
        <button 
          type="button" 
          @click="isRegister = false" 
          :class="['w-1/2 py-2 rounded-full transition-all text-center focus:outline-none', !isRegister ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark']"
        >
          Sign In
        </button>
        <button 
          type="button" 
          @click="isRegister = true" 
          :class="['w-1/2 py-2 rounded-full transition-all text-center focus:outline-none', isRegister ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark']"
        >
          Register
        </button>
      </div>

      <!-- Form: Login Mode -->
      <form v-if="!isRegister" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Email Address</label>
          <input v-model="loginForm.email" type="email" required placeholder="e.g. client@domain.com" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div class="relative">
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Password</label>
          <div class="relative">
            <input v-model="loginForm.password" :type="showLoginPassword ? 'text' : 'password'" required placeholder="••••••••" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5 pr-12" />
            <button type="button" @click="showLoginPassword = !showLoginPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark focus:outline-none transition-colors p-1" aria-label="Toggle Password Visibility">
              <svg v-if="!showLoginPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="text-xs text-red-600 font-semibold text-center whitespace-pre-line">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="text-xs text-emerald-600 font-semibold text-center whitespace-pre-line">
          {{ successMsg }}
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
          {{ loading ? 'Signing In...' : 'Log In To Workspace' }}
        </button>

        <div class="text-center pt-2">
          <router-link to="/forgot-password" @click="$emit('close')" class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-dark transition-colors block">
            Forgot Your Password?
          </router-link>
        </div>
      </form>

      <!-- Form: Register Mode -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Full Name</label>
          <input v-model="registerForm.name" type="text" required placeholder="e.g. John Doe" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email Address</label>
          <input v-model="registerForm.email" type="email" required placeholder="e.g. client@domain.com" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mobile Phone</label>
          <input v-model="registerForm.phone" type="tel" required placeholder="e.g. 09171234567" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Password</label>
          <div class="relative">
            <input v-model="registerForm.password" :type="showRegisterPassword ? 'text' : 'password'" required placeholder="Minimum 6 characters" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5 pr-12" />
            <button type="button" @click="showRegisterPassword = !showRegisterPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark focus:outline-none transition-colors p-1" aria-label="Toggle Password Visibility">
              <svg v-if="!showRegisterPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="errorMsg" class="text-xs text-red-600 font-semibold text-center whitespace-pre-line">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="text-xs text-emerald-600 font-semibold text-center whitespace-pre-line">
          {{ successMsg }}
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
          {{ loading ? 'Creating Account...' : 'Create Member Account' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['close', 'openRegister']);
const router = useRouter();

const isRegister = ref(false);
const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const loginForm = ref({
  email: '',
  password: ''
});

const registerForm = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
});

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: loginForm.value.email.trim(),
        password: loginForm.value.password
      })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Invalid email address or password.');
    }

    localStorage.setItem('subscriber_session_active', 'true');
    localStorage.setItem('subscriber_name', result.user?.full_name || loginForm.value.email.split('@')[0]);
    if (result.token) localStorage.setItem('auth_token', result.token);
    emit('close');
    router.push('/dashboard');
  } catch (err) {
    errorMsg.value = err.message || 'Invalid email address or password.';
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  if (registerForm.value.password.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters.';
    return;
  }

  loading.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: registerForm.value.name.trim(),
        email: registerForm.value.email.trim(),
        phone_number: registerForm.value.phone.trim(),
        password: registerForm.value.password
      })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to initiate account registration checkout.');
    }

    if (result && result.checkout_url) {
      window.location.href = result.checkout_url;
      return;
    } else {
      errorMsg.value = result.message || 'PayMongo Checkout initialization failed. Please try again.';
    }
  } catch (err) {
    errorMsg.value = err.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
