<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const videoRef = ref(null)
const historyRef = ref(null)
const currentTime = ref(0)
const videoDuration = ref(0)
const videoStatus = ref('loading')
const videoErrorMessage = ref('')
const videoSourceIndex = ref(0)
const videoSourceCandidates = [
  '/data.mp4',
  `${import.meta.env.BASE_URL}data.mp4`,
  './data.mp4',
  '/public/data.mp4',
]
const activeVideoSource = computed(() => videoSourceCandidates[videoSourceIndex.value])

const brainRegions = [
  { id: 'planner', label: '任务规划' },
  { id: 'vision', label: '视觉理解' },
  { id: 'geo', label: '空间推理' },
  { id: 'executor', label: '执行决策' },
]

const brainPathMap = {
  planner: {
    d: 'M70 110 C40 95,38 56,70 38 C94 24,122 31,136 49 C150 67,144 92,122 103 C103 114,86 118,70 110 Z',
    x: 94,
    y: 72,
  },
  vision: {
    d: 'M73 112 C47 122,45 160,75 178 C102 194,131 186,144 166 C156 146,148 126,127 118 C106 110,91 108,73 112 Z',
    x: 98,
    y: 150,
  },
  geo: {
    d: 'M290 110 C320 95,322 56,290 38 C266 24,238 31,224 49 C210 67,216 92,238 103 C257 114,274 118,290 110 Z',
    x: 262,
    y: 72,
  },
  executor: {
    d: 'M287 112 C313 122,315 160,285 178 C258 194,229 186,216 166 C204 146,212 126,233 118 C254 110,269 108,287 112 Z',
    x: 262,
    y: 150,
  },
}

// 统一时间段配置：可按需修改秒数、能力历史和高亮区域
const stageConfigs = [
  {
    start: 0,
    end: 6,
    brainHighlight: ['vision', 'geo'],
    histories: ['道路/土地骨架化', '农田实例分割', '统一坐标、分辨率与切片金字塔'],
  },
  {
    start: 6,
    end: 13,
    brainHighlight: ['vision'],
    histories: ['区域轮廓矢量化'],
  },
  {
    start: 13,
    end: 18,
    brainHighlight: ['planner', 'vision'],
    histories: ['区域可别等级划分'],
  },
  {
    start: 18,
    end: 25,
    brainHighlight: ['planner', 'geo'],
    histories: ['略略略'],
  },
  {
    start: 25,
    end: 30,
    brainHighlight: ['planner', 'executor'],
    histories: ['略略略'],
  },
  {
    start: 30,
    end: 40,
    brainHighlight: ['geo', 'executor'],
    histories: ['略略略'],
  },
  {
    start: 40,
    end: 48,
    brainHighlight: ['vision', 'executor'],
    histories: ['略略略'],
  },
  {
    start: 48,
    end: Number.POSITIVE_INFINITY,
    brainHighlight: ['planner', 'vision', 'geo', 'executor'],
    histories: ['略略略'],
  },
]

const activeStage = computed(() =>
  stageConfigs.find((stage) => currentTime.value >= stage.start && currentTime.value < stage.end),
)

const activeStageIndex = computed(() =>
  stageConfigs.findIndex((stage) => currentTime.value >= stage.start && currentTime.value < stage.end),
)

const activeBrainRegions = computed(() => new Set(activeStage.value?.brainHighlight ?? []))

const brainShapeRegions = computed(() =>
  brainRegions.map((region) => ({
    ...region,
    ...brainPathMap[region.id],
  })),
)

const timelineHistory = computed(() => {
  const items = []

  stageConfigs.forEach((stage) => {
    if (currentTime.value < stage.start) {
      return
    }

    stage.histories.forEach((text) => {
      items.push(text)
    })
  })

  return items
})

const currentStageLabel = computed(() => {
  if (activeStageIndex.value < 0) {
    return '--'
  }
  return `阶段 ${activeStageIndex.value + 1}`
})

const handleTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
}

const tryStartPlayback = async () => {
  if (!videoRef.value) return
  try {
    await videoRef.value.play()
  } catch {
    // 浏览器可能在极少数场景阻止自动播放，这里静默处理
  }
}

const handleLoadedMetadata = () => {
  if (!videoRef.value) return
  videoDuration.value = videoRef.value.duration || 0
  void tryStartPlayback()
}

const handleCanPlay = () => {
  videoStatus.value = 'ready'
  videoErrorMessage.value = ''
}

const handleVideoError = () => {
  if (videoSourceIndex.value < videoSourceCandidates.length - 1) {
    videoSourceIndex.value += 1
    videoStatus.value = 'loading'
    videoErrorMessage.value = ''
    return
  }

  videoStatus.value = 'error'
  videoErrorMessage.value = '视频加载失败：路径已尝试，但当前 MP4 编码可能不被浏览器支持（建议 H.264）。'
}

watch(
  timelineHistory,
  async () => {
    await nextTick()
    if (!historyRef.value) return
    historyRef.value.scrollTop = historyRef.value.scrollHeight
  },
  { flush: 'post' },
)

watch(videoSourceIndex, async () => {
  await nextTick()
  if (!videoRef.value) return
  videoRef.value.load()
  void tryStartPlayback()
})

onMounted(() => {
  void tryStartPlayback()
})

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<template>
  <section class="model-video section">
    <div class="layout">
      <article class="card video-card panel-card">
        <div class="card-title">
          <h2>3D 建模演示</h2>
          <span class="time-chip">当前阶段：{{ currentStageLabel }}</span>
        </div>
        <div class="video-wrap">
          <div v-if="videoStatus === 'loading'" class="video-mask loading-mask">视频加载中...</div>
          <div v-else-if="videoStatus === 'error'" class="video-mask error-mask">
            {{ videoErrorMessage }}
          </div>
          <video
            ref="videoRef"
            class="video-player"
            autoplay
            muted
            loop
            playsinline
            preload="metadata"
            :src="activeVideoSource"
            @timeupdate="handleTimeUpdate"
            @loadedmetadata="handleLoadedMetadata"
            @canplay="handleCanPlay"
            @error="handleVideoError"
          ></video>
        </div>
        <p class="video-hint">
          视频地址：`{{ activeVideoSource }}`
        </p>
      </article>

      <aside class="right-panel panel-card">
        <article class="brain-card inner-card">
          <div class="card-title">
            <h3>大模型功能调用脑图</h3>
          </div>

          <div class="brain-grid">
            <svg viewBox="0 0 360 220" class="brain-svg" aria-label="大脑分区示意图">
              <path
                d="M180 34 C160 32,148 41,143 56 C136 42,122 33,102 35 C73 38,50 58,45 85 C41 105,50 122,66 133 C52 149,50 174,66 191 C85 212,122 216,145 198 C154 213,168 220,180 220 C192 220,206 213,215 198 C238 216,275 212,294 191 C310 174,308 149,294 133 C310 122,319 105,315 85 C310 58,287 38,258 35 C238 33,224 42,217 56 C212 41,200 32,180 34 Z"
                class="brain-outline"
              />
              <line x1="180" y1="38" x2="180" y2="208" class="brain-center-line" />

              <g
                v-for="region in brainShapeRegions"
                :key="region.id"
                class="brain-region"
                :class="{ active: activeBrainRegions.has(region.id) }"
              >
                <path :d="region.d" class="brain-region-shape" />
                <text :x="region.x" :y="region.y" text-anchor="middle" dominant-baseline="middle" class="brain-label">
                  {{ region.label }}
                </text>
              </g>
            </svg>
          </div>
        </article>

        <article class="history-card inner-card">
          <div class="card-title">
            <h3>能力调用历史</h3>
            <span class="history-count">历史 {{ timelineHistory.length }}</span>
          </div>
          <div ref="historyRef" class="history-scroll">
            <p
              v-for="(line, index) in timelineHistory"
              :key="`${index}-${line}`"
              class="history-line"
            >
              <span class="history-dot"></span>
              <span class="history-text">{{ line }}</span>
            </p>
          </div>
        </article>
      </aside>
    </div>

    <div class="config-tips panel-card">
      <p>可维护配置：</p>
      <p>1. `stageConfigs`：按秒定义历史文本和高亮区域；</p>
      <p>2. `brainRegions`：定义脑图分区名称；</p>
      <p>3. `videoSource`：替换视频来源。</p>
      <p v-if="videoDuration > 0">视频总时长：{{ videoDuration.toFixed(1) }}s</p>
    </div>
  </section>
</template>

<style scoped>
.model-video {
  padding-top: 1.5rem;
  padding-bottom: 2rem;
}

.panel-card {
  border-radius: 16px;
  border: 1px solid rgba(170, 220, 255, 0.32);
  background: linear-gradient(180deg, rgba(232, 248, 255, 0.08), rgba(203, 230, 245, 0.03));
  box-shadow: inset 0 0 0 1px rgba(214, 237, 255, 0.08);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 1rem;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.card-title h2,
.card-title h3 {
  font-size: 1.02rem;
  color: #daf3ff;
}

.time-chip {
  font-size: 0.75rem;
  line-height: 1;
  border-radius: 999px;
  padding: 0.35rem 0.55rem;
  border: 1px solid rgba(182, 225, 255, 0.35);
  background: rgba(145, 205, 255, 0.13);
  color: #d9f4ff;
}

.video-card {
  min-height: 620px;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.video-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  border: 1px solid rgba(198, 234, 255, 0.35);
  border-radius: 12px;
  overflow: hidden;
  background: #02060b;
}

.video-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
}

.loading-mask {
  color: #b6d8ed;
  background: rgba(3, 10, 14, 0.55);
}

.error-mask {
  color: #ffd6d6;
  background: rgba(46, 8, 8, 0.72);
}

.video-player {
  width: 100%;
  height: 100%;
  min-height: 520px;
  object-fit: contain;
  background: #000;
}

.video-player::-webkit-media-controls {
  display: none !important;
}

.video-hint {
  margin-top: 0.6rem;
  font-size: 0.8rem;
  color: #9ec8e2;
}

.right-panel {
  display: grid;
  grid-template-rows: minmax(240px, 1fr) minmax(340px, 1.2fr);
  gap: 1rem;
  padding: 1rem;
}

.inner-card {
  border-radius: 12px;
  border: 1px solid rgba(173, 218, 247, 0.3);
  background: rgba(13, 27, 38, 0.5);
  padding: 0.75rem;
}

.brain-card,
.history-card {
  min-height: 0;
}

.brain-grid {
  position: relative;
  width: min(100%, 380px);
  aspect-ratio: 1.64 / 1;
  margin: 0 auto;
  padding: 0.2rem;
  border-radius: 40px;
  border: 1px solid rgba(159, 209, 243, 0.4);
  background: radial-gradient(circle at 50% 40%, rgba(156, 209, 248, 0.16), rgba(16, 31, 44, 0.95));
}

.brain-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.brain-outline {
  fill: rgba(16, 34, 48, 0.65);
  stroke: rgba(176, 226, 255, 0.52);
  stroke-width: 2;
}

.brain-center-line {
  stroke: rgba(176, 226, 255, 0.42);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}

.brain-region {
  transition: all 0.25s ease;
}

.brain-region-shape {
  fill: rgba(33, 66, 91, 0.62);
  stroke: rgba(157, 209, 244, 0.42);
  stroke-width: 1.2;
}

.brain-label {
  font-size: 13px;
  fill: #bad9eb;
  font-weight: 500;
}

.brain-region.active {
  filter: drop-shadow(0 0 10px rgba(129, 208, 255, 0.42));
}

.brain-region.active .brain-region-shape {
  fill: rgba(186, 232, 255, 0.92);
  stroke: rgba(231, 247, 255, 0.98);
}

.brain-region.active .brain-label {
  fill: #132736;
  font-weight: 700;
}

.history-count {
  font-size: 0.78rem;
  color: #9fcae3;
}

.history-scroll {
  height: calc(100% - 1.75rem);
  overflow-y: auto;
  border: 1px solid rgba(159, 209, 243, 0.32);
  border-radius: 10px;
  padding: 0.75rem;
  background: rgba(6, 20, 30, 0.45);
}

.history-line {
  margin: 0 0 0.55rem;
  color: #e3f5ff;
  font-size: 0.83rem;
  line-height: 1.45;
  word-break: break-word;
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
}

.history-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex-shrink: 0;
  background: #95d8ff;
  box-shadow: 0 0 8px rgba(149, 216, 255, 0.75);
}

.history-text {
  flex: 1;
}

.history-line:last-child {
  margin-bottom: 0;
}

.config-tips {
  margin-top: 0.9rem;
  color: #9ec5dd;
  font-size: 0.79rem;
  line-height: 1.5;
  padding: 0.75rem 1rem;
}

@media (max-width: 1080px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .right-panel {
    grid-template-columns: 1fr;
    grid-template-rows: 260px 340px;
  }

  .video-player {
    min-height: 420px;
  }
}
</style>
