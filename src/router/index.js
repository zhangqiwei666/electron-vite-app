import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/workspace',
    component: () => import('../views/WorkspaceLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/workspace/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/workspace/Dashboard.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('../views/workspace/MessageCenter.vue'),
        meta: { title: '信息中心' }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('../views/workspace/Analytics.vue'),
        meta: { title: '统计分析' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/workspace/UserData.vue'),
        meta: { title: '用户数据' }
      },
      {
        path: 'files',
        name: 'Files',
        component: () => import('../views/workspace/DataManagement.vue'),
        meta: { title: '资料管理' }
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('../views/workspace/SystemMonitor.vue'),
        meta: { title: '系统监控' }
      },
      {
        path: 'devices',
        name: 'Devices',
        component: () => import('../views/DeviceManager.vue'),
        meta: { title: '设备管理' }
      },
      {
        path: 'resume',
        name: 'ResumeOptimizer',
        component: () => import('../views/workspace/ResumeOptimizer.vue'),
        meta: { title: '智能简历' }
      }
    ]
  },
  {
    path: '/chat',
    name: 'ChatAI',
    component: () => import('../views/ChatAI.vue'),
    meta: { requiresAuth: false } // 独立窗口，不限制鉴权
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：未登录则跳转到登录页
router.beforeEach((to, from, next) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/workspace/dashboard')
  } else {
    next()
  }
})

export default router
