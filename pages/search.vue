<script setup lang="ts">
import type { SearchResult } from '~/types'

const route = useRoute()
const router = useRouter()

const query = ref(String(route.query.q || ''))
const dynasty = ref<string | null>(String(route.query.dynasty || '') || null)
const rankRange = ref<string | null>(String(route.query.rank || '') || null)
const junwang = ref<string | null>(String(route.query.junwang || '') || null)

watch(() => route.query.q, (newQ) => {
  query.value = String(newQ || '')
})

const { data: result } = await useFetch('/api/search', {
  query: computed(() => ({ q: query.value || undefined }))
})

const results = computed<SearchResult[]>(() => (result.value as any)?.data ?? [])

const surnameResults = computed(() => results.value.filter(r => r.type === 'surname'))
const celebrityResults = computed(() => results.value.filter(r => r.type === 'celebrity'))

useHead({ title: computed(() => query.value ? `搜索：${query.value} — 百家姓` : '搜索 — 百家姓') })

function doSearch() {
  const q = query.value.trim()
  if (q) {
    const params: Record<string, string> = { q }
    if (dynasty.value) params.dynasty = dynasty.value
    if (rankRange.value) params.rank = rankRange.value
    if (junwang.value) params.junwang = junwang.value
    router.push({ query: params })
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <SearchBar :modelValue="query" @update:modelValue="query = $event" />
    </div>

    <div class="flex flex-col md:flex-row gap-8">
      <aside class="md:w-56 flex-shrink-0">
        <FilterPanel
          :dynasty="dynasty"
          :rankRange="rankRange"
          :junwang="junwang"
          @update:dynasty="dynasty = $event"
          @update:rankRange="rankRange = $event"
          @update:junwang="junwang = $event"
        />
      </aside>

      <div class="flex-1 min-w-0">
        <div v-if="!query" class="text-center text-ink/40 py-20">
          请输入搜索关键词
        </div>

        <template v-else>
          <p class="text-sm text-ink/40 mb-4">
            找到 <strong class="text-ink/70">{{ results.length }}</strong> 条结果
          </p>

          <div v-if="surnameResults.length" class="mb-8">
            <h3 class="section-title">姓氏</h3>
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              <SurnameCard
                v-for="r in surnameResults"
                :key="r.data.id"
                :surname="(r.data as any)"
              />
            </div>
          </div>

          <div v-if="celebrityResults.length">
            <h3 class="section-title">名人</h3>
            <CelebrityList :celebrities="celebrityResults.map(r => r.data as any)" />
          </div>

          <div v-if="results.length === 0" class="text-center text-ink/40 py-20">
            未找到匹配结果
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
