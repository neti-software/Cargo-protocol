import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import '@/styles/utils.scss'
import '@/styles/animations.scss'
import '@/styles/global.scss'
import 'animate.css';
import BigNumber from "bignumber.js";
import NumbersService from "@/services/numbers.service";
import UserAgentService from "@/services/user-agent.service";

Vue.config.productionTip = false

Vue.use(VueToast);

Vue.filter('date', function (value: Date | string, mode?: 'date' | 'time' | 'datetime') {
    if (value) {
        switch (mode) {
            case "time":
                return new Date(value).toLocaleTimeString();
            case "datetime":
                return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`;
            case "date":
            default:
                return new Date(value).toLocaleDateString();
        }
    }
});

Vue.filter('number', function (value: number | string, decimalPlaces?: number) {
    const number = Number(value);
    if (!isNaN(number)) {
        return NumbersService.parseNumericValue(number, decimalPlaces);
    }
    return '';
});

Vue.filter('smallNumber', function (value: number | string) {
    return NumbersService.parseSmallValues(value);
});

Vue.filter('WeiNumber', function (value: number | string, decimalPlaces?: number) {
    const number = new BigNumber(value.toString()).div(1e18).toNumber();
    if (!isNaN(number)) {
        return NumbersService.parseNumericValue(number, decimalPlaces);
    }
    return '';
});

Vue.filter('percent', function (value: number, numericValue: boolean = false) {
    let number = value;
    if (!numericValue) {
        number = value * 100;
    }
    return `${number} %`;
});
Vue.filter('nullable', function (value?: unknown) {
    return value || '-';
});

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
    mounted: () => {
        if (UserAgentService.isMobile()) {
            document.body.classList.add('mobile-browser')
        }
    }
}).$mount('#app')
