import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/apex",
    name: "Home",
    component: () => import(/* webpackChunkName: "home" */ "../views/Home.vue"),
  },
  {
    path: "/taiko",
    name: "Taiko",
    component: () =>
      import(/* webpackChunkName: "home" */ "../views/Taiko.vue"),
  },
  {
    path: "/earth",
    name: "earth",
    component: () =>
      import(/* webpackChunkName: "home" */ "../views/earth.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
