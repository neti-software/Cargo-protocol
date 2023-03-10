import {RouteConfig} from "vue-router";
import Analytics from "./Analytics.vue";
import RouterWrapper from "@/modules/_shared/common/router-wrapper/router-wrapper.vue";

export const analyticsRouting: RouteConfig = {
    path: '/analytics',
    component: RouterWrapper,
    children: [
        {
            path: '',
            name: 'anal-main',
            component: Analytics
        },
    ]
};
