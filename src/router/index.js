import { createRouter, createWebHistory } from 'vue-router'
import OverviewView from '@/views/OverviewView.vue'
import InteractView from '@/views/InteractView.vue'
import DataView from '@/views/DataView.vue'
import ModelVideoView from '@/views/ModelVideoView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/overview',
    },
    {
      path: '/overview',
      name: 'overview',
      component: OverviewView,
      meta: { title: '概览' },
    },
    {
      path: '/interact',
      name: 'interact',
      component: InteractView,
      meta: { title: '互动' },
    },
    {
      path: '/data',
      name: 'data',
      component: DataView,
      meta: { title: '数据' },
    },
    {
      path: '/model-video',
      name: 'model-video',
      component: ModelVideoView,
      meta: { title: '3D 建模演示' },
    },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title || ''} · 星土感知`
})

export default router
