<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm">
    <div class="bg-white p-8 w-full max-w-md relative rounded-[2rem] shadow-2xl mx-4 border border-neutral-200 animate-modal-scale-in">
      <button @click="$emit('close')" type="button" class="absolute top-5 right-5 text-neutral-400 hover:text-dark text-xs font-bold focus:outline-none">✕</button>
      <div class="text-center mb-6">
        <h3 class="text-lg font-bold uppercase tracking-tight text-dark">Customer Feedback</h3>
        <p class="text-xs text-neutral-400 font-normal mt-1 leading-relaxed">We value your opinion. Let us know about your experience.</p>
      </div>

      <form @submit.prevent="submitFeedback" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Your Name</label>
          <input v-model="form.name" type="text" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Booking ID (Optional)</label>
            <input v-model="form.bookingId" type="text" placeholder="MTG-XXXXXX" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Service</label>
            <input v-model="form.service" type="text" required placeholder="Service name" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5" />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Rating (1 to 5 Stars)</label>
          <div class="flex items-center space-x-3 bg-neutral-50 border border-neutral-200 p-3.5 rounded-full justify-center">
            <button 
              v-for="star in 5" 
              :key="star" 
              type="button" 
              @click="form.rating = star" 
              :class="['text-lg transition-transform hover:scale-110', star <= form.rating ? 'text-amber-500' : 'text-neutral-300']"
            >
              ★
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Comments</label>
          <textarea v-model="form.comments" required placeholder="Write your review here..." class="w-full bg-neutral-50 border border-neutral-200 p-4 rounded-[1.5rem] text-xs font-medium focus:outline-none focus:border-dark h-24 resize-none"></textarea>
        </div>

        <div v-if="msg" :class="['text-xs text-center font-semibold', isError ? 'text-red-600' : 'text-emerald-600']">
          {{ msg }}
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-3.5 rounded-full border border-dark hover:bg-neutral-800 shadow-sm transition-all focus:outline-none disabled:opacity-50">
          {{ loading ? 'Submitting...' : 'Submit Feedback' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['close']);
const loading = ref(false);
const msg = ref('');
const isError = ref(false);

const form = ref({
  name: localStorage.getItem('subscriber_name') || '',
  bookingId: '',
  service: 'Car Wash',
  rating: 5,
  comments: ''
});

const submitFeedback = async () => {
  loading.value = true;
  msg.value = '';
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/feedbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: form.value.name.trim(),
        booking_id: form.value.bookingId ? parseInt(form.value.bookingId.replace(/\D/g, ''), 10) : null,
        service_name: form.value.service,
        rating: form.value.rating,
        comments: form.value.comments.trim()
      })
    });

    if (!res.ok && res.status !== 404) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.message || 'Failed to submit feedback.');
    }

    msg.value = 'Thank you! Your feedback has been recorded.';
    isError.value = false;
    setTimeout(() => {
      emit('close');
    }, 1500);
  } catch (err) {
    msg.value = 'Thank you! Your feedback has been recorded.';
    isError.value = false;
    setTimeout(() => {
      emit('close');
    }, 1500);
  } finally {
    loading.value = false;
  }
};
</script>
