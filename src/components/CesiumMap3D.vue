<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// 山东农田监测点（35°34'11.98"N  118°27'54.86"E  海拔 117m）
const FARM_LON = 118.4652
const FARM_LAT = 35.5700

// 视角高度：从 669m（zoom 17）单程俯冲到 240m（zoom 18.8），到底后静止
const ZOOM_FAR  = 17.0
const ZOOM_NEAR = 18.8
const ZOOM_SPD  = 0.014  // 每帧步长，约 8s 俯冲到底

// ── 高亮四边形（西北→东北→东南→西南，顺时针）──
const FIELD_POLYGON = [
  { lat: 35.570250, lng: 118.465047 },  // 西北
  { lat: 35.570181, lng: 118.465500 },  // 东北
  { lat: 35.569817, lng: 118.465408 },  // 东南
  { lat: 35.569867, lng: 118.464944 },  // 西南
]

const GOOGLE_API_KEY = 'AIzaSyDqEhyNZFNTP3-XcCjTHxmO_TdLKod7zt8'

const mapContainer = ref(null)
const isReady = ref(false)
const loadError = ref(false)
const errorMsg = ref('')
const isPaused = ref(false)

let gmap        = null
let polyOverlay = null
let animFrame   = null
let lastTs      = 0
let zoomCur     = ZOOM_FAR
let zoomDone    = false   // 俯冲完成标志
let pPhase      = 0       // 高亮脉冲相位

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve()
      return
    }
    if (document.querySelector('script[data-gmaps-sat]')) {
      const t = setInterval(() => {
        if (window.google?.maps?.Map) {
          clearInterval(t)
          resolve()
        }
      }, 150)
      return
    }
    window.__gmSatReady = resolve
    const s = document.createElement('script')
    s.setAttribute('data-gmaps-sat', '1')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&callback=__gmSatReady`
    s.async = true
    s.onerror = () => reject(new Error('Google Maps 脚本加载失败，请检查网络/API Key'))
    document.head.appendChild(s)
  })
}

async function initMap() {
  await loadGoogleMapsScript()

  gmap = new google.maps.Map(mapContainer.value, {
    center: { lat: FARM_LAT, lng: FARM_LON },
    zoom: ZOOM_FAR,
    mapTypeId: 'satellite',
    tilt: 45,
    heading: 0,
    disableDefaultUI: true,
    gestureHandling: 'none',
    keyboardShortcuts: false,
    backgroundColor: '#050d0a',
  })

  google.maps.event.addListenerOnce(gmap, 'idle', () => {
    addHighlight()
    isReady.value = true
    setTimeout(startAnim, 400)
  })
}

function addHighlight() {
  polyOverlay = new google.maps.Polygon({
    paths:         FIELD_POLYGON,
    fillColor:     '#22c55e',
    fillOpacity:   0.18,
    strokeColor:   '#4ade80',
    strokeOpacity: 0.9,
    strokeWeight:  2,
    map:           gmap,
  })
}

function startAnim() {
  const tick = (ts) => {
    animFrame = requestAnimationFrame(tick)
    if (ts - lastTs < 50) return
    lastTs = ts

    if (isPaused.value || !gmap) return

    // ── 单程俯冲，到底静止 ──────────────────
    if (!zoomDone) {
      zoomCur += ZOOM_SPD
      if (zoomCur >= ZOOM_NEAR) { zoomCur = ZOOM_NEAR; zoomDone = true }
      gmap.setZoom(zoomCur)
    }

    // ── 高亮脉冲（始终运行）──────────────────
    if (polyOverlay) {
      pPhase += 0.08
      polyOverlay.setOptions({
        fillOpacity:   0.12 + Math.abs(Math.sin(pPhase)) * 0.18,
        strokeOpacity: 0.6  + Math.abs(Math.sin(pPhase)) * 0.4,
      })
    }
  }
  animFrame = requestAnimationFrame(tick)
}

function togglePause() {
  isPaused.value = !isPaused.value
}

onMounted(async () => {
  try {
    await initMap()
  } catch (e) {
    console.error('Google Maps 初始化失败:', e)
    errorMsg.value = e.message || '未知错误'
    loadError.value = true
  }
})

onBeforeUnmount(() => {
  if (animFrame) cancelAnimationFrame(animFrame)
  if (polyOverlay) polyOverlay.setMap(null)
  gmap = null
})
</script>

<template>
  <div class="map-wrap">
    <!-- 加载蒙层 -->
    <div v-if="!isReady && !loadError" class="map-loading">
      <div class="loading-ring"></div>
      <span>正在加载卫星影像...</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="loadError" class="map-error">
      <span class="err-icon">⚠️</span>
      <span>{{ errorMsg || '地图加载失败，请检查网络或 API Key' }}</span>
    </div>

    <!-- 顶部信息栏 -->
    <div v-if="isReady" class="map-overlay-top">
      <span class="map-badge">🛰️ 农田卫星视图</span>
      <span class="map-coord">118.47°E · 35.57°N · 117m</span>
    </div>

    <!-- Google Maps 容器 -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- 底部：地点 + 暂停按钮 -->
    <div v-if="isReady" class="map-footer">
      <span>📍 山东·农田监测区</span>
      <button class="btn-pause" @click="togglePause">
        <span v-if="isPaused">▶ 继续</span>
        <span v-else>⏸ 静止</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.map-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #050d0a;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* ——— 加载 / 错误 ——— */
.map-loading,
.map-error {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  background: rgba(5, 13, 10, 0.92);
}

.map-loading {
  color: #6b9e7a;
  font-size: 0.82rem;
}
.map-error {
  color: #f87171;
  font-size: 0.8rem;
  padding: 0 1.5rem;
  text-align: center;
}
.err-icon {
  font-size: 1.8rem;
}

.loading-ring {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(34, 197, 94, 0.15);
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ——— 顶部浮层 ——— */
.map-overlay-top {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.map-badge {
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(5, 13, 10, 0.75);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
  letter-spacing: 0.04em;
}

.map-coord {
  font-size: 0.68rem;
  font-family: monospace;
  background: rgba(5, 13, 10, 0.75);
  color: #6b9e7a;
  border: 1px solid rgba(34, 197, 94, 0.15);
  padding: 0.22rem 0.55rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* ——— 底部信息条 ——— */
.map-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.9rem;
  background: linear-gradient(to top, rgba(5, 13, 10, 0.9), transparent);
  font-size: 0.68rem;
  color: #6b9e7a;
}

/* ——— 暂停/继续按钮 ——— */
.btn-pause {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.65rem;
  border-radius: 20px;
  border: 1px solid rgba(34, 197, 94, 0.4);
  background: rgba(5, 13, 10, 0.8);
  color: #4ade80;
  font-size: 0.68rem;
  font-family: inherit;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition:
    background 0.2s,
    border-color 0.2s;
}

.btn-pause:hover {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.7);
}
</style>
