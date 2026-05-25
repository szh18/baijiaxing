<script setup lang="ts">
defineProps<{ title: string; content: string }>()
</script>

<template>
  <div class="mb-6">
    <h3 v-if="title" class="section-title">{{ title }}</h3>
    <p class="prose-chinese whitespace-pre-line">{{ content }}</p>
  </div>
</template>
