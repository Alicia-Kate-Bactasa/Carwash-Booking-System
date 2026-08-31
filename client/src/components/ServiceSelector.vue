<!--
  Custom Service Selector Component for Montage Auto Studio.
  Renders a custom dropdown menu for selecting detailing packages, formatting durations and VIP/regular pricing.
-->
<template>
  <div class="relative w-full">
    <!-- Custom Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      :class="[
        'w-full border p-4 rounded-full text-xs font-semibold text-left focus:outline-none focus:ring-0 transition-all px-6 shadow-sm flex items-center justify-between cursor-pointer',
        isOpen ? 'bg-white border-dark ring-1 ring-dark' : 'bg-white border-neutral-200 hover:border-neutral-400'
      ]"
    >
      <template v-if="selectedServiceObj">
        <div class="flex items-center gap-2.5 flex-wrap">
          <span class="font-black text-dark text-xs uppercase tracking-tight">{{ selectedServiceObj.service_name || selectedServiceObj.name }}</span>
          <span :class="['font-black px-3 py-0.5 rounded-full text-[10px]', isVip ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-dark']">
            {{ isVip ? 'VIP FREE' : '₱' + (selectedServiceObj.service_price || selectedServiceObj.price) + '.00' }}
          </span>
          <span class="text-[10px] text-neutral-400 font-medium">⏱️ {{ formatDuration(selectedServiceObj.service_duration || selectedServiceObj.duration) }}</span>
        </div>
      </template>
      <template v-else>
        <span class="text-neutral-400 font-semibold">{{ placeholder }}</span>
      </template>
      
      <svg xmlns="http://www.w3.org/2000/svg" :class="['w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-2', isOpen ? 'rotate-180 text-dark' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Custom Dropdown Menu Panel -->
    <div 
      v-if="isOpen" 
      class="absolute left-0 right-0 top-full mt-2.5 z-50 bg-white border border-neutral-200 rounded-[1.5rem] p-3 shadow-2xl space-y-2 max-h-72 overflow-y-auto animate-modal-scale-in"
    >
      <div v-if="activeServicesList.length === 0" class="p-4 text-center text-xs text-neutral-400 italic">
        No active detailing services available.
      </div>

      <div
        v-for="s in activeServicesList"
        :key="s.service_id || s.name"
        @click="selectService(s)"
        :class="[
          'p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-3',
          isSelected(s)
            ? 'bg-dark text-white border-dark shadow-md scale-[1.01]'
            : 'bg-neutral-50/60 border-neutral-200/80 text-dark hover:bg-neutral-100 hover:border-neutral-300'
        ]"
      >
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="font-black text-xs uppercase tracking-tight">{{ s.service_name || s.name }}</span>
            <span :class="['text-[10px] font-extrabold px-2.5 py-0.5 rounded-full', isSelected(s) ? (isVip ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-white') : (isVip ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-dark')]">
              {{ isVip ? 'VIP FREE' : '₱' + (s.service_price || s.price) + '.00' }}
            </span>
          </div>
          <p :class="['text-[11px] line-clamp-1 font-normal', isSelected(s) ? 'text-neutral-300' : 'text-neutral-500']">
            {{ s.service_description || s.desc || 'Professional detailing package' }}
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0">
          <span :class="['text-[10px] font-bold', isSelected(s) ? 'text-neutral-300' : 'text-neutral-400']">
            ⏱️ {{ formatDuration(s.service_duration || s.duration) }}
          </span>
          <div :class="['w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold', isSelected(s) ? 'bg-white text-dark border-white' : 'border-neutral-300 text-transparent']">
            ✓
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component props, computed properties for active service filtering, and duration format helpers
import { ref, computed } from 'vue';


const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  services: {
    type: Array,
    default: () => []
  },
  isVip: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Choose a Service'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);

const activeServicesList = computed(() => {
  return props.services.filter(s => s.is_active !== false);
});

const selectedServiceObj = computed(() => {
  if (!props.modelValue) return null;
  return props.services.find(s => String(s.service_id || s.name) === String(props.modelValue)) || null;
});

const formatDuration = (val) => {
  if (!val) return '60 Mins';
  const str = String(val);
  if (str.toLowerCase().includes('min') || str.toLowerCase().includes('hour')) return str;
  const num = parseInt(str, 10);
  if (isNaN(num)) return '60 Mins';
  if (num === 30) return '30 Mins';
  if (num === 60) return '1 Hour';
  if (num === 90) return '1 Hour & 30 Mins';
  if (num === 120) return '2 Hours';
  return `${num} Mins`;
};

const isSelected = (s) => {
  return String(props.modelValue) === String(s.service_id || s.name);
};

const selectService = (service) => {
  const val = service.service_id || service.name;
  emit('update:modelValue', val);
  emit('change', service);
  isOpen.value = false;
};
</script>
