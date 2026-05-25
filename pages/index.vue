<script setup lang="ts">
import type { Surname } from '~/types'

const activePinyin = ref<string | null>(null)
const { data: result } = await useFetch('/api/surnames', {
  query: computed(() => ({
    pinyin: activePinyin.value || undefined,
    pageSize: 200
  }))
})

const surnames = computed<Surname[]>(() => (result.value as any)?.data ?? [])
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl md:text-5xl font-calligraphy text-vermilion mb-4">百家姓</h1>
      <p class="text-ink/50 mb-6">探索每一个姓氏背后的历史与文化</p>
      <SearchBar />
    </div>

    <PinyinNav :active="activePinyin" @select="activePinyin = $event" />

    <div class="mt-8">
      <SurnameGrid :surnames="surnames" />
    </div>
  </div>
</template>
