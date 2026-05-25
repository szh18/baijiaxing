<script setup lang="ts">
import type { SurnameWithCelebrities } from '~/types'

const route = useRoute()
const { data: surname, error } = await useFetch<SurnameWithCelebrities>(
  `/api/surnames/${route.params.id}`
)

if (error.value) {
  throw createError({ statusCode: 404, message: '姓氏未找到' })
}

useHead({
  title: computed(() => `${surname.value?.name} — 百家姓`),
  meta: [{ name: 'description', content: computed(() => surname.value?.origin.slice(0, 150)) }]
})

const tab = ref<'overview' | 'celebrities'>('overview')
</script>

<template>
  <div v-if="surname" class="max-w-4xl mx-auto px-4 py-8">
    <SurnameHeader :surname="surname" />

    <!-- Tabs (desktop) -->
    <div class="hidden md:flex gap-4 mb-6 justify-center border-b border-amber-200 pb-2">
      <button :class="['px-4 py-1.5 text-sm rounded-sm transition-colors', tab === 'overview' ? 'bg-vermilion text-white' : 'hover:text-vermilion']" @click="tab = 'overview'">概览</button>
      <button :class="['px-4 py-1.5 text-sm rounded-sm transition-colors', tab === 'celebrities' ? 'bg-vermilion text-white' : 'hover:text-vermilion']" @click="tab = 'celebrities'">
        名人（{{ surname.celebrities?.length ?? 0 }}）
      </button>
    </div>

    <!-- Content -->
    <section v-show="tab === 'overview'">
      <ProseBlock title="姓氏起源" :content="surname.origin" />
      <ProseBlock v-if="surname.ancestor" title="得姓始祖" :content="surname.ancestor" />
    </section>

    <section v-show="tab === 'celebrities'">
      <CelebrityList :celebrities="surname.celebrities ?? []" />
    </section>

    <!-- Mobile: show all in scroll -->
    <div class="md:hidden mt-6">
      <div class="section-title">姓氏起源</div>
      <ProseBlock title="" :content="surname.origin" />
      <ProseBlock v-if="surname.ancestor" title="得姓始祖" :content="surname.ancestor" />
      <div class="section-title mt-8">历史名人（{{ surname.celebrities?.length ?? 0 }}）</div>
      <CelebrityList :celebrities="surname.celebrities ?? []" />
    </div>
  </div>
</template>
