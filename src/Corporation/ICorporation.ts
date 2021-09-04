import { Industry } from "./Industry";
import { IPlayer } from "../PersonObjects/IPlayer";
import { CorporationUnlockUpgrade } from "./data/CorporationUnlockUpgrades";
import { CorporationUpgrade } from "./data/CorporationUpgrades";
import { CorporationState } from "./CorporationState";

export interface ICorporation {
  name: string;

  divisions: Industry[];

  funds: any;
  revenue: any;
  expenses: any;
  fundingRound: number;
  public: boolean;
  totalShares: number;
  numShares: number;
  shareSalesUntilPriceUpdate: number;
  shareSaleCooldown: number;
  issueNewSharesCooldown: number;
  dividendPercentage: number;
  dividendTaxPercentage: number;
  issuedShares: number;
  sharePrice: number;
  storedCycles: number;

  unlockUpgrades: number[];
  upgrades: number[];
  upgradeMultipliers: number[];

  state: CorporationState;

  addFunds(amt: number): void;
  getState(): string;
  storeCycles(numCycles: number): void;
  process(player: IPlayer): void;
  determineValuation(): number;
  getTargetSharePrice(): number;
  updateSharePrice(): void;
  immediatelyUpdateSharePrice(): void;
  calculateShareSale(numShares: number): [number, number, number];
  convertCooldownToString(cd: number): string;
  unlock(upgrade: CorporationUnlockUpgrade): void;
  upgrade(upgrade: CorporationUpgrade): void;
  getProductionMultiplier(): number;
  getStorageMultiplier(): number;
  getDreamSenseGain(): number;
  getAdvertisingMultiplier(): number;
  getEmployeeCreMultiplier(): number;
  getEmployeeChaMultiplier(): number;
  getEmployeeIntMultiplier(): number;
  getEmployeeEffMultiplier(): number;
  getSalesMultiplier(): number;
  getScientificResearchMultiplier(): number;
  getStarterGuide(player: IPlayer): void;
  createUI(player: IPlayer): void;
  rerender(player: IPlayer): void;
  clearUI(): void;
  toJSON(): any;
}
