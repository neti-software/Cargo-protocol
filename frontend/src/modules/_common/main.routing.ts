import {RouteConfig} from "vue-router";
import NotFound from "./404.vue";
import NotAuthorised from "@/modules/_common/not-authorised.vue";

export const notFound: RouteConfig = {
    // will match everything
    path: '*',
    component: NotFound
}
