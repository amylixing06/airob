import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/generator',
      name: 'generator',
      component: () => import('../views/Generator.vue')
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import('../views/Preview.vue')
    }
  ]
})

export default router 