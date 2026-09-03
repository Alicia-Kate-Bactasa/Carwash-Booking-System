<!--
  Booking Reschedule Modal Component for Montage Auto Studio.
  Provides live interactive studio calendar and dynamic time slot grid matching the primary booking wizard.
-->
<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 backdrop-blur-sm p-4 overflow-y-auto" @click.self="$emit('close')">
    <div class="bg-white border border-neutral-200 p-8 w-full max-w-lg relative rounded-[2.5rem] shadow-2xl mx-4 animate-modal-scale-in my-8 max-h-[90vh] overflow-y-auto">
      <button @click="$emit('close')" class="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-dark text-xs font-bold flex items-center justify-center focus:outline-none transition-colors">✕</button>
      
      <div class="text-center mb-6">
        <span class="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-2">Reschedule Session</span>
        <h3 class="text-xl font-black uppercase tracking-tight text-dark">Update Appointment</h3>
        <p class="text-xs text-neutral-400 font-medium mt-1">Booking Reference: <span class="font-bold font-mono text-dark">{{ bookingId }}</span></p>
      </div>

      <form @submit.prevent="handleReschedule" class="space-y-6">
        <!-- Date Selection -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Select New Date</label>
          <input 
            v-model="newDate" 
            type="date" 
            :min="todayStr"
            required 
            @change="onDateChange"
            class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark px-5 cursor-pointer" 
          />
        </div>

        <!-- Available Time Slot Grid -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Available Studio Time Slots</label>
          <div v-if="!newDate" class="text-xs text-neutral-400 font-medium italic p-3 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
            Please select a date to view live studio slot availability.
          </div>
          <div v-else-if="loadingSlots" class="text-xs text-neutral-500 font-semibold p-3 text-center bg-neutral-50 rounded-2xl border border-neutral-200 animate-pulse">
            Checking studio bay availability...
          </div>
          <div v-else-if="availableTimeSlots.length === 0" class="text-xs text-red-500 font-semibold p-3 text-center bg-red-50 rounded-2xl border border-red-200">
            No available slots for this date & service duration. Please choose another date.
          </div>
          <div v-else class="max-h-52 overflow-y-auto rounded-[1.5rem] bg-neutral-50 p-3 border border-neutral-200 shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              v-for="slot in availableTimeSlots"
              :key="slot.timeSlotValue"
              type="button"
              @click="newTime = slot.timeSlotValue"
              :class="[
                'p-3 rounded-full text-xs font-bold transition-all text-center border focus:outline-none',
                newTime === slot.timeSlotValue
                  ? 'bg-dark text-white border-dark shadow-md scale-[1.02]'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-dark hover:bg-neutral-100'
              ]"
            >
              {{ slot.label }}
            </button>
          </div>
        </div>

        <!-- Summary Comparison Card -->
        <div v-if="newDate && newTime" class="bg-neutral-900 text-white p-5 rounded-[1.5rem] space-y-2 shadow-sm text-xs">
          <div class="text-[10px] uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-800 pb-1.5">Schedule Update Summary</div>
          <div v-if="currentDate" class="flex justify-between text-amber-400 font-medium"><span>Previous Date:</span><span>{{ currentDate }} @ {{ currentTime || '—' }}</span></div>
          <div class="flex justify-between font-bold text-white"><span>New Schedule:</span><span>{{ newDate }} @ {{ newTime }}</span></div>
        </div>

        <div v-if="errorMsg" class="text-xs text-red-600 font-semibold text-center bg-red-50 p-2.5 rounded-2xl border border-red-100">
          {{ errorMsg }}
        </div>

        <div>
          <button type="submit" :disabled="loading || !newTime" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-md disabled:opacity-50">
            {{ loading ? 'Saving Changes...' : 'Verify Slot & Save Modifications' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  bookingId: { type: String, required: true },
  rawBookingId: { type: Number, required: true },
  serviceDuration: { type: [Number, String], default: 60 },
  currentDate: { type: String, default: '' },
  currentTime: { type: String, default: '' }
});

const emit = defineEmits(['close', 'updated']);

const newDate = ref('');
const newTime = ref('');
const loading = ref(false);
const loadingSlots = ref(false);
const bookedSlots = ref([]);
const errorMsg = ref('');

const todayStr = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const currentMinutesToday = computed(() => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
});

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const formatMinutesTo12H = (mins) => {
  let hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  const hStr = hours < 10 ? '0' + hours : String(hours);
  const mStr = minutes < 10 ? '0' + minutes : String(minutes);
  return `${hStr}:${mStr} ${period}`;
};

const fetchBookedSlots = async (date) => {
  if (!date) return;
  loadingSlots.value = true;
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/bookings/availability?date=${date}`);
    if (res.ok) {
      const result = await res.json();
      bookedSlots.value = result.data?.booked_slots || [];
    }
  } catch (err) {
    console.warn("Could not fetch booked slots for reschedule:", err);
  } finally {
    loadingSlots.value = false;
  }
};

const onDateChange = () => {
  newTime.value = '';
  if (newDate.value) {
    fetchBookedSlots(newDate.value);
  }
};

const parsedDuration = computed(() => {
  const d = parseInt(props.serviceDuration, 10);
  return isNaN(d) || d <= 0 ? 60 : d;
});

const availableTimeSlots = computed(() => {
  if (!newDate.value) return [];

  const duration = parsedDuration.value;
  const dayStart = 9 * 60;
  const dayEnd = 17 * 60;
  const step = 30;

  const slots = [];
  const isToday = newDate.value === todayStr.value;
  const nowMins = currentMinutesToday.value;

  for (let start = dayStart; start + duration <= dayEnd; start += step) {
    const end = start + duration;
    const label = `${formatMinutesTo12H(start)} - ${formatMinutesTo12H(end)}`;

    if (isToday && start <= nowMins) continue;

    let isOverlap = false;
    for (const booked of bookedSlots.value) {
      if (booked.booking_id === props.rawBookingId) continue;

      let bStart = 0;
      let bEnd = 0;
      if (booked.time_slot && booked.time_slot.includes('-')) {
        const parts = booked.time_slot.split('-');
        bStart = parseTimeToMinutes(parts[0].trim());
        bEnd = parseTimeToMinutes(parts[1].trim());
      } else if (booked.time_slot) {
        bStart = parseTimeToMinutes(booked.time_slot);
        bEnd = bStart + 60;
      }

      if (Math.max(start, bStart) < Math.min(end, bEnd)) {
        isOverlap = true;
        break;
      }
    }

    if (!isOverlap) {
      slots.push({ label, timeSlotValue: label });
    }
  }

  return slots;
});

onMounted(() => {
  newDate.value = todayStr.value;
  fetchBookedSlots(todayStr.value);
});

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
