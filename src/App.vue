<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <header class="navbar">
      <div class="navbar-inner">
        <div class="logo">
          <span class="logo-icon">🌾</span>
          <span class="logo-text">星土感知</span>
          <span class="logo-sub">农业灾害治理大模型</span>
        </div>
        <nav class="nav-links">
          <router-link to="/overview" class="nav-item" active-class="active">
            <span class="nav-icon">◈</span>概览
          </router-link>
          <router-link to="/interact" class="nav-item" active-class="active">
            <span class="nav-icon">◈</span>互动
          </router-link>
          <router-link to="/data" class="nav-item" active-class="active">
            <span class="nav-icon">◈</span>数据
          </router-link>
          <router-link to="/model-video" class="nav-item" active-class="active">
            <span class="nav-icon">◈</span>3D演示
          </router-link>
        </nav>
        <div class="nav-badge">Beta v1.0</div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <p>© 2026 星土感知 · 检索增强与多智能体闭环农业灾害治理大模型</p>
    </footer>
  </div>
</template>

<style>
/* ===== 全局重置 ===== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --green-900: #14532d;
  --green-800: #166534;
  --green-700: #15803d;
  --green-600: #16a34a;
  --green-500: #22c55e;
  --green-400: #4ade80;
  --green-300: #86efac;
  --green-100: #dcfce7;
  --green-50:  #f0fdf4;

  --bg-dark:   #0a0f0d;
  --bg-card:   #111a14;
  --bg-glass:  rgba(22, 101, 52, 0.12);
  --border:    rgba(34, 197, 94, 0.2);
  --text-main: #e8f5e9;
  --text-muted:#6b9e7a;
  --shadow-green: 0 0 40px rgba(34,197,94,0.15);

  --font: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --navbar-h: 64px;
}

html { scroll-behavior: smooth; }

body {
  font-family: var(--font);
  background: var(--bg-dark);
  color: var(--text-main);
  min-height: 100vh;
  line-height: 1.6;
}

a { text-decoration: none; color: inherit; }

/* ===== 导航栏 ===== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--navbar-h);
  background: rgba(10, 15, 13, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.logo-icon { font-size: 1.5rem; }

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--green-400);
  letter-spacing: 0.05em;
}

.logo-sub {
  font-size: 0.7rem;
  color: var(--text-muted);
  border-left: 1px solid var(--border);
  padding-left: 0.6rem;
  margin-left: 0.2rem;
  line-height: 1.2;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1.1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  color: var(--green-400);
  background: var(--bg-glass);
  border-color: var(--border);
}

.nav-item.active {
  color: var(--green-400);
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.nav-icon { font-size: 0.65rem; opacity: 0.7; }

.nav-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid var(--border);
  color: var(--green-400);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .navbar-inner {
    padding: 0 1rem;
    gap: 0.75rem;
  }
  .logo-sub { display: none; }
  .nav-badge { display: none; }
  .nav-links { gap: 0.1rem; }
  .nav-item {
    padding: 0.4rem 0.75rem;
    font-size: 0.82rem;
  }
  .nav-icon { display: none; }
}

/* ===== 主内容 ===== */
.main-content {
  min-height: calc(100vh - var(--navbar-h) - 52px);
  padding-top: var(--navbar-h);
}

/* ===== 底部 ===== */
.footer {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.78rem;
}

/* ===== 页面切换动画 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== 通用工具类 ===== */
.section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: var(--green-400);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card:hover {
  border-color: rgba(34, 197, 94, 0.4);
  box-shadow: var(--shadow-green);
}
</style>
