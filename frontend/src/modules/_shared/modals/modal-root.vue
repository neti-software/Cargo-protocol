<template>
  <section :class="{ 'modal-root': modal.component }">
    <component
        v-if="modal"
        :is="modal.component"
        v-bind:close="modal.close"
        v-bind:dismiss="modal.dismiss"
        v-bind="modal.props"
        :class="{ 'd-block': modal.component }"
    />
  </section>
</template>

<script lang="ts">
import {Component, Vue} from "vue-property-decorator";
import ModalWrapper from "./modal-wrapper/modal-wrapper.vue";
import ModalService from "@/services/modal.service";

interface OpenOptions {
  component: any;
  props: any;
  resolve: any;
  reject: any;
}

@Component({
  components: {ModalWrapper}
})
export default class ModalRoot extends Vue {

  public modal: any = {}

  created() {
    ModalService.$on('open', (options: OpenOptions, scrollBlocker?: boolean) => {
      const {component, props, resolve, reject} = options;
      if (scrollBlocker === true) {
        document.body.classList.add('scroll-blocker')
      }
      this.modal = {
        component,
        props,
        close: (value: any) => {
          this.modal = {};
          document.body.classList.remove('scroll-blocker')
          resolve(value);
        },
        dismiss: (reason: any) => {
          this.modal = {};
          document.body.classList.remove('scroll-blocker')
          reject(reason);
        },
      };
    });
  }

}
</script>
