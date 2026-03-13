<script setup>
const features = [
  {
    icon: '🛰️',
    title: '星土感知融合',
    desc: '融合卫星遥感与土壤传感器数据，构建多源异构感知网络，实现田间级灾害态势感知。',
  },
  {
    icon: '🔍',
    title: '检索增强生成 (RAG)',
    desc: '基于动态知识库检索，为大模型提供实时农业领域知识支撑，有效缓解幻觉问题。',
  },
  {
    icon: '🤖',
    title: '多智能体闭环',
    desc: '感知、分析、决策、执行多智能体协同，形成闭环治理链路，驱动精准化农业干预。',
  },
  {
    icon: '🌿',
    title: '灾害精准溯源',
    desc: '结合时序数据与因果推断，对病虫害、旱涝、极端气候等灾害进行根因诊断与预警。',
  },
  {
    icon: '⚡',
    title: '实时情境推理',
    desc: '毫秒级在线推理引擎，支持田间复杂情境下的动态决策，响应速度远超传统专家系统。',
  },
  {
    icon: '🗺️',
    title: '空间智能分析',
    desc: '集成地理信息系统与深度学习，输出可视化灾情图谱与治理方案，支持大规模区域管控。',
  },
]

const techStack = [
  { label: 'LLM 基座', value: 'Qwen2.5-72B / DeepSeek-V3' },
  { label: '感知框架', value: 'Multi-Modal Fusion' },
  { label: '检索引擎', value: 'Dense + Sparse Hybrid RAG' },
  { label: '智能体框架', value: 'Multi-Agent Orchestration' },
  { label: '推理后端', value: 'vLLM + TensorRT-LLM' },
  { label: '空间分析', value: 'GIS + RS Deep Learning' },
]

const timeline = [
  { year: '2025', event: '立项启动，确立"星土感知"技术路线' },
  { year: '2025 Q1', event: '完成多源遥感数据融合基线模型' },
  { year: '2024 Q3', event: 'RAG 模块与农业知识图谱集成完毕' },
  { year: '2025 Q1', event: '多智能体框架闭环验证，田间试验开始' },
  { year: '2025 Q4', event: '大规模区域灾害治理系统正式部署' },
  { year: '2026', event: '持续迭代，拓展至全国主粮产区' },
]
</script>

<template>
  <div class="overview">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-inner section">
        <div class="hero-tag">
          <span class="tag">🌾 Agricultural AI · 星土感知</span>
        </div>
        <h1 class="hero-title">
          检索增强与多智能体<br />
          <span class="highlight">农业灾害治理大模型</span>
        </h1>
        <p class="hero-desc">
          融合卫星遥感、土壤传感与大语言模型，构建"感知—分析—决策—执行"全链路闭环智能体系统，
          为农业灾害的精准识别、溯源诊断与协同治理提供新一代 AI 解决方案。
        </p>
        <div class="hero-actions">
          <router-link to="/interact" class="btn-primary">立即体验 →</router-link>
          <router-link to="/data" class="btn-ghost">查看实验数据</router-link>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-num">94.7<em>%</em></span>
            <span class="stat-label">灾害识别准确率</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">6<em>类</em></span>
            <span class="stat-label">覆盖灾害类型</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">3<em>s</em></span>
            <span class="stat-label">平均响应时延</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">5<em>省</em></span>
            <span class="stat-label">试验示范区域</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色功能 -->
    <section class="section">
      <div class="section-header">
        <span class="tag">核心特色</span>
        <h2 class="section-title">六大技术优势</h2>
        <p class="section-sub">从数据采集到治理决策，构建完整的智能农业灾害防控体系</p>
      </div>
      <div class="features-grid">
        <div v-for="f in features" :key="f.title" class="card feature-card">
          <div class="feat-icon">{{ f.icon }}</div>
          <h3 class="feat-title">{{ f.title }}</h3>
          <p class="feat-desc">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 技术架构 -->
    <section class="section arch-section">
      <div class="arch-inner">
        <div class="arch-left">
          <span class="tag">技术架构</span>
          <h2 class="section-title">系统技术栈</h2>
          <p class="section-sub">
            以大语言模型为推理核心，结合专业农业知识库与多模态感知数据，
            通过多智能体编排实现端到端的灾害治理闭环。
          </p>
          <div class="tech-list">
            <div v-for="t in techStack" :key="t.label" class="tech-item">
              <span class="tech-label">{{ t.label }}</span>
              <span class="tech-value">{{ t.value }}</span>
            </div>
          </div>
        </div>
        <div class="arch-right">
          <div class="arch-diagram">
            <div class="arch-layer layer-sense">
              <span>🛰️ 感知层</span>
              <small>卫星遥感 · 土壤传感 · 气象数据</small>
            </div>
            <div class="arch-arrow">↓</div>
            <div class="arch-layer layer-rag">
              <span>🔍 检索层</span>
              <small>RAG · 知识图谱 · 向量数据库</small>
            </div>
            <div class="arch-arrow">↓</div>
            <div class="arch-layer layer-llm">
              <span>🧠 推理层</span>
              <small>LLM · 情境理解 · 因果推断</small>
            </div>
            <div class="arch-arrow">↓</div>
            <div class="arch-layer layer-agent">
              <span>🤖 智能体层</span>
              <small>多Agent协同 · 任务规划 · 闭环执行</small>
            </div>
            <div class="arch-arrow">↓</div>
            <div class="arch-layer layer-action">
              <span>⚡ 治理层</span>
              <small>预警发布 · 方案生成 · 效果评估</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 发展历程 -->
    <section class="section">
      <div class="section-header">
        <span class="tag">发展历程</span>
        <h2 class="section-title">项目里程碑</h2>
      </div>
      <div class="timeline">
        <div v-for="(item, i) in timeline" :key="i" class="timeline-item">
          <div class="tl-dot"></div>
          <div class="tl-year">{{ item.year }}</div>
          <div class="tl-event">{{ item.event }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  padding: 3rem 0 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34, 197, 94, 0.18) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 80% 80%, rgba(21, 128, 61, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
}

.hero-tag {
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}

.highlight {
  background: linear-gradient(135deg, var(--green-400) 0%, var(--green-300) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  max-width: 640px;
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.btn-primary {
  padding: 0.75rem 2rem;
  border-radius: 10px;
  background: var(--green-600);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  transition:
    background 0.2s,
    transform 0.15s;
}
.btn-primary:hover {
  background: var(--green-500);
  transform: translateY(-1px);
}

.btn-ghost {
  padding: 0.75rem 2rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.95rem;
  transition: all 0.2s;
}
.btn-ghost:hover {
  border-color: var(--green-400);
  color: var(--green-400);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  padding: 1.5rem 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  max-width: 700px;
}

.stat-item {
  flex: 1;
  min-width: 100px;
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--green-400);
  line-height: 1;
}

.stat-num em {
  font-style: normal;
  font-size: 1rem;
  font-weight: 400;
  color: var(--green-300);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.35rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
}

/* section 通用 */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  margin: 0.75rem 0 0.5rem;
}

.section-sub {
  color: var(--text-muted);
  max-width: 540px;
  margin: 0 auto;
}

/* 特色卡片 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.feature-card {
  cursor: default;
}

.feat-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.feat-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--green-300);
  margin-bottom: 0.5rem;
}

.feat-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.7;
}

/* 架构 */
.arch-section {
  padding-top: 2rem;
}

.arch-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

@media (max-width: 768px) {
  .arch-inner {
    grid-template-columns: 1fr;
  }
}

.tech-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.88rem;
}

.tech-label {
  color: var(--text-muted);
}
.tech-value {
  color: var(--green-400);
  font-weight: 500;
}

.arch-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.arch-layer {
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  text-align: center;
  transition: border-color 0.2s;
}

.arch-layer:hover {
  border-color: var(--green-400);
}

.arch-layer span {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--green-300);
}

.arch-layer small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.layer-sense {
  background: rgba(20, 83, 45, 0.3);
}
.layer-rag {
  background: rgba(21, 128, 61, 0.2);
}
.layer-llm {
  background: rgba(22, 163, 74, 0.2);
}
.layer-agent {
  background: rgba(34, 197, 94, 0.15);
}
.layer-action {
  background: rgba(74, 222, 128, 0.1);
}

.arch-arrow {
  font-size: 1.2rem;
  color: var(--green-600);
  padding: 0.2rem 0;
}

/* 时间线 */
.timeline {
  position: relative;
  padding-left: 2rem;
  border-left: 2px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 700px;
  margin: 0 auto;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
}

.tl-dot {
  position: absolute;
  left: -2.6rem;
  top: 0.35rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green-500);
  border: 2px solid var(--bg-dark);
  box-shadow: 0 0 8px var(--green-500);
}

.tl-year {
  font-size: 0.82rem;
  color: var(--green-400);
  font-weight: 600;
  white-space: nowrap;
  min-width: 80px;
}

.tl-event {
  font-size: 0.92rem;
  color: var(--text-muted);
}
</style>
