<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class IconMixin extends Vue {
  @Prop({ default: 16 }) size!: number;
  @Prop() color?: 'primary' | 'primary-dark' | 'secondary' | 'error' | 'waring' | 'success' | 'magenta' | string;

  private colorParsed = '#CC3366';

  mounted() {
    this.parseColor(this.color);
  }

  @Watch('color')
  parseColor(color: string | undefined) {
    if (color === undefined) {
      this.colorParsed = '#CC3366';
    }
    switch (color) {
      case 'primary':
        this.colorParsed = '#CC3366';
        break;
      case 'primary-dark':
        this.colorParsed = '#663366';
        break;
      case 'secondary':
        this.colorParsed = '#E27625';
        break;
      case 'error':
        this.colorParsed = '#F46060';
        break;
      case 'warning':
        this.colorParsed = '#FFAD02';
        break;
      case 'success':
        this.colorParsed = '#54CF9B';
        break;
      case 'magenta':
        this.colorParsed = '#AD00FF';
        break;
      default:
        this.colorParsed = color!;
        break;
    }
  }
}
</script>
