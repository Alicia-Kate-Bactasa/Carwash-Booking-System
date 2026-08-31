<!--
  Root Vue component.
  Renders the active route view wrapped in a smooth page transition.
-->
<template>
  <div id="app-root">
    <!-- Router view component renderer with fade-slide route transition -->
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
// Component setup block for root component
</script>


