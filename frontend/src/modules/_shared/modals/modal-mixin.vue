<script lang="ts">
import {Component, Prop, Vue} from "vue-property-decorator";
import UserAgentService from "../../../services/user-agent.service";

@Component
export default class ModalMixin extends Vue {
  @Prop({required: true}) close!: Function;
  @Prop({required: true}) dismiss!: Function;

  public isMobile = false;

  created() {
    this.isMobile = UserAgentService.isMobile()
  }
}
</script>
