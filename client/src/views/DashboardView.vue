<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-neutral-50 text-dark font-sans antialiased text-base">
    <!-- Sidebar container -->
    <aside class="w-full md:w-72 bg-dark text-light flex flex-col justify-between p-6 border-r border-neutral-800 shrink-0">
      <div class="space-y-10">
        <div class="pb-6 border-b border-neutral-800 flex justify-between items-center relative">
          <div>
            <div class="text-lg font-bold uppercase tracking-wider text-white">Montage Studio</div>
            <div class="text-xs text-neutral-400 tracking-widest uppercase font-mono mt-1.5">Member Hub</div>
          </div>
        </div>

        <nav class="space-y-4 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <button 
            @click="activeView = 'overview'" 
            :class="['w-full flex items-center space-x-3 p-4 rounded-full transition-all text-left font-bold focus:outline-none', activeView === 'overview' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span>My Account</span>
          </button>
          <button 
            @click="activeView = 'booking'" 
            :class="['w-full flex items-center space-x-3 p-4 rounded-full transition-all text-left font-bold focus:outline-none', activeView === 'booking' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>Book New Session</span>
          </button>
          <button 
            @click="activeView = 'subscription'" 
            :class="['w-full flex items-center space-x-3 p-4 rounded-full transition-all text-left font-bold focus:outline-none', activeView === 'subscription' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span>Subscription Status</span>
          </button>
        </nav>
      </div>

      <div class="pt-6 border-t border-neutral-800">
        <button @click="logout" class="w-full flex items-center justify-center space-x-3 text-sm font-bold bg-neutral-900 hover:bg-red-950 hover:text-red-200 border border-neutral-800 text-neutral-400 py-4 rounded-full tracking-widest uppercase transition-all focus:outline-none">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 p-4 sm:p-8 md:p-12 space-y-12 overflow-y-auto max-h-screen">
      <!-- Member Workspace Top Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h2 class="text-3xl font-black uppercase tracking-tight text-dark">Member Workspace</h2>
          <p class="text-sm text-neutral-500 font-medium mt-1">
            Active Client: <span class="font-bold text-neutral-800">{{ welcomeName }}</span>
          </p>
        </div>
        <div class="text-xs bg-emerald-50 text-emerald-700 font-bold px-4 py-2 rounded-full border border-emerald-200 flex items-center gap-1.5 self-start sm:self-center">
          <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>VIP STATUS ACTIVE
        </div>
      </div>

      <!-- VIEW: OVERVIEW -->
      <div v-if="activeView === 'overview'" class="space-y-12">
        <div class="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span class="text-xs font-bold text-neutral-400 uppercase tracking-widest block">Current Subscription Tier</span>
            <div class="text-2xl font-black uppercase text-dark mt-1">Unlimited VIP Wash Club</div>
            <p class="text-sm text-neutral-500 mt-2">Provides flat-rate access to our standard scheduling with no per-visit transaction requirements.</p>
          </div>
          <div class="text-right">
            <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">Membership Account</span>
            <div class="text-xl font-bold text-dark mt-1">₱1,500.00 / paid</div>
          </div>
        </div>

        <div class="bg-white border border-neutral-200 rounded-[2rem] shadow-sm overflow-hidden">
          <div class="p-6 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center space-x-2 bg-neutral-200/60 p-1 rounded-full">
              <button 
                @click="activeTab = 'active'" 
                :class="['text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full transition-all', activeTab === 'active' ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark']"
              >
                Active Sessions
              </button>
              <button 
                @click="activeTab = 'history'" 
                :class="['text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-full transition-all', activeTab === 'history' ? 'bg-white text-dark shadow-sm' : 'text-neutral-500 hover:text-dark']"
              >
                Past History
              </button>
            </div>
            <span class="text-xs bg-dark text-light px-3 py-1 rounded-full font-bold self-start sm:self-center">
              {{ displayedAppointments.length }} Session{{ displayedAppointments.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-500 uppercase tracking-wider text-xs">
                  <th class="p-5">Booking ID</th>
                  <th class="p-5">Category</th>
                  <th class="p-5">Scheduled Date</th>
                  <th class="p-5">Time Window</th>
                  <th class="p-5">Status</th>
                  <th class="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 font-medium text-neutral-700">
                <tr v-if="displayedAppointments.length === 0">
                  <td colspan="6" class="p-8 text-center text-neutral-400 font-medium text-base">
                    No {{ activeTab }} appointments scheduled.
                  </td>
                </tr>
                <tr v-for="app in displayedAppointments" :key="app.id" class="hover:bg-neutral-50/80 transition-colors">
                  <td class="p-5 font-mono font-bold text-dark">{{ app.id }}</td>
                  <td class="p-5 font-bold text-dark">{{ app.service }}</td>
                  <td class="p-5">{{ app.date }}</td>
                  <td class="p-5">{{ app.time }}</td>
                  <td class="p-5">
                    <span :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', app.type === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200']">
                      {{ app.type }}
                    </span>
                  </td>
                  <td class="p-5 text-right space-x-2">
                    <button v-if="app.type === 'pending'" @click="openReschedule(app)" class="text-xs font-bold text-neutral-700 hover:text-black border border-neutral-200 px-3.5 py-1.5 rounded-full hover:bg-neutral-100 transition-all">
                      Reschedule
                    </button>
                    <button v-if="app.type === 'pending'" @click="cancelAppointment(app.booking_id)" class="text-xs font-bold text-red-600 hover:text-red-700 border border-neutral-200 px-3.5 py-1.5 rounded-full hover:bg-red-50 transition-all">
                      Cancel
                    </button>
                    <button v-if="app.type === 'completed'" @click="showFeedbackModal = true" class="text-xs font-bold text-amber-600 border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-50 transition-all">
                      Leave Feedback
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- VIEW: BOOKING -->
      <div v-if="activeView === 'booking'" class="space-y-8">
        <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-6">
          <div>
            <h3 class="text-3xl font-black uppercase tracking-tight text-dark">Schedule An Appointment Session</h3>
            <p class="text-sm text-neutral-400 font-medium mt-1">Book directly into our active Banilad studio twin-bay configuration.</p>
          </div>
        </div>

        <!-- Service Selection Menu Grid -->
        <div class="mb-12">
          <div class="mb-6">
            <span class="text-xs font-bold tracking-widest uppercase text-neutral-400 block mb-1">Service Selection Menu</span>
            <h4 class="text-lg font-bold uppercase tracking-tight text-dark">Available Detail Treatments</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="s in catalogServices" :key="s.service_id" class="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-lg font-bold uppercase text-dark tracking-tight">{{ s.service_name }}</h4>
                  <span class="text-xs font-bold text-neutral-400 uppercase tracking-widest">{{ s.service_duration || 60 }} Mins</span>
                </div>
                <p class="text-xs text-neutral-500 font-medium leading-relaxed mb-6">{{ s.service_description || 'Professional detailing package.' }}</p>
              </div>
              <div class="flex items-center justify-between border-t border-neutral-100 pt-6">
                <span class="text-xl font-bold text-dark">₱{{ s.service_price }}</span>
                <button @click="bookingForm.serviceId = s.service_id" class="text-xs font-bold uppercase tracking-wider bg-dark text-light px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-all">
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="submitMemberBooking" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div class="lg:col-span-7 space-y-8 bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">1. Choose a service</label>
              <select v-model="bookingForm.serviceId" required class="w-full bg-white border border-neutral-200 p-4 rounded-full text-sm font-semibold text-left focus:outline-none focus:border-dark transition-all px-6 shadow-sm">
                <option value="" disabled>Choose a service...</option>
                <option v-for="s in catalogServices" :key="s.service_id" :value="s.service_id">
                  {{ s.service_name }} ({{ s.service_duration || 60 }} Mins)
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">2. Schedule Appointment</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input v-model="bookingForm.date" type="date" required class="w-full bg-white border border-neutral-200 p-4 rounded-full text-sm font-semibold focus:outline-none focus:border-dark transition-all px-6" />
                <select v-model="bookingForm.timeSlot" required class="w-full bg-white border border-neutral-200 p-4 rounded-full text-sm font-semibold focus:outline-none focus:border-dark transition-all px-6 shadow-sm">
                  <option value="" disabled>Choose a time...</option>
                  <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5 space-y-6">
            <div class="bg-white border border-neutral-200 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
              <div class="text-xs uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-200 pb-3 mb-2">Booking Summary</div>
              <div class="flex justify-between text-sm font-medium"><span>Service:</span><span class="font-bold text-dark">{{ selectedServiceName }}</span></div>
              <div class="flex justify-between text-sm font-medium"><span>Date:</span><span class="font-bold text-dark">{{ bookingForm.date || '—' }}</span></div>
              <div class="flex justify-between text-sm font-medium"><span>Time:</span><span class="font-bold text-dark">{{ bookingForm.timeSlot || '—' }}</span></div>
              <div class="flex justify-between text-sm font-medium"><span>Duration:</span><span class="font-bold text-dark">60 Mins</span></div>

              <div class="border-t border-dashed border-neutral-300 pt-4 flex justify-between items-center text-sm font-bold text-emerald-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <span>Payment:</span>
                <span class="uppercase font-extrabold tracking-wider text-xs">Included in plan</span>
              </div>

              <div class="pt-2">
                <button type="submit" :disabled="bookingLoading" class="w-full bg-dark text-light text-sm font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
                  {{ bookingLoading ? 'Reserving...' : 'Authorize Session Reservation' }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- VIEW: SUBSCRIPTION -->
      <div v-if="activeView === 'subscription'" class="space-y-8">
        <div class="mb-4">
          <h3 class="text-3xl font-black uppercase tracking-tight text-dark">Subscription Management</h3>
          <p class="text-base text-neutral-400 font-medium mt-1">Check payment history and account status.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm space-y-6">
            <h4 class="text-xs uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-100 pb-3">Member & Plan</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span class="text-xs text-neutral-400 font-medium uppercase tracking-wider block">Account Holder</span>
                <span class="font-bold text-dark text-base">{{ welcomeName }}</span>
              </div>
              <div>
                <span class="text-xs text-neutral-400 font-medium uppercase tracking-wider block">Plan Creation Timestamp</span>
                <span class="font-bold text-dark text-base">Active</span>
              </div>
            </div>
          </div>

          <div class="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between space-y-8">
            <div class="space-y-4">
              <h4 class="text-xs uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-100 pb-3">Payments & Billing</h4>
              <div class="text-sm font-medium text-neutral-500 leading-relaxed">
                Upload GCash remittance screenshots to verify your current billing cycle, renew access limits, or initiate plan downgrades.
              </div>
            </div>

            <div class="space-y-3">
              <button @click="showRenewalModal = true" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-4 rounded-full transition-all text-center shadow-sm">
                Pay Next Monthly Renewal
              </button>
              <button @click="showCancelModal = true" class="w-full bg-white hover:bg-red-50 text-red-600 border border-neutral-200 hover:border-red-200 text-xs font-bold tracking-widest uppercase py-4 rounded-full transition-all text-center">
                Cancel Subscription Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <RescheduleModal 
      v-if="selectedReschedule" 
      :bookingId="selectedReschedule.id" 
      :rawBookingId="selectedReschedule.booking_id" 
      @close="selectedReschedule = null" 
      @updated="loadAppointments" 
    />
    <FeedbackModal v-if="showFeedbackModal" @close="showFeedbackModal = false" />
    <GlobalErrorModal ref="errorModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RescheduleModal from '@/components/RescheduleModal.vue';
import FeedbackModal from '@/components/FeedbackModal.vue';
import GlobalErrorModal from '@/components/GlobalErrorModal.vue';

const router = useRouter();
const activeView = ref('overview');
const activeTab = ref('active');
const welcomeName = ref(localStorage.getItem('subscriber_name') || 'VIP Member');

const currentAppointments = ref([]);
const historyAppointments = ref([]);
const catalogServices = ref([]);
const selectedReschedule = ref(null);
const showFeedbackModal = ref(false);
const showRenewalModal = ref(false);
const showCancelModal = ref(false);
const errorModal = ref(null);

const bookingForm = ref({
  serviceId: '',
  date: '',
  timeSlot: ''
});
const bookingLoading = ref(false);

const timeSlots = [
  '09:00:00', '10:00:00', '11:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00'
];

const displayedAppointments = computed(() => {
  return activeTab.value === 'active' ? currentAppointments.value : historyAppointments.value;
});

const selectedServiceName = computed(() => {
  const match = catalogServices.value.find(s => s.service_id === bookingForm.value.serviceId);
  return match ? match.service_name : '—';
});

const loadAppointments = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/user/bookings`);
    if (res.ok) {
      const data = await res.json();
      const mapped = (data || []).map(app => {
        let type = 'cancelled';
        if (['Pending Verification', 'Confirmed', 'Pending', 'Paid', 'Scheduled'].includes(app.booking_status)) {
          type = 'pending';
        } else if (app.booking_status === 'Completed') {
          type = 'completed';
        }
        return {
          id: "MTG-" + app.booking_id,
          booking_id: parseInt(app.booking_id, 10),
          type,
          service: app.service_name || app.services?.service_name || 'Car Wash',
          date: app.scheduled_date,
          time: app.time_slot,
          price: app.purchased_price
        };
      });

      currentAppointments.value = mapped.filter(a => a.type === 'pending');
      historyAppointments.value = mapped.filter(a => a.type === 'completed' || a.type === 'cancelled');
    }
  } catch (err) {
    console.warn("Could not load appointments:", err);
  }
};

const fetchCatalogServices = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/services`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        catalogServices.value = data;
      }
    }
  } catch (err) {
    console.warn("Catalog fetch notice:", err);
  }
};

const openReschedule = (app) => {
  selectedReschedule.value = app;
};

const cancelAppointment = async (bookingId) => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    await fetch(`${apiBase}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    await loadAppointments();
  } catch (err) {
    if (errorModal.value) errorModal.value.show(err.message || 'Failed to cancel appointment.');
  }
};

const submitMemberBooking = async () => {
  if (!bookingForm.value.serviceId || !bookingForm.value.date || !bookingForm.value.timeSlot) return;

  bookingLoading.value = true;
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/bookings/member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: parseInt(bookingForm.value.serviceId, 10),
        scheduled_date: bookingForm.value.date,
        time_slot: bookingForm.value.timeSlot
      })
    });

    if (errorModal.value) await errorModal.value.show("Session reserved successfully!", true);
    bookingForm.value = { serviceId: '', date: '', timeSlot: '' };
    activeView.value = 'overview';
    await loadAppointments();
  } catch (err) {
    if (errorModal.value) errorModal.value.show(err.message || 'Failed to reserve booking session.');
  } finally {
    bookingLoading.value = false;
  }
};

const logout = async () => {
  localStorage.removeItem('subscriber_session_active');
  localStorage.removeItem('subscriber_name');
  localStorage.removeItem('auth_token');
  router.push('/');
};

onMounted(() => {
  loadAppointments();
  fetchCatalogServices();
});
</script>
