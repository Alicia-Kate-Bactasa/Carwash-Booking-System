<template>
  <div class="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">
    <!-- Admin Sidebar -->
    <aside class="w-72 md:w-80 bg-white border-r border-neutral-200 flex flex-col justify-between p-6 z-10 shrink-0">
      <div class="space-y-12">
        <div>
          <h1 class="font-bold text-xs tracking-widest text-neutral-400">Admin</h1>
          <p class="text-lg font-bold tracking-tight mt-1 text-black">Montage Auto Studio</p>
        </div>

        <nav class="space-y-2">
          <button 
            @click="activeTab = 'bookings'" 
            :class="['w-full text-left flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold tracking-wide transition-all', activeTab === 'bookings' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span>Bookings</span>
          </button>

          <button 
            @click="activeTab = 'ledgers'" 
            :class="['w-full text-left flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold tracking-wide transition-all', activeTab === 'ledgers' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Payments</span>
          </button>

          <button 
            @click="activeTab = 'services'" 
            :class="['w-full text-left flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold tracking-wide transition-all', activeTab === 'services' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
            <span>Service List</span>
          </button>

          <button 
            @click="activeTab = 'monitoring'" 
            :class="['w-full text-left flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold tracking-wide transition-all', activeTab === 'monitoring' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span>Subscriptions</span>
          </button>

          <button 
            @click="activeTab = 'feedbacks'" 
            :class="['w-full text-left flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold tracking-wide transition-all', activeTab === 'feedbacks' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black']"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span>Customer Feedback</span>
          </button>
        </nav>
      </div>

      <div class="border-t border-neutral-100 pt-6 space-y-4">
        <div class="flex items-center gap-3 px-2">
          <div class="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">A</div>
          <div>
            <p class="text-sm font-bold text-black">Admin</p>
            <p class="text-xs text-neutral-400 font-medium tracking-wider uppercase">Manager</p>
          </div>
        </div>
        <router-link to="/" class="w-full flex items-center justify-center gap-3 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3.5 rounded-full tracking-wider uppercase transition-all">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Sign Out</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Workspace -->
    <main class="flex-1 bg-neutral-50 overflow-y-auto p-6 md:p-12">
      <!-- TAB: BOOKINGS -->
      <section v-if="activeTab === 'bookings'" class="space-y-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-6 gap-4">
          <div>
            <h2 class="text-3xl font-bold tracking-tight text-black">Bookings</h2>
            <p class="text-neutral-500 text-sm mt-2">Manage customer bookings and track the studio schedule.</p>
          </div>
          <div class="flex flex-wrap gap-3 self-end sm:self-auto items-center">
            <div class="bg-neutral-200/80 p-1 rounded-full flex gap-1">
              <button 
                @click="bookingSlide = 'pending'" 
                :class="['text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all', bookingSlide === 'pending' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']"
              >
                Pending
              </button>
              <button 
                @click="bookingSlide = 'completed'" 
                :class="['text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all', bookingSlide === 'completed' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']"
              >
                Completed
              </button>
              <button 
                @click="bookingSlide = 'cancelled'" 
                :class="['text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all', bookingSlide === 'cancelled' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']"
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white border border-neutral-200 rounded-[2rem] p-8 space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-4 gap-3">
            <div>
              <h3 class="text-sm font-bold tracking-wider uppercase text-neutral-400">{{ bookingSlide }} Bookings</h3>
            </div>
            <div class="flex items-center gap-3">
              <div class="bg-neutral-100 p-1 rounded-full flex gap-1 text-[10px] font-bold uppercase tracking-wider">
                <button @click="bookingUserFilter = 'all'" :class="['px-3.5 py-1.5 rounded-full transition-all', bookingUserFilter === 'all' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']">All</button>
                <button @click="bookingUserFilter = 'regular'" :class="['px-3.5 py-1.5 rounded-full transition-all', bookingUserFilter === 'regular' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']">Regular</button>
                <button @click="bookingUserFilter = 'subscriber'" :class="['px-3.5 py-1.5 rounded-full transition-all', bookingUserFilter === 'subscriber' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']">Subscribers</button>
              </div>
              <span class="bg-neutral-900 text-white px-3 py-1 text-xs font-bold rounded-full">
                {{ filteredBookings.length }}
              </span>
            </div>
          </div>

          <div class="space-y-4">
            <div v-if="filteredBookings.length === 0" class="text-center p-8 text-neutral-400 font-medium text-sm font-mono">
              No {{ bookingSlide }} bookings found.
            </div>
            <div 
              v-for="b in filteredBookings" 
              :key="b.id" 
              class="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-50 border border-neutral-200 rounded-2xl gap-4 hover:border-neutral-400 transition-all"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-black text-sm">{{ b.id }}</span>
                  <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 uppercase tracking-wider">{{ b.userType }}</span>
                </div>
                <h4 class="font-bold text-black text-base mt-1">{{ b.service }}</h4>
                <p class="text-xs text-neutral-500 mt-1 font-medium">Client: {{ b.client }} | Scheduled: {{ b.date }} @ {{ b.time }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button 
                  v-if="b.type === 'pending'" 
                  @click="updateBookingStatus(b.booking_id, 'Completed')" 
                  class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm"
                >
                  Mark Completed
                </button>
                <button 
                  v-if="b.type === 'pending'" 
                  @click="updateBookingStatus(b.booking_id, 'Cancelled')" 
                  class="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-full border border-red-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB: PAYMENTS -->
      <section v-if="activeTab === 'ledgers'" class="space-y-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-6 gap-4">
          <div>
            <h2 class="text-3xl font-bold tracking-tight text-black">Payments</h2>
            <p class="text-neutral-500 text-sm mt-2">Check payment proof images and review past payments.</p>
          </div>
          <div class="flex flex-wrap gap-3 self-end sm:self-auto items-center">
            <div class="bg-neutral-200/80 p-1 rounded-full flex gap-1">
              <button 
                @click="ledgerSlide = 'pending'" 
                :class="['text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all', ledgerSlide === 'pending' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']"
              >
                Pending
              </button>
              <button 
                @click="ledgerSlide = 'archive'" 
                :class="['text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full transition-all', ledgerSlide === 'archive' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-black']"
              >
                History
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-400 uppercase tracking-wider text-[11px]">
                  <th class="p-5">Invoice ID</th>
                  <th class="p-5">Type</th>
                  <th class="p-5">Amount</th>
                  <th class="p-5">Issued Date</th>
                  <th class="p-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 font-medium text-neutral-700 text-xs">
                <tr v-if="invoices.length === 0">
                  <td colspan="5" class="p-8 text-center text-neutral-400 font-mono">No payment records found.</td>
                </tr>
                <tr v-for="inv in invoices" :key="inv.invoice_id" class="hover:bg-neutral-50">
                  <td class="p-5 font-mono font-bold text-black">INV-{{ inv.invoice_id }}</td>
                  <td class="p-5 uppercase text-xs font-bold text-neutral-600">{{ inv.invoice_type || 'Detailing Treatment' }}</td>
                  <td class="p-5 font-bold text-emerald-600">₱{{ inv.total_amount }}</td>
                  <td class="p-5">{{ inv.issued_at ? inv.issued_at.split('T')[0] : '-' }}</td>
                  <td class="p-5 text-right">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {{ inv.invoice_status || 'Paid' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB: SERVICES -->
      <section v-if="activeTab === 'services'" class="space-y-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-6 gap-4">
          <div>
            <h2 class="text-3xl font-bold tracking-tight text-black">Service List</h2>
            <p class="text-neutral-500 text-sm mt-2">Manage detailing packages and pricing in the catalog.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="s in services" :key="s.service_id" class="bg-white border border-neutral-200 p-6 rounded-[2rem] space-y-4 shadow-sm">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-black text-lg uppercase tracking-tight">{{ s.service_name }}</h3>
              <span class="text-xs font-mono font-bold bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">₱{{ s.service_price }}</span>
            </div>
            <p class="text-xs text-neutral-500 font-medium leading-relaxed">{{ s.service_description }}</p>
            <div class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Duration: {{ s.service_duration }} Mins</div>
          </div>
        </div>
      </section>

      <!-- TAB: SUBSCRIPTIONS -->
      <section v-if="activeTab === 'monitoring'" class="space-y-8">
        <div class="border-b border-neutral-200 pb-6">
          <h2 class="text-3xl font-bold tracking-tight text-black">Subscription Control</h2>
          <p class="text-neutral-500 text-sm mt-2">Manage member accounts and subscriptions roster.</p>
        </div>

        <div class="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-400 uppercase tracking-wider text-[11px]">
                  <th class="p-5">Subscriber Name</th>
                  <th class="p-5">Plan Tier</th>
                  <th class="p-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 text-xs">
                <tr v-if="subscribers.length === 0">
                  <td colspan="3" class="p-8 text-center text-neutral-400 font-mono">No VIP subscriber accounts found.</td>
                </tr>
                <tr v-for="sub in subscribers" :key="sub.subscription_id">
                  <td class="p-5 font-bold text-black">{{ sub.user_name || 'VIP Member' }}</td>
                  <td class="p-5 uppercase font-bold text-neutral-600">{{ sub.plan_tier || 'Unlimited VIP Wash Club' }}</td>
                  <td class="p-5 text-right"><span class="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">ACTIVE</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB: FEEDBACKS -->
      <section v-if="activeTab === 'feedbacks'" class="space-y-8">
        <div class="border-b border-neutral-200 pb-6">
          <h2 class="text-3xl font-bold tracking-tight text-black">Customer Feedback</h2>
          <p class="text-neutral-500 text-sm mt-2">A simple list of reviews and ratings from customers.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="fb in feedbacks" :key="fb.feedback_id" class="bg-white border border-neutral-200 p-6 rounded-[2rem] space-y-3 shadow-sm">
            <div class="flex justify-between items-center">
              <h4 class="font-bold text-black">{{ fb.customer_name }}</h4>
              <span class="text-amber-500 font-bold text-xs">★ {{ fb.rating }}/5</span>
            </div>
            <p class="text-xs text-neutral-600 font-medium leading-relaxed">"{{ fb.comments }}"</p>
            <div class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Service: {{ fb.service_name }}</div>
          </div>
        </div>
      </section>
    </main>

    <GlobalErrorModal ref="errorModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import GlobalErrorModal from '@/components/GlobalErrorModal.vue';

const activeTab = ref('bookings');
const bookingSlide = ref('pending');
const bookingUserFilter = ref('all');
const ledgerSlide = ref('pending');
const errorModal = ref(null);

const appointments = ref([]);
const invoices = ref([]);
const services = ref([]);
const subscribers = ref([]);
const feedbacks = ref([]);

const filteredBookings = computed(() => {
  return appointments.value.filter(b => {
    const slideMatch = b.type === bookingSlide.value;
    const filterMatch = bookingUserFilter.value === 'all' || b.userType === bookingUserFilter.value;
    return slideMatch && filterMatch;
  });
});

const loadBookings = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/admin/bookings`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        appointments.value = data.map(app => {
          let type = 'cancelled';
          const statusStr = String(app.booking_status || '');
          if (['Pending Verification', 'Pending_Verification', 'Confirmed', 'Pending', 'Paid', 'Scheduled'].includes(statusStr)) {
            type = 'pending';
          } else if (statusStr === 'Completed') {
            type = 'completed';
          }

          return {
            id: "MTG-" + app.booking_id,
            booking_id: parseInt(app.booking_id, 10),
            type,
            service: app.service?.service_name || app.services?.service_name || app.service_name || 'Car Wash',
            date: app.scheduled_date ? String(app.scheduled_date).split('T')[0] : '—',
            time: app.time_slot || '—',
            client: app.customer?.full_name || app.customers?.full_name || app.customer_name || 'Client',
            userType: app.user_id ? 'subscriber' : 'regular'
          };
        });
      }
    }
  } catch (err) {
    console.warn("Bookings fetch notice:", err);
  }
};

const loadInvoices = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/admin/invoices`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) invoices.value = data;
    }
  } catch (err) {
    console.warn("Invoices fetch notice:", err);
  }
};

const loadServices = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/services`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) services.value = data;
    }
  } catch (err) {
    console.warn("Services fetch notice:", err);
  }
};

const loadSubscribers = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/admin/subscriptions`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) subscribers.value = data;
    }
  } catch (err) {
    console.warn("Subscribers fetch notice:", err);
  }
};

const loadFeedbacks = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/feedbacks`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) feedbacks.value = data;
    }
  } catch (err) {
    console.warn("Feedbacks fetch notice:", err);
  }
};

const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    await fetch(`${apiBase}/admin/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_status: newStatus })
    });
    await loadBookings();
  } catch (err) {
    if (errorModal.value) errorModal.value.show(err.message || 'Failed to update booking status.');
  }
};

onMounted(() => {
  loadBookings();
  loadInvoices();
  loadServices();
  loadSubscribers();
  loadFeedbacks();
});
</script>
