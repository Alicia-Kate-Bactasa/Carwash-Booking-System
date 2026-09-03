<!--
  VIP Membership Roster Modal Component for Montage Auto Studio.
  Collects new member registration details and redirects to PayMongo Hosted Checkout for ₱1,500 monthly VIP membership.
-->
<template>
  <Transition name="fade-scale" appear>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4 overflow-y-auto" @click.self="$emit('close')">
      <div class="bg-white p-8 w-full max-w-md relative rounded-[2.5rem] shadow-2xl mx-4 border border-neutral-200 transform transition-all duration-300">
        <button @click="$emit('close')" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-dark text-xs font-bold flex items-center justify-center focus:outline-none transition-colors">✕</button>

      <div class="text-center mb-6">
        <h3 class="text-xl font-bold uppercase tracking-tight text-dark">VIP Club Membership</h3>
        <p class="text-xs text-neutral-400 font-medium mt-1">Monthly VIP Access (₱1,500/mo)</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Full Name</label>
          <input v-model="form.name" type="text" required placeholder="e.g. Jane Doe" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email Address</label>
          <input v-model="form.email" type="email" required placeholder="e.g. client@domain.com" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Password</label>
          <div class="relative">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="Minimum 6 characters" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5 pr-12" />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-dark focus:outline-none transition-colors p-1" aria-label="Toggle Password Visibility">
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Mobile Phone</label>
          <input v-model="form.phone" type="tel" required placeholder="e.g. 09171234567" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div v-if="errorMsg" class="text-xs text-red-600 font-semibold text-center">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="text-xs text-emerald-600 font-semibold text-center">
          {{ successMsg }}
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full transition-all shadow-md disabled:opacity-50">
          {{ loading ? 'Processing...' : 'Pay ₱1,500 & Join VIP Club' }}
        </button>
      </form>
    </div>
  </div>
  </Transition>
</template>

<script setup>
// VIP Registration form handling and API checkout redirection
import { ref } from 'vue';


const emit = defineEmits(['close']);
const showPassword = ref(false);
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const form = ref({
  name: '',
  email: '',
  password: '',
  phone: ''
});

const handleRegister = async () => {
  if (form.value.password.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters.';
    return;
  }

  loading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/auth/pre-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.value.name.trim(),
        email: form.value.email.trim(),
        phone_number: form.value.phone.trim(),
        password: form.value.password
      })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to initiate VIP membership registration checkout.');
    }

    if (result && result.checkout_url) {
      window.location.href = result.checkout_url;
      return;
    } else {
      errorMsg.value = result.message || 'Unable to connect to payment server. Please ensure your backend server is running.';
    }
  } catch (err) {
    errorMsg.value = err.message || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
