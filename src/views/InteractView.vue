<script setup>
import { ref, nextTick } from 'vue'

const scenarios = [
  { id: 'drought', label: '旱灾预警', icon: '☀️', desc: '分析土壤墒情与气象数据，评估旱情等级并给出灌溉建议' },
  { id: 'pest', label: '病虫害诊断', icon: '🐛', desc: '上传田间图像，识别病虫害类型及扩散风险' },
  { id: 'flood', label: '洪涝风险评估', icon: '🌊', desc: '结合遥感积水数据，评估受灾范围与转移优先级' },
  { id: 'frost', label: '低温冻害', icon: '❄️', desc: '基于气温趋势预测冻害窗口期，给出防护时序建议' },
]

const selectedScenario = ref(scenarios[0])
const inputText = ref('')
const isLoading = ref(false)
const messages = ref([
  {
    role: 'assistant',
    content: '您好！我是**星土感知**农业灾害治理智能体。\n\n请选择一个灾害情境，或直接描述您的田间问题，我将为您进行诊断分析并提供治理建议。',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  },
])
const chatBox = ref(null)

function selectScenario(s) {
  selectedScenario.value = s
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({
    role: 'user',
    content: text,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  })
  inputText.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  // TODO: 调用后端 Agent API
  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: getMockResponse(text, selectedScenario.value),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
    isLoading.value = false
    nextTick(scrollToBottom)
  }, 1800)
}

function getMockResponse(input, scenario) {
  return `【${scenario.label} · 情境分析】\n\n` +
    `**检索增强推理**：已检索农业知识库 142 条相关文档，匹配度 Top-3 来源已融合至推理上下文。\n\n` +
    `**智能体分析**：\n` +
    `- 感知智能体：当前区域土壤含水量 23.4%，低于警戒线 28%\n` +
    `- 分析智能体：综合历史气象数据，判定为中度旱情（等级 III）\n` +
    `- 决策智能体：建议在未来 48 小时内启动补充灌溉，优先保障拔节期作物\n\n` +
    `**治理建议**：\n` +
    `1. 立即启动滴灌系统，灌水定额 40-50m³/亩\n` +
    `2. 喷施抗旱保水剂，减少蒸腾耗水\n` +
    `3. 72 小时后复检土壤墒情，评估灌溉效果\n\n` +
    `_（以上为演示数据，实际响应将由后端 Agent 动态生成）_`
}

function scrollToBottom() {
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

function useScenarioPrompt(s) {
  selectedScenario.value = s
  inputText.value = `请分析当前${s.label}情况并给出治理建议。`
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <div class="interact">
    <div class="section interact-layout">

      <!-- 左侧：情境选择 + 说明 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <span class="tag">情境模式</span>
          <p class="sidebar-hint">选择灾害类型以切换推理情境</p>
        </div>
        <div class="scenario-list">
          <div
            v-for="s in scenarios"
            :key="s.id"
            class="scenario-item"
            :class="{ active: selectedScenario.id === s.id }"
            @click="useScenarioPrompt(s)"
          >
            <span class="s-icon">{{ s.icon }}</span>
            <div class="s-info">
              <span class="s-label">{{ s.label }}</span>
              <span class="s-desc">{{ s.desc }}</span>
            </div>
          </div>
        </div>

        <div class="agent-status">
          <div class="status-title">Agent 状态</div>
          <div class="status-row">
            <span class="dot online"></span>感知智能体 · 在线
          </div>
          <div class="status-row">
            <span class="dot online"></span>分析智能体 · 在线
          </div>
          <div class="status-row">
            <span class="dot online"></span>决策智能体 · 在线
          </div>
          <div class="status-row">
            <span class="dot standby"></span>执行智能体 · 待命
          </div>
        </div>
      </aside>

      <!-- 右侧：对话区 -->
      <div class="chat-panel">
        <div class="chat-header">
          <div class="chat-title">
            <span class="chat-icon">{{ selectedScenario.icon }}</span>
            {{ selectedScenario.label }}
          </div>
          <span class="chat-model">Qwen2.5-72B + RAG</span>
        </div>

        <div class="chat-body" ref="chatBox">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="message"
            :class="msg.role"
          >
            <div v-if="msg.role === 'assistant'" class="msg-avatar">🌾</div>
            <div class="msg-bubble">
              <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
            <div v-if="msg.role === 'user'" class="msg-avatar user-avatar">👤</div>
          </div>

          <!-- 加载中 -->
          <div v-if="isLoading" class="message assistant">
            <div class="msg-avatar">🌾</div>
            <div class="msg-bubble loading-bubble">
              <span class="dot-pulse"></span>
              <span class="dot-pulse"></span>
              <span class="dot-pulse"></span>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <div class="input-hint">
            当前情境：<strong>{{ selectedScenario.label }}</strong> · 按 Enter 发送，Shift+Enter 换行
          </div>
          <div class="input-row">
            <textarea
              v-model="inputText"
              class="chat-input"
              placeholder="描述您的田间问题，例如：近期叶片出现黄斑，请分析可能的病因..."
              rows="3"
              @keydown="handleKeydown"
            ></textarea>
            <button class="send-btn" :disabled="isLoading || !inputText.trim()" @click="sendMessage">
              <span v-if="!isLoading">发送</span>
              <span v-else>推理中</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.interact { min-height: calc(100vh - 116px); }

.interact-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  align-items: start;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

@media (max-width: 900px) {
  .interact-layout { grid-template-columns: 1fr; }
}

/* 侧边栏 */
.sidebar {
  position: sticky;
  top: calc(64px + 1rem);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; }

.scenario-list { display: flex; flex-direction: column; gap: 0.5rem; }

.scenario-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s;
}

.scenario-item:hover,
.scenario-item.active {
  border-color: var(--green-500);
  background: rgba(34,197,94,0.08);
}

.s-icon { font-size: 1.3rem; flex-shrink: 0; }

.s-info { display: flex; flex-direction: column; gap: 0.2rem; }

.s-label { font-size: 0.88rem; font-weight: 600; color: var(--text-main); }
.s-desc  { font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; }

.agent-status {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
}

.status-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 0.25rem 0;
}

.dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.online  { background: var(--green-500); box-shadow: 0 0 6px var(--green-500); }
.dot.standby { background: #a3a3a3; }

/* 对话面板 */
.chat-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  height: calc(100vh - 180px);
  min-height: 500px;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.chat-icon { font-size: 1.2rem; }

.chat-model {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 20px;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.message.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-avatar { background: rgba(34,197,94,0.1); }

.msg-bubble {
  max-width: 75%;
  padding: 0.85rem 1.1rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(17, 26, 20, 0.8);
  font-size: 0.88rem;
  line-height: 1.7;
}

.message.user .msg-bubble {
  background: rgba(21, 128, 61, 0.2);
  border-color: rgba(34,197,94,0.25);
}

.msg-time {
  display: block;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.4rem;
}

.loading-bubble {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem 1.2rem;
  min-width: 70px;
}

.dot-pulse {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--green-500);
  animation: pulse 1.2s ease-in-out infinite;
}
.dot-pulse:nth-child(2) { animation-delay: 0.2s; }
.dot-pulse:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* 输入区 */
.chat-input-area {
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.6rem;
}

.input-hint strong { color: var(--green-400); }

.input-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: var(--text-main);
  font-family: var(--font);
  font-size: 0.88rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus { border-color: var(--green-500); }
.chat-input::placeholder { color: var(--text-muted); }

.send-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  background: var(--green-700);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  white-space: nowrap;
  height: fit-content;
}

.send-btn:hover:not(:disabled) { background: var(--green-600); }
.send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
