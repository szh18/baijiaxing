<script setup lang="ts">
import type { Surname } from '~/types'

defineProps<{ surname: Surname }>()
</script>

<template>
  <div class="text-center mb-8">
    <div class="text-7xl md:text-8xl font-calligraphy text-vermilion mb-3">
      {{ surname.name }}
    </div>
    <div class="text-lg text-ink/50 mb-1">{{ surname.pinyin }}</div>
    <div class="flex items-center justify-center gap-3 text-sm text-ink/40 mt-3">
      <span>百家姓第 <strong class="text-ink/70">{{ surname.rank }}</strong> 位</span>
      <span v-if="surname.tanghao">·</span>
      <span v-if="surname.tanghao">堂号：<strong class="text-ink/70">{{ surname.tanghao }}</strong></span>
    </div>
    <div v-if="surname.junwang.length" class="mt-2 flex justify-center gap-1 flex-wrap">
      <span
        v-for="jw in surname.junwang" :key="jw"
        class="dynasty-tag"
      >{{ jw }}</span>
    </div>
  </div>
</template>
