import { ICorporation } from "./ICorporation";
import { IIndustry } from "./IIndustry";
import { IndustryStartingCosts } from "./IndustryData";
import { Industry } from "./Industry";
import { CorporationConstants } from "./data/Constants";
import { OfficeSpace } from "./OfficeSpace";
import { Material } from "./Material";
import { Product } from "./Product";
import { Warehouse } from "./Warehouse";
import { CorporationUnlockUpgrade } from "./data/CorporationUnlockUpgrades";
import { CorporationUpgrade } from "./data/CorporationUpgrades";
import { Cities } from "../Locations/Cities";

export function NewIndustry(
  corporation: ICorporation,
  industry: string,
  name: string,
): void {
  for (let i = 0; i < corporation.divisions.length; ++i) {
    if (corporation.divisions[i].name === name) {
      throw new Error("This division name is already in use!");
      return;
    }
  }

  const cost = IndustryStartingCosts[industry];
  if (cost === undefined) {
    throw new Error(`Invalid industry: '${industry}'`);
  }
  if (corporation.funds.lt(cost)) {
    throw new Error(
      "Not enough money to create a new division in this industry",
    );
  } else if (name === "") {
    throw new Error("New division must have a name!");
  } else {
    corporation.funds = corporation.funds.minus(cost);
    corporation.divisions.push(
      new Industry({
        corp: corporation,
        name: name,
        type: industry,
      }),
    );
  }
}

export function NewCity(
  corporation: ICorporation,
  division: IIndustry,
  city: string,
): void {
  if (corporation.funds.lt(CorporationConstants.OfficeInitialCost)) {
    throw new Error(
      "You don't have enough company funds to open a new office!",
    );
  } else {
    corporation.funds = corporation.funds.minus(
      CorporationConstants.OfficeInitialCost,
    );
    division.offices[city] = new OfficeSpace({
      loc: city,
      size: CorporationConstants.OfficeInitialSize,
    });
  }
}

export function UnlockUpgrade(
  corporation: ICorporation,
  upgrade: CorporationUnlockUpgrade,
): void {
  if (corporation.funds.lt(upgrade[1])) {
    throw new Error("Insufficient funds");
  }
  corporation.unlock(upgrade);
}

export function LevelUpgrade(
  corporation: ICorporation,
  upgrade: CorporationUpgrade,
): void {
  const baseCost = upgrade[1];
  const priceMult = upgrade[2];
  const level = corporation.upgrades[upgrade[0]];
  const cost = baseCost * Math.pow(priceMult, level);
  if (corporation.funds.lt(cost)) {
    throw new Error("Insufficient funds");
  } else {
    corporation.upgrade(upgrade);
  }
}

export function IssueDividends(
  corporation: ICorporation,
  percent: number,
): void {
  if (
    isNaN(percent) ||
    percent < 0 ||
    percent > CorporationConstants.DividendMaxPercentage
  ) {
    throw new Error(
      `Invalid value. Must be an integer between 0 and ${CorporationConstants.DividendMaxPercentage}`,
    );
  }

  corporation.dividendPercentage = percent * 100;
}

export function SellMaterial(mat: Material, amt: string, price: string): void {
  if (price === "") price = "0";
  if (amt === "") amt = "0";
  let cost = price.replace(/\s+/g, "");
  cost = cost.replace(/[^-()\d/*+.MP]/g, ""); //Sanitize cost
  let temp = cost.replace(/MP/g, mat.bCost + "");
  try {
    temp = eval(temp);
  } catch (e) {
    throw new Error("Invalid value or expression for sell price field: " + e);
  }

  if (temp == null || isNaN(parseFloat(temp))) {
    throw new Error("Invalid value or expression for sell price field");
  }

  if (cost.includes("MP")) {
    mat.sCost = cost; //Dynamically evaluated
  } else {
    mat.sCost = temp;
  }

  //Parse quantity
  if (amt.includes("MAX") || amt.includes("PROD")) {
    let q = amt.replace(/\s+/g, "");
    q = q.replace(/[^-()\d/*+.MAXPROD]/g, "");
    let tempQty = q.replace(/MAX/g, "1");
    tempQty = tempQty.replace(/PROD/g, "1");
    try {
      tempQty = eval(tempQty);
    } catch (e) {
      throw new Error("Invalid value or expression for sell price field: " + e);
    }

    if (tempQty == null || isNaN(parseFloat(tempQty))) {
      throw new Error("Invalid value or expression for sell price field");
    }

    mat.sllman[0] = true;
    mat.sllman[1] = q; //Use sanitized input
  } else if (isNaN(parseFloat(amt))) {
    throw new Error(
      "Invalid value for sell quantity field! Must be numeric or 'MAX'",
    );
  } else {
    let q = parseFloat(amt);
    if (isNaN(q)) {
      q = 0;
    }
    if (q === 0) {
      mat.sllman[0] = false;
      mat.sllman[1] = 0;
    } else {
      mat.sllman[0] = true;
      mat.sllman[1] = q;
    }
  }
}

export function SellProduct(
  product: Product,
  city: string,
  amt: string,
  price: string,
  all: boolean,
): void {
  //Parse price
  if (price.includes("MP")) {
    //Dynamically evaluated quantity. First test to make sure its valid
    //Sanitize input, then replace dynamic variables with arbitrary numbers
    price = price.replace(/\s+/g, "");
    price = price.replace(/[^-()\d/*+.MP]/g, "");
    let temp = price.replace(/MP/g, "1");
    try {
      temp = eval(temp);
    } catch (e) {
      throw new Error(
        "Invalid value or expression for sell quantity field: " + e,
      );
    }
    if (temp == null || isNaN(parseFloat(temp))) {
      throw new Error("Invalid value or expression for sell quantity field.");
    }
    product.sCost = price; //Use sanitized price
  } else {
    const cost = parseFloat(price);
    if (isNaN(cost)) {
      throw new Error("Invalid value for sell price field");
    }
    product.sCost = cost;
  }

  // Array of all cities. Used later
  const cities = Object.keys(Cities);

  // Parse quantity
  if (amt.includes("MAX") || amt.includes("PROD")) {
    //Dynamically evaluated quantity. First test to make sure its valid
    let qty = amt.replace(/\s+/g, "");
    qty = qty.replace(/[^-()\d/*+.MAXPROD]/g, "");
    let temp = qty.replace(/MAX/g, "1");
    temp = temp.replace(/PROD/g, "1");
    try {
      temp = eval(temp);
    } catch (e) {
      throw new Error("Invalid value or expression for sell price field: " + e);
    }

    if (temp == null || isNaN(parseFloat(temp))) {
      throw new Error("Invalid value or expression for sell price field");
    }
    if (all) {
      for (let i = 0; i < cities.length; ++i) {
        const tempCity = cities[i];
        product.sllman[tempCity][0] = true;
        product.sllman[tempCity][1] = qty; //Use sanitized input
      }
    } else {
      product.sllman[city][0] = true;
      product.sllman[city][1] = qty; //Use sanitized input
    }
  } else if (isNaN(parseFloat(amt))) {
    throw new Error("Invalid value for sell quantity field! Must be numeric");
  } else {
    let qty = parseFloat(amt);
    if (isNaN(qty)) {
      qty = 0;
    }
    if (qty === 0) {
      if (all) {
        for (let i = 0; i < cities.length; ++i) {
          const tempCity = cities[i];
          product.sllman[tempCity][0] = false;
          product.sllman[tempCity][1] = "";
        }
      } else {
        product.sllman[city][0] = false;
        product.sllman[city][1] = "";
      }
    } else {
      if (all) {
        for (let i = 0; i < cities.length; ++i) {
          const tempCity = cities[i];
          product.sllman[tempCity][0] = true;
          product.sllman[tempCity][1] = qty;
        }
      } else {
        product.sllman[city][0] = true;
        product.sllman[city][1] = qty;
      }
    }
  }
}

export function SetSmartSupply(
  warehouse: Warehouse,
  smartSupply: boolean,
): void {
  warehouse.smartSupplyEnabled = smartSupply;
}

export function BuyMaterial(material: Material, amt: number): void {
  if (isNaN(amt)) {
    throw new Error(
      `Invalid amount '${amt}' to buy material '${material.name}'`,
    );
  }
  material.buy = amt;
}
