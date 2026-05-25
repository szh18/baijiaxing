<script setup lang="ts">
import type { Celebrity } from '~/types'

defineProps<{ celebrity: Celebrity }>()
</script>

<template>
  <NuxtLink
    :to="`/celebrity/${celebrity.id}`"
    class="block bg-white/60 border border-amber-200 rounded-sm p-4
           hover:border-vermilion hover:shadow-md transition-all duration-200"
  >
    <div class="flex items-start gap-3">
      <div v-if="celebrity.imageUrl" class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-amber-300">
        <img :src="celebrity.imageUrl" :alt="celebrity.name" class="w-full h-full object-cover" />
      </div>
      <div v-else class="w-12 h-12 rounded-full flex-shrink-0 border border-amber-300 bg-amber-50 flex items-center justify-center">
        <span class="text-amber-400 text-lg font-calligraphy">{{ celebrity.name[0] }}</span>
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-ink">{{ celebrity.name }}</h3>
          <span class="dynasty-tag">{{ celebrity.dynasty }}</span>
        </div>
        <p class="text-sm text-ink/60 mt-1 line-clamp-2">{{ celebrity.summary }}</p>
      </div>
    </div>
  </NuxtLink>
</template>
