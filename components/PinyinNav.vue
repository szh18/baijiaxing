<script setup lang="ts">
import { PINYIN_INITIALS } from '~/server/utils/constants'

const props = defineProps<{ active: string | null }>()
const emit = defineEmits<{ select: [letter: string | null] }>()

function toggle(letter: string) {
  emit('select', props.active === letter ? null : letter)
}
</script>

<template>
  <div class="flex flex-wrap gap-1 justify-center">
    <button
      v-for="letter in PINYIN_INITIALS"
      :key="letter"
      :class="['filter-btn text-xs min-w-[28px]', { active: active === letter }]"
      @click="toggle(letter)"
    >
      {{ letter }}
    </button>
    <button
      :class="['filter-btn text-xs', { active: !active }]"
      @click="emit('select', null)"
    >
      全部
    </button>
  </div>
</template>
