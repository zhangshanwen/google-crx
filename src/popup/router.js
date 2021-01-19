import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/",
      component: () => import(/* webpackChunkName: "home" */ "./App.vue"),
      meta: { title: "" }
    },
    {
      path: "/home",
      component: () =>
        import(/* webpackChunkName: "home" */ "./components/Home.vue"),
      meta: { title: "" }
    },

    {
      path: "/login",
      component: () =>
        import(/* webpackChunkName: "login" */ "./components/Login.vue"),
      meta: { title: "Login" }
    }
  ]
});
