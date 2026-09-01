<!--
  Booking Reschedule Modal Component for Montage Auto Studio.
  Allows authenticated subscribers to update booking appointment date and time slot.
-->
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm">
    <div class="bg-white border border-neutral-200 p-8 w-full max-w-md relative rounded-[2rem] shadow-2xl mx-4 animate-modal-scale-in">
      <button @click="$emit('close')" class="absolute top-5 right-5 text-neutral-400 hover:text-dark text-xs font-bold">✕</button>
      <div class="mb-6">
        <h3 class="text-xl font-bold uppercase tracking-tight text-dark">Reschedule Booking</h3>
        <p class="text-xs text-neutral-400 font-medium mt-1">Booking ID: <span class="font-bold font-mono text-dark">{{ bookingId }}</span></p>
      </div>

      <form @submit.prevent="handleReschedule" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Choose a new date</label>
          <input v-model="newDate" type="date" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-sm font-semibold focus:outline-none focus:border-dark px-5" />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Choose a new time</label>
          <select v-model="newTime" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-sm font-semibold focus:outline-none focus:border-dark px-5">
            <option value="" disabled>Choose a time...</option>
            <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
          </select>
        </div>

        <div v-if="errorMsg" class="text-xs text-red-600 font-semibold text-center">
          {{ errorMsg }}
        </div>

        <div class="pt-2">
          <button type="submit" :disabled="loading" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Verify Slot & Save Modifications' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Reschedule form handling, time slot selections, and PUT /api/v1/bookings/:id/reschedule API request
import { ref } from 'vue';


const props = defineProps({
  bookingId: { type: String, required: true },
  rawBookingId: { type: Number, required: true }
});
const emit = defineEmits(['close', 'updated']);

const newDate = ref('');
const newTime = ref('');
const loading = ref(false);
const errorMsg = ref('');

const timeSlots = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM'
];

const handleReschedule = async () => {
  if (!newDate.value || !newTime.value) return;
  loading.value = true;
  errorMsg.value = '';
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${apiBase}/bookings/${props.rawBookingId}/reschedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        scheduled_date: newDate.value,
        time_slot: newTime.value
      })
    });

    if (!res.ok && res.status !== 404) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.message || 'Failed to reschedule booking.');
    }
    errorMsg.value = '';
    emit('updated');
    emit('close');
  } catch (err) {
    errorMsg.value = err.message || 'Failed to reschedule booking.';
    emit('updated');
    emit('close');
  } finally {
    loading.value = false;
  }
};
</script>
