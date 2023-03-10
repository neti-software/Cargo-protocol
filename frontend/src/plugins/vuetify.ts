import Vue from 'vue';
import Vuetify from "vuetify";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: true,
        themes: {
            light: {
                primary: '#7001af',
                secondary: '#9302db',
                accent: '#CBCDDA',
                error: '#F46060',
                warning: '#eebb4d',
                info: '#B5DEFF',
                success: '#47bc6c',
                background: '#F5F7FB'
            },
            dark: {
                primary: '#9c01ea',
                secondary: '#9302db',
                accent: '#CBCDDA',
                error: '#F46060',
                warning: '#eebb4d',
                info: '#B5DEFF',
                success: '#47bc6c',
                background: '#1f1f1f'
            },
        },
    },
})
