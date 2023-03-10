export class TickService {
  static sqrtPriceFromTick(tick: number): number {
    return Math.sqrt(Math.pow(1.0001, tick));
  }

  static tickFromPrice(price: number): number {
    return Math.log(price) / Math.log(1.0001);
  }
}
