import {RouteConfig} from "vue-router";
import RouterWrapper from "@/modules/_shared/common/router-wrapper/router-wrapper.vue";
import Aggregator from "@/modules/aggregator/Aggregator.vue";
import AggregatorDetails from "@/modules/aggregator/components/aggregator-details.vue";

export const aggregatorRouting: RouteConfig = {
  path: "/rebalancer",
  component: RouterWrapper,
  children: [
    {
      path: ":id?",
      name: "rebalancer-main",
      component: Aggregator
    }
  ]
};
