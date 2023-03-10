const T = 1000000000000;
const BN = 1000000000;
const MLN = 1000000;
const K = 1000;

export default abstract class NumbersService {
  public static parseNumericValue(value: number, decimalPlaces?: number): string {
    if (!value && value <= 0) {
      return "0";
    }

    if (value / T > 1) {
      return this.parse(value, T, "tn");
    } else if (value / BN > 1) {
      return this.parse(value, BN, "bn");
    } else if (value / MLN > 1) {
      return this.parse(value, MLN, "m");
    } else if (value / (K * 10) > 1) {
      return this.parse(value, K, "k");
    } else {
      return `${value}`;
    }
  }

  public static parseStringValue(parsedValue: string): number {
    const multiplier = parsedValue.replace(/[^A-Za-z]/g, "");
    const value = +parsedValue.replace(/[^0-9.]/g, "");

    if (multiplier == "tn") {
      return value * T;
    } else if (multiplier == "bn") {
      return value * BN;
    } else if (multiplier == "m") {
      return value * MLN;
    } else if (multiplier == "k") {
      return value * K;
    } else {
      return value;
    }
  }

  public static parseNumericValueTVL(value: number, decimalPlaces?: number): string {
    if (!value && value <= 0) {
      return "0";
    }

    if (value / T > 1) {
      return this.parse(value, T, "tn");
    } else if (value / BN > 1) {
      return this.parse(value, BN, "bn");
    } else if (value / MLN > 1) {
      return this.parse(value, MLN, "m");
    } else if (value / (K * 10) > 1) {
      return this.parse(value, K, "k");
    }

    // config numbers precision depends of how large value is
    return `${value.toFixed(decimalPlaces || (value < 1 ? 3 : 2))}`;
  }

  private static parse(value: number, multiplier: number, multiplierText: string) {
    const valueText = (value / multiplier).toFixed(1);
    return `${valueText}${multiplierText}`;
  }

  public static parseSmallValues(value: string | number) {
    const number = +value;
    if (isNaN(number)) {
      return 0;
    }
    return number === 0 ? number.toFixed(2) : number;
  }
}
