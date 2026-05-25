<script setup lang="ts">
import type { Surname } from '~/types'

defineProps<{ surname: Surname }>()
</script>

<template>
  <NuxtLink :to="`/surname/${surname.id}`" class="surname-card aspect-square p-4">
    <span class="surname-char">{{ surname.name }}</span>
    <span class="text-xs text-ink/50 mt-1">{{ surname.pinyin }}</span>
    <span class="text-xs text-ink/30 mt-0.5">第{{ surname.rank }}位</span>
  </NuxtLink>
</template>
