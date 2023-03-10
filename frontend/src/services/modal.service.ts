import Vue from 'vue';

const ModalService = new Vue({
    methods: {
        open(component: any, props = {}, scrollBlocker?: boolean) {
            return new Promise<unknown>((resolve, reject) => {
                this.$emit('open', { component, props, resolve, reject }, scrollBlocker);
            });
        }
    }
})

export default ModalService;
