import { StrategyState } from "types";

export class FakeStateManager {
  private _state: Record<string, Partial<StrategyState>> = {};

  constructor() {
    this._state = {};
  }

  public get state(): Record<string, Partial<StrategyState>> {
    return this._state;
  }

  public makeUpdater(
    txHashOrRandomString?: string
  ): (data: Partial<StrategyState>) => void {
    const key =
      txHashOrRandomString ||
      `0x${Math.round(Math.random() * 1e10).toString(16)}`;

    return (data) => {
      this._state = {
        ...this._state,
        [key]: data,
      };
    };
  }
}
