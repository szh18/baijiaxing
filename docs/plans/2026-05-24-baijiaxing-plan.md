# 百家姓平台 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a classic-Chinese-styled web platform for browsing the Hundred Family Surnames and their historical celebrities.

**Architecture:** Nuxt 3 (Vue 3 + Nitro) monolith with PostgreSQL. SSR for content pages (SEO), CSR for search. Deployed to Vercel.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Tailwind CSS, Drizzle ORM, PostgreSQL, Vercel

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `nuxt.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app.vue`, `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "baijiaxing",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "db:migrate": "drizzle-kit push",
    "db:seed": "npx tsx server/db/seed.ts"
  },
  "dependencies": {
    "nuxt": "^3.12.0",
    "vue": "^3.5.0",
    "drizzle-orm": "^0.33.0",
    "postgres": "^3.4.0"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.12.0",
    "drizzle-kit": "^0.24.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Run npm install**

```bash
cd /Users/szh/Desktop/baijiaxingProject && npm install
```

Expected: packages install without errors.

- [ ] **Step 3: Create nuxt.config.ts**

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: '百家姓 · 中国姓氏名人',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '探索百家姓，了解每个姓氏的历史名人与文化渊源' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  nitro: {
    experimental: {
      openAPI: true
    }
  }
})
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 5: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        vermilion: '#C43A31',
        ink: '#2C2C2C',
        rice: '#F5F0E8',
        gold: '#B8860B',
        seal: '#8B1A1A',
        bamboo: '#5D7A4A'
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        calligraphy: ['"Ma Shan Zheng"', 'cursive']
      }
    }
  },
  plugins: []
}
```

- [ ] **Step 6: Create app.vue**

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 7: Create .gitignore**

```
node_modules/
.output/
.data/
.env
.nuxt/
dist/
```

- [ ] **Step 8: Verify scaffold**

```bash
cd /Users/szh/Desktop/baijiaxingProject && npx nuxt dev --no-fork &
sleep 5 && curl -s http://localhost:3000 | head -20
```

Expected: HTML response from Nuxt dev server. Kill the dev server after.

---

### Task 2: Type Definitions & Constants

**Files:**
- Create: `types/index.ts`, `server/utils/constants.ts`

- [ ] **Step 1: Create types/index.ts**

```typescript
export interface Surname {
  id: string
  name: string
  pinyin: string
  rank: number
  origin: string
  ancestor: string
  junwang: string[]
  tanghao: string
  createdAt: string
  updatedAt: string
}

export interface Celebrity {
  id: string
  surnameId: string
  name: string
  dynasty: string
  birthYear: number | null
  deathYear: number | null
  birthplace: string | null
  imageUrl: string | null
  summary: string
  biography: string
  works: string
  anecdotes: string | null
  externalLinks: { label: string; url: string }[]
  createdAt: string
  updatedAt: string
}

export interface SurnameWithCelebrities extends Surname {
  celebrities: Celebrity[]
}

export interface SearchResult {
  type: 'surname' | 'celebrity'
  data: Surname | Celebrity
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
```

- [ ] **Step 2: Create server/utils/constants.ts**

```typescript
export const DYNASTIES = [
  '先秦', '秦汉', '三国', '晋', '南北朝', '隋', '唐',
  '五代十国', '宋', '元', '明', '清', '近现代'
] as const

export const JUNWANG_REGIONS = [
  '河北', '河南', '山东', '山西', '陕西', '甘肃',
  '江苏', '浙江', '安徽', '江西', '福建', '广东',
  '湖北', '湖南', '四川', '云南', '贵州'
] as const

export const PINYIN_INITIALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
```

---

### Task 3: Database Schema

**Files:**
- Create: `server/db/schema.ts`, `drizzle.config.ts`

- [ ] **Step 1: Create drizzle.config.ts**

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
} satisfies Config
```

- [ ] **Step 2: Create server/db/schema.ts**

```typescript
import { pgTable, uuid, varchar, integer, text, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const surnames = pgTable('surnames', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 10 }).notNull(),
  pinyin: varchar('pinyin', { length: 50 }).notNull(),
  rank: integer('rank').notNull(),
  origin: text('origin').notNull(),
  ancestor: varchar('ancestor', { length: 100 }).notNull(),
  junwang: text('junwang').array().notNull().default([]),
  tanghao: varchar('tanghao', { length: 200 }).notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  nameIdx: uniqueIndex('surname_name_idx').on(table.name),
  pinyinIdx: index('surname_pinyin_idx').on(table.pinyin),
  rankIdx: index('surname_rank_idx').on(table.rank)
}))

export const celebrities = pgTable('celebrities', {
  id: uuid('id').defaultRandom().primaryKey(),
  surnameId: uuid('surname_id').references(() => surnames.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  dynasty: varchar('dynasty', { length: 50 }).notNull(),
  birthYear: integer('birth_year'),
  deathYear: integer('death_year'),
  birthplace: varchar('birthplace', { length: 200 }),
  imageUrl: text('image_url'),
  summary: text('summary').notNull(),
  biography: text('biography').notNull(),
  works: text('works').notNull(),
  anecdotes: text('anecdotes'),
  externalLinks: jsonb('external_links').$type<{ label: string; url: string }[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  surnameIdIdx: index('celebrity_surname_idx').on(table.surnameId),
  dynastyIdx: index('celebrity_dynasty_idx').on(table.dynasty)
}))

export const surnamesRelations = relations(surnames, ({ many }) => ({
  celebrities: many(celebrities)
}))

export const celebritiesRelations = relations(celebrities, ({ one }) => ({
  surname: one(surnames, { fields: [celebrities.surnameId], references: [surnames.id] })
}))
```

- [ ] **Step 3: Create .env**

```
DATABASE_URL=postgresql://localhost:5432/baijiaxing
```

- [ ] **Step 4: Push schema to database**

```bash
cd /Users/szh/Desktop/baijiaxingProject && npx drizzle-kit push
```

Expected: tables created without errors. (Requires local PostgreSQL running.)

---

### Task 4: Database Client

**Files:**
- Create: `server/db/client.ts`

- [ ] **Step 1: Create server/db/client.ts**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString, { max: 10 })
export const db = drizzle(client, { schema })

export { schema }
```

---

### Task 5: Seed Data Script

**Files:**
- Create: `server/db/seed.ts`, `server/db/seed-data.ts`

- [ ] **Step 1: Create server/db/seed-data.ts**

Create a seed data file with 10 surnames and 20+ celebrities for initial development. Use the path `server/db/seed-data.ts`.

```typescript
export const seedSurnames = [
  { name: '赵', pinyin: 'Zhào', rank: 1, origin: '出自嬴姓，形成于西周，始祖为造父。造父为周穆王驾车，在平定徐偃王之乱中立功，受封于赵城，后裔以赵为氏。', ancestor: '造父', junwang: ['河北', '山西'], tanghao: '天水堂' },
  { name: '钱', pinyin: 'Qián', rank: 2, origin: '出自彭姓，以官名为氏。颛顼帝后裔彭祖之孙孚，在西周时任钱府上士，掌管钱财，后裔以官名为氏。', ancestor: '孚', junwang: ['江苏', '浙江'], tanghao: '彭城堂' },
  { name: '孙', pinyin: 'Sūn', rank: 3, origin: '出自姬姓、芈姓等多源。卫武公之子惠孙，其孙以祖父字为氏。另有楚国令尹孙叔敖之后。', ancestor: '惠孙', junwang: ['山东', '河南'], tanghao: '乐安堂' },
  { name: '李', pinyin: 'Lǐ', rank: 4, origin: '出自嬴姓，尧帝时理官皋陶之后。因避商纣王迫害，理利贞逃难途中食李子存活，改理为李。', ancestor: '理利贞', junwang: ['河北', '陕西', '甘肃'], tanghao: '陇西堂' },
  { name: '周', pinyin: 'Zhōu', rank: 5, origin: '出自姬姓，周平王之子姬烈封于汝南，以国号为氏。另有周朝灭亡后，部分王族以故国名为氏。', ancestor: '姬烈', junwang: ['河南', '安徽'], tanghao: '汝南堂' },
  { name: '张', pinyin: 'Zhāng', rank: 24, origin: '出自姬姓，黄帝之孙挥，因发明弓箭而被赐姓张。张字本意为"弓长"，即弓弦张开之意。', ancestor: '挥', junwang: ['河北', '河南'], tanghao: '清河堂' },
  { name: '刘', pinyin: 'Liú', rank: 252, origin: '出自祁姓，帝尧后裔。刘累为夏朝御龙氏，其后裔以刘为氏。另有一支为周代刘国之后。', ancestor: '刘累', junwang: ['江苏', '河北'], tanghao: '彭城堂' },
  { name: '陈', pinyin: 'Chén', rank: 10, origin: '出自妫姓，周武王封舜帝后裔妫满于陈国，其后裔以国为氏。陈国故地在今河南淮阳。', ancestor: '妫满', junwang: ['河南', '安徽'], tanghao: '颍川堂' },
  { name: '杨', pinyin: 'Yáng', rank: 16, origin: '出自姬姓，晋武公之子伯侨封于杨邑，其子孙以邑为氏。杨邑故地在今山西洪洞。', ancestor: '伯侨', junwang: ['山西', '陕西'], tanghao: '弘农堂' },
  { name: '黄', pinyin: 'Huáng', rank: 96, origin: '出自嬴姓，伯益之后。黄国为周代诸侯国，后为楚所灭，子孙以国为氏。', ancestor: '伯益', junwang: ['湖北', '河南'], tanghao: '江夏堂' }
]

export const seedCelebrities = [
  { surname: '李', name: '李白', dynasty: '唐', birthYear: 701, deathYear: 762, birthplace: '碎叶城（今吉尔吉斯斯坦境内）', summary: '唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。', biography: '李白（701年—762年），字太白，号青莲居士，又号"谪仙人"，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"，与杜甫并称为"李杜"。李白出生于西域碎叶城，五岁时随父迁居四川绵州。二十岁时只身出川，开始了广泛漫游。天宝元年，因道士吴筠的推荐，被召至长安，供奉翰林。文章风采，名动一时，颇为唐玄宗所赏识。后因不能见容于权贵，在京仅三年，就弃官而去。安史之乱爆发后，李白因参加永王李璘的幕府，受牵连被流放夜郎，途中遇赦。晚年漂泊东南一带，病逝于当涂。', works: '《静夜思》《望庐山瀑布》《将进酒》《行路难》《蜀道难》《早发白帝城》等', anecdotes: '据传李白醉后入水中捉月而溺亡。又传其在长安时，曾让高力士为他脱靴，杨国忠为他磨墨。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/李白' }] },
  { surname: '李', name: '李清照', dynasty: '宋', birthYear: 1084, deathYear: 1155, birthplace: '山东济南', summary: '宋代婉约派代表词人，被称为"千古第一才女"。', biography: '李清照（1084年—约1155年），号易安居士，齐州济南（今山东省济南市）人。宋代婉约派代表词人，有"千古第一才女"之称。李清照出生于书香门第，早期生活优裕。其父李格非藏书甚富，她自幼便在良好的家庭环境中打下文学基础。出嫁后与夫赵明诚共同致力于书画金石的搜集整理。金兵入据中原时，流寓南方，境遇孤苦。所作词，前期多写其悠闲生活，后期多悲叹身世，情调感伤。', works: '《如梦令》《声声慢》《一剪梅》《夏日绝句》《武陵春》《醉花阴》等', anecdotes: '李清照与丈夫赵明诚曾以"赌书泼茶"为乐，即一人说某典故，另一人指出在某书某页，猜对者可先饮茶。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/李清照' }] },
  { surname: '李', name: '李世民', dynasty: '唐', birthYear: 598, deathYear: 649, birthplace: '陕西武功', summary: '唐朝第二位皇帝，杰出的政治家、军事家，开创"贞观之治"。', biography: '唐太宗李世民（598年—649年），陇西成纪人，唐朝第二位皇帝，杰出的政治家、战略家、军事家。李世民少年从军，曾往雁门关解救隋炀帝。首倡晋阳起兵，拜右领军大都督，受封敦煌郡公。率兵攻破长安，拜尚书令、光禄大夫，受封秦国公、赵国公。唐朝建立后，领兵平定薛仁杲、刘武周、窦建德、王世充等割据势力，为唐朝的建立与统一立下赫赫战功，拜天策上将，封秦王。武德九年发动玄武门之变，被立为太子，不久即位，年号贞观。在位期间开创了历史上著名的"贞观之治"。', works: '在位期间修《晋书》《梁书》《陈书》《北齐书》《周书》《隋书》，开创贞观之治', anecdotes: '魏征敢于直谏，李世民曾因魏征的直言而大怒，但冷静后反而更加敬重他。魏征去世后，李世民悲痛地说："以铜为鉴，可正衣冠；以史为鉴，可知兴替；以人为鉴，可明得失。"', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/唐太宗' }] },
  { surname: '张', name: '张良', dynasty: '秦汉', birthYear: null, deathYear: null, birthplace: '韩国城父（今河南郏县）', summary: '西汉开国功臣，与韩信、萧何并列为"汉初三杰"。', biography: '张良（约前250年—前186年），字子房，颍川城父（今河南郏县）人。秦末汉初杰出谋臣，西汉开国功臣，政治家，与韩信、萧何并列为"汉初三杰"。张良出身韩国贵族，秦灭韩后，他图谋恢复韩国，结交刺客，在博浪沙狙击秦始皇未遂。后跟随刘邦，成为其最重要的谋士，为刘邦制定了许多重要的战略决策，包括不立六国之后、联合英布彭越、重用韩信等，最终助刘邦建立汉朝。刘邦曾赞其"运筹帷幄之中，决胜千里之外"。', works: '辅佐刘邦建立汉朝，提出诸多重要战略决策', anecdotes: '张良年轻时在桥上遇到黄石公，黄石公故意将鞋扔下桥三次，张良三次下桥拾鞋，黄石公见其心诚，传授《太公兵法》。后张良凭此书辅佐刘邦平定天下。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/张良' }] },
  { surname: '张', name: '张衡', dynasty: '汉', birthYear: 78, deathYear: 139, birthplace: '南阳西鄂（今河南南阳市）', summary: '东汉时期伟大的天文学家、数学家、发明家、地理学家、文学家。', biography: '张衡（78年—139年），字平子，南阳西鄂（今河南南阳市石桥镇）人。东汉时期伟大的天文学家、数学家、发明家、地理学家、文学家。张衡早年游学长安、洛阳，精通五经，贯通六艺。永元十二年任南阳郡主簿，后被征召入朝，历任郎中、太史令、侍中、河间相等职。在天文学方面，张衡著有《灵宪》《浑仪图注》等，提出了"浑天说"；发明了世界上第一台地动仪——候风地动仪；创造了指南车、自动记里鼓车、飞行数里的木鸟等。', works: '《二京赋》《归田赋》《四愁诗》，发明地动仪、浑天仪', anecdotes: '张衡发明的地动仪曾准确测出陇西地震，但当时洛阳无人有感，朝臣纷纷质疑。几日后陇西快马来报，果然地震，众人方服。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/张衡' }] },
  { surname: '张', name: '张仲景', dynasty: '汉', birthYear: null, deathYear: null, birthplace: '南阳涅阳（今河南邓州）', summary: '东汉末年著名医学家，被后人尊称为"医圣"。', biography: '张仲景，名机，字仲景，南阳涅阳县（今河南省邓州市）人。东汉末年著名医学家，被后人尊称为"医圣"。张仲景广泛收集医方，写出了传世巨著《伤寒杂病论》。它确立的"辨证论治"原则，是中医临床的基本原则，是中医的灵魂所在。在方剂学方面，《伤寒杂病论》也做出了巨大贡献，创造了很多剂型，记载了大量有效的方剂。', works: '《伤寒杂病论》', anecdotes: '张仲景曾任长沙太守，但因时局动荡，他深感医道比政道更能济世救人，于是辞官行医。每逢瘟疫流行，他必亲临疫区救治百姓。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/张仲景' }] },
  { surname: '赵', name: '赵云', dynasty: '三国', birthYear: null, deathYear: 229, birthplace: '常山真定（今河北正定）', summary: '三国时期蜀汉名将，以忠勇著称。', biography: '赵云，字子龙，常山真定（今河北省正定县）人。身长八尺，姿颜雄伟，三国时期蜀汉名将。赵云初从公孙瓒，后追随刘备，先后参加过博望坡之战、长坂坡之战、江南平定战，独自指挥过入川之战、汉水之战、箕谷之战，均取得了非常好的战果。赵云跟随刘备将近三十年，先后参加过博望坡之战、长坂坡之战、江南平定战等，战功赫赫，被封为翊军将军。', works: '参与博望坡、长坂坡、定军山等重大战役', anecdotes: '长坂坡之战中，赵云单骑救主，在曹操大军中七进七出，救出刘备之子刘禅。刘备感动得将刘禅摔在地上说："为汝这孺子，几损我一员大将！"赵云连忙接住，说："云虽肝脑涂地，不能报也。"', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/赵云' }] },
  { surname: '孙', name: '孙武', dynasty: '先秦', birthYear: null, deathYear: null, birthplace: '齐国乐安（今山东广饶）', summary: '春秋时期著名军事家，被尊称为"兵圣"，著有《孙子兵法》。', biography: '孙武，字长卿，春秋末期齐国乐安（今山东省北部）人。春秋时期著名的军事家、政治家，被尊称为"兵圣"或"孙子（孙武子）"，又称"兵家至圣"，被誉为"百世兵家之师"、"东方兵学的鼻祖"。孙武经吴国重臣伍员举荐，向吴王阖闾进呈所著兵法十三篇，受到重用为将。他曾率领吴国军队大败楚国军队，占领楚国都城郢城，几近覆亡楚国。', works: '《孙子兵法》十三篇', anecdotes: '孙武练兵的故事广为流传：吴王让他训练宫女，宫女们最初嬉笑不听号令，孙武斩杀两名队长（吴王宠妃），此后宫女们令行禁止，再无人敢违抗。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/孙武' }] },
  { surname: '孙', name: '孙中山', dynasty: '近现代', birthYear: 1866, deathYear: 1925, birthplace: '广东香山（今广东中山）', summary: '中国近代民族民主主义革命的开拓者，中华民国和中国国民党的缔造者。', biography: '孙中山（1866年11月12日—1925年3月12日），名文，字载之，号日新，又号逸仙，幼名帝象，化名中山。广东香山县（今中山市）翠亨村人。中国近代民族民主主义革命的开拓者，中国民主革命伟大先行者，中华民国和中国国民党的缔造者，三民主义的倡导者，创立了《五权宪法》。他首举彻底反帝反封建的旗帜，"起共和而终两千年封建帝制"。', works: '提出三民主义，领导辛亥革命，推翻清朝统治，建立中华民国', anecdotes: '孙中山曾以优异成绩毕业于香港西医书院，本可成为一名优秀的医生。但他深感"医术救人，所济有限"，而"医国"比"医人"更重要，于是弃医从政，走上革命道路。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/孙中山' }] },
  { surname: '周', name: '周恩来', dynasty: '近现代', birthYear: 1898, deathYear: 1976, birthplace: '江苏淮安', summary: '中国无产阶级革命家、政治家、军事家、外交家，新中国第一位总理。', biography: '周恩来（1898年3月5日—1976年1月8日），字翔宇，原籍浙江绍兴，生于江苏淮安。伟大的马克思主义者，伟大的无产阶级革命家、政治家、军事家、外交家，党和国家主要领导人之一，中国人民解放军主要创建人之一，中华人民共和国的开国元勋，是以毛泽东同志为核心的党的第一代中央领导集体的重要成员。新中国成立后，周恩来一直担任政府总理，在政治、经济、外交、国防、统战、科技、文化、教育、新闻、卫生、体育等各领域的工作中作出了奠基性的贡献。', works: '领导南昌起义，推动中美建交，提出和平共处五项原则', anecdotes: '周恩来在外交场合的机智广为传颂。一次外国记者问："中国有多少钱？"周恩来回答："十八元八角八分。"因为当时的人民币面值加起来正好是十八元八角八分，巧妙回避了"国家财富"这一敏感问题的同时又不失风度。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/周恩来' }] },
  { surname: '陈', name: '陈胜', dynasty: '秦汉', birthYear: null, deathYear: null, birthplace: '阳城（今河南登封）', summary: '秦末农民起义领袖，中国历史上第一次大规模农民起义的发起者。', biography: '陈胜，字涉，阳城（今河南登封）人。秦朝末年农民起义的领袖之一。秦二世元年，陈胜与吴广在大泽乡率领九百戍卒起义，陈胜自立为将军，以"王侯将相宁有种乎"为口号，起义军迅速壮大，接连攻克多地。后陈胜在陈县建立"张楚"政权，称王。虽然起义最终失败，陈胜也被其车夫庄贾杀害，但他点燃了推翻暴秦的燎原之火。', works: '领导大泽乡起义，建立中国历史上第一个农民政权"张楚"', anecdotes: '陈胜年轻时给人耕田，在田埂上休息时对同伴说："苟富贵，无相忘。"同伴笑他一个种田的怎么会富贵。陈胜叹息道："燕雀安知鸿鹄之志哉！"后来果然成为起义领袖。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/陈胜' }] },
  { surname: '刘', name: '刘邦', dynasty: '秦汉', birthYear: null, deathYear: null, birthplace: '沛县丰邑（今江苏丰县）', summary: '汉朝开国皇帝，汉民族和汉文化的奠基者。', biography: '刘邦（前256年—前195年），字季，沛郡丰邑（今江苏丰县）人。中国历史上杰出的政治家、战略家和军事指挥家，汉朝开国皇帝，汉民族和汉文化的奠基者和开拓者。刘邦出身农家，为人豁达大度。陈胜起事后不久，刘邦集合三千子弟响应起义，攻占沛县等地称沛公。后投奔项梁，受封为武安侯。公元前206年，刘邦进抵霸上，秦王子婴投降，秦朝灭亡。经过楚汉之争，刘邦击败项羽，统一天下，建立汉朝。', works: '建立汉朝，推行休养生息政策，奠定了汉朝四百年基业', anecdotes: '刘邦当上皇帝后回到家乡沛县，大摆宴席，亲自击筑高歌："大风起兮云飞扬，威加海内兮归故乡，安得猛士兮守四方！"唱罢泪流满面。这就是著名的《大风歌》。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/刘邦' }] },
  { surname: '杨', name: '杨绛', dynasty: '近现代', birthYear: 1911, deathYear: 2016, birthplace: '北京', summary: '中国著名作家、翻译家、外国文学研究家。', biography: '杨绛（1911年7月17日—2016年5月25日），本名杨季康，江苏无锡人，中国女作家、文学翻译家和外国文学研究家。杨绛通晓英语、法语、西班牙语，由她翻译的《堂吉诃德》被公认为最优秀的翻译佳作。93岁出版散文随笔《我们仨》，风靡海内外。96岁出版哲理散文集《走到人生边上》。102岁出版250万字的《杨绛文集》八卷。', works: '《我们仨》《洗澡》《干校六记》，译作《堂吉诃德》', anecdotes: '钱锺书曾评价杨绛为"最贤的妻，最才的女"。杨绛97岁时仍每天坚持读书写作，她说："我们曾如此渴望命运的波澜，到最后才发现：人生最曼妙的风景，竟是内心的淡定与从容。"', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/杨绛' }] },
  { surname: '黄', name: '黄庭坚', dynasty: '宋', birthYear: 1045, deathYear: 1105, birthplace: '洪州分宁（今江西修水）', summary: '北宋著名文学家、书法家，江西诗派开山之祖。', biography: '黄庭坚（1045年—1105年），字鲁直，号山谷道人，晚号涪翁，洪州分宁（今江西省九江市修水县）人。北宋著名文学家、书法家、盛极一时的江西诗派开山之祖。黄庭坚与杜甫、陈师道和陈与义素有"一祖三宗"之称。与张耒、晁补之、秦观都游学于苏轼门下，合称为"苏门四学士"。生前与苏轼齐名，世称"苏黄"。书法独树一格，为"宋四家"之一。', works: '《登快阁》《寄黄几复》《清平乐》，书法作品《松风阁诗帖》', anecdotes: '黄庭坚曾梦见自己前世是一个吃素的女子，后来竟真的找到了梦中的前世故居，里面还有一位老婆婆，正是前世女儿。从此黄庭坚更加孝顺，并终身奉佛。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/黄庭坚' }] },
  { surname: '钱', name: '钱学森', dynasty: '近现代', birthYear: 1911, deathYear: 2009, birthplace: '上海', summary: '世界著名科学家、空气动力学家，中国载人航天奠基人。', biography: '钱学森（1911年12月11日—2009年10月31日），浙江杭州人。世界著名科学家、空气动力学家，中国载人航天奠基人，中国科学院及中国工程院院士，中国两弹一星功勋奖章获得者，被誉为"中国航天之父""中国导弹之父""中国自动化控制之父"和"火箭之王"。钱学森早年留学美国，在麻省理工学院和加州理工学院深造，师从著名空气动力学家冯·卡门。1955年冲破重重阻力回到中国，将中国导弹、原子弹的发射向前推进了至少20年。', works: '领导研制中国第一枚导弹、第一颗人造卫星，著有《工程控制论》', anecdotes: '钱学森回国的过程非常曲折。美国海军次长丹尼·金布尔曾说："钱学森无论走到哪里，都抵得上五个海军陆战师。"美国政府由此百般阻挠他回国。经过五年多的抗争和中国政府的外交努力，钱学森才终于于1955年踏上归国之路。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/钱学森' }] },
  { surname: '孙', name: '孙权', dynasty: '三国', birthYear: 182, deathYear: 252, birthplace: '吴郡富春（今浙江杭州）', summary: '三国时期孙吴的开国皇帝，被曹操称赞"生子当如孙仲谋"。', biography: '孙权（182年—252年），字仲谋，吴郡富春（今浙江杭州富阳区）人。三国时代孙吴的建立者。孙权的父亲孙坚和兄长孙策在东汉末年群雄割据中打下了江东基业。建安五年孙策遇刺身亡，孙权继之掌事，成为一方诸侯。建安十三年，孙权与刘备联合于赤壁打败曹操军队，奠定了三国鼎立的基础。建安二十四年，孙权派吕蒙袭取刘备的荆州成功。黄龙元年，孙权正式称帝，建立吴国。', works: '建立吴国，开发江南，派遣船队到达夷洲（今台湾）', anecdotes: '曹操攻打东吴时，见孙权水军军容严整，不由得赞叹："生子当如孙仲谋！若刘景升儿子，豚犬耳。"这句话成为千古名言。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/孙权' }] },
  { surname: '陈', name: '陈子昂', dynasty: '唐', birthYear: 659, deathYear: 700, birthplace: '梓州射洪（今四川射洪）', summary: '唐代文学家，初唐诗文革新人物之一。', biography: '陈子昂（659年—700年），字伯玉，梓州射洪（今四川省射洪市）人。唐代文学家、诗人，初唐诗文革新人物之一。因曾任右拾遗，后世称陈拾遗。陈子昂青少年时轻财好施，慷慨任侠。后进士及第，历任麟台正字、右拾遗。直言敢谏，曾因"逆党"反对武则天而株连下狱。在26岁时、36岁时两次从军边塞，对边防颇有些远见。', works: '《登幽州台歌》《感遇诗》三十八首', anecdotes: '陈子昂初到长安时籍籍无名。一日在街上见有人卖一把胡琴，要价千金。陈子昂当场买下，邀请众人第二日来听他演奏。次日宾客云集，他却将胡琴摔碎，说："蜀人陈子昂，有文百轴，不为人知。弹琴乃乐工之事，岂是我辈所为！"然后将自己的诗文分发众人，从此名动长安。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/陈子昂' }] },
  { surname: '周', name: '周瑜', dynasty: '三国', birthYear: 175, deathYear: 210, birthplace: '庐江舒县（今安徽庐江）', summary: '东汉末年东吴名将，赤壁之战的主要指挥者。', biography: '周瑜（175年—210年），字公瑾，庐江舒县（今安徽省合肥市庐江县）人。东汉末年东吴名将。出身庐江周氏，洛阳令周异之子。正史记载周瑜"性度恢廓""实奇才也"，孙权称赞其有"王佐之资"。周瑜少与孙策交好，助孙策平定江东。孙策遇刺后，周瑜与张昭共同辅佐孙权。建安十三年，周瑜率军与刘备联合，于赤壁之战中大败曹操，由此奠定了"三分天下"的基础。', works: '指挥赤壁之战，提出"二分天下"的战略规划', anecdotes: '周瑜精通音律，即使是酒过三巡，演奏者有一点微小的错误也逃不过他的耳朵。每当发现错误，他就会回头看向演奏者。所以当时有歌谣说："曲有误，周郎顾。"', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/周瑜' }] },
  { surname: '刘', name: '刘备', dynasty: '三国', birthYear: 161, deathYear: 223, birthplace: '涿郡涿县（今河北涿州）', summary: '三国时期蜀汉开国皇帝，以仁德著称。', biography: '刘备（161年—223年），字玄德，涿郡涿县（今河北省涿州市）人。三国时期蜀汉开国皇帝。刘备是汉朝宗室，汉中山靖王刘胜的后代。他为人谦和、礼贤下士，宽以待人，志向远大，知人善用。刘备早年颠沛流离，先后依附于公孙瓒、陶谦、曹操、袁绍、刘表等人。后经三顾茅庐请出诸葛亮，与孙权联合在赤壁之战中击败曹操，占据荆州，又夺取益州和汉中。章武元年，刘备在成都称帝，建立蜀汉。', works: '建立蜀汉政权，与曹操、孙权形成三国鼎立之势', anecdotes: '刘备临终前对诸葛亮说："君才十倍曹丕，必能安国，终定大事。若嗣子可辅，辅之；如其不才，君可自取。"诸葛亮涕泣曰："臣敢竭股肱之力，效忠贞之节，继之以死。"这就是千古佳话"白帝城托孤"。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/刘备' }] },
  { surname: '赵', name: '赵匡胤', dynasty: '宋', birthYear: 927, deathYear: 976, birthplace: '洛阳', summary: '宋朝开国皇帝，结束了五代十国的分裂局面。', biography: '宋太祖赵匡胤（927年—976年），字元朗，小名香孩儿。涿郡（今河北省涿州市）人。五代至北宋初年军事家、政治家，宋朝开国皇帝。赵匡胤在后汉时投奔枢密使郭威，致身行伍。他受后周世宗柴荣器重，于征伐南唐时屡建战功。柴荣病重时，任命赵匡胤为殿前都点检。显德七年，赵匡胤受命抵御北汉及契丹联军，旋即在"陈桥兵变"中被拥立为帝，回京逼迫后周恭帝禅位。同年登基为帝，改元建隆，国号"宋"。他在位期间，逐步统一全国，结束了五代十国的分裂割据局面。', works: '建立宋朝，统一全国，实施"杯酒释兵权"强化中央集权', anecdotes: '赵匡胤称帝后，在一次酒宴上对众将说："若有一日，你们的部下也给你们黄袍加身，你们能拒绝吗？"众将听后大惊，跪地求指生路。赵匡胤劝他们交出兵权，多买良田美宅，安享富贵。这便是"杯酒释兵权"的故事。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/赵匡胤' }] },
  { surname: '杨', name: '杨万里', dynasty: '宋', birthYear: 1127, deathYear: 1206, birthplace: '吉州吉水（今江西吉水）', summary: '南宋著名诗人，与陆游、尤袤、范成大并称"中兴四大诗人"。', biography: '杨万里（1127年—1206年），字廷秀，号诚斋。吉州吉水（今江西省吉水县）人。南宋著名诗人，大臣，与陆游、尤袤、范成大并称为"中兴四大诗人"。因宋光宗曾为其亲书"诚斋"二字，故学者称其为"诚斋先生"。杨万里一生作诗两万多首，传世作品有四千二百余首，被誉为一代诗宗。他创造了语言浅近明白、清新自然、富有幽默情趣的"诚斋体"。', works: '《小池》《晓出净慈寺送林子方》《宿新市徐公店》等', anecdotes: '杨万里在官场中刚直不阿，多次被贬。晚年居家，仍关心国事。听说韩侂胄北伐失利，他愤而绝食，临终前还大叫："韩侂胄奸臣，专权误国！"其忠贞爱国之志，至死不渝。', externalLinks: [{ label: '百度百科', url: 'https://baike.baidu.com/item/杨万里' }] }
]
```

- [ ] **Step 2: Create server/db/seed.ts**

```typescript
import { db, schema } from './client'
import { seedSurnames, seedCelebrities } from './seed-data'

async function seed() {
  console.log('Seeding surnames...')
  for (const s of seedSurnames) {
    await db.insert(schema.surnames).values(s).onConflictDoNothing()
  }

  console.log('Seeding celebrities...')
  const surnameRecords = await db.select().from(schema.surnames)
  const surnameMap = new Map(surnameRecords.map(s => [s.name, s.id]))

  for (const c of seedCelebrities) {
    const surnameId = surnameMap.get(c.surname)
    if (!surnameId) {
      console.warn(`Surname "${c.surname}" not found, skipping celebrity "${c.name}"`)
      continue
    }
    await db.insert(schema.celebrities).values({
      surnameId,
      name: c.name,
      dynasty: c.dynasty,
      birthYear: c.birthYear ?? null,
      deathYear: c.deathYear ?? null,
      birthplace: c.birthplace ?? null,
      summary: c.summary,
      biography: c.biography,
      works: c.works,
      anecdotes: c.anecdotes ?? null,
      externalLinks: c.externalLinks
    })
  }

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
```

- [ ] **Step 3: Run seed script**

```bash
cd /Users/szh/Desktop/baijiaxingProject && npx tsx server/db/seed.ts
```

Expected: "Seed complete!" with no errors.

---

### Task 6: Global Layout + Chinese Theme CSS

**Files:**
- Create: `layouts/default.vue`, `assets/css/main.css`

- [ ] **Step 1: Create assets/css/main.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@400;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-rice text-ink font-serif;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5a9' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
}

@layer components {
  .chinese-seal {
    @apply inline-block border-2 border-seal text-seal px-3 py-1 font-bold text-sm tracking-widest;
    font-family: 'Ma Shan Zheng', cursive;
  }

  .surname-card {
    @apply bg-white/70 border border-amber-200 rounded-sm
           flex flex-col items-center justify-center
           cursor-pointer transition-all duration-200
           hover:shadow-lg hover:border-vermilion hover:bg-white/90
           hover:-translate-y-0.5;
  }

  .surname-char {
    @apply text-4xl md:text-5xl;
    font-family: 'Ma Shan Zheng', cursive;
  }

  .prose-chinese {
    @apply text-base leading-loose tracking-wide text-ink/85;
    text-indent: 2em;
  }

  .section-title {
    @apply text-xl font-bold border-b-2 border-amber-300 pb-2 mb-4 text-ink;
  }

  .filter-btn {
    @apply px-3 py-1.5 text-sm rounded-sm border border-amber-300
           bg-white/60 hover:bg-vermilion hover:text-white hover:border-vermilion
           transition-colors duration-150 cursor-pointer;
  }

  .filter-btn.active {
    @apply bg-vermilion text-white border-vermilion;
  }

  .search-input {
    @apply w-full max-w-xl px-6 py-4 text-lg rounded-sm
           border-2 border-amber-300 bg-white/80
           focus:outline-none focus:border-vermilion
           placeholder:text-amber-400/60 text-center;
    font-family: 'Noto Serif SC', serif;
  }

  .dynasty-tag {
    @apply inline-block px-2 py-0.5 text-xs rounded-sm
           bg-amber-100/70 text-amber-900 border border-amber-300;
  }
}
```

- [ ] **Step 2: Create layouts/default.vue**

```vue
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
```

---

### Task 7: API — Surnames List

**Files:**
- Create: `server/api/surnames.get.ts`

- [ ] **Step 1: Create server/api/surnames.get.ts**

```typescript
import { db, schema } from '../db/client'
import { and, gte, lte, ilike, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const conditions = []

  if (query.pinyin) {
    conditions.push(ilike(schema.surnames.pinyin, `${query.pinyin}%`))
  }
  if (query.rank_min) {
    conditions.push(gte(schema.surnames.rank, Number(query.rank_min)))
  }
  if (query.rank_max) {
    conditions.push(lte(schema.surnames.rank, Number(query.rank_max)))
  }
  if (query.junwang) {
    conditions.push(sql`${query.junwang} = ANY(${schema.surnames.junwang})`)
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 200))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, totalResult] = await Promise.all([
    db.select().from(schema.surnames).where(where)
      .orderBy(schema.surnames.rank)
      .limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(schema.surnames).where(where)
  ])

  return {
    data,
    total: Number(totalResult[0]?.count ?? 0),
    page,
    pageSize
  }
})
```

- [ ] **Step 2: Test API endpoint**

```bash
cd /Users/szh/Desktop/baijiaxingProject && npx nuxt dev &
sleep 5
curl -s http://localhost:3000/api/surnames | python3 -m json.tool | head -30
```

Expected: JSON array with surnames, paginated. Kill dev server after.

---

### Task 8: API — Surname Detail

**Files:**
- Create: `server/api/surnames/[id].get.ts`

- [ ] **Step 1: Create server/api/surnames/[id].get.ts**

```typescript
import { db, schema } from '../../db/client'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id required' })

  const surname = await db.query.surnames.findFirst({
    where: eq(schema.surnames.id, id),
    with: { celebrities: { orderBy: (celebrities, { asc }) => [asc(celebrities.dynasty)] } }
  })

  if (!surname) throw createError({ statusCode: 404, message: 'Surname not found' })

  return surname
})
```

- [ ] **Step 2: Test endpoint**

```bash
# Get a surname ID from previous response
curl -s http://localhost:3000/api/surnames/REPLACE_WITH_ID | python3 -m json.tool | head -20
```

---

### Task 9: API — Celebrities List

**Files:**
- Create: `server/api/celebrities.get.ts`

- [ ] **Step 1: Create server/api/celebrities.get.ts**

```typescript
import { db, schema } from '../db/client'
import { and, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const conditions = []

  if (query.surname_id) {
    conditions.push(eq(schema.celebrities.surnameId, String(query.surname_id)))
  }
  if (query.dynasty) {
    conditions.push(eq(schema.celebrities.dynasty, String(query.dynasty)))
  }

  const page = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [data, totalResult] = await Promise.all([
    db.select().from(schema.celebrities).where(where)
      .orderBy(schema.celebrities.dynasty)
      .limit(pageSize).offset((page - 1) * pageSize),
    db.select({ count: sql<number>`count(*)` }).from(schema.celebrities).where(where)
  ])

  return {
    data,
    total: Number(totalResult[0]?.count ?? 0),
    page,
    pageSize
  }
})
```

---

### Task 10: API — Celebrity Detail

**Files:**
- Create: `server/api/celebrities/[id].get.ts`

- [ ] **Step 1: Create server/api/celebrities/[id].get.ts**

```typescript
import { db, schema } from '../../db/client'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'id required' })

  const celebrity = await db.query.celebrities.findFirst({
    where: eq(schema.celebrities.id, id),
    with: { surname: true }
  })

  if (!celebrity) throw createError({ statusCode: 404, message: 'Celebrity not found' })

  return celebrity
})
```

---

### Task 11: API — Global Search

**Files:**
- Create: `server/api/search.get.ts`

- [ ] **Step 1: Create server/api/search.get.ts**

```typescript
import { db, schema } from '../db/client'
import { or, ilike, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const q = String(getQuery(event).q || '').trim()
  if (!q) return { data: [], total: 0 }

  const pattern = `%${q}%`

  const [surnameResults, celebrityResults] = await Promise.all([
    db.select({
      id: schema.surnames.id,
      name: schema.surnames.name,
      pinyin: schema.surnames.pinyin,
      rank: schema.surnames.rank
    }).from(schema.surnames)
      .where(or(
        ilike(schema.surnames.name, pattern),
        ilike(schema.surnames.pinyin, pattern)
      ))
      .limit(20),

    db.select({
      id: schema.celebrities.id,
      name: schema.celebrities.name,
      dynasty: schema.celebrities.dynasty,
      summary: schema.celebrities.summary,
      surnameId: schema.celebrities.surnameId
    }).from(schema.celebrities)
      .where(or(
        ilike(schema.celebrities.name, pattern),
        ilike(schema.celebrities.summary, pattern)
      ))
      .limit(50)
  ])

  const surnames = surnameResults.map(s => ({ type: 'surname' as const, data: s }))
  const celebrities = celebrityResults.map(c => ({ type: 'celebrity' as const, data: c }))

  return {
    data: [...surnames, ...celebrities],
    total: surnames.length + celebrities.length
  }
})
```

---

### Task 12: SurnameCard + SurnameGrid Components

**Files:**
- Create: `components/SurnameCard.vue`, `components/SurnameGrid.vue`

- [ ] **Step 1: Create components/SurnameCard.vue**

```vue
<script setup lang="ts">
import type { Surname } from '~/types'

defineProps<{ surname: Surname }>()
</script>

<template>
  <NuxtLink :to="`/surname/${surname.id}`" class="surname-card aspect-square p-4">
    <span class="surname-char">{{ surname.name }}</span>
    <span class="text-xs text-ink/50 mt-1">{{ surname.pinyin }}</span>
    <span class="text-xs text-ink/30 mt-0.5">第{{ surname.rank }}位</span>
  </NuxtLink>
</template>
```

- [ ] **Step 2: Create components/SurnameGrid.vue**

```vue
<script setup lang="ts">
import type { Surname } from '~/types'

defineProps<{ surnames: Surname[] }>()
</script>

<template>
  <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4">
    <SurnameCard v-for="s in surnames" :key="s.id" :surname="s" />
  </div>
  <div v-if="surnames.length === 0" class="text-center text-ink/40 py-20">
    暂无数据
  </div>
</template>
```

---

### Task 13: PinyinNav Component

**Files:**
- Create: `components/PinyinNav.vue`

- [ ] **Step 1: Create components/PinyinNav.vue**

```vue
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
```

---

### Task 14: SearchBar Component

**Files:**
- Create: `components/SearchBar.vue`

- [ ] **Step 1: Create components/SearchBar.vue**

```vue
<script setup lang="ts">
const router = useRouter()
const query = ref('')

let timer: ReturnType<typeof setTimeout> | null = null

function onInput() {
  // Navigate to search page on Enter or after debounce
}

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
```

---

### Task 15: FilterPanel Component

**Files:**
- Create: `components/FilterPanel.vue`

- [ ] **Step 1: Create components/FilterPanel.vue**

```vue
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
```

---

### Task 16: CelebrityCard + CelebrityList Components

**Files:**
- Create: `components/CelebrityCard.vue`, `components/CelebrityList.vue`

- [ ] **Step 1: Create components/CelebrityCard.vue**

```vue
<script setup lang="ts">
import type { Celebrity } from '~/types'

defineProps<{ celebrity: Celebrity }>()
</script>

<template>
  <NuxtLink
    :to="`/celebrity/${celebrity.id}`"
    class="block bg-white/60 border border-amber-200 rounded-sm p-4
           hover:border-vermilion hover:shadow-md transition-all duration-200"
  >
    <div class="flex items-start gap-3">
      <div v-if="celebrity.imageUrl" class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-amber-300">
        <img :src="celebrity.imageUrl" :alt="celebrity.name" class="w-full h-full object-cover" />
      </div>
      <div v-else class="w-12 h-12 rounded-full flex-shrink-0 border border-amber-300 bg-amber-50 flex items-center justify-center">
        <span class="text-amber-400 text-lg font-calligraphy">{{ celebrity.name[0] }}</span>
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-ink">{{ celebrity.name }}</h3>
          <span class="dynasty-tag">{{ celebrity.dynasty }}</span>
        </div>
        <p class="text-sm text-ink/60 mt-1 line-clamp-2">{{ celebrity.summary }}</p>
      </div>
    </div>
  </NuxtLink>
</template>
```

- [ ] **Step 2: Create components/CelebrityList.vue**

```vue
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
```

---

### Task 17: SurnameHeader Component

**Files:**
- Create: `components/SurnameHeader.vue`

- [ ] **Step 1: Create components/SurnameHeader.vue**

```vue
<script setup lang="ts">
import type { Surname } from '~/types'

defineProps<{ surname: Surname }>()
</script>

<template>
  <div class="text-center mb-8">
    <div class="text-7xl md:text-8xl font-calligraphy text-vermilion mb-3">
      {{ surname.name }}
    </div>
    <div class="text-lg text-ink/50 mb-1">{{ surname.pinyin }}</div>
    <div class="flex items-center justify-center gap-3 text-sm text-ink/40 mt-3">
      <span>百家姓第 <strong class="text-ink/70">{{ surname.rank }}</strong> 位</span>
      <span v-if="surname.tanghao">·</span>
      <span v-if="surname.tanghao">堂号：<strong class="text-ink/70">{{ surname.tanghao }}</strong></span>
    </div>
    <div v-if="surname.junwang.length" class="mt-2 flex justify-center gap-1 flex-wrap">
      <span
        v-for="jw in surname.junwang" :key="jw"
        class="dynasty-tag"
      >{{ jw }}</span>
    </div>
  </div>
</template>
```

---

### Task 18: ProseBlock Component

**Files:**
- Create: `components/ProseBlock.vue`

- [ ] **Step 1: Create components/ProseBlock.vue**

```vue
<script setup lang="ts">
defineProps<{ title: string; content: string }>()
</script>

<template>
  <div class="mb-6">
    <h3 class="section-title">{{ title }}</h3>
    <p class="prose-chinese whitespace-pre-line">{{ content }}</p>
  </div>
</template>
```

---

### Task 19: Homepage (index.vue)

**Files:**
- Create: `pages/index.vue`

- [ ] **Step 1: Create pages/index.vue**

```vue
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
```

---

### Task 20: Surname Detail Page

**Files:**
- Create: `pages/surname/[id].vue`

- [ ] **Step 1: Create pages/surname/[id].vue**

```vue
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
```

---

### Task 21: Celebrity Detail Page

**Files:**
- Create: `pages/celebrity/[id].vue`

- [ ] **Step 1: Create pages/celebrity/[id].vue**

```vue
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
```

---

### Task 22: Search Results Page

**Files:**
- Create: `pages/search.vue`

- [ ] **Step 1: Create pages/search.vue**

```vue
<script setup lang="ts">
import type { SearchResult } from '~/types'

const route = useRoute()
const router = useRouter()

const query = ref(String(route.query.q || ''))
const dynasty = ref<string | null>(String(route.query.dynasty || '') || null)
const rankRange = ref<string | null>(String(route.query.rank || '') || null)
const junwang = ref<string | null>(String(route.query.junwang || '') || null)

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
    router.push({ query: { q, ...(dynasty.value && { dynasty: dynasty.value }), ...(rankRange.value && { rank: rankRange.value }), ...(junwang.value && { junwang: junwang.value }) } })
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-8">
      <SearchBar />
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
```

---

### Task 23: Final Integration & Polish

- [ ] **Step 1: Install dependencies and verify build**

```bash
cd /Users/szh/Desktop/baijiaxingProject && npm install && npx nuxt build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server and smoke test**

```bash
cd /Users/szh/Desktop/baijiaxingProject && npx nuxt dev &
sleep 5

# Test homepage
curl -s http://localhost:3000/ | grep -o '百家姓'

# Test search API
curl -s 'http://localhost:3000/api/search?q=李' | python3 -m json.tool

# Test surnames API
curl -s http://localhost:3000/api/surnames | python3 -m json.tool | head -10
```

Expected: All endpoints return valid data.

- [ ] **Step 3: Create vercel.json for deployment**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public"
}
```

- [ ] **Step 4: Create .env.example**

```
DATABASE_URL=postgresql://localhost:5432/baijiaxing
```

- [ ] **Step 5: Commit**

```bash
cd /Users/szh/Desktop/baijiaxingProject && git init && git add -A && git commit -m "feat: initial implementation of 百家姓 platform

- Nuxt 3 + Vue 3 + TypeScript + Tailwind CSS
- PostgreSQL with Drizzle ORM
- 10 surnames and 20+ celebrities seed data
- Surname grid browsing with pinyin navigation
- Surname detail with origin and celebrity list
- Celebrity detail with full biography
- Global search with multi-filter support
- Classic Chinese visual style
- SSR for content pages, CSR for search"
```

---

## Implementation Order

Tasks 1-11 build the foundation (scaffold → DB → API). Tasks 12-22 build the UI layer. Task 23 integrates.

**Dependency chain:**
```
1 → 2 → 3 → 4 → 5 (foundation)
         ↘ 6 (layout + CSS)
              ↘ 7,8,9,10,11 (APIs can be parallel)
                    ↘ 12 → 13,14,15 (components)
                           ↘ 16,17,18
                                 ↘ 19,20,21,22 (pages)
                                      ↘ 23 (integration)
```
