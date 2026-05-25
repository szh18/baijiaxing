<script setup lang="ts">
import type { Celebrity } from '~/types'

const route = useRoute()
const { data: celebrity, error } = await useFetch<Celebrity & { surname: { id: string; name: string } }>(
  `/api/celebrities/${route.params.id}`
)

if (error.value) {
  throw createError({ statusCode: 404, message: '名人未找到' })
}

useHead({
  title: computed(() => `${celebrity.value?.name} — 百家姓`),
  meta: [{ name: 'description', content: computed(() => celebrity.value?.summary) }]
})

const lifespan = computed(() => {
  const c = celebrity.value
  if (!c) return ''
  if (c.birthYear && c.deathYear) return `（${c.birthYear}年—${c.deathYear}年）`
  if (c.birthYear) return `（生于${c.birthYear}年）`
  return ''
})
</script>

<template>
  <div v-if="celebrity" class="max-w-3xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <div v-if="celebrity.imageUrl" class="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-300 mb-4">
        <img :src="celebrity.imageUrl" :alt="celebrity.name" class="w-full h-full object-cover" />
      </div>
      <div v-else class="w-24 h-24 mx-auto rounded-full border-2 border-amber-300 bg-amber-50 flex items-center justify-center mb-4">
        <span class="text-4xl font-calligraphy text-amber-400">{{ celebrity.name[0] }}</span>
      </div>

      <h1 class="text-4xl font-bold text-ink mb-2">{{ celebrity.name }}</h1>
      <div class="flex items-center justify-center gap-3 text-ink/50 text-sm">
        <span class="dynasty-tag">{{ celebrity.dynasty }}</span>
        <span v-if="celebrity.birthplace">{{ celebrity.birthplace }}</span>
        <span>{{ lifespan }}</span>
      </div>
      <NuxtLink v-if="celebrity.surname" :to="`/surname/${celebrity.surname.id}`" class="inline-block mt-2 text-sm text-vermilion hover:underline">
        ← {{ celebrity.surname.name }}姓名人
      </NuxtLink>
    </div>

    <ProseBlock title="生平" :content="celebrity.biography" />
    <ProseBlock title="代表作品 / 主要功绩" :content="celebrity.works" />
    <ProseBlock v-if="celebrity.anecdotes" title="轶事典故" :content="celebrity.anecdotes" />

    <div v-if="celebrity.externalLinks?.length" class="mt-6 pt-4 border-t border-amber-200">
      <h3 class="section-title">了解更多</h3>
      <div class="flex flex-wrap gap-2">
        <a
          v-for="link in celebrity.externalLinks" :key="link.url"
          :href="link.url" target="_blank" rel="noopener noreferrer"
          class="text-sm text-vermilion hover:underline"
        >{{ link.label }}</a>
      </div>
    </div>
  </div>
</template>
