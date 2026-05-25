<script setup lang="ts">
import type { Surname } from '~/types'

defineProps<{ surnames: Surname[] }>()
</script>

<template>
  <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4">
    <SurnameCard v-for="s in surnames" :key="s.id" :surname="s" />
  </div>
  <div v-if="surnames.length === 0" class="text-center text-ink/40 py-20">
    暂无数据
  </div>
</template>
