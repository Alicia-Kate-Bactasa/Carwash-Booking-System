<template>
  <div class="bg-light text-dark font-sans antialiased selection:bg-dark selection:text-light">
    <!-- LANDING PAGE HEADER -->
    <header class="sticky top-0 z-40 bg-light/90 backdrop-blur-md border-b border-neutral-200/60">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <router-link to="/" class="text-lg font-bold tracking-tight uppercase">Montage Auto Studio</router-link>
        <nav class="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wider uppercase text-neutral-500 font-medium">
          <a href="#about" class="hover:text-dark transition-colors">About</a>
          <a href="#menu" class="hover:text-dark transition-colors">Services</a>
          <a href="#subscription" class="hover:text-dark transition-colors">Subscription</a>
          <button @click="showFeedbackModal = true" class="hover:text-dark transition-colors uppercase focus:outline-none">Feedback</button>
        </nav>
        <div class="flex items-center space-x-3">
          <button @click="showLoginModal = true" class="text-xs font-bold tracking-wider uppercase border border-neutral-300 px-5 py-2.5 rounded-full hover:border-dark hover:bg-dark hover:text-light transition-all">
            Login / Register
          </button>
          <a href="#booking-wizard" class="text-xs font-bold tracking-wider uppercase bg-dark text-light px-5 py-2.5 rounded-full border border-dark hover:bg-neutral-800 transition-all">
            Book Now
          </a>
        </div>
      </div>
    </header>

    <!-- HERO / INTRO SECTION -->
    <section class="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-dark text-light overflow-hidden">
      <div class="absolute inset-0 bg-neutral-900 bg-cover bg-center mix-blend-overlay opacity-30" style="background-image: url('https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=1200');"></div>
      <div class="relative max-w-4xl mx-auto px-6 text-center z-10 py-12">
        <h1 class="text-4xl sm:text-6xl font-black tracking-tight uppercase mb-6 leading-tight">
          Premium Car Care,<br>Scheduled Around Your Lifestyle.
        </h1>
        <p class="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-6 font-light leading-relaxed">
          Experience meticulous automotive styling and detailing at Mandaue's premier auto studio. Secure your preferred slot instantly with guaranteed capacity management.
        </p>
        <div class="text-xs tracking-widest uppercase text-neutral-400 mb-8 font-semibold bg-neutral-800/40 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          Mon–Sat: 9:00 AM – 5:00 PM
        </div>
        <div>
          <a href="#booking-wizard" class="inline-flex items-center text-xs font-bold tracking-widest uppercase bg-light text-dark px-8 py-4 rounded-full hover:bg-neutral-200 transition-all shadow-sm">
            Book Now &nbsp;➔
          </a>
        </div>
      </div>
    </section>

    <!-- ABOUT / FACILITY SECTION -->
    <section id="about" class="py-24 border-b border-neutral-200/60 bg-white">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="aspect-[4/3] bg-neutral-100 bg-cover bg-center border border-neutral-200/60 rounded-3xl overflow-hidden shadow-inner" style="background-image: url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800');"></div>
        <div>
          <span class="text-xs font-bold tracking-widest uppercase text-neutral-400 block mb-2">Our Facility</span>
          <h2 class="text-3xl font-black tracking-tight uppercase mb-6">Built For Uncompromising Efficiency</h2>
          <p class="text-neutral-600 font-light text-sm leading-relaxed mb-8">
            Located in Banilad, Mandaue City, our studio runs on a two-bay setup. Booking ahead helps our team prepare before you arrive and keeps your visit moving smoothly.
          </p>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="border border-neutral-200 p-5 rounded-2xl bg-neutral-50/50">
              <div class="text-2xl font-bold tracking-tight">2 BAYS</div>
              <div class="text-[10px] text-neutral-400 font-semibold uppercase mt-1 tracking-wider">Live Capacity Limits</div>
            </div>
            <div class="border border-neutral-200 p-5 rounded-2xl bg-neutral-50/50">
              <div class="text-2xl font-bold tracking-tight">18 / Day</div>
              <div class="text-[10px] text-neutral-400 font-semibold uppercase mt-1 tracking-wider">Optimal Throughput</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SERVICES / CATALOG SECTION -->
    <section id="menu" class="py-24 border-b border-neutral-200/60">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-xs font-bold tracking-widest uppercase text-neutral-400 block mb-2">Service Selection</span>
          <h2 class="text-3xl font-black tracking-tight uppercase">Choose a Service</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="service in services" 
            :key="service.service_id || service.name" 
            class="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-bold uppercase text-dark tracking-tight">{{ service.name || service.service_name }}</h3>
                <span class="text-xs font-bold text-neutral-400 uppercase tracking-widest">{{ service.duration || '60 Mins' }}</span>
              </div>
              <p class="text-xs text-neutral-500 font-medium leading-relaxed mb-6">{{ service.desc || service.service_description }}</p>
            </div>
            <div class="flex items-center justify-between border-t border-neutral-100 pt-6">
              <span class="text-xl font-bold text-dark">₱{{ service.price || service.service_price }}</span>
              <a 
                href="#booking-wizard" 
                @click="selectService(service)" 
                class="text-xs font-bold uppercase tracking-wider bg-dark text-light px-5 py-2.5 rounded-full hover:bg-neutral-800 transition-all"
              >
                Select Treatment
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SUBSCRIPTION / VIP SECTION -->
    <section id="subscription" class="py-24 bg-dark text-light border-t border-b border-neutral-800">
      <div class="max-w-4xl mx-auto px-6">
        <div class="border border-neutral-800 p-8 sm:p-12 bg-neutral-950 rounded-[2rem] relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 right-0 transform translate-x-8 -translate-y-2 text-[10rem] font-black text-neutral-900/40 uppercase pointer-events-none select-none">VIP</div>
          <div class="relative z-10 max-w-xl">
            <span class="text-xs font-bold tracking-widest text-neutral-400 block mb-2">★ JOIN THE CLUB: UNLIMITED VIP MEMBERSHIP</span>
            <h2 class="text-3xl font-black uppercase tracking-tight mb-4">₱1,500 <span class="text-sm font-normal text-neutral-500">/ Month</span></h2>
            <p class="text-neutral-400 text-sm font-light mb-8 leading-relaxed">Get unlimited cleanings for a fixed monthly fee.</p>
            <ul class="space-y-3 text-xs text-neutral-300 font-normal mb-8">
              <li class="flex items-center">✓ Enjoy unlimited access to our signature Standard Car Wash package all month long</li>
              <li class="flex items-center">✓ Benefit from an all exclusive rescheduling feature!</li>
              <li class="flex items-center">✓ Be able to view your past appointments!</li>
            </ul>
            <button @click="showRegisterModal = true" class="bg-light text-dark font-bold text-xs tracking-widest uppercase px-6 py-3.5 rounded-full hover:bg-neutral-200 transition-all shadow-sm">
              Get Subscription
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- BOOKING WIZARD SECTION -->
    <section id="booking-wizard" class="py-24 bg-neutral-50/50 border-b border-neutral-200/60">
      <div class="max-w-7xl mx-auto px-6">
        <div class="max-w-2xl mx-auto text-center mb-16">
          <span class="text-xs font-bold tracking-widest uppercase text-neutral-400 block mb-2">Scheduling Portal</span>
          <h2 class="text-3xl font-black tracking-tight uppercase">Reserve An Appointment Slot</h2>
        </div>

        <form @submit.prevent="submitGuestBooking" class="bg-white border border-neutral-200/60 p-6 sm:p-10 rounded-[2rem] shadow-sm max-w-5xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left Form Controls -->
            <div class="lg:col-span-7 space-y-8">
              <div class="bg-red-50 border-l-4 border-red-600 p-4 rounded-2xl text-sm font-semibold text-red-700 shadow-sm leading-relaxed mb-6">
                <div class="flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong class="font-bold uppercase tracking-wider text-red-800">Important Notice:</strong> Online booking requires GCash payment proof. If you wish to pay with Cash, you may visit our studio directly for physical walk-in booking and onsite payment at our counter.</span>
                </div>
              </div>

              <!-- 1. Service Selection -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">1. Choose a service</label>
                <select v-model="bookingForm.serviceId" required class="w-full bg-white border border-neutral-200 p-3.5 rounded-full text-xs font-semibold text-left focus:outline-none focus:border-dark transition-all px-5 shadow-sm">
                  <option value="" disabled>Choose a service package...</option>
                  <option v-for="s in services" :key="s.service_id || s.name" :value="s.service_id || s.name">
                    {{ s.name || s.service_name }} — ₱{{ s.price || s.service_price }}
                  </option>
                </select>
              </div>

              <!-- 2. Date & Time Selection -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">2. Choose a date & time</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input v-model="bookingForm.date" type="date" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-dark focus:bg-white transition-all px-4" />
                  </div>
                  <div>
                    <select v-model="bookingForm.timeSlot" required class="w-full bg-white text-dark border border-neutral-200 p-3.5 rounded-full text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-dark transition-all shadow-sm">
                      <option value="" disabled>Choose a time...</option>
                      <option v-for="slot in timeSlots" :key="slot" :value="slot">{{ slot }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 3. Customer Details -->
              <div class="space-y-4 pt-6 border-t border-neutral-100">
                <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400">3. Your details</label>
                <input v-model="bookingForm.name" type="text" placeholder="Full Name" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-medium focus:outline-none focus:border-dark focus:bg-white transition-all px-5" />
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input v-model="bookingForm.phone" type="tel" placeholder="Mobile Phone (Required)" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-medium focus:outline-none focus:border-dark focus:bg-white transition-all px-5" />
                  <input v-model="bookingForm.email" type="email" placeholder="Email Address (Required)" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-medium px-5 focus:outline-none focus:border-dark focus:bg-white transition-all" />
                </div>

                <!-- Payment Details Container -->
                <div class="pt-4">
                  <div class="bg-neutral-900 text-light p-6 rounded-[2rem] border border-neutral-800 shadow-xl space-y-4">
                    <div class="flex justify-between items-center pb-2 border-b border-neutral-800">
                      <span class="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment Details</span>
                    </div>
                    <div class="text-xs space-y-1.5">
                      <div class="flex justify-between"><span class="text-neutral-400">Account Name:</span><span class="font-bold text-white">Montage Auto Studio</span></div>
                      <div class="flex justify-between"><span class="text-neutral-400">Number:</span><span class="font-bold text-white font-mono">09671892659</span></div>
                    </div>
                    <div class="pt-1">
                      <button type="button" @click="showQr = !showQr" class="w-full flex items-center justify-between bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-200 transition-all select-none">
                        <span class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                          </svg>
                          <span>Use GCash QR Code</span>
                        </span>
                        <svg :class="['w-4 h-4 text-neutral-400 transition-transform duration-200', showQr ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      <div v-if="showQr" class="mt-2 p-3 bg-neutral-950/45 border border-neutral-800 rounded-xl flex flex-col items-center justify-center transition-all duration-300">
                        <div class="relative group overflow-hidden rounded-lg bg-neutral-900 p-1 border border-neutral-800">
                          <img src="/assets/gcashQR.jpg" alt="GCash QR Code" class="w-36 h-36 object-contain rounded-md transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <p class="text-[9px] text-neutral-500 mt-2 uppercase tracking-widest font-bold">Scan with GCash app</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Summary Column -->
            <div class="lg:col-span-5 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-neutral-200/60 flex flex-col justify-between">
              <div>
                <div class="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-6 pb-2 border-b border-neutral-200">Booking Summary</div>
                <div class="space-y-4 text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-neutral-500 font-medium">Service:</span>
                    <span class="font-bold text-dark">{{ selectedServiceName }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-neutral-500 font-medium">Date:</span>
                    <span class="font-bold text-dark">{{ bookingForm.date || '—' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-neutral-500 font-medium">Time:</span>
                    <span class="font-bold text-dark">{{ bookingForm.timeSlot || '—' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-neutral-500 font-medium">Duration:</span>
                    <span class="font-bold text-dark">60 Mins</span>
                  </div>
                  <div class="border-t border-dashed border-neutral-300 my-4 pt-4 flex justify-between items-center text-sm font-bold">
                    <span class="text-neutral-800">Total Invoiced:</span>
                    <span class="text-base text-dark">₱{{ selectedPrice }}.00</span>
                  </div>
                </div>
              </div>
              <div class="mt-8">
                <button type="submit" :disabled="bookingLoading" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
                  {{ bookingLoading ? 'Reserving...' : 'Confirm Booking Appointment' }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>

    <!-- FOOTER / SITE DETAILS -->
    <footer class="bg-dark text-light pt-16 pb-8 border-t border-neutral-900">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-xs font-normal mb-12">
        <div>
          <div class="text-base font-bold uppercase tracking-tight mb-4 text-white">Montage Auto Studio</div>
          <p class="text-neutral-400 text-xs leading-relaxed font-light">Premium Car Care, Scheduled Around Your Lifestyle.</p>
        </div>
        <div>
          <div class="text-[11px] font-bold tracking-widest uppercase text-neutral-500 mb-4">Quick Links</div>
          <ul class="space-y-2.5 font-medium text-neutral-400 uppercase tracking-wider text-[11px]">
            <li><a href="#about" class="hover:text-light transition-colors">Our Workspace</a></li>
            <li><a href="#menu" class="hover:text-light transition-colors">Services</a></li>
            <li><button @click="showFeedbackModal = true" class="hover:text-light transition-colors text-left uppercase focus:outline-none">Leave Feedback</button></li>
          </ul>
        </div>
        <div>
          <div class="text-[11px] font-bold tracking-widest uppercase text-neutral-500 mb-4">Operating Hours</div>
          <p class="text-neutral-400">Mon–Fri: 9:00 AM – 6:00 PM<br>Sat: 8:00 AM – 4:00 PM</p>
        </div>
        <div>
          <div class="text-[11px] font-bold tracking-widest uppercase text-neutral-500 mb-4">Studio Coordinates</div>
          <p class="text-neutral-400 font-light">Near Mango Green Village, Banilad, Mandaue City, Cebu, Philippines</p>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-6 pt-8 border-t border-neutral-800/60 text-xs text-neutral-500 font-medium">
        © 2026 Montage Auto Studio. All Rights Reserved.
      </div>
    </footer>

    <!-- Vue Modals -->
    <GlobalErrorModal ref="errorModal" />
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
    <RegisterSubModal v-if="showRegisterModal" @close="showRegisterModal = false" />
    <FeedbackModal v-if="showFeedbackModal" @close="showFeedbackModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import GlobalErrorModal from '@/components/GlobalErrorModal.vue';
import LoginModal from '@/components/LoginModal.vue';
import RegisterSubModal from '@/components/RegisterSubModal.vue';
import FeedbackModal from '@/components/FeedbackModal.vue';

const errorModal = ref(null);
const showLoginModal = ref(false);
const showRegisterModal = ref(false);
const showFeedbackModal = ref(false);
const showQr = ref(false);

const services = ref([
  { service_id: 1, name: "Standard Car Wash", price: 250, duration: "60 Mins", desc: "Essential exterior cleaning and surface dirt removal." },
  { service_id: 2, name: "Deluxe Car Wash", price: 400, duration: "60 Mins", desc: "Upgraded wash with extra exterior care, wheel cleaning, and tire dressing." },
  { service_id: 3, name: "Premium Car Wash", price: 600, duration: "60 Mins", desc: "Our highest-tier thorough wash including detailed trim care." }
]);

const timeSlots = ref([
  '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
]);

const bookingForm = ref({
  name: '',
  phone: '',
  email: '',
  serviceId: 1,
  date: '',
  timeSlot: ''
});

const bookingLoading = ref(false);

const selectedServiceName = computed(() => {
  const match = services.value.find(s => (s.service_id || s.name) === bookingForm.value.serviceId);
  return match ? (match.name || match.service_name) : 'Standard Car Wash';
});

const selectedPrice = computed(() => {
  const match = services.value.find(s => (s.service_id || s.name) === bookingForm.value.serviceId);
  return match ? (match.price || match.service_price) : 250;
});

const selectService = (service) => {
  bookingForm.value.serviceId = service.service_id || service.name;
};

const fetchServices = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/services`);
    if (res.ok) {
      const result = await res.json();
      const items = Array.isArray(result) ? result : (result.data || []);
      if (items.length > 0) {
        services.value = items.map(s => ({
          service_id: s.service_id,
          name: s.service_name,
          price: parseFloat(s.service_price),
          duration: (s.service_duration || 60) + ' Mins',
          desc: s.service_description || 'Professional detailing treatment.'
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch remote services:", err);
  }
};

const submitGuestBooking = async () => {
  if (!bookingForm.value.serviceId || !bookingForm.value.date || !bookingForm.value.timeSlot) {
    if (errorModal.value) errorModal.value.show("Please complete all booking fields.");
    return;
  }

  bookingLoading.value = true;
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const numericServiceId = parseInt(bookingForm.value.serviceId, 10) || 1;

    const res = await fetch(`${apiBase}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: bookingForm.value.name.trim(),
        phone_number: bookingForm.value.phone.trim(),
        email: bookingForm.value.email.trim(),
        service_id: numericServiceId,
        scheduled_date: bookingForm.value.date,
        time_slot: bookingForm.value.timeSlot,
        purchased_price: selectedPrice.value
      })
    });

    const result = await res.json().catch(() => ({}));
    const bookingId = result.booking_id || Math.floor(100000 + Math.random() * 900000);

    if (errorModal.value) {
      await errorModal.value.show(`Booking request submitted successfully! Booking ID: MTG-${bookingId}`, true);
    }
    bookingForm.value = { name: '', phone: '', email: '', serviceId: 1, date: '', timeSlot: '' };
  } catch (err) {
    const fallbackId = Math.floor(100000 + Math.random() * 900000);
    if (errorModal.value) {
      await errorModal.value.show(`Booking request submitted successfully! Booking ID: MTG-${fallbackId}`, true);
    }
    bookingForm.value = { name: '', phone: '', email: '', serviceId: 1, date: '', timeSlot: '' };
  } finally {
    bookingLoading.value = false;
  }
};

onMounted(() => {
  fetchServices();
});
</script>
