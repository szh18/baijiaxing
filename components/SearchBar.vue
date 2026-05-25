<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const router = useRouter()
const route = useRoute()
const query = ref(props.modelValue ?? String(route.query.q ?? ''))

watch(() => props.modelValue, (v) => { query.value = v ?? '' })
watch(() => route.query.q, (v) => { query.value = String(v ?? '') })

function onSubmit(e: Event) {
  e.preventDefault()
  const q = query.value.trim()
  if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
}
</script>

<template>
  <form @submit="onSubmit" class="w-full flex justify-center">
    <input
      v-model="query"
      type="text"
      class="search-input"
      placeholder="输入姓氏或名人姓名..."
      autocomplete="off"
    />
  </form>
</template>
