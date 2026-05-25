<script setup lang="ts">
import { DYNASTIES, JUNWANG_REGIONS } from '~/server/utils/constants'

const props = defineProps<{
  dynasty: string | null
  rankRange: string | null
  junwang: string | null
}>()

const emit = defineEmits<{
  'update:dynasty': [v: string | null]
  'update:rankRange': [v: string | null]
  'update:junwang': [v: string | null]
}>()

const RANK_RANGES = [
  { label: '1-50', value: '1-50' },
  { label: '51-100', value: '51-100' },
  { label: '101-200', value: '101-200' },
  { label: '201-504', value: '201-504' }
]

function toggle(key: 'dynasty' | 'rankRange' | 'junwang', current: string | null, value: string) {
  emit(`update:${key}` as any, current === value ? null : value)
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h4 class="text-sm font-bold text-ink/60 mb-2">朝代</h4>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="d in DYNASTIES" :key="d"
          :class="['filter-btn text-xs', { active: dynasty === d }]"
          @click="toggle('dynasty', dynasty, d)"
        >{{ d }}</button>
      </div>
    </div>

    <div>
      <h4 class="text-sm font-bold text-ink/60 mb-2">百家姓排名</h4>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="r in RANK_RANGES" :key="r.value"
          :class="['filter-btn text-xs', { active: rankRange === r.value }]"
          @click="toggle('rankRange', rankRange, r.value)"
        >{{ r.label }}</button>
      </div>
    </div>

    <div>
      <h4 class="text-sm font-bold text-ink/60 mb-2">郡望地区</h4>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="j in JUNWANG_REGIONS" :key="j"
          :class="['filter-btn text-xs', { active: junwang === j }]"
          @click="toggle('junwang', junwang, j)"
        >{{ j }}</button>
      </div>
    </div>
  </div>
</template>
