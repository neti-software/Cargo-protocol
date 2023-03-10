<template>
  <div>
    <v-data-table
      :headers="[]"
      :items="strategyFeesWeekly"
      class="elevation-0 strategy-apy-weekly"
      hide-default-footer
      hide-default-header
      disable-pagination
      v-if="strategy.feesWeekly"
    >
      <template v-slot:header>
        <thead>
          <tr>
            <th v-bind:style="{'min-width': '120px'}" class="text-center">Date</th>
            <th v-for="i in feeWeeklyLength" :key="i" class="text-center py-2">
              Fee{{ i }}<br />
              TVL{{ i }}<br />
              Fee{{ i }} / TVL{{ i }}
            </th>
          </tr>
        </thead></template
      >

      <template v-slot:item="props">
        <tr>
          <td class="text-center">{{ props.item.date }}</td>

          <template v-for="item in props.item.fee">
            <td :key="item.date" class="text-center py-2">
              ${{ item.fee == 0 ? 0 : item.fee.toFixed(7) }}<br />
              ${{ item.tvl }}<br />
              ${{ +item.fee / item.tvl == 0 ? 0 : (+item.fee / item.tvl).toFixed(7) }}
            </td>
          </template>
        </tr>
      </template>
    </v-data-table>

    <div class="strategy-apy-weekly__details">
      <p class="strategy-apy-weekly__details-text">Total fee / tvl: ${{ strategy.totalFeesWeekly }}</p>

      <p class="strategy-apy-weekly__details-tex">
        APY: ${{ strategy.totalFeesWeekly }} * 100% * (1460 /
        {{ strategy.feesWeekly && strategy.feesWeekly.replace(/},{/g, "}|{").split("|").length }}) =
        <b>{{ strategy.apyFromFeesWeekly }}</b>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import {Vue, Component, Prop} from "vue-property-decorator";
import {Strategy} from "@/interfaces";
import {of} from "rxjs";
import {groupBy, map, mergeMap, reduce, toArray} from "rxjs/internal/operators";

@Component({})
export default class StrategyApyWeeklyDetails extends Vue {
  @Prop({required: true}) strategy!: Strategy;

  public strategyFeesWeekly: {fee: {fee: number; tvl: number; date: string}[]; date: string}[] = [];
  public feeWeeklyLength = 0;
  public feeWeeklyTotal = 0;

  created() {
    setTimeout(() => {
      if (this.strategy.feesWeekly) this.getValues();
    }, 100);
  }

  getValues() {
    const strategyFeesWeekly = (this.strategy.feesWeekly! as string)
      .replace(/},{/g, "}|{")
      .split("|")
      .map((x: string | {fee: number; tvl: number; date: string}) => {
        x = JSON.parse(x as string);
        const y = x as {fee: number; tvl: number; date: string};
        y.fee = +y.fee;
        return y;
      });

    of(...strategyFeesWeekly)
      .pipe(
        groupBy((p: any) => p.date.split("T")[0]),
        mergeMap((group$) => group$.pipe(reduce((result, currentValue) => [...result, currentValue], [`${group$.key}`]))),
        map((arr) => ({date: arr[0], fee: arr.slice(1)})),
        toArray()
      )
      .subscribe((p) => (this.strategyFeesWeekly = p as []));

    this.feeWeeklyLength = this.strategyFeesWeekly.reduce((result, currentValue) => {
      if (currentValue.fee.length > result) return currentValue.fee.length;
      return result;
    }, 0);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables";

.strategy-apy-weekly {
  background: transparent !important;

  &__details {
    margin: 20px 0;

    &-text {
      font-size: $font-md;
      margin-bottom: 5px;
    }
  }
}
</style>
