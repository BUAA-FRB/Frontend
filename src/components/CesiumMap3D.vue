<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

// 河南省周口地区农田（全国小麦主产区）
const FARM_LON = 114.65
const FARM_LAT = 33.62
const GOOGLE_API_KEY = 'AIzaSyDqEhyNZFNTP3-XcCjTHxmO_TdLKod7zt8'

const mapContainer = ref(null)
const isReady = ref(false)
const loadError = ref(false)
const errorMsg = ref('')

let gmap = null
let animFrame = null
let heading = 0
let lastTs = 0

/** 动态加载 Google Maps JS API（仅一次，稳定版 weekly 频道） */
function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.Map) { resolve(); return }

    if (document.querySelector('script[data-gmaps-sat]')) {
      const t = setInterval(() => {
        if (window.google?.maps?.Map) { clearInterval(t); resolve() }
      }, 150)
      return
    }

    window.__gmSatReady = resolve
    const s = document.createElement('script')
    s.setAttribute('data-gmaps-sat', '1')
    // 使用稳定 weekly 频道，无需特殊 Map ID，不依赖 alpha 接口
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
    zoom: 17,
    mapTypeId: 'satellite',   // 卫星影像
    tilt: 45,                 // 45° 斜拍（有覆盖时自动启用）
    heading: 0,
    disableDefaultUI: true,
    gestureHandling: 'none',
    keyboardShortcuts: false,
    backgroundColor: '#050d0a',
  })

  // 等地图瓦片首次加载完毕再标记就绪、启动动画
  google.maps.event.addListenerOnce(gmap, 'idle', () => {
    isReady.value = true
    setTimeout(startOrbit, 400)
  })
}

function startOrbit() {
  // 限速约 20fps，避免频繁调用 setHeading 拖慢渲染
  const orbit = (ts) => {
    animFrame = requestAnimationFrame(orbit)
    if (ts - lastTs < 50) return
    lastTs = ts
    heading = (heading + 0.6) % 360
    if (gmap) gmap.setHeading(heading)
  }
  animFrame = requestAnimationFrame(orbit)
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
  gmap = null
})
</script>

<template>
  <div class="map-wrap">
    <!-- 加载蒙层 -->
    <div v-if="!isReady && !loadError" class="map-loading">
      <div class="loading-ring"></div>
      <span>正在加载 3D 卫星影像...</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="loadError" class="map-error">
      <span class="err-icon">⚠️</span>
      <span>{{ errorMsg || '地图加载失败，请检查网络或 API Key' }}</span>
    </div>

    <!-- 顶部信息浮层 -->
    <div v-if="isReady" class="map-overlay-top">
      <span class="map-badge">🛰️ 农田卫星视图</span>
      <span class="map-coord">114.65°E · 33.62°N</span>
    </div>

    <!-- Google Maps 3D 容器 -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- 底部信息条 -->
    <div v-if="isReady" class="map-footer">
      <span>📍 河南省周口·小麦主产区</span>
      <span>遥感影像匹配区域</span>
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

/* Google Maps 直接渲染到此容器，必须有明确尺寸 */
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
  to { transform: rotate(360deg); }
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
  padding: 0.45rem 0.9rem;
  background: linear-gradient(to top, rgba(5, 13, 10, 0.88), transparent);
  pointer-events: none;
  font-size: 0.68rem;
  color: #6b9e7a;
}

.map-footer span:last-child {
  color: rgba(74, 222, 128, 0.55);
  font-size: 0.62rem;
}
</style>
