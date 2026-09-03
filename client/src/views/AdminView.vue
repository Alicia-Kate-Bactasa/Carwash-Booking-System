<!--
  Admin Management View Component for Montage Auto Studio.
  Provides administrative controls for booking status workflow, walk-in appointment creation,
  payment proof verification, service catalog editing, and VIP subscriber roster management.
-->
<template>
  <div class="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">

    <!-- Admin Sidebar -->
    <aside 
      :class="[
        'bg-white border-r border-neutral-200 flex flex-col justify-between p-4 md:p-6 z-10 shrink-0 transition-all duration-300 relative overflow-x-hidden',
        isSidebarCollapsed ? 'w-20' : 'w-72 md:w-80'
      ]"
    >
      <div class="space-y-8">
        <!-- Header & Toggle Button -->
        <div class="flex items-center justify-between">
          <div v-if="!isSidebarCollapsed" class="overflow-hidden whitespace-nowrap">
            <h1 class="font-bold text-xs tracking-widest text-neutral-400">Admin</h1>
            <p class="text-lg font-bold tracking-tight mt-1 text-black">Montage Auto Studio</p>
          </div>
          <button 
            @click="toggleSidebar" 
            :class="[
              'p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors focus:outline-none shrink-0',
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

        <nav class="space-y-2">
          <button 
            @click="activeTab = 'bookings'" 
            :title="isSidebarCollapsed ? 'Bookings' : ''"
            :class="[
              'w-full text-left flex items-center gap-3 py-3 rounded-full text-sm font-semibold tracking-wide transition-all',
              isSidebarCollapsed ? 'justify-center px-0' : 'px-4',
              activeTab === 'bookings' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Bookings</span>
          </button>

          <button 
            @click="activeTab = 'ledgers'" 
            :title="isSidebarCollapsed ? 'Payments' : ''"
            :class="[
              'w-full text-left flex items-center gap-3 py-3 rounded-full text-sm font-semibold tracking-wide transition-all',
              isSidebarCollapsed ? 'justify-center px-0' : 'px-4',
              activeTab === 'ledgers' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Payments</span>
          </button>

          <button 
            @click="activeTab = 'services'" 
            :title="isSidebarCollapsed ? 'Service List' : ''"
            :class="[
              'w-full text-left flex items-center gap-3 py-3 rounded-full text-sm font-semibold tracking-wide transition-all',
              isSidebarCollapsed ? 'justify-center px-0' : 'px-4',
              activeTab === 'services' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Service List</span>
          </button>

          <button 
            @click="activeTab = 'monitoring'" 
            :title="isSidebarCollapsed ? 'Subscriptions' : ''"
            :class="[
              'w-full text-left flex items-center gap-3 py-3 rounded-full text-sm font-semibold tracking-wide transition-all',
              isSidebarCollapsed ? 'justify-center px-0' : 'px-4',
              activeTab === 'monitoring' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Subscriptions</span>
          </button>

          <button 
            @click="activeTab = 'feedbacks'" 
            :title="isSidebarCollapsed ? 'Customer Feedback' : ''"
            :class="[
              'w-full text-left flex items-center gap-3 py-3 rounded-full text-sm font-semibold tracking-wide transition-all',
              isSidebarCollapsed ? 'justify-center px-0' : 'px-4',
              activeTab === 'feedbacks' ? 'bg-black text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
            ]"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Customer Feedback</span>
          </button>
        </nav>
      </div>

      <div class="border-t border-neutral-100 pt-6 space-y-4">
        <div :class="['flex items-center gap-3', isSidebarCollapsed ? 'justify-center' : 'px-2']">
          <div class="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">A</div>
          <div v-if="!isSidebarCollapsed" class="overflow-hidden whitespace-nowrap">
            <p class="text-sm font-bold text-black">Admin</p>
            <p class="text-xs text-neutral-400 font-medium tracking-wider uppercase">Manager</p>
          </div>
        </div>
        <router-link 
          to="/" 
          :title="isSidebarCollapsed ? 'Sign Out' : ''"
          :class="[
            'w-full flex items-center justify-center gap-3 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-3.5 rounded-full tracking-wider uppercase transition-all',
            isSidebarCollapsed ? 'px-0' : ''
          ]"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span v-if="!isSidebarCollapsed" class="whitespace-nowrap">Sign Out</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Workspace -->
    <main class="flex-1 bg-neutral-50 overflow-y-auto p-6 md:p-12">
      <transition name="fade-slide" mode="out-in">
        <!-- TAB: BOOKINGS -->
        <section v-if="activeTab === 'bookings'" key="bookings" class="space-y-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-6 gap-4">
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-black">Bookings</h2>
              <p class="text-neutral-500 text-sm mt-2">Manage customer bookings and track the studio schedule.</p>
            </div>
            <div class="flex flex-wrap gap-3 self-end sm:self-auto items-center">
              <button 
                @click="openWalkInModal" 
                class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-sm flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Walk-In Cash Booking</span>
              </button>
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

          <div v-motion-fade-visible-once class="bg-white border border-neutral-200 rounded-[2rem] p-8 space-y-6">
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
                v-for="(b, idx) in filteredBookings" 
                :key="b.id" 
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: idx * 40 } }"
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
        <section v-else-if="activeTab === 'ledgers'" key="ledgers" class="space-y-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-6 gap-4">
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-black">Payments Ledger</h2>
              <p class="text-neutral-500 text-sm mt-2">Verified successful payment transactions processed via PayMongo checkout.</p>
            </div>
          </div>

          <!-- Payments Ledger Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
            <div class="relative w-full sm:w-80">
              <input 
                v-model="paymentSearchQuery" 
                type="text" 
                placeholder="Search Invoice ID (INV-), Booking ID (MTG-), or Date..." 
                class="w-full bg-neutral-50 border border-neutral-200 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium focus:outline-none focus:border-black"
              />
              <svg class="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Payment Type:</span>
              <select v-model="paymentTypeFilter" class="bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-full text-xs font-bold uppercase focus:outline-none focus:border-black">
                <option value="all">All Invoices</option>
                <option value="Single_Detailing">Single Detailing</option>
                <option value="Monthly_Roster">VIP Membership Renewal</option>
              </select>
            </div>
          </div>

          <div v-motion-fade-visible-once class="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead>
                  <tr class="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-400 uppercase tracking-wider text-[11px]">
                    <th class="p-5">Invoice ID</th>
                    <th class="p-5">Booking ID</th>
                    <th class="p-5">Type</th>
                    <th class="p-5">Amount</th>
                    <th class="p-5">Issued Date</th>
                    <th class="p-5 text-right">Payment Gateway</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 font-medium text-neutral-700 text-xs">
                  <tr v-if="filteredInvoices.length === 0">
                    <td colspan="6" class="p-8 text-center text-neutral-400 font-mono">No matching payment ledger records found.</td>
                  </tr>
                  <tr v-for="inv in filteredInvoices" :key="inv.invoice_id" class="hover:bg-neutral-50">
                    <td class="p-5 font-mono font-bold text-black">INV-{{ inv.invoice_id }}</td>
                    <td class="p-5 font-mono font-bold text-neutral-800">
                      {{ inv.booking_id ? ('MTG-' + inv.booking_id) : (inv.booking?.booking_id ? ('MTG-' + inv.booking.booking_id) : '—') }}
                    </td>
                    <td class="p-5 uppercase text-xs font-bold text-neutral-600">{{ inv.invoice_type || 'Detailing Treatment' }}</td>
                    <td class="p-5 font-bold text-emerald-600">₱{{ inv.total_amount }}.00</td>
                    <td class="p-5">{{ inv.issued_at ? inv.issued_at.split('T')[0] : '-' }}</td>
                    <td class="p-5 font-semibold text-neutral-600 text-right">PayMongo (GCash/Maya/Card)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- TAB: SERVICES -->
        <section v-else-if="activeTab === 'services'" key="services" class="space-y-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-6 gap-4">
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-black">Service List Catalog</h2>
              <p class="text-neutral-500 text-sm mt-2">Manage, edit, activate, deactivate, or add new detailing packages.</p>
            </div>
            <button 
              @click="openAddServiceModal"
              class="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-full transition-all shadow-sm flex items-center gap-2"
            >
              <span>+ Add New Service</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="(s, idx) in services" 
              :key="s.service_id" 
              v-motion
              :initial="{ opacity: 0, y: 12 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 350, delay: idx * 50 } }"
              :class="['bg-white border p-6 rounded-[2rem] space-y-4 shadow-sm relative transition-all', s.is_active ? 'border-neutral-200' : 'border-neutral-300 opacity-60 bg-neutral-50']"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-black text-black text-lg uppercase tracking-tight">{{ s.service_name }}</h3>
                  <span :class="['text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 inline-block', s.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200']">
                    {{ s.is_active ? 'ACTIVE' : 'DEACTIVATED' }}
                  </span>
                </div>
                <span class="text-xs font-mono font-bold bg-neutral-100 px-3.5 py-1.5 rounded-full border border-neutral-200 text-black">₱{{ s.service_price }}.00</span>
              </div>
              <p class="text-xs text-neutral-500 font-medium leading-relaxed">{{ s.service_description || 'No description provided.' }}</p>
              
              <div class="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span class="text-[11px] font-bold text-neutral-600 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-neutral-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDuration(s.service_duration) }}
                </span>
                <div class="flex items-center gap-2">
                  <button 
                    @click="openEditServiceModal(s)"
                    class="text-xs font-bold border border-neutral-200 px-3.5 py-1.5 rounded-full hover:bg-neutral-100 text-black transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    @click="toggleServiceActivation(s)"
                    :class="['text-xs font-bold px-3.5 py-1.5 rounded-full transition-all border', s.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50']"
                  >
                    {{ s.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB: SUBSCRIPTIONS -->
        <section v-else-if="activeTab === 'monitoring'" key="monitoring" class="space-y-8">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-200 pb-6 gap-4">
            <div>
              <h2 class="text-3xl font-bold tracking-tight text-black">Subscription Control</h2>
              <p class="text-neutral-500 text-sm mt-2">Manage member accounts and subscriptions roster.</p>
            </div>
          </div>

          <!-- Subscription Control Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
            <div class="relative w-full sm:w-80">
              <input 
                v-model="subSearchQuery" 
                type="text" 
                placeholder="Search SUB-ID, Subscriber Name, or Email..." 
                class="w-full bg-neutral-50 border border-neutral-200 pl-10 pr-4 py-2.5 rounded-full text-xs font-medium focus:outline-none focus:border-black"
              />
              <svg class="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Plan Status:</span>
              <select v-model="subStatusFilter" class="bg-neutral-50 border border-neutral-200 px-4 py-2.5 rounded-full text-xs font-bold uppercase focus:outline-none focus:border-black">
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Payment_Pending">Payment Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div v-motion-fade-visible-once class="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead>
                  <tr class="border-b border-neutral-200 bg-neutral-50 font-bold text-neutral-400 uppercase tracking-wider text-[11px]">
                    <th class="p-5">Subscription ID</th>
                    <th class="p-5">Subscriber Name</th>
                    <th class="p-5">Plan Tier</th>
                    <th class="p-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100 text-xs">
                  <tr v-if="filteredSubscribers.length === 0">
                    <td colspan="4" class="p-8 text-center text-neutral-400 font-mono">No matching VIP subscriber accounts found.</td>
                  </tr>
                  <tr v-for="sub in filteredSubscribers" :key="sub.subscription_id">
                    <td class="p-5 font-mono font-bold text-neutral-800">
                      <span class="bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                        SUB-{{ sub.subscription_id }}
                      </span>
                    </td>
                    <td class="p-5 font-bold text-black">{{ sub.user?.username || sub.user?.email || sub.user_name || 'VIP Member' }}</td>
                    <td class="p-5 uppercase font-bold text-neutral-600">{{ sub.plan_tier || 'Unlimited VIP Wash Club' }}</td>
                    <td class="p-5 text-right">
                      <span :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', (sub.plan_status === 'Active' || !sub.plan_status) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200']">
                        {{ sub.plan_status || 'ACTIVE' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- TAB: FEEDBACKS & ANALYTICS DASHBOARD -->
        <section v-else-if="activeTab === 'feedbacks'" key="feedbacks" class="space-y-8">
          <div class="border-b border-neutral-200 pb-6">
            <h2 class="text-3xl font-bold tracking-tight text-black">Customer Feedback Analytics</h2>
            <p class="text-neutral-500 text-sm mt-2">Real-time statistics calculation, rating distribution, and customer reviews.</p>
          </div>

          <!-- ANALYTICS CARDS & RECHARTS INSIGHTS GRID -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Stat 1: Avg Rating -->
            <div class="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm">
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Average Rating</span>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-4xl font-black text-black">{{ feedbackStats.avgRating }}</span>
                <span class="text-amber-500 text-lg font-bold">★ / 5.0</span>
              </div>
              <p class="text-[11px] text-neutral-400 mt-2 font-medium">Based on {{ feedbacks.length }} verified submissions</p>
            </div>

            <!-- Stat 2: Total Reviews -->
            <div class="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm">
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Feedbacks</span>
              <div class="text-4xl font-black text-black mt-2">{{ feedbacks.length }}</div>
              <p class="text-[11px] text-emerald-600 mt-2 font-bold">100% Verified Sessions</p>
            </div>

            <!-- Stat 3: Satisfaction Rate -->
            <div class="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm">
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Satisfaction Rate</span>
              <div class="text-4xl font-black text-emerald-600 mt-2">{{ feedbackStats.satisfactionRate }}%</div>
              <p class="text-[11px] text-neutral-400 mt-2 font-medium">4★ and 5★ Rating Percentage</p>
            </div>

            <!-- Stat 4: Top Rating Category -->
            <div class="bg-white border border-neutral-200 p-6 rounded-[2rem] shadow-sm">
              <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Top Rating</span>
              <div class="text-4xl font-black text-black mt-2">{{ feedbackStats.topRatingLabel }}</div>
              <p class="text-[11px] text-neutral-400 mt-2 font-medium">{{ feedbackStats.topRatingCount }} Ratings Recorded</p>
            </div>
          </div>

          <!-- RATING DISTRIBUTION BREAKDOWN BAR CHART -->
          <div class="bg-white border border-neutral-200 p-8 rounded-[2rem] shadow-sm space-y-6">
            <div class="flex justify-between items-center border-b border-neutral-100 pb-4">
              <h3 class="text-sm font-bold uppercase tracking-wider text-black">Rating Distribution Breakdown</h3>
              <span class="text-xs font-bold text-neutral-400">Calculation Insights</span>
            </div>

            <div class="space-y-4">
              <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-4 text-xs font-bold">
                <span class="w-16 shrink-0 text-neutral-700 flex items-center gap-1">{{ star }} Stars <span class="text-amber-500">★</span></span>
                <div class="flex-1 bg-neutral-100 h-4 rounded-full overflow-hidden relative">
                  <div 
                    class="bg-dark h-full rounded-full transition-all duration-500" 
                    :style="{ width: feedbackStats.distribution[star].percent + '%' }"
                  ></div>
                </div>
                <span class="w-20 text-right font-mono text-neutral-600">{{ feedbackStats.distribution[star].count }} ({{ feedbackStats.distribution[star].percent }}%)</span>
              </div>
            </div>
          </div>

          <!-- REVIEWS CARDS GRID -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="(fb, idx) in feedbacks" 
              :key="fb.feedback_id" 
              v-motion
              :initial="{ opacity: 0, y: 12 }"
              :enter="{ opacity: 1, y: 0, transition: { duration: 350, delay: idx * 50 } }"
              class="bg-white border border-neutral-200 p-6 rounded-[2rem] space-y-3 shadow-sm"
            >
              <div class="flex justify-between items-center">
                <h4 class="font-bold text-black text-sm">{{ fb.customer_name }}</h4>
                <div class="flex items-center gap-1">
                  <span v-for="s in 5" :key="s" :class="['text-xs', s <= fb.rating ? 'text-amber-500' : 'text-neutral-200']">★</span>
                  <span class="text-xs font-bold text-black ml-1">{{ fb.rating }}/5</span>
                </div>
              </div>
              <p class="text-xs text-neutral-600 font-medium leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">"{{ fb.comments }}"</p>
              <div class="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                <span>Treatment: {{ fb.service_name || 'Detailing Session' }}</span>
                <span>Booking #MTG-{{ fb.booking_id }}</span>
              </div>
            </div>
          </div>
        </section>
      </transition>
    </main>

    <!-- EDIT / ADD SERVICE MODAL -->
    <div v-if="showServiceModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white p-8 w-full max-w-md relative rounded-[2rem] shadow-2xl border border-neutral-200 animate-modal-scale-in">
        <button @click="showServiceModal = false" type="button" class="absolute top-5 right-5 text-neutral-400 hover:text-black text-xs font-bold focus:outline-none">✕</button>
        
        <div class="text-center mb-6">
          <h3 class="text-lg font-bold uppercase tracking-tight text-black">{{ isEditingService ? 'Edit Detailing Service' : 'Add New Service Package' }}</h3>
          <p class="text-xs text-neutral-400 font-normal mt-1 leading-relaxed">Update service duration, pricing, name, and description.</p>
        </div>

        <form @submit.prevent="saveService" class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Service Name</label>
            <input v-model="serviceForm.service_name" type="text" required placeholder="e.g. Executive Polish & Ceramic" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-black px-5" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Price (₱ PHP)</label>
              <input v-model="serviceForm.service_price" type="number" step="50" min="0" required placeholder="e.g. 500" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-bold focus:outline-none focus:border-black px-5" />
            </div>

            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Service Duration</label>
              <select v-model="serviceForm.service_duration" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-bold focus:outline-none focus:border-black px-4 cursor-pointer">
                <option :value="30">30 Mins</option>
                <option :value="60">1 Hour (60 Mins)</option>
                <option :value="90">1 Hour & 30 Mins (90 Mins)</option>
                <option :value="120">2 Hours (120 Mins)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Package Description</label>
            <textarea v-model="serviceForm.service_description" required placeholder="Describe exterior and interior treatment procedures..." class="w-full bg-neutral-50 border border-neutral-200 p-4 rounded-[1.5rem] text-xs font-medium focus:outline-none focus:border-black h-24 resize-none"></textarea>
          </div>

          <button type="submit" :disabled="savingService" class="w-full bg-black text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full hover:bg-neutral-800 transition-all shadow-sm disabled:opacity-50">
            {{ savingService ? 'Saving Changes...' : (isEditingService ? 'Update Service Package' : 'Publish New Service') }}
          </button>
        </form>
      </div>
    </div>

    <!-- WALK-IN CUSTOMER CASH BOOKING MODAL -->
    <div v-if="showWalkInModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white p-8 w-full max-w-md relative rounded-[2rem] shadow-2xl border border-neutral-200 animate-modal-scale-in">
        <button @click="showWalkInModal = false" type="button" class="absolute top-5 right-5 text-neutral-400 hover:text-black text-xs font-bold focus:outline-none">✕</button>
        
        <div class="text-center mb-6">
          <h3 class="text-lg font-bold uppercase tracking-tight text-black">Log Walk-In Customer</h3>
          <p class="text-xs text-neutral-400 font-normal mt-1 leading-relaxed">Register counter walk-in appointment. Cash payment is processed immediately.</p>
        </div>

        <form @submit.prevent="submitWalkInBooking" class="space-y-4">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Customer Full Name</label>
            <input v-model="walkInForm.full_name" type="text" required placeholder="e.g. Juan Dela Cruz" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-black px-5" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Phone Number</label>
              <input v-model="walkInForm.phone_number" type="tel" required placeholder="e.g. 09171234567" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-black px-5" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Email (Optional)</label>
              <input v-model="walkInForm.email" type="email" placeholder="client@domain.com" class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-black px-5" />
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Select Service Package</label>
            <select v-model="walkInForm.service_id" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-bold focus:outline-none focus:border-black px-4 cursor-pointer">
              <option v-for="s in activeServicesList" :key="s.service_id" :value="s.service_id">
                {{ s.service_name }} — ₱{{ s.service_price }}.00 ({{ s.service_duration }} Mins)
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Scheduled Date</label>
              <input v-model="walkInForm.scheduled_date" type="date" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-semibold focus:outline-none focus:border-black px-4" />
            </div>
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Time Slot</label>
              <select v-model="walkInForm.time_slot" required class="w-full bg-neutral-50 border border-neutral-200 p-3.5 rounded-full text-xs font-bold focus:outline-none focus:border-black px-4 cursor-pointer">
                <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                <option value="Walk-In Immediate">Immediate Counter Slot</option>
              </select>
            </div>
          </div>

          <div class="border-t border-b border-neutral-200 py-3 flex justify-between items-center text-xs">
            <span class="font-bold uppercase text-neutral-400">Payment Method:</span>
            <span class="font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">💵 CASH ON HAND</span>
          </div>

          <div class="flex justify-between items-center text-sm font-bold text-dark bg-neutral-100 p-3.5 rounded-2xl border border-neutral-200">
            <span>Total Cash Amount:</span>
            <span class="font-black text-emerald-600 text-base">₱{{ selectedWalkInPrice }}.00</span>
          </div>

          <button type="submit" :disabled="submittingWalkIn" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-widest uppercase py-4 rounded-full transition-all shadow-sm disabled:opacity-50">
            {{ submittingWalkIn ? 'Processing Cash Entry...' : 'Confirm Cash Payment & Log Walk-In' }}
          </button>
        </form>
      </div>
    </div>

    <GlobalErrorModal ref="errorModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import GlobalErrorModal from '@/components/GlobalErrorModal.vue';

const isSidebarCollapsed = ref(false);
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const activeTab = ref('bookings');
const bookingSlide = ref('pending');
const bookingUserFilter = ref('all');
const errorModal = ref(null);

const appointments = ref([]);
const invoices = ref([]);
const services = ref([]);
const subscribers = ref([]);
const feedbacks = ref([]);

// Walk-In Customer Booking Modal State
const showWalkInModal = ref(false);
const submittingWalkIn = ref(false);

const walkInForm = ref({
  full_name: '',
  phone_number: '',
  email: '',
  service_id: '',
  scheduled_date: new Date().toISOString().split('T')[0],
  time_slot: 'Walk-In Immediate'
});

const activeServicesList = computed(() => {
  return services.value.filter(s => s.is_active !== false);
});

const selectedWalkInPrice = computed(() => {
  if (!walkInForm.value.service_id) return 0;
  const match = services.value.find(s => String(s.service_id) === String(walkInForm.value.service_id));
  return match ? parseFloat(match.service_price) : 0;
});

const openWalkInModal = () => {
  if (activeServicesList.value.length > 0 && !walkInForm.value.service_id) {
    walkInForm.value.service_id = activeServicesList.value[0].service_id;
  }
  walkInForm.value.scheduled_date = new Date().toISOString().split('T')[0];
  showWalkInModal.value = true;
};

const submitWalkInBooking = async () => {
  if (!walkInForm.value.full_name || !walkInForm.value.service_id) return;

  submittingWalkIn.value = true;
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const token = localStorage.getItem('auth_token');

    const res = await fetch(`${apiBase}/admin/walkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        full_name: walkInForm.value.full_name,
        phone_number: walkInForm.value.phone_number || 'Walk-In Counter',
        email: walkInForm.value.email || null,
        service_id: parseInt(walkInForm.value.service_id, 10),
        scheduled_date: walkInForm.value.scheduled_date,
        time_slot: walkInForm.value.time_slot,
        price: selectedWalkInPrice.value
      })
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result.message || 'Failed to log walk-in booking.');
    }

    showWalkInModal.value = false;
    walkInForm.value = {
      full_name: '',
      phone_number: '',
      email: '',
      service_id: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      time_slot: 'Walk-In Immediate'
    };

    refreshAllAdminData();

    if (errorModal.value) {
      await errorModal.value.show('Walk-In Customer logged! Cash payment recorded in Payments Ledger & Booking confirmed.', true);
    }
  } catch (err) {
    if (errorModal.value) {
      await errorModal.value.show(err.message || 'Failed to record walk-in customer.');
    }
  } finally {
    submittingWalkIn.value = false;
  }
};

// Filter & Search State for Payments Ledger & Subscription Control
const paymentSearchQuery = ref('');
const paymentTypeFilter = ref('all');

const filteredInvoices = computed(() => {
  return invoices.value.filter(inv => {
    const typeStr = (inv.invoice_type || '').toLowerCase();
    const matchesType = paymentTypeFilter.value === 'all' || 
      (paymentTypeFilter.value === 'Single_Detailing' && (typeStr.includes('single') || typeStr.includes('detailing'))) ||
      (paymentTypeFilter.value === 'Monthly_Roster' && (typeStr.includes('monthly') || typeStr.includes('roster') || typeStr.includes('vip')));

    const query = paymentSearchQuery.value.toLowerCase().trim();
    if (!query) return matchesType;

    const invIdStr = `inv-${inv.invoice_id}`.toLowerCase();
    const bookingIdStr = inv.booking_id ? `mtg-${inv.booking_id}`.toLowerCase() : (inv.booking?.booking_id ? `mtg-${inv.booking.booking_id}`.toLowerCase() : '');
    const dateStr = inv.issued_at ? String(inv.issued_at).toLowerCase() : '';

    return matchesType && (invIdStr.includes(query) || bookingIdStr.includes(query) || dateStr.includes(query) || typeStr.includes(query));
  });
});

const subSearchQuery = ref('');
const subStatusFilter = ref('all');

const filteredSubscribers = computed(() => {
  return subscribers.value.filter(sub => {
    const rawStatus = (sub.plan_status || 'Active').toLowerCase();
    const filterVal = subStatusFilter.value.toLowerCase();
    const matchesStatus = filterVal === 'all' || rawStatus === filterVal || rawStatus.replace('_', ' ') === filterVal.replace('_', ' ');

    const query = subSearchQuery.value.toLowerCase().trim();
    if (!query) return matchesStatus;

    const subIdStr = `sub-${sub.subscription_id}`.toLowerCase();
    const nameStr = (sub.user?.username || sub.user?.email || sub.user_name || '').toLowerCase();
    const emailStr = (sub.user?.email || '').toLowerCase();
    const tierStr = (sub.plan_tier || '').toLowerCase();

    return matchesStatus && (subIdStr.includes(query) || nameStr.includes(query) || emailStr.includes(query) || tierStr.includes(query));
  });
});

// Service Editing & Creation State
const showServiceModal = ref(false);
const isEditingService = ref(false);
const savingService = ref(false);
const editingServiceId = ref(null);

const serviceForm = ref({
  service_name: '',
  service_price: 300,
  service_duration: 60,
  service_description: ''
});

const formatDuration = (mins) => {
  const m = parseInt(mins, 10) || 60;
  if (m === 30) return '30 Mins';
  if (m === 60) return '1 Hour';
  if (m === 90) return '1 Hour & 30 Mins';
  if (m === 120) return '2 Hours';
  return `${m} Mins`;
};

const filteredBookings = computed(() => {
  return appointments.value.filter(b => {
    const slideMatch = b.type === bookingSlide.value;
    const filterMatch = bookingUserFilter.value === 'all' || b.userType === bookingUserFilter.value;
    return slideMatch && filterMatch;
  });
});

// Feedback Analytical Calculation Statistics (No AI, pure statistics calculation)
const feedbackStats = computed(() => {
  const total = feedbacks.value.length;
  if (total === 0) {
    return {
      avgRating: '0.0',
      satisfactionRate: 0,
      fiveStarCount: 0,
      topRatingLabel: 'N/A',
      topRatingCount: 0,
      distribution: {
        5: { count: 0, percent: 0 },
        4: { count: 0, percent: 0 },
        3: { count: 0, percent: 0 },
        2: { count: 0, percent: 0 },
        1: { count: 0, percent: 0 }
      }
    };
  }

  let sum = 0;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  feedbacks.value.forEach(fb => {
    const r = Math.min(5, Math.max(1, parseInt(fb.rating, 10) || 5));
    sum += r;
    counts[r] = (counts[r] || 0) + 1;
  });

  const avg = (sum / total).toFixed(1);
  const positiveCount = (counts[4] || 0) + (counts[5] || 0);
  const satRate = Math.round((positiveCount / total) * 100);

  const distribution = {};
  [5, 4, 3, 2, 1].forEach(star => {
    const c = counts[star] || 0;
    distribution[star] = {
      count: c,
      percent: Math.round((c / total) * 100)
    };
  });

  let topStar = 5;
  let maxCount = -1;
  [5, 4, 3, 2, 1].forEach(star => {
    if ((counts[star] || 0) > maxCount) {
      maxCount = counts[star] || 0;
      topStar = star;
    }
  });

  const topRatingLabel = maxCount > 0 ? `${topStar} Star${topStar > 1 ? 's' : ''}` : 'N/A';
  const topRatingCount = maxCount > 0 ? maxCount : 0;

  return {
    avgRating: avg,
    satisfactionRate: satRate,
    fiveStarCount: counts[5] || 0,
    topRatingLabel,
    topRatingCount,
    distribution
  };
});

const getAuthHeaders = (json = true) => {
  const headers = json ? { 'Content-Type': 'application/json' } : {};
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const extractList = (data) => {
  return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
};

const loadBookings = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/admin/bookings`, { headers: getAuthHeaders(false) });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      const data = extractList(json);
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
  } catch (err) {
    console.warn("Bookings fetch notice:", err);
  }
};

const loadInvoices = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/admin/invoices`, { headers: getAuthHeaders(false) });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      invoices.value = extractList(json);
    }
  } catch (err) {
    console.warn("Invoices fetch notice:", err);
  }
};

const loadServices = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/services?include_inactive=true`, { headers: getAuthHeaders(false) });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      services.value = extractList(json);
    }
  } catch (err) {
    console.warn("Services fetch notice:", err);
  }
};

const loadSubscribers = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/admin/subscriptions`, { headers: getAuthHeaders(false) });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      subscribers.value = extractList(json);
    }
  } catch (err) {
    console.warn("Subscribers fetch notice:", err);
  }
};

const loadFeedbacks = async () => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const res = await fetch(`${apiBase}/feedbacks`, { headers: getAuthHeaders(false) });
    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      const data = extractList(json);
      feedbacks.value = data.map(fb => ({
        ...fb,
        customer_name: fb.customer_name || fb.booking?.customer?.full_name || fb.booking?.user?.username || 'Valued Customer',
        service_name: fb.service_name || fb.booking?.service?.service_name || 'Detailing Session'
      }));
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
      headers: getAuthHeaders(),
      body: JSON.stringify({ booking_status: newStatus })
    });
    await loadBookings();
  } catch (err) {
    if (errorModal.value) errorModal.value.show(err.message || 'Failed to update booking status.');
  }
};

const toggleServiceActivation = async (service) => {
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    await fetch(`${apiBase}/services/${service.service_id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    await loadServices();
  } catch (err) {
    if (errorModal.value) errorModal.value.show('Failed to update service activation status.');
  }
};

const openAddServiceModal = () => {
  isEditingService.value = false;
  editingServiceId.value = null;
  serviceForm.value = {
    service_name: '',
    service_price: 300,
    service_duration: 60,
    service_description: ''
  };
  showServiceModal.value = true;
};

const openEditServiceModal = (service) => {
  isEditingService.value = true;
  editingServiceId.value = service.service_id;
  serviceForm.value = {
    service_name: service.service_name,
    service_price: parseFloat(service.service_price),
    service_duration: parseInt(service.service_duration, 10) || 60,
    service_description: service.service_description || ''
  };
  showServiceModal.value = true;
};

const saveService = async () => {
  savingService.value = true;
  try {
    const apiBase = window.API_BASE_URL || '/api/v1';
    const endpoint = isEditingService.value
      ? `${apiBase}/services/${editingServiceId.value}`
      : `${apiBase}/services`;
    
    const method = isEditingService.value ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify({
        service_name: serviceForm.value.service_name,
        service_price: parseFloat(serviceForm.value.service_price),
        service_duration: parseInt(serviceForm.value.service_duration, 10),
        service_description: serviceForm.value.service_description,
        service_category: 'Detailing'
      })
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.message || 'Failed to save service.');
    }

    showServiceModal.value = false;
    await loadServices();
  } catch (err) {
    if (errorModal.value) errorModal.value.show(err.message || 'Failed to save service.');
  } finally {
    savingService.value = false;
  }
};

let pollInterval = null;

const refreshAllAdminData = () => {
  loadBookings();
  loadInvoices();
  loadServices();
  loadSubscribers();
  loadFeedbacks();
};

onMounted(() => {
  refreshAllAdminData();

  // Auto-refresh admin view when switching back to tab
  window.addEventListener('focus', refreshAllAdminData);

  // Poll for updates every 10 seconds for live on-spot rendering
  pollInterval = setInterval(refreshAllAdminData, 10000);
});

onUnmounted(() => {
  window.removeEventListener('focus', refreshAllAdminData);
  if (pollInterval) clearInterval(pollInterval);
});
</script>
