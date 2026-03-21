<script setup>
import { ref, onMounted } from 'vue'

defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

const renderedHtml = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/nutrient.md')
    const text = await res.text()
    renderedHtml.value = renderMd(text)
  } catch {
    renderedHtml.value = '<p class="r-p">报告加载失败，请稍后重试。</p>'
  } finally {
    loading.value = false
  }
})

function close() {
  emit('close')
}

function renderMd(raw) {
  const lines = raw.split('\n')
  const result = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    const hMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (hMatch) {
      const lvl = hMatch[1].length
      result.push(`<h${lvl} class="r-h${lvl}">${inlineRender(hMatch[2])}</h${lvl}>`)
      i++
      continue
    }

    if (line.trim().startsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      result.push(buildTable(tableLines))
      continue
    }

    if (line.startsWith('> ')) {
      const bqLines = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        bqLines.push(lines[i].slice(2))
        i++
      }
      result.push(
        `<blockquote class="r-quote">${bqLines.map((l) => inlineRender(l)).join('<br>')}</blockquote>`,
      )
      continue
    }

    if (line.match(/^- /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^- /)) {
        items.push(`<li>${inlineRender(lines[i].slice(2))}</li>`)
        i++
      }
      result.push(`<ul class="r-ul">${items.join('')}</ul>`)
      continue
    }

    const imgM = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imgM) {
      result.push(
        `<div class="r-img-wrap"><img class="r-img" alt="${imgM[1]}" src="${imgM[2]}" loading="lazy"><p class="r-img-cap">${imgM[1]}</p></div>`,
      )
      i++
      continue
    }

    result.push(`<p class="r-p">${inlineRender(line)}</p>`)
    i++
  }

  return result.join('')
}

function buildTable(lines) {
  const dataRows = lines.filter(
    (l) => !l.split('|').slice(1, -1).every((c) => /^[\s\-:]+$/.test(c)),
  )
  if (!dataRows.length) return ''
  const headerCells = dataRows[0].split('|').slice(1, -1).map((c) => c.trim())
  let html = '<div class="r-table-wrap"><table class="r-table">'
  html +=
    '<thead><tr>' +
    headerCells.map((c) => `<th>${inlineRender(c)}</th>`).join('') +
    '</tr></thead><tbody>'
  for (let i = 1; i < dataRows.length; i++) {
    const cells = dataRows[i].split('|').slice(1, -1).map((c) => c.trim())
    html += '<tr>' + cells.map((c) => `<td>${inlineRender(c)}</td>`).join('') + '</tr>'
  }
  html += '</tbody></table></div>'
  return html
}

function inlineRender(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img class="r-img-inline" alt="$1" src="$2">')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a class="r-link" href="$2" target="_blank" rel="noopener">$1</a>',
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="r-code">$1</code>')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="visible" class="report-overlay" @click.self="close">
        <div class="report-modal">
          <div class="report-header">
            <div class="report-title-wrap">
              <div class="report-icon-wrap">🌿</div>
              <div>
                <div class="report-name">作物营养缺乏诊断报告</div>
                <div class="report-sub">Nutrient Deficiency Diagnosis &amp; Action Report</div>
              </div>
            </div>
            <button class="close-btn" @click="close" aria-label="关闭">✕</button>
          </div>

          <div class="report-meta-bar">
            <span class="meta-chip">🛰️ 遥感影像分析</span>
            <span class="meta-chip">置信度 92.0%</span>
            <span class="meta-chip">复核分数 75.3%</span>
            <span class="meta-chip chip-warn">⚠ 建议土壤采样验证</span>
          </div>

          <div class="report-body">
            <div v-if="loading" class="report-loading">
              <span class="ld"></span>
              <span class="ld"></span>
              <span class="ld"></span>
            </div>
            <div v-else class="report-content" v-html="renderedHtml"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.report-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.report-modal {
  background: #0d1a10;
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-radius: 18px;
  width: 100%;
  max-width: 820px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.1),
    0 40px 80px rgba(0, 0, 0, 0.6);
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(34, 197, 94, 0.15);
  flex-shrink: 0;
}

.report-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.report-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.report-name {
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8e4;
}

.report-sub {
  font-size: 0.72rem;
  color: #4b7a59;
  margin-top: 0.1rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  background: transparent;
  color: #4b7a59;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.4);
}

.report-meta-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.5rem;
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
  background: rgba(34, 197, 94, 0.03);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.meta-chip {
  font-size: 0.72rem;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #4ade80;
  background: rgba(34, 197, 94, 0.06);
}

.chip-warn {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.06);
}

.report-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(34, 197, 94, 0.2) transparent;
}

.report-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem;
}

.ld {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: ldpulse 1.2s ease-in-out infinite;
}

.ld:nth-child(2) {
  animation-delay: 0.2s;
}
.ld:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes ldpulse {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Markdown content styles */
:deep(.r-h1) {
  font-size: 1.35rem;
  font-weight: 800;
  color: #86efac;
  margin: 0 0 1.2rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(34, 197, 94, 0.2);
}

:deep(.r-h2) {
  font-size: 1.05rem;
  font-weight: 700;
  color: #4ade80;
  margin: 1.8rem 0 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.r-h2::before) {
  content: '';
  display: inline-block;
  width: 3px;
  height: 1em;
  background: #22c55e;
  border-radius: 2px;
}

:deep(.r-h3) {
  font-size: 0.92rem;
  font-weight: 600;
  color: #86efac;
  margin: 1.2rem 0 0.5rem;
}

:deep(.r-p) {
  font-size: 0.88rem;
  color: #a3bfa8;
  line-height: 1.75;
  margin: 0.5rem 0;
}

:deep(.r-ul) {
  margin: 0.5rem 0 0.5rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

:deep(.r-ul li) {
  font-size: 0.875rem;
  color: #a3bfa8;
  line-height: 1.6;
  list-style: none;
  position: relative;
  padding-left: 1rem;
}

:deep(.r-ul li::before) {
  content: '▸';
  position: absolute;
  left: 0;
  color: #22c55e;
  font-size: 0.75rem;
  top: 0.1em;
}

:deep(.r-quote) {
  border-left: 3px solid rgba(34, 197, 94, 0.4);
  padding: 0.6rem 1rem;
  margin: 0.75rem 0;
  background: rgba(34, 197, 94, 0.04);
  border-radius: 0 8px 8px 0;
  font-size: 0.82rem;
  color: #6b9e7a;
  font-style: italic;
}

:deep(.r-code) {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 0.8em;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #4ade80;
  padding: 0.1em 0.4em;
  border-radius: 4px;
}

:deep(.r-link) {
  color: #34d399;
  text-decoration: underline;
  text-underline-offset: 2px;
}

:deep(.r-link:hover) {
  color: #6ee7b7;
}

:deep(.r-table-wrap) {
  overflow-x: auto;
  margin: 1rem 0;
  border-radius: 10px;
  border: 1px solid rgba(34, 197, 94, 0.18);
}

:deep(.r-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

:deep(.r-table th) {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  font-weight: 600;
  padding: 0.6rem 1rem;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid rgba(34, 197, 94, 0.2);
}

:deep(.r-table td) {
  padding: 0.5rem 1rem;
  color: #a3bfa8;
  border-bottom: 1px solid rgba(34, 197, 94, 0.08);
}

:deep(.r-table tr:last-child td) {
  border-bottom: none;
}

:deep(.r-table tr:hover td) {
  background: rgba(34, 197, 94, 0.04);
}

:deep(.r-img-wrap) {
  margin: 1.25rem 0;
  text-align: center;
}

:deep(.r-img) {
  max-width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(34, 197, 94, 0.15);
}

:deep(.r-img-cap) {
  font-size: 0.75rem;
  color: #4b7a59;
  margin-top: 0.4rem;
  font-style: italic;
}

:deep(strong) {
  color: #d1fae5;
  font-weight: 600;
}

/* Overlay transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-active .report-modal,
.overlay-leave-active .report-modal {
  transition: transform 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.overlay-enter-from .report-modal {
  transform: translateY(20px) scale(0.97);
}

.overlay-leave-to .report-modal {
  transform: translateY(10px) scale(0.98);
}

/* ===== 移动端：底部抽屉 ===== */
@media (max-width: 768px) {
  .report-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .report-modal {
    max-width: 100%;
    max-height: 92vh;
    max-height: 92dvh;
    border-radius: 16px 16px 0 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
  }

  /* 底部抽屉的拖拽指示条 */
  .report-modal::before {
    content: '';
    display: block;
    width: 36px;
    height: 4px;
    background: rgba(34, 197, 94, 0.25);
    border-radius: 2px;
    margin: 0.6rem auto 0;
    flex-shrink: 0;
  }

  .report-header {
    padding: 0.85rem 1rem;
  }

  .report-icon-wrap {
    width: 34px;
    height: 34px;
    font-size: 1.1rem;
  }

  .report-name {
    font-size: 0.9rem;
  }

  .report-sub {
    display: none;
  }

  .report-meta-bar {
    padding: 0.5rem 1rem;
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
  }

  .report-meta-bar::-webkit-scrollbar {
    display: none;
  }

  .meta-chip {
    flex-shrink: 0;
    font-size: 0.68rem;
    padding: 0.15rem 0.5rem;
  }

  .report-body {
    padding: 1rem;
  }

  /* Markdown 内容在移动端的微调 */
  :deep(.r-h1) {
    font-size: 1.1rem;
  }

  :deep(.r-h2) {
    font-size: 0.95rem;
    margin: 1.2rem 0 0.6rem;
  }

  :deep(.r-h3) {
    font-size: 0.85rem;
  }

  :deep(.r-p),
  :deep(.r-ul li) {
    font-size: 0.83rem;
  }

  :deep(.r-table th),
  :deep(.r-table td) {
    padding: 0.4rem 0.6rem;
    font-size: 0.78rem;
  }

  :deep(.r-img) {
    border-radius: 8px;
  }
}

/* 底部抽屉进入动画 */
@media (max-width: 768px) {
  .overlay-enter-from .report-modal {
    transform: translateY(100%);
  }

  .overlay-leave-to .report-modal {
    transform: translateY(60%);
  }

  .overlay-enter-active .report-modal,
  .overlay-leave-active .report-modal {
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }
}

@media (max-width: 420px) {
  .report-header {
    padding: 0.75rem 0.85rem;
  }

  .report-body {
    padding: 0.75rem;
  }

  .close-btn {
    width: 28px;
    height: 28px;
  }
}
</style>
