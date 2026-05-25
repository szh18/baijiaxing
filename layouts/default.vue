<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-amber-300/50 bg-white/60 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 no-underline">
          <span class="chinese-seal">百家姓</span>
          <span class="text-sm text-ink/60 hidden sm:inline">中国姓氏名人</span>
        </NuxtLink>
        <nav class="flex items-center gap-4 text-sm text-ink/70">
          <NuxtLink to="/" class="hover:text-vermilion transition-colors">首页</NuxtLink>
          <NuxtLink to="/search" class="hover:text-vermilion transition-colors">搜索</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-amber-300/50 py-6 mt-12 text-center text-xs text-ink/40">
      <p>百家姓 · 中国姓氏名人文化平台</p>
    </footer>
  </div>
</template>
