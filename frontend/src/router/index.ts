import Vue from "vue";
import VueRouter, {RouteConfig} from "vue-router";
import {analyticsRouting} from "@/modules/analytics/analytics.routing";
import Layout from "@/modules/_shared/common/layout/layout.vue";
import {adminRouting} from "@/modules/admin/admin.routing";
import {celoRouting} from "@/modules/celo/celo.routing";
import {notFound} from "@/modules/_common/main.routing";
import {portfolioRouting} from "@/modules/portfolio/portfolio.routing";
import {aggregatorRouting} from "@/modules/aggregator/aggregator.routing";
import CommonStore from "@/store/common.store";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {path: "", redirect: "rebalancer"},
  {
    path: "/",
    component: Layout,
    children: [portfolioRouting, aggregatorRouting, analyticsRouting, adminRouting, celoRouting]
  },
  notFound
];

const analyticsRoutes: RouteConfig[] = [
  {path: "", redirect: "analytics"},
  {
    path: "/",
    component: Layout,
    children: [analyticsRouting]
  },
  notFound
];

const router = new VueRouter({
  routes: process.env.VUE_APP_ROUTER_MODE === "analytics" ? analyticsRoutes : routes,
  mode: "history"
});

router.afterEach((to, from) => {
  CommonStore.setHistory(!!to.name);
});
export default router;
