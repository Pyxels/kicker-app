import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router';
import { pb } from '@/lib/pb';

import MatchView from '@/views/MatchView.vue';
import MatchSelectView from '@/views/MatchSelect.vue';
import LoginView from '@/views/LoginView.vue';
import HomeView from './views/HomeView.vue';
import LogoutView from './views/LogoutView.vue';
import UserSettingsView from './views/UserSettingsView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogoutView,
  },
  {
    path: '/account/settings',
    name: 'account-settings',
    component: UserSettingsView,
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/match',
    name: 'match-select',
    component: MatchSelectView,
  },
  {
    path: '/match/:id',
    name: 'match',
    component: MatchView,
    props: (route: RouteLocationNormalized) => ({ matchId: route.params.id }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const isLoggedIn = pb.authStore.isValid;

  if (to.path !== '/login' && !isLoggedIn) {
    next({ path: '/login' });
  } else if (to.path === '/login' && isLoggedIn) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
