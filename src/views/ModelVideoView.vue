<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const videoRef = ref(null)
const historyRef = ref(null)
const currentTime = ref(0)
const previousTime = ref(0)
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

const brainImageMap = {
  gray: '/brain_gray.jpg',
  red: '/brain_red.jpg',
  green: '/brain_green.jpg',
  yellow: '/brain_yellow.jpg',
  blue: '/brain_blue.jpg',
}

// 时间段配置：后续只改这里即可
const stageConfigs = [
  {
    start: 0,
    end: 6,
    brainFlash: { color: 'red', blink: true, intervalMs: 320 },
    histories: ['道路/土地骨架化', '农田实例分割', '统一坐标、分辨率与切片金字塔'],
  },
  {
    start: 6,
    end: 13,
    brainFlash: { color: 'yellow', blink: true, intervalMs: 320 },
    histories: ['区域轮廓矢量化'],
  },
  {
    start: 13,
    end: 18,
    brainFlash: { color: 'green', blink: true, intervalMs: 320 },
    histories: ['区域可别等级划分'],
  },
  {
    start: 18,
    end: 25,
    brainFlash: { color: 'blue', blink: true, intervalMs: 320 },
    histories: ['略略略'],
  },
  {
    start: 25,
    end: 30,
    brainFlash: { color: 'red', blink: true, intervalMs: 320 },
    histories: ['略略略'],
  },
  {
    start: 30,
    end: 40,
    brainFlash: { color: 'yellow', blink: true, intervalMs: 320 },
    histories: ['略略略'],
  },
  {
    start: 40,
    end: 48,
    brainFlash: { color: 'blue', blink: true, intervalMs: 320 },
    histories: ['略略略'],
  },
  {
    start: 48,
    end: Number.POSITIVE_INFINITY,
    brainFlash: { color: 'green', blink: true, intervalMs: 320 },
    histories: ['略略略'],
  },
]

const activeStage = computed(() =>
  stageConfigs.find((stage) => currentTime.value >= stage.start && currentTime.value < stage.end),
)
const activeStageIndex = computed(() =>
  stageConfigs.findIndex(
    (stage) => currentTime.value >= stage.start && currentTime.value < stage.end,
  ),
)
const brainBlinkOn = ref(true)
const brainBlinkTimer = ref(null)

const clearBrainBlinkTimer = () => {
  if (!brainBlinkTimer.value) return
  clearInterval(brainBlinkTimer.value)
  brainBlinkTimer.value = null
}

const setupBrainBlinkByStage = () => {
  clearBrainBlinkTimer()

  const flashCfg = activeStage.value?.brainFlash
  brainBlinkOn.value = true
  if (!flashCfg || !flashCfg.blink) return

  const intervalMs = Math.max(120, flashCfg.intervalMs || 320)
  brainBlinkTimer.value = setInterval(() => {
    brainBlinkOn.value = !brainBlinkOn.value
  }, intervalMs)
}

const activeBrainImage = computed(() => {
  const flashCfg = activeStage.value?.brainFlash
  if (!flashCfg || !flashCfg.color) return brainImageMap.gray

  const highlightImage = brainImageMap[flashCfg.color] || brainImageMap.gray
  if (!flashCfg.blink) return highlightImage
  return brainBlinkOn.value ? highlightImage : brainImageMap.gray
})

const preloadBrainImages = () => {
  Object.values(brainImageMap).forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

const displayedHistory = ref([])
const processedStageIndex = ref(-1)
const historyId = ref(0)
const appendTimerIds = []
const lastHistoryScrollHeight = ref(0)

const clearAppendTimers = () => {
  appendTimerIds.forEach((id) => clearTimeout(id))
  appendTimerIds.length = 0
}

const resetHistoryTimeline = () => {
  clearAppendTimers()
  displayedHistory.value = []
  processedStageIndex.value = -1
  historyId.value = 0
  lastHistoryScrollHeight.value = 0

  if (historyRef.value) {
    historyRef.value.scrollTop = 0
  }
}

const appendStageHistory = (stageIndex) => {
  const stage = stageConfigs[stageIndex]
  if (!stage) return

  stage.histories.forEach((text, idx) => {
    const timerId = setTimeout(() => {
      displayedHistory.value.push({
        id: historyId.value++,
        text,
      })
    }, idx * 260)

    appendTimerIds.push(timerId)
  })
}

const handleTimeUpdate = () => {
  if (!videoRef.value) return
  const now = videoRef.value.currentTime

  // 视频循环或回拖时，重置历史列表，再重新按阶段追加
  if (now + 0.5 < previousTime.value) {
    resetHistoryTimeline()
  }

  previousTime.value = now
  currentTime.value = now
}

const tryStartPlayback = async () => {
  if (!videoRef.value) return
  try {
    await videoRef.value.play()
  } catch {
    // 浏览器自动播放策略可能拦截，这里保持静默
  }
}

const handleCanPlay = () => {
  videoStatus.value = 'ready'
  videoErrorMessage.value = ''
  void tryStartPlayback()
}

const handleVideoError = () => {
  if (videoSourceIndex.value < videoSourceCandidates.length - 1) {
    videoSourceIndex.value += 1
    videoStatus.value = 'loading'
    videoErrorMessage.value = ''
    return
  }
  videoStatus.value = 'error'
  videoErrorMessage.value = '视频加载失败，请更换浏览器可解码的 MP4 文件。'
}

watch(activeStageIndex, (stageIndex) => {
  if (stageIndex < 0) return
  if (stageIndex <= processedStageIndex.value) return

  for (let idx = processedStageIndex.value + 1; idx <= stageIndex; idx += 1) {
    appendStageHistory(idx)
  }
  processedStageIndex.value = stageIndex
})

watch(activeStageIndex, () => {
  setupBrainBlinkByStage()
})

watch(
  displayedHistory,
  async () => {
    await nextTick()
    if (!historyRef.value) return
    const el = historyRef.value
    const currentHeight = el.scrollHeight
    const overflow = currentHeight > el.clientHeight

    if (!overflow) {
      lastHistoryScrollHeight.value = currentHeight
      return
    }

    const delta = Math.max(0, currentHeight - lastHistoryScrollHeight.value)
    el.scrollBy({
      top: delta || 48,
      behavior: 'smooth',
    })
    lastHistoryScrollHeight.value = currentHeight
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
  document.body.classList.add('model-video-page')
  preloadBrainImages()
  setupBrainBlinkByStage()
  void tryStartPlayback()
})

onBeforeUnmount(() => {
  document.body.classList.remove('model-video-page')
  clearAppendTimers()
  clearBrainBlinkTimer()
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<template>
  <section class="model-video section">
    <div class="layout">
      <article class="video-card panel-card">
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
            @canplay="handleCanPlay"
            @error="handleVideoError"
          ></video>
        </div>
      </article>

      <aside class="right-panel panel-card">
        <article class="brain-card inner-card">
          <div class="card-title">
            <h3>大模型功能调用脑图</h3>
          </div>

          <div class="brain-grid">
            <img :src="activeBrainImage" alt="大脑能力调用状态" class="brain-image" />
          </div>
        </article>

        <article class="history-card inner-card">
          <div class="card-title">
            <h3>能力调用历史</h3>
            <span class="history-count">{{ displayedHistory.length }}</span>
          </div>
          <div ref="historyRef" class="history-scroll">
            <TransitionGroup name="history-list" tag="div">
              <p v-for="item in displayedHistory" :key="item.id" class="history-line">
                <span class="history-dot"></span>
                <span class="history-text">{{ item.text }}</span>
              </p>
            </TransitionGroup>
          </div>
        </article>
      </aside>
    </div>
  </section>
</template>

<style scoped>
:global(body.model-video-page) {
  background: radial-gradient(circle at 24% 12%, #fdfef8 0%, #f6f7f1 48%, #ecefe3 100%);
  color: #2f3f2f;
}

:global(body.model-video-page .main-content) {
  background: transparent;
}

.model-video {
  --theme-r: 227;
  --theme-g: 230;
  --theme-b: 227;

  padding-top: 1.5rem;
  padding-bottom: 2rem;
  min-height: calc(100vh - 64px - 52px);
}

.panel-card {
  border-radius: 16px;
  border: 1px solid rgba(225, 226, 214, 0.92);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.96),
    rgba(var(--theme-r), var(--theme-g), var(--theme-b), 0.62)
  );
  box-shadow:
    0 8px 24px rgba(83, 84, 67, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.65);
}

.video-card.panel-card,
.right-panel.panel-card {
  border: none;
  background: transparent;
  box-shadow: none;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 0.32rem;
  align-items: stretch;
  padding: 0.45rem;
  border: 10px solid #0f1110;
  border-radius: 22px;
  background: linear-gradient(180deg, #1b1f1d 0%, #141816 100%);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.34),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  margin-bottom: 5.2rem;
}

.layout::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -3.65rem;
  width: 1.2rem;
  height: 3.5rem;
  transform: translateX(-50%);
  border-radius: 0.45rem;
  background: linear-gradient(180deg, #2a2e2b 0%, #1a1e1c 70%, #131614 100%);
  border: 1px solid #0c0f0d;
  box-shadow:
    0 8px 12px rgba(0, 0, 0, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  z-index: 2;
}

.layout::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5.45rem;
  width: 13.2rem;
  height: 2rem;
  transform: translateX(-50%);
  border-radius: 2.4rem / 1.15rem;
  background: radial-gradient(ellipse at 50% 42%, #3a3f3c 0%, #242927 58%, #171a19 100%);
  border: 1px solid #0d100f;
  box-shadow:
    0 10px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  z-index: 1;
}

.video-card {
  height: 620px;
  padding: 1rem;
}

.video-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(214, 216, 202, 0.9);
  border-radius: 12px;
  overflow: hidden;
  background: rgb(var(--theme-r) var(--theme-g) var(--theme-b));
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
  color: #f2f4f0;
  background: rgba(8, 13, 9, 0.55);
}

.error-mask {
  color: #ffd4d4;
  background: rgba(54, 12, 12, 0.72);
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: rgb(var(--theme-r) var(--theme-g) var(--theme-b));
}

.video-player::-webkit-media-controls {
  display: none !important;
}

.right-panel {
  height: 620px;
  display: grid;
  grid-template-rows: 255px 1fr;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

.inner-card {
  border-radius: 12px;
  border: 1px solid rgba(220, 222, 210, 0.95);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(237, 239, 230, 0.68));
  padding: 0.75rem;
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.card-title h3 {
  font-size: 1.02rem;
  color: #2f3d2f;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.brain-grid {
  position: relative;
  width: min(100%, 380px);
  aspect-ratio: 1.64 / 1;
  margin: 0 auto;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 28px;
  border: 1px solid rgba(214, 217, 202, 0.9);
  background: rgb(247, 247, 247);
  overflow: hidden;
}

.brain-image {
  width: 90%;
  height: 90%;
  display: block;
  margin: 0;
  object-fit: contain;
  border-radius: 22px;
  max-width: 100%;
  max-height: 100%;
}

.history-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.history-count {
  min-width: 2rem;
  text-align: right;
  font-size: 0.84rem;
  color: #6f7f6d;
  font-weight: 600;
}

.history-scroll {
  flex: 1;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  border: 1px solid rgba(218, 222, 208, 0.92);
  border-radius: 10px;
  padding: 0.8rem 0.8rem 0.7rem;
  background: linear-gradient(180deg, rgba(253, 254, 251, 0.95), rgba(236, 239, 231, 0.82));
  scroll-behavior: smooth;
}

.history-line {
  margin: 0 0 0.62rem;
  color: #394838;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: 600;
  word-break: break-word;
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
}

.history-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex-shrink: 0;
  background: #b2bd9f;
  box-shadow: 0 0 6px rgba(162, 176, 142, 0.5);
}

.history-text {
  flex: 1;
}

.history-line:last-child {
  margin-bottom: 0;
}

.history-list-enter-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.history-list-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.history-scroll::-webkit-scrollbar {
  width: 7px;
}

.history-scroll::-webkit-scrollbar-track {
  background: rgba(193, 201, 179, 0.25);
  border-radius: 8px;
}

.history-scroll::-webkit-scrollbar-thumb {
  background: rgba(145, 157, 128, 0.55);
  border-radius: 8px;
}

@media (max-width: 1080px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 0.52rem;
    padding: 0.6rem;
    margin-bottom: 5rem;
  }

  .video-card {
    height: 460px;
  }

  .right-panel {
    height: 560px;
    grid-template-rows: 240px 1fr;
  }
}
</style>
