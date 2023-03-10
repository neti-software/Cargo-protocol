import {RouteConfig} from "vue-router";
import Portfolio from "@/modules/portfolio/Portfolio.vue";
import RouterWrapper from "@/modules/_shared/common/router-wrapper/router-wrapper.vue";

export const portfolioRouting: RouteConfig = {
    path: '/portfolio',
    component: RouterWrapper,
    children: [
        {
            path: ":id?",
            name: 'potfolio-main',
            component: Portfolio
        },
    ]
};
