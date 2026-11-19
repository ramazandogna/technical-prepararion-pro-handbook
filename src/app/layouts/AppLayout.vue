<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import MobileTopBar from '@/components/layout/MobileTopBar.vue'
import MobileTabBar from '@/components/layout/MobileTabBar.vue'
import CommandSearch from '@/components/layout/CommandSearch.vue'
</script>

<template>
  <div class="min-h-dvh lg:flex">
    <AppSidebar class="hidden lg:flex" />

    <div class="min-w-0 flex-1">
      <MobileTopBar class="lg:hidden" />
      <main id="main" tabindex="-1" class="pb-safe pt-5 outline-none [--pb-safe:7rem] lg:pt-10 lg:[--pb-safe:4rem]">
        <div v-if="$slots.banner" class="shell mb-4">
          <slot name="banner" />
        </div>
        <RouterView v-slot="{ Component, route }">
          <Transition name="page" mode="out-in">
            <div :key="route.path" class="shell">
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </main>
    </div>

    <MobileTabBar class="lg:hidden" />
    <CommandSearch />
  </div>
</template>
