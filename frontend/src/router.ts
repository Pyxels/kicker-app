import { createRouter, createWebHistory } from "vue-router";
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

export default router;
