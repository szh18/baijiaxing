<script setup lang="ts">
import type { Celebrity } from '~/types'

const props = defineProps<{ celebrities: Celebrity[] }>()

const grouped = computed(() => {
  const map = new Map<string, Celebrity[]>()
  for (const c of props.celebrities) {
    const dynasty = c.dynasty || '未知'
    if (!map.has(dynasty)) map.set(dynasty, [])
    map.get(dynasty)!.push(c)
  }
  return Array.from(map.entries())
})
</script>

<template>
  <div v-if="celebrities.length === 0" class="text-center text-ink/40 py-10">
    暂无名人记录
  </div>
  <div v-else class="space-y-6">
    <div v-for="[dynasty, celebs] in grouped" :key="dynasty">
      <h3 class="text-sm font-bold text-ink/40 mb-3 border-b border-amber-200 pb-1">{{ dynasty }}</h3>
      <div class="space-y-2">
        <CelebrityCard v-for="c in celebs" :key="c.id" :celebrity="c" />
      </div>
    </div>
  </div>
</template>
