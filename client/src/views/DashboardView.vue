<!--
  Member Dashboard View Component for Montage Auto Studio.
  Provides authenticated member workspace featuring account overview, ₱0.00 VIP booking reservation,
  rescheduling, cancellation, and subscription plan status monitoring.
-->
<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-neutral-50 text-dark font-sans antialiased text-base">
    <!-- Sidebar container -->
    <aside 
      :class="[
        'bg-dark text-light flex flex-col justify-between p-4 md:p-6 border-r border-neutral-800 shrink-0 transition-all duration-300 relative overflow-x-hidden',
        isSidebarCollapsed ? 'w-full md:w-20' : 'w-full md:w-72'
      ]"
    >
      <div class="space-y-8">
        <div class="pb-4 border-b border-neutral-800 flex justify-between items-center relative">
          <div v-if="!isSidebarCollapsed" class="overflow-hidden whitespace-nowrap">
            <div class="text-lg font-bold uppercase tracking-wider text-white">Montage Studio</div>
            <div class="text-xs text-neutral-400 tracking-widest uppercase font-mono mt-1.5">Member Hub</div>
          </div>
          <button 
            @click="toggleSidebar" 
            :class="[
              'p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors focus:outline-none shrink-0',
              isSidebarCollapsed ? 'mx-auto' : ''
            ]"
            :title="isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
          >
            <svg v-if="!isSidebarCollapsed" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <nav class="space-y-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
          <button 
            @click="activeView = 'overview'" 
            :title="isSidebarCollapsed ? 'My Account' : ''"
            :class="[
              'w-full flex items-center space-x-3 p-4 rounded-full transition-all text-left font-bold focus:outline-none',
              isSidebarCollapsed ? 'md:justify-center md:px-0' : '',
              activeView === 'overview' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">My Account</span>
          </button>
          <button 
            @click="activeView = 'booking'" 
            :title="isSidebarCollapsed ? 'Book New Session' : ''"
            :class="[
              'w-full flex items-center space-x-3 p-4 rounded-full transition-all text-left font-bold focus:outline-none',
              isSidebarCollapsed ? 'md:justify-center md:px-0' : '',
              activeView === 'booking' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Book New Session</span>
          </button>
          <button 
            @click="activeView = 'subscription'" 
            :title="isSidebarCollapsed ? 'Subscription Status' : ''"
            :class="[
              'w-full flex items-center space-x-3 p-4 rounded-full transition-all text-left font-bold focus:outline-none',
              isSidebarCollapsed ? 'md:justify-center md:px-0' : '',
              activeView === 'subscription' ? 'bg-neutral-900 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Subscription Status</span>
          </button>
        </nav>
      </div>

      <div class="pt-6 border-t border-neutral-800">
        <button 
          @click="logout" 
          :title="isSidebarCollapsed ? 'Logout' : ''"
          :class="[
            'w-full flex items-center justify-center space-x-3 text-sm font-bold bg-neutral-900 hover:bg-red-950 hover:text-red-200 border border-neutral-800 text-neutral-400 py-4 rounded-full tracking-widest uppercase transition-all focus:outline-none',
            isSidebarCollapsed ? 'md:px-0' : ''
          ]"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Logout</span>
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
        <div :class="['text-xs font-bold px-4 py-2 rounded-full border flex items-center gap-1.5 self-start sm:self-center uppercase tracking-wider', isSubscriberActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200']">
          <span :class="['w-2 h-2 rounded-full inline-block', isSubscriberActive ? 'bg-emerald-500' : 'bg-red-500']"></span>
          {{ isSubscriberActive ? 'VIP STATUS ACTIVE' : 'SUBSCRIPTION INACTIVE' }}
        </div>
      </div>

      <!-- VIEW CONTENT CONTAINERS WITH FADE-SLIDE TRANSITION -->
      <transition name="fade-slide" mode="out-in">
        <!-- VIEW: OVERVIEW -->
        <div v-if="activeView === 'overview'" key="overview" class="space-y-12">
          <div v-motion-fade-visible-once class="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-widest block">Current Subscription Tier</span>
              <div class="text-2xl font-black uppercase text-dark mt-1">Unlimited VIP Wash Club</div>
              <p class="text-sm text-neutral-500 mt-2">Provides flat-rate access to our standard scheduling with ₱0.00 per-visit transaction invoices.</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">Membership Account</span>
              <div :class="['text-xl font-bold mt-1', isSubscriberActive ? 'text-emerald-600' : 'text-red-600']">
                {{ isSubscriberActive ? '₱1,500.00 / Active' : 'Account Inactive' }}
              </div>
            </div>
          </div>

          <div v-motion-fade-visible-once class="bg-white border border-neutral-200 rounded-[2rem] shadow-sm overflow-hidden">
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
                      <button v-if="app.type === 'completed'" @click="openFeedbackModalForApp(app)" class="text-xs font-bold text-amber-600 border border-amber-200 px-3.5 py-1.5 rounded-full hover:bg-amber-50 transition-all">
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
        <div v-else-if="activeView === 'booking'" key="booking" class="space-y-8">
          <!-- INACTIVE ACCOUNT LOCKOUT NOTICE -->
          <div v-if="!isSubscriberActive" class="bg-neutral-950 border border-neutral-800 p-8 sm:p-12 rounded-[2rem] text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            <div class="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold border border-amber-500/20">
              🔒
            </div>
            <h3 class="text-2xl font-black uppercase tracking-tight text-white mb-3">Unlimited Booking Unavailable</h3>
            <p class="text-neutral-400 text-sm font-light mb-8 leading-relaxed">
              Unlimited booking is not available for inactive or cancelled subscriber accounts. Reactivate your account to avail your perks again and resume complimentary scheduling.
            </p>
            <button @click="handleSubscriptionRenewal" class="bg-light text-dark font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-full hover:bg-neutral-200 transition-all shadow-sm">
              Reactivate VIP Account (₱1,500 / Month)
            </button>
          </div>

          <!-- ACTIVE SUBSCRIBER BOOKING FORM -->
          <template v-else>
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-6">
              <div>
                <h3 class="text-3xl font-black uppercase tracking-tight text-dark">Schedule An Appointment Session</h3>
                <p class="text-sm text-neutral-400 font-medium mt-1">Book directly into our active Banilad studio configuration (₱0.00 VIP Member Rate).</p>
              </div>
            </div>

            <!-- Service Selection Menu Grid -->
            <div class="mb-12">
              <div class="mb-6">
                <span class="text-xs font-bold tracking-widest uppercase text-neutral-400 block mb-1">Service Selection Menu</span>
                <h4 class="text-lg font-bold uppercase tracking-tight text-dark">Available Detail Treatments</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div 
                  v-for="(s, idx) in catalogServices" 
                  :key="s.service_id" 
                  v-motion
                  :initial="{ opacity: 0, y: 12 }"
                  :enter="{ opacity: 1, y: 0, transition: { duration: 350, delay: idx * 60 } }"
                  :class="['p-8 rounded-[2rem] shadow-sm flex flex-col justify-between border cursor-pointer transition-all', String(bookingForm.serviceId) === String(s.service_id) ? 'bg-dark text-white border-dark' : 'bg-white border-neutral-200']"
                  @click="bookingForm.serviceId = s.service_id"
                >
                  <div>
                    <div class="flex justify-between items-start mb-4">
                      <h4 class="text-lg font-bold uppercase tracking-tight">{{ s.service_name }}</h4>
                      <span :class="['text-xs font-bold uppercase tracking-widest', String(bookingForm.serviceId) === String(s.service_id) ? 'text-neutral-300' : 'text-neutral-400']">{{ s.service_duration || 60 }} Mins</span>
                    </div>
                    <p :class="['text-xs font-medium leading-relaxed mb-6', String(bookingForm.serviceId) === String(s.service_id) ? 'text-neutral-300' : 'text-neutral-500']">{{ s.service_description || 'Professional detailing package.' }}</p>
                  </div>
                  <div class="flex items-center justify-between border-t border-neutral-100/40 pt-6">
                    <span class="text-sm font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full">VIP FREE</span>
                    <button type="button" class="text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-all">
                      {{ String(bookingForm.serviceId) === String(s.service_id) ? 'Selected ✓' : 'Select' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="submitMemberBooking" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div class="lg:col-span-7 space-y-8 bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">1. Choose a service</label>
                  <ServiceSelector 
                    v-model="bookingForm.serviceId" 
                    :services="catalogServices" 
                    :isVip="true"
                    @change="onDateChange" 
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">2. Choose Date & Time</label>
                  <div class="space-y-4">
                    <input 
                      v-model="bookingForm.date" 
                      type="date" 
                      :min="todayStr"
                      required 
                      @change="onDateChange"
                      class="w-full bg-neutral-50 border border-neutral-200 p-4 rounded-full text-sm font-semibold focus:outline-none focus:ring-0 focus:border-neutral-300 focus:bg-white transition-all px-6 cursor-pointer" 
                    />

                    <!-- Scrollable Dynamic Time Slot Blocks -->
                    <div>
                      <div v-if="!bookingForm.serviceId" class="text-xs text-neutral-400 font-medium italic p-4 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
                        Please choose a service package first.
                      </div>
                      <div v-else-if="!bookingForm.date" class="text-xs text-neutral-400 font-medium italic p-4 text-center bg-neutral-50 rounded-2xl border border-neutral-200">
                        Please select a date to view available studio time slots.
                      </div>
                      <div v-else-if="loadingSlots" class="text-xs text-neutral-500 font-semibold p-4 text-center bg-neutral-50 rounded-2xl border border-neutral-200 animate-pulse">
                        Checking studio availability...
                      </div>
                      <div v-else-if="availableTimeSlots.length === 0" class="text-xs text-red-500 font-semibold p-4 text-center bg-red-50 rounded-2xl border border-red-200">
                        No available slots for this date & service duration. Please select another date.
                      </div>
                      <div v-else class="max-h-56 overflow-y-auto rounded-[1.5rem] bg-neutral-50 p-3 border border-neutral-200 shadow-inner grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          v-for="slot in availableTimeSlots"
                          :key="slot.timeSlotValue"
                          type="button"
                          @click="bookingForm.timeSlot = slot.timeSlotValue"
                          :class="[
                            'p-3.5 rounded-full text-xs font-bold transition-all text-center border focus:outline-none focus:ring-0',
                            bookingForm.timeSlot === slot.timeSlotValue
                              ? 'bg-dark text-white border-dark shadow-md scale-[1.02]'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:border-dark hover:bg-neutral-100'
                          ]"
                        >
                          {{ slot.label }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-5 space-y-6">
                <div class="bg-white border border-neutral-200 p-6 sm:p-8 rounded-[2rem] shadow-sm space-y-4">
                  <div class="text-xs uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-200 pb-3 mb-2">Booking Summary</div>
                  <div class="flex justify-between text-sm font-medium"><span>Service:</span><span class="font-bold text-dark">{{ selectedServiceName }}</span></div>
                  <div class="flex justify-between text-sm font-medium"><span>Date:</span><span class="font-bold text-dark">{{ bookingForm.date || '—' }}</span></div>
                  <div class="flex justify-between text-sm font-medium"><span>Time:</span><span class="font-bold text-dark">{{ bookingForm.timeSlot || '—' }}</span></div>
                  <div class="flex justify-between text-sm font-medium"><span>Duration:</span><span class="font-bold text-dark">{{ selectedServiceDurationMinutes }} Mins</span></div>

                  <div class="border-t border-dashed border-neutral-300 pt-4 flex justify-between items-center text-sm font-bold text-emerald-700 bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
                    <span>Invoice Total:</span>
                    <span class="uppercase font-black text-sm tracking-wider">₱0.00 (VIP FREE)</span>
                  </div>

                  <div class="pt-2">
                    <button type="submit" :disabled="bookingLoading" class="w-full bg-dark text-light text-xs font-bold tracking-widest uppercase py-4 rounded-full border border-dark hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
                      {{ bookingLoading ? 'Reserving...' : 'Confirm ₱0.00 Session Appointment' }}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </template>
        </div>

        <!-- VIEW: SUBSCRIPTION METRICS -->
        <div v-else-if="activeView === 'subscription'" key="subscription" class="space-y-8">
          <div class="mb-4">
            <h3 class="text-3xl font-black uppercase tracking-tight text-dark">Subscription Status & Details</h3>
            <p class="text-base text-neutral-400 font-medium mt-1">Review membership billing dates, status, and completed session metrics.</p>
          </div>

          <div v-motion-fade-visible-once class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm space-y-6">
              <h4 class="text-xs uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-100 pb-3">Membership Profile Details</h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">Subscription ID</span>
                  <span class="font-bold text-dark font-mono text-sm bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200 inline-block">
                    SUB-{{ subscriptionDetails.subscription_id || 'N/A' }}
                  </span>
                </div>
                <div>
                  <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">Account Holder</span>
                  <span class="font-bold text-dark text-base">{{ welcomeName }}</span>
                </div>
                <div>
                  <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">Plan Status</span>
                  <span :class="['font-black text-sm uppercase px-3 py-1 rounded-full border inline-block', isSubscriberActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200']">
                    {{ subscriptionDetails.plan_status }}
                  </span>
                </div>
                <div>
                  <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">Created At</span>
                  <span class="font-bold text-dark font-mono text-sm">{{ subscriptionDetails.created_at }}</span>
                </div>
                <div>
                  <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">Completed Sessions</span>
                  <span class="font-black text-emerald-600 font-mono text-base">{{ completedSessionsCount }} Sessions</span>
                </div>
                <div>
                  <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">Last Billing Date</span>
                  <span class="font-bold text-dark font-mono text-sm">{{ subscriptionDetails.last_billing_date }}</span>
                </div>
                <div>
                  <span class="text-xs text-neutral-400 font-semibold uppercase tracking-wider block mb-1">Next Billing Date</span>
                  <span class="font-bold text-dark font-mono text-sm">{{ subscriptionDetails.next_billing_date }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm flex flex-col justify-between space-y-8">
              <div class="space-y-4">
                <h4 class="text-xs uppercase tracking-wider text-neutral-400 font-bold border-b border-neutral-100 pb-3">Payments & Roster Control</h4>
                <div class="text-xs text-neutral-500 font-medium leading-relaxed">
                  Monthly VIP membership subscription (₱1,500/mo) includes unlimited detailing session bookings at ₱0.00 per appointment.
                </div>
              </div>

              <div class="space-y-3">
                <button @click="handleSubscriptionRenewal" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-4 rounded-full transition-all text-center shadow-sm uppercase tracking-wider">
                  Pay Monthly Renewal (₱1,500)
                </button>
                <button v-if="isSubscriberActive" @click="handleCancelSubscription" class="w-full bg-white hover:bg-red-50 text-red-600 border border-neutral-200 hover:border-red-200 text-xs font-bold tracking-widest uppercase py-4 rounded-full transition-all text-center">
                  Cancel Subscription Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </main>

    <!-- Modals with fade transitions -->
    <transition name="fade-scale">
      <RescheduleModal 
        v-if="selectedReschedule" 
        :bookingId="selectedReschedule.id" 
        :rawBookingId="selectedReschedule.booking_id" 
        @close="selectedReschedule = null" 
        @updated="loadAppointments" 
      />
    </transition>
    <transition name="fade-scale">
      <FeedbackModal v-if="showFeedbackModal" :presetBookingId="selectedPresetBookingId" @close="showFeedbackModal = false" @submitted="loadAppointments" />
    </transition>
    <GlobalErrorModal ref="errorModal" />
  </div>
</template>

<script setup>
// Script setup for managing member workspace state, active appointments, ₱0.00 booking calculations, and subscription status
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ServiceSelector from '@/components/ServiceSelector.vue';
import RescheduleModal from '@/components/RescheduleModal.vue';
import FeedbackModal from '@/components/FeedbackModal.vue';
import GlobalErrorModal from '@/components/GlobalErrorModal.vue';


const router = useRouter();
const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const activeView = ref('overview');
const activeTab = ref('active');
const welcomeName = ref(localStorage.getItem('subscriber_name') || 'VIP Member');

const currentAppointments = ref([]);
const historyAppointments = ref([]);
const catalogServices = ref([
  { service_id: 1, service_name: "Standard Car Wash", service_price: 250, service_duration: "60 Mins", service_description: "Essential exterior cleaning and surface dirt removal." },
  { service_id: 2, service_name: "Deluxe Car Wash", service_price: 400, service_duration: "60 Mins", service_description: "Upgraded wash with extra exterior care, wheel cleaning, and tire dressing." },
  { service_id: 3, service_name: "Premium Car Wash", service_price: 600, service_duration: "60 Mins", service_description: "Our highest-tier thorough wash including detailed trim care." }
]);
const selectedReschedule = ref(null);
const selectedPresetBookingId = ref(null);
const showFeedbackModal = ref(false);

const bookedSlots = ref([]);
const loadingSlots = ref(false);

const subscriptionDetails = ref({
  plan_status: 'Active',
  created_at: new Date().toISOString().split('T')[0],
  last_billing_date: new Date().toISOString().split('T')[0],
  next_billing_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
});

const isSubscriberActive = computed(() => {
  const localStatus = localStorage.getItem('subscriber_plan_status');
  if (localStatus) {
    return localStatus.toUpperCase() === 'ACTIVE';
  }
  const status = String(subscriptionDetails.value.plan_status || '').toUpperCase();
  return status === 'ACTIVE';
});

const completedSessionsCount = computed(() => {
  return historyAppointments.value.filter(a => a.type === 'completed').length;
});

const openFeedbackModalForApp = (app) => {
  selectedPresetBookingId.value = app.booking_id || String(app.id).replace(/\D/g, '');
  showFeedbackModal.value = true;
};

const errorModal = ref(null);

const bookingForm = ref({
  serviceId: '',
  date: '',
  timeSlot: ''
});
const bookingLoading = ref(false);

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

const selectedServiceDurationMinutes = computed(() => {
  if (!bookingForm.value.serviceId) return 60;
  const match = catalogServices.value.find(s => String(s.service_id || s.name) === String(bookingForm.value.serviceId));
  if (!match) return 60;
  const durStr = String(match.duration || match.service_duration || '60');
  const parsed = durStr.match(/\d+/);
  return parsed ? parseInt(parsed[0], 10) : 60;
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
    console.warn("Could not fetch booked slots:", err);
  } finally {
    loadingSlots.value = false;
  }
};

const onDateChange = () => {
  bookingForm.value.timeSlot = '';
  if (bookingForm.value.date) {
    fetchBookedSlots(bookingForm.value.date);
  }
};

const availableTimeSlots = computed(() => {
  if (!bookingForm.value.serviceId || !bookingForm.value.date) return [];

  const duration = selectedServiceDurationMinutes.value;
  const dayStart = 9 * 60;  // 09:00 AM
  const dayEnd = 17 * 60;   // 05:00 PM
  const step = 30;          // 30 min step

  const slots = [];
  const isToday = bookingForm.value.date === todayStr.value;
  const nowMins = currentMinutesToday.value;

  for (let start = dayStart; start + duration <= dayEnd; start += step) {
    const end = start + duration;
    const label = `${formatMinutesTo12H(start)} - ${formatMinutesTo12H(end)}`;

    // Filter past times on today's date
    if (isToday && start <= nowMins) {
      continue;
    }

    // Filter overlap with existing booked slots
    let isOverlap = false;
    for (const booked of bookedSlots.value) {
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
      slots.push({
        label,
        timeSlotValue: label
      });
    }
  }

  return slots;
});

const displayedAppointments = computed(() => {
  return activeTab.value === 'active' ? currentAppointments.value : historyAppointments.value;
});

const selectedServiceName = computed(() => {
  const match = catalogServices.value.find(s => String(s.service_id) === String(bookingForm.value.serviceId));
  return match ? match.service_name : 'Please Select a Service';
});

const loadAppointments = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${apiBase}/bookings/user/bookings`, {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    if (res.ok) {
      const data = await res.json();
      const mapped = (data || []).map(app => {
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
      const result = await res.json();
      const items = Array.isArray(result) ? result : (result.data || []);
      catalogServices.value = items;
    }
  } catch (err) {
    console.warn("Catalog fetch notice:", err);
  }
};

const fetchSubscriptionDetails = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const token = localStorage.getItem('auth_token');
    const res = await fetch(`${apiBase}/subscriptions/me`, {
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    if (res.ok) {
      const result = await res.json();
      if (result.data?.subscription) {
        const sub = result.data.subscription;
        const statusFromDb = sub.plan_status || 'Active';

        localStorage.setItem('subscriber_plan_status', statusFromDb);

        subscriptionDetails.value = {
          subscription_id: sub.subscription_id || null,
          plan_status: statusFromDb,
          created_at: sub.created_at ? String(sub.created_at).split('T')[0] : new Date().toISOString().split('T')[0],
          last_billing_date: sub.last_billing_date ? String(sub.last_billing_date).split('T')[0] : new Date().toISOString().split('T')[0],
          next_billing_date: sub.next_billing_date ? String(sub.next_billing_date).split('T')[0] : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        };
      }
    }
  } catch (err) {
    console.warn("Subscription details fetch notice:", err);
  }
};

const openReschedule = (app) => {
  selectedReschedule.value = app;
};

const cancelAppointment = async (bookingId) => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const token = localStorage.getItem('auth_token');
    await fetch(`${apiBase}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
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

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result.message || 'Failed to reserve appointment session.');
    }

    if (errorModal.value) {
      await errorModal.value.show("VIP Appointment reserved successfully at ₱0.00 invoice!", true);
    }

    bookingForm.value = { serviceId: '', date: '', timeSlot: '' };
    await loadAppointments();
    activeView.value = 'overview';
  } catch (err) {
    if (errorModal.value) errorModal.value.show(err.message || 'Failed to reserve VIP booking session.');
  } finally {
    bookingLoading.value = false;
  }
};

const handleSubscriptionRenewal = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const token = localStorage.getItem('auth_token');
    const subscriberEmail = localStorage.getItem('subscriber_email') || '';

    // 1. Create Renewal Invoice
    const renewRes = await fetch(`${apiBase}/subscriptions/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ plan_tier: 'Unlimited Basic Wash' })
    });
    const renewData = await renewRes.json().catch(() => ({}));

    if (!renewRes.ok) {
      throw new Error(renewData.message || 'Failed to generate renewal invoice.');
    }

    const subId = renewData.data?.subscription?.subscription_id;
    const invId = renewData.data?.invoice?.invoice_id;

    // 2. Request PayMongo Hosted Checkout Session (GCash / Maya / Card)
    const checkoutRes = await fetch(`${apiBase}/payments/paymongo/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        amount: 1500,
        service_name: 'VIP Monthly Membership Renewal (₱1,500.00)',
        subscription_id: subId,
        invoice_id: invId,
        client_email: subscriberEmail,
        return_url: window.location.origin + window.location.pathname
      })
    });

    const checkoutData = await checkoutRes.json().catch(() => ({}));

    if (!checkoutRes.ok || !checkoutData.checkout_url) {
      throw new Error(checkoutData.message || 'Failed to initialize PayMongo checkout session.');
    }

    // 3. Redirect user to PayMongo Hosted Checkout Page
    window.location.href = checkoutData.checkout_url;

  } catch (err) {
    if (errorModal.value) {
      await errorModal.value.show(err.message || 'Failed to process renewal checkout. Please try again.', false);
    }
  }
};

const handleCancelSubscription = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const token = localStorage.getItem('auth_token');
    const subscriberEmail = localStorage.getItem('subscriber_email') || localStorage.getItem('subscriber_name') || '';

    const res = await fetch(`${apiBase}/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ email: subscriberEmail })
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result.message || 'Failed to cancel subscription.');
    }

    // Apply server-confirmed state only after a successful response
    localStorage.setItem('subscriber_plan_status', 'Cancelled');
    subscriptionDetails.value.plan_status = 'Cancelled';

    if (errorModal.value) {
      await errorModal.value.show("Subscription plan cancelled successfully. Unlimited booking is now disabled for inactive accounts.", true);
    }
  } catch (err) {
    if (errorModal.value) {
      await errorModal.value.show(err.message || 'Failed to cancel subscription. Please try again.', false);
    }
  }
};

const checkPaymentRedirect = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');
  const subscriptionId = urlParams.get('subscription_id');
  const invoiceId = urlParams.get('invoice_id');

  if (paymentStatus === 'success' && (subscriptionId || invoiceId)) {
    try {
      const apiBase = window.API_BASE_URL || '/api/v1';
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${apiBase}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subscription_id: subscriptionId ? parseInt(subscriptionId, 10) : undefined,
          invoice_id: invoiceId ? parseInt(invoiceId, 10) : undefined,
          payment_method: 'PayMongo (Verified Checkout)'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        localStorage.setItem('subscriber_plan_status', 'Active');
        subscriptionDetails.value.plan_status = 'Active';
        await fetchSubscriptionDetails();
        if (errorModal.value) {
          await errorModal.value.show('Payment Verified! Your VIP Membership renewal is now ACTIVE.', true);
        }
      }
    } catch (e) {
      console.error('Subscription payment verification error:', e);
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (paymentStatus === 'cancel') {
    if (errorModal.value) {
      await errorModal.value.show('Payment was cancelled or failed. Your subscription remains inactive until paid.', false);
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

const logout = async () => {
  localStorage.removeItem('subscriber_session_active');
  localStorage.removeItem('subscriber_name');
  localStorage.removeItem('subscriber_plan_status');
  localStorage.removeItem('subscriber_email');
  localStorage.removeItem('auth_token');
  router.push('/');
};

let pollInterval = null;

const refreshAllData = () => {
  loadAppointments();
  fetchCatalogServices();
  fetchSubscriptionDetails();
};

onMounted(() => {
  refreshAllData();
  checkPaymentRedirect();

  // Auto-refresh data when user switches back to tab
  window.addEventListener('focus', refreshAllData);

  // Poll for updates every 10 seconds for live on-spot rendering
  pollInterval = setInterval(refreshAllData, 10000);
});

onUnmounted(() => {
  window.removeEventListener('focus', refreshAllData);
  if (pollInterval) clearInterval(pollInterval);
});
</script>
