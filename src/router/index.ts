import { createRouter, createWebHistory } from 'vue-router'
import TicketView from '../views/TicketView.vue'
import AttendanceView from '../views/AttendanceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/nhanve'
    },
    {
      path: '/nhanve',
      name: 'nhanve',
      component: TicketView
    },
    {
      path: '/diemdanh',
      name: 'diemdanh',
      component: AttendanceView
    }
  ]
})

export default router
