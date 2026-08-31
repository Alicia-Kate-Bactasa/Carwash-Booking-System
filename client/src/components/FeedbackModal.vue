<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4">
    <div class="bg-white p-6 sm:p-8 w-full max-w-md relative rounded-[2rem] shadow-2xl border border-neutral-200 animate-modal-scale-in">
      <button @click="$emit('close')" type="button" class="absolute top-5 right-5 text-neutral-400 hover:text-dark text-xs font-bold focus:outline-none">✕</button>
      
      <div class="text-center mb-6">
        <h3 class="text-lg font-bold uppercase tracking-tight text-dark">Customer Feedback</h3>
        <p class="text-xs text-neutral-400 font-normal mt-1 leading-relaxed">Enter your completed booking reference ID to automatically pull session details and leave your review.</p>
      </div>

      <!-- Step 1: Booking ID Verification -->
      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Booking Reference Number</label>
          <div class="flex gap-2">
            <input 
              v-model="bookingIdInput" 
              type="text" 
              placeholder="e.g. 130 or MTG-130" 
              :disabled="isVerified"
              @keyup.enter="verifyBooking"
              class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-mono font-bold focus:outline-none focus:border-dark px-5 disabled:opacity-60" 
            />
            <button 
              v-if="!isVerified"
              type="button" 
              @click="verifyBooking"
              :disabled="verifying || !bookingIdInput"
              class="bg-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-full hover:bg-neutral-800 transition-all shrink-0 disabled:opacity-50"
            >
              {{ verifying ? 'Verifying...' : 'Verify' }}
            </button>
            <button
              v-else
              type="button"
              @click="resetVerification"
              class="bg-neutral-200 text-dark text-xs font-bold uppercase tracking-wider px-4 py-3.5 rounded-full hover:bg-neutral-300 transition-all shrink-0"
            >
              Change
            </button>
          </div>
        </div>

        <!-- Verification Error / Notice Banner -->
        <div v-if="verifyError" class="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold leading-relaxed">
          ⚠️ {{ verifyError }}
        </div>
      </div>

      <!-- Step 2: Automatically Verified Details & Rating Form -->
      <form v-if="isVerified" @submit.prevent="submitFeedback" class="space-y-4 border-t border-neutral-100 pt-5 animate-modal-scale-in">
        <!-- Verified Session Card -->
        <div class="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl space-y-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Customer Name:</span>
            <span class="font-bold text-dark">{{ verifiedData.customer_name }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Service Treatment:</span>
            <span class="font-bold text-dark">{{ verifiedData.service_name }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-neutral-200/60 text-[10px]">
            <span class="text-neutral-400 font-medium">Session Schedule:</span>
            <span class="font-semibold text-neutral-700">{{ formatDate(verifiedData.scheduled_date) }} @ {{ verifiedData.time_slot }}</span>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5 text-center">Your Rating (1 to 5 Stars)</label>
          <div class="flex items-center space-x-3 bg-neutral-50 border border-neutral-200 p-3.5 rounded-full justify-center">
            <button 
              v-for="star in 5" 
              :key="star" 
              type="button" 
              @click="rating = star" 
              :class="['text-xl transition-transform hover:scale-125 focus:outline-none', star <= rating ? 'text-amber-500' : 'text-neutral-300']"
            >
              ★
            </button>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Comments & Experience</label>
          <textarea v-model="comments" required placeholder="Describe your experience with our detailing service..." class="w-full bg-neutral-50 border border-neutral-200 p-4 rounded-[1.5rem] text-xs font-medium focus:outline-none focus:border-dark h-24 resize-none"></textarea>
        </div>

        <div v-if="submitMsg" :class="['text-xs text-center font-semibold p-3 rounded-2xl', submitSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200']">
          {{ submitMsg }}
        </div>

        <button type="submit" :disabled="submitting" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 shadow-sm transition-all focus:outline-none disabled:opacity-50">
          {{ submitting ? 'Submitting Review...' : 'Submit Completed Feedback' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  presetBookingId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['close', 'submitted']);

const bookingIdInput = ref('');
const verifying = ref(false);
const isVerified = ref(false);
const verifyError = ref('');

const verifiedData = ref({
  booking_id: null,
  customer_name: '',
  service_name: '',
  scheduled_date: '',
  time_slot: ''
});

const rating = ref(5);
const comments = ref('');
const submitting = ref(false);
const submitMsg = ref('');
const submitSuccess = ref(false);

const formatDate = (dateStr) => {
  if (!dateStr) return 'Completed Session';
  return String(dateStr).split('T')[0];
};

const verifyBooking = async () => {
  if (!bookingIdInput.value) return;

  verifying.value = true;
  verifyError.value = '';
  isVerified.value = false;

  const numericId = String(bookingIdInput.value).replace(/\D/g, '');
  if (!numericId) {
    verifyError.value = 'Please enter a valid booking ID number (e.g. 130).';
    verifying.value = false;
    return;
  }

  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/feedback/verify-booking/${numericId}`);
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      verifyError.value = result.message || `Booking #${numericId} was not found or is not completed.`;
      return;
    }

    verifiedData.value = result.data;
    isVerified.value = true;
  } catch (err) {
    verifyError.value = err.message || 'Failed to verify booking status.';
  } finally {
    verifying.value = false;
  }
};

const resetVerification = () => {
  isVerified.value = false;
  verifyError.value = '';
  bookingIdInput.value = '';
};

const submitFeedback = async () => {
  if (!verifiedData.value.booking_id) return;

  submitting.value = true;
  submitMsg.value = '';
  submitSuccess.value = false;

  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: verifiedData.value.booking_id,
        rating: rating.value,
        comments: comments.value.trim()
      })
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.message || 'Failed to submit feedback.');
    }

    submitMsg.value = 'Thank you! Your feedback has been recorded successfully.';
    submitSuccess.value = true;

    setTimeout(() => {
      emit('submitted');
      emit('close');
    }, 1500);
  } catch (err) {
    submitMsg.value = err.message || 'Failed to submit feedback.';
    submitSuccess.value = false;
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (props.presetBookingId) {
    bookingIdInput.value = String(props.presetBookingId);
    verifyBooking();
  }
});
</script>
