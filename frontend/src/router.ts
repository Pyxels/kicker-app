import { createRouter, createWebHistory } from "vue-router";
import { pb } from "@/lib/pb";

import MatchView from "@/views/MatchView.vue";
import MatchSelectView from "@/views/MatchSelect.vue";

const routes = [
  {
    path: "/match",
    name: "match-select",
    component: MatchSelectView,
  },
  {
    path: "/match/:id",
    name: "match",
    component: MatchView,
    props: (route: any) => ({ matchId: route.params.id }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const isLoggedIn = pb.authStore.isValid;

  if (to.path !== "/login" && !isLoggedIn) {
    next({ path: "/login" });
  } else if (to.path === "/login" && isLoggedIn) {
    next({ path: "/" });
  } else {
    next();
  }
});

export default router;
