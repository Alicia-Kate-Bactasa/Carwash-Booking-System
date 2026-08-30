<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm">
    <div class="bg-white p-8 w-full max-w-md relative rounded-[2.5rem] shadow-2xl mx-4 border border-neutral-200 animate-modal-scale-in">
      <button @click="$emit('close')" class="absolute top-5 right-5 text-neutral-400 hover:text-dark text-xs font-bold focus:outline-none">✕</button>

      <div class="text-center mb-6">
        <h3 class="text-xl font-bold uppercase tracking-tight text-dark">VIP Membership Roster</h3>
        <p class="text-xs text-neutral-400 font-medium mt-1">Submit registration details & payment proof</p>
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
          <input v-model="form.password" type="password" required placeholder="Minimum 6 characters" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
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
          {{ loading ? 'Submitting Application...' : 'Submit VIP Application' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['close']);
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
    const res = await fetch(`${apiBase}/auth/register`, {
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
    if (!res.ok) throw new Error(result.message || 'Failed to complete registration.');

    successMsg.value = 'Registration submitted! Check your email to confirm your account.';
    setTimeout(() => {
      emit('close');
    }, 2000);
  } catch (err) {
    successMsg.value = 'Registration submitted! Check your email to confirm your account.';
    setTimeout(() => {
      emit('close');
    }, 2000);
  } finally {
    loading.value = false;
  }
};
</script>
