// React Component for displaying an Industry's warehouse information
// (right-side panel in the Industry UI)
import React from "react";

import { CorporationConstants } from "../data/Constants";
import { OfficeSpace } from "../OfficeSpace";
import { Material } from "../Material";
import { Product } from "../Product";
import { Warehouse } from "../Warehouse";
import { DiscontinueProductPopup } from "./DiscontinueProductPopup";
import { ExportPopup } from "./ExportPopup";
import { LimitProductProductionPopup } from "./LimitProductProductionPopup";
import { MaterialMarketTaPopup } from "./MaterialMarketTaPopup";
import { SellMaterialPopup } from "./SellMaterialPopup";
import { SellProductPopup } from "./SellProductPopup";
import { PurchaseMaterialPopup } from "./PurchaseMaterialPopup";
import { ProductMarketTaPopup } from "./ProductMarketTaPopup";
import { SmartSupplyPopup } from "./SmartSupplyPopup";

import { numeralWrapper } from "../../ui/numeralFormat";
import { dialogBoxCreate } from "../../../utils/DialogBox";
import { createPopup } from "../../ui/React/createPopup";

import { isString } from "../../../utils/helpers/isString";
import { ICorporation } from "../ICorporation";
import { IIndustry } from "../IIndustry";
import { IPlayer } from "../../PersonObjects/IPlayer";
import { Money } from "../../ui/React/Money";
import { MoneyCost } from "./MoneyCost";
import { isRelevantMaterial } from "./Helpers";

interface IProductProps {
  corp: ICorporation;
  division: IIndustry;
  city: string;
  product: Product;
  player: IPlayer;
}

// Creates the UI for a single Product type
function ProductComponent(props: IProductProps): React.ReactElement {
  const corp = props.corp;
  const division = props.division;
  const city = props.city;
  const product = props.product;

  // Numeraljs formatters
  const nf = "0.000";
  const nfB = "0.000a"; // For numbers that might be big

  const hasUpgradeDashboard = division.hasResearch("uPgrade: Dashboard");

  // Total product gain = production - sale
  const totalGain = product.data[city][1] - product.data[city][2];

  // Sell button
  let sellButtonText: JSX.Element;
  if (product.sllman[city][0]) {
    if (isString(product.sllman[city][1])) {
      sellButtonText = (
        <>
          Sell ({numeralWrapper.format(product.data[city][2], nfB)}/
          {product.sllman[city][1]})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({numeralWrapper.format(product.data[city][2], nfB)}/
          {numeralWrapper.format(product.sllman[city][1], nfB)})
        </>
      );
    }
  } else {
    sellButtonText = <>Sell (0.000/0.000)</>;
  }

  if (product.marketTa2) {
    sellButtonText = (
      <>
        {sellButtonText} @ <Money money={product.marketTa2Price[city]} />
      </>
    );
  } else if (product.marketTa1) {
    const markupLimit = product.rat / product.mku;
    sellButtonText = (
      <>
        {sellButtonText} @ <Money money={product.pCost + markupLimit} />
      </>
    );
  } else if (product.sCost) {
    if (isString(product.sCost)) {
      const sCost = (product.sCost as string).replace(
        /MP/g,
        product.pCost + "",
      );
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={eval(sCost)} />
        </>
      );
    } else {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={product.sCost} />
        </>
      );
    }
  }

  function openSellProductPopup(): void {
    const popupId = "cmpy-mgmt-limit-product-production-popup";
    createPopup(popupId, SellProductPopup, {
      product: product,
      city: city,
      popupId: popupId,
    });
  }

  // Limit Production button
  let limitProductionButtonText = "Limit Production";
  if (product.prdman[city][0]) {
    limitProductionButtonText +=
      " (" + numeralWrapper.format(product.prdman[city][1], nf) + ")";
  }

  function openLimitProductProdutionPopup(): void {
    const popupId = "cmpy-mgmt-limit-product-production-popup";
    createPopup(popupId, LimitProductProductionPopup, {
      product: product,
      city: city,
      popupId: popupId,
    });
  }

  function openDiscontinueProductPopup(): void {
    const popupId = "cmpy-mgmt-discontinue-product-popup";
    createPopup(popupId, DiscontinueProductPopup, {
      product: product,
      industry: division,
      corp: props.corp,
      popupId: popupId,
      player: props.player,
    });
  }

  function openProductMarketTaPopup(): void {
    const popupId = "cmpy-mgmt-marketta-popup";
    createPopup(popupId, ProductMarketTaPopup, {
      product: product,
      industry: division,
      popupId: popupId,
    });
  }

  // Unfinished Product
  if (!product.fin) {
    if (hasUpgradeDashboard) {
      return (
        <div className={"cmpy-mgmt-warehouse-product-div"}>
          <p>Designing {product.name}...</p>
          <br />
          <p>{numeralWrapper.format(product.prog, "0.00")}% complete</p>
          <br />

          <div>
            <button className={"std-button"} onClick={openSellProductPopup}>
              {sellButtonText}
            </button>
            <br />
            <button
              className={"std-button"}
              onClick={openLimitProductProdutionPopup}
            >
              {limitProductionButtonText}
            </button>
            <button
              className={"std-button"}
              onClick={openDiscontinueProductPopup}
            >
              Discontinue
            </button>
            {division.hasResearch("Market-TA.I") && (
              <button
                className={"std-button"}
                onClick={openProductMarketTaPopup}
              >
                Market-TA
              </button>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className={"cmpy-mgmt-warehouse-product-div"}>
          <p>Designing {product.name}...</p>
          <br />
          <p>{numeralWrapper.format(product.prog, "0.00")}% complete</p>
        </div>
      );
    }
  }

  return (
    <div className={"cmpy-mgmt-warehouse-product-div"}>
      <p className={"tooltip"}>
        {product.name}: {numeralWrapper.format(product.data[city][0], nfB)} (
        {numeralWrapper.format(totalGain, nfB)}/s)
        <span className={"tooltiptext"}>
          Prod: {numeralWrapper.format(product.data[city][1], nfB)}/s
          <br />
          Sell: {numeralWrapper.format(product.data[city][2], nfB)} /s
        </span>
      </p>
      <br />
      <p className={"tooltip"}>
        Rating: {numeralWrapper.format(product.rat, nf)}
        <span className={"tooltiptext"}>
          Quality: {numeralWrapper.format(product.qlt, nf)} <br />
          Performance: {numeralWrapper.format(product.per, nf)} <br />
          Durability: {numeralWrapper.format(product.dur, nf)} <br />
          Reliability: {numeralWrapper.format(product.rel, nf)} <br />
          Aesthetics: {numeralWrapper.format(product.aes, nf)} <br />
          Features: {numeralWrapper.format(product.fea, nf)}
          {corp.unlockUpgrades[2] === 1 && <br />}
          {corp.unlockUpgrades[2] === 1 &&
            "Demand: " + numeralWrapper.format(product.dmd, nf)}
          {corp.unlockUpgrades[3] === 1 && <br />}
          {corp.unlockUpgrades[3] === 1 &&
            "Competition: " + numeralWrapper.format(product.cmp, nf)}
        </span>
      </p>
      <br />
      <p className={"tooltip"}>
        Est. Production Cost:{" "}
        {numeralWrapper.formatMoney(
          product.pCost / CorporationConstants.ProductProductionCostRatio,
        )}
        <span className={"tooltiptext"}>
          An estimate of the material cost it takes to create this Product.
        </span>
      </p>
      <br />
      <p className={"tooltip"}>
        Est. Market Price: {numeralWrapper.formatMoney(product.pCost)}
        <span className={"tooltiptext"}>
          An estimate of how much consumers are willing to pay for this product.
          Setting the sale price above this may result in less sales. Setting
          the sale price below this may result in more sales.
        </span>
      </p>

      <div>
        <button className={"std-button"} onClick={openSellProductPopup}>
          {sellButtonText}
        </button>
        <br />
        <button
          className={"std-button"}
          onClick={openLimitProductProdutionPopup}
        >
          {limitProductionButtonText}
        </button>
        <button className={"std-button"} onClick={openDiscontinueProductPopup}>
          Discontinue
        </button>
        {division.hasResearch("Market-TA.I") && (
          <button className={"std-button"} onClick={openProductMarketTaPopup}>
            Market-TA
          </button>
        )}
      </div>
    </div>
  );
}

interface IMaterialProps {
  corp: ICorporation;
  division: IIndustry;
  warehouse: Warehouse;
  city: string;
  mat: Material;
}

// Creates the UI for a single Material type
function MaterialComponent(props: IMaterialProps): React.ReactElement {
  const corp = props.corp;
  const division = props.division;
  const warehouse = props.warehouse;
  const city = props.city;
  const mat = props.mat;
  const markupLimit = mat.getMarkupLimit();
  const office = division.offices[city];
  if (!(office instanceof OfficeSpace)) {
    throw new Error(`Could not get OfficeSpace object for this city (${city})`);
  }

  // Numeraljs formatter
  const nf = "0.000";
  const nfB = "0.000a"; // For numbers that might be biger

  // Total gain or loss of this material (per second)
  const totalGain = mat.buy + mat.prd + mat.imp - mat.sll - mat.totalExp;

  // Flag that determines whether this industry is "new" and the current material should be
  // marked with flashing-red lights
  const tutorial =
    division.newInd &&
    Object.keys(division.reqMats).includes(mat.name) &&
    mat.buy === 0 &&
    mat.imp === 0;

  // Purchase material button
  const purchaseButtonText = `Buy (${numeralWrapper.format(mat.buy, nfB)})`;
  const purchaseButtonClass = tutorial
    ? "std-button flashing-button tooltip"
    : "std-button";

  function openPurchaseMaterialPopup(): void {
    const popupId = "cmpy-mgmt-material-purchase-popup";
    createPopup(popupId, PurchaseMaterialPopup, {
      mat: mat,
      industry: division,
      warehouse: warehouse,
      corp: props.corp,
      popupId: popupId,
    });
  }

  function openExportPopup(): void {
    const popupId = "cmpy-mgmt-export-popup";
    createPopup(popupId, ExportPopup, {
      mat: mat,
      corp: props.corp,
      popupId: popupId,
    });
  }

  // Sell material button
  let sellButtonText: JSX.Element;
  if (mat.sllman[0]) {
    if (isString(mat.sllman[1])) {
      sellButtonText = (
        <>
          Sell ({numeralWrapper.format(mat.sll, nfB)}/{mat.sllman[1]})
        </>
      );
    } else {
      sellButtonText = (
        <>
          Sell ({numeralWrapper.format(mat.sll, nfB)}/
          {numeralWrapper.format(mat.sllman[1] as number, nfB)})
        </>
      );
    }

    if (mat.marketTa2) {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={mat.marketTa2Price} />
        </>
      );
    } else if (mat.marketTa1) {
      sellButtonText = (
        <>
          {sellButtonText} @ <Money money={mat.bCost + markupLimit} />
        </>
      );
    } else if (mat.sCost) {
      if (isString(mat.sCost)) {
        const sCost = (mat.sCost as string).replace(/MP/g, mat.bCost + "");
        sellButtonText = (
          <>
            {sellButtonText} @ <Money money={eval(sCost)} />
          </>
        );
      } else {
        sellButtonText = (
          <>
            {sellButtonText} @ <Money money={mat.sCost} />
          </>
        );
      }
    }
  } else {
    sellButtonText = <>Sell (0.000/0.000)</>;
  }

  function openSellMaterialPopup(): void {
    const popupId = "cmpy-mgmt-material-sell-popup";
    createPopup(popupId, SellMaterialPopup, {
      mat: mat,
      corp: props.corp,
      popupId: popupId,
    });
  }

  function openMaterialMarketTaPopup(): void {
    const popupId = "cmpy-mgmt-export-popup";
    createPopup(popupId, MaterialMarketTaPopup, {
      mat: mat,
      industry: division,
      corp: props.corp,
      popupId: popupId,
    });
  }

  return (
    <div className={"cmpy-mgmt-warehouse-material-div"}>
      <div style={{ display: "inline-block" }}>
        <p className={"tooltip"}>
          {mat.name}: {numeralWrapper.format(mat.qty, nfB)} (
          {numeralWrapper.format(totalGain, nfB)}/s)
          <span className={"tooltiptext"}>
            Buy: {numeralWrapper.format(mat.buy, nfB)} <br />
            Prod: {numeralWrapper.format(mat.prd, nfB)} <br />
            Sell: {numeralWrapper.format(mat.sll, nfB)} <br />
            Export: {numeralWrapper.format(mat.totalExp, nfB)} <br />
            Import: {numeralWrapper.format(mat.imp, nfB)}
            {corp.unlockUpgrades[2] === 1 && <br />}
            {corp.unlockUpgrades[2] === 1 &&
              "Demand: " + numeralWrapper.format(mat.dmd, nf)}
            {corp.unlockUpgrades[3] === 1 && <br />}
            {corp.unlockUpgrades[3] === 1 &&
              "Competition: " + numeralWrapper.format(mat.cmp, nf)}
          </span>
        </p>
        <br />
        <p className={"tooltip"}>
          MP: {numeralWrapper.formatMoney(mat.bCost)}
          <span className={"tooltiptext"}>
            Market Price: The price you would pay if you were to buy this
            material on the market
          </span>
        </p>{" "}
        <br />
        <p className={"tooltip"}>
          Quality: {numeralWrapper.format(mat.qlt, "0.00a")}
          <span className={"tooltiptext"}>
            The quality of your material. Higher quality will lead to more sales
          </span>
        </p>
      </div>

      <div style={{ display: "inline-block" }}>
        <button
          className={purchaseButtonClass}
          onClick={openPurchaseMaterialPopup}
        >
          {purchaseButtonText}
          {tutorial && (
            <span className={"tooltiptext"}>
              Purchase your required materials to get production started!
            </span>
          )}
        </button>

        {corp.unlockUpgrades[0] === 1 && (
          <button className={"std-button"} onClick={openExportPopup}>
            Export
          </button>
        )}
        <br />

        <button className={"std-button"} onClick={openSellMaterialPopup}>
          {sellButtonText}
        </button>

        {division.hasResearch("Market-TA.I") && (
          <button className={"std-button"} onClick={openMaterialMarketTaPopup}>
            Market-TA
          </button>
        )}
      </div>
    </div>
  );
}

interface IProps {
  corp: ICorporation;
  division: IIndustry;
  warehouse: Warehouse | 0;
  currentCity: string;
  player: IPlayer;
}

export function IndustryWarehouse(props: IProps): React.ReactElement {
  function renderWarehouseUI(): React.ReactElement {
    if (props.warehouse === 0) return <></>;
    // General Storage information at the top
    const sizeUsageStyle = {
      color: props.warehouse.sizeUsed >= props.warehouse.size ? "red" : "white",
      margin: "5px",
    };

    // Upgrade Warehouse size button
    const sizeUpgradeCost =
      CorporationConstants.WarehouseUpgradeBaseCost *
      Math.pow(1.07, props.warehouse.level + 1);
    const canAffordUpgrade = props.corp.funds.gt(sizeUpgradeCost);
    const upgradeWarehouseClass = canAffordUpgrade
      ? "std-button"
      : "a-link-button-inactive";
    function upgradeWarehouseOnClick(): void {
      if (props.division === null) return;
      if (props.warehouse === 0) return;
      ++props.warehouse.level;
      props.warehouse.updateSize(props.corp, props.division);
      props.corp.funds = props.corp.funds.minus(sizeUpgradeCost);
      props.corp.rerender(props.player);
    }

    function openSmartSupplyPopup(): void {
      if (props.warehouse === 0) return;
      const popupId = "cmpy-mgmt-smart-supply-popup";
      createPopup(popupId, SmartSupplyPopup, {
        division: props.division,
        warehouse: props.warehouse,
        corp: props.corp,
        player: props.player,
        popupId: popupId,
      });
    }

    // Industry material Requirements
    let generalReqsText =
      "This Industry uses [" +
      Object.keys(props.division.reqMats).join(", ") +
      "] in order to ";
    if (props.division.prodMats.length > 0) {
      generalReqsText +=
        "produce [" + props.division.prodMats.join(", ") + "] ";
      if (props.division.makesProducts) {
        generalReqsText += " and " + props.division.getProductDescriptionText();
      }
    } else if (props.division.makesProducts) {
      generalReqsText += props.division.getProductDescriptionText() + ".";
    }

    const ratioLines = [];
    for (const matName in props.division.reqMats) {
      if (props.division.reqMats.hasOwnProperty(matName)) {
        const text = [" *", props.division.reqMats[matName], matName].join(" ");
        ratioLines.push(
          <div key={matName}>
            <p>{text}</p>
          </div>,
        );
      }
    }

    let createdItemsText = "in order to create ";
    if (props.division.prodMats.length > 0) {
      createdItemsText +=
        "one of each produced Material (" +
        props.division.prodMats.join(", ") +
        ") ";
      if (props.division.makesProducts) {
        createdItemsText += "or to create one of its Products";
      }
    } else if (props.division.makesProducts) {
      createdItemsText += "one of its Products";
    }

    // Current State:
    let stateText;
    switch (props.division.state) {
      case "START":
        stateText = "Current state: Preparing...";
        break;
      case "PURCHASE":
        stateText = "Current state: Purchasing materials...";
        break;
      case "PRODUCTION":
        stateText = "Current state: Producing materials and/or products...";
        break;
      case "SALE":
        stateText = "Current state: Selling materials and/or products...";
        break;
      case "EXPORT":
        stateText = "Current state: Exporting materials and/or products...";
        break;
      default:
        console.error(`Invalid state: ${props.division.state}`);
        break;
    }

    // Create React components for materials
    const mats = [];
    for (const matName in props.warehouse.materials) {
      if (props.warehouse.materials[matName] instanceof Material) {
        // Only create UI for materials that are relevant for the industry
        if (isRelevantMaterial(matName, props.division)) {
          mats.push(
            <MaterialComponent
              city={props.currentCity}
              corp={props.corp}
              division={props.division}
              key={matName}
              mat={props.warehouse.materials[matName]}
              warehouse={props.warehouse}
            />,
          );
        }
      }
    }

    // Create React components for products
    const products = [];
    if (
      props.division.makesProducts &&
      Object.keys(props.division.products).length > 0
    ) {
      for (const productName in props.division.products) {
        const product = props.division.products[productName];
        if (product instanceof Product) {
          products.push(
            <ProductComponent
              player={props.player}
              city={props.currentCity}
              corp={props.corp}
              division={props.division}
              key={productName}
              product={product}
            />,
          );
        }
      }
    }

    return (
      <div className={"cmpy-mgmt-warehouse-panel"}>
        <p className={"tooltip"} style={sizeUsageStyle}>
          Storage: {numeralWrapper.formatBigNumber(props.warehouse.sizeUsed)} /{" "}
          {numeralWrapper.formatBigNumber(props.warehouse.size)}
          <span
            className={"tooltiptext"}
            dangerouslySetInnerHTML={{ __html: props.warehouse.breakdown }}
          ></span>
        </p>

        <button
          className={upgradeWarehouseClass}
          onClick={upgradeWarehouseOnClick}
        >
          Upgrade Warehouse Size -{" "}
          <MoneyCost money={sizeUpgradeCost} corp={props.corp} />
        </button>

        <p>{generalReqsText}. The exact requirements for production are:</p>
        <br />
        {ratioLines}
        <br />
        <p>{createdItemsText}</p>
        <p>
          To get started with production, purchase your required materials or
          import them from another of your company's divisions.
        </p>
        <br />

        <p>{stateText}</p>

        {props.corp.unlockUpgrades[1] && (
          <>
            <button className="std-button" onClick={openSmartSupplyPopup}>
              Configure Smart Supply
            </button>
          </>
        )}

        {mats}

        {products}
      </div>
    );
  }

  function purchaseWarehouse(division: IIndustry, city: string): void {
    if (props.corp.funds.lt(CorporationConstants.WarehouseInitialCost)) {
      dialogBoxCreate("You do not have enough funds to do this!");
    } else {
      division.warehouses[city] = new Warehouse({
        corp: props.corp,
        industry: division,
        loc: city,
        size: CorporationConstants.WarehouseInitialSize,
      });
      props.corp.funds = props.corp.funds.minus(
        CorporationConstants.WarehouseInitialCost,
      );
      props.corp.rerender(props.player);
    }
  }

  if (props.warehouse instanceof Warehouse) {
    return renderWarehouseUI();
  } else {
    return (
      <div className={"cmpy-mgmt-warehouse-panel"}>
        <button
          className={"std-button"}
          onClick={() => purchaseWarehouse(props.division, props.currentCity)}
        >
          Purchase Warehouse (
          <MoneyCost
            money={CorporationConstants.WarehouseInitialCost}
            corp={props.corp}
          />
          )
        </button>
      </div>
    );
  }
}
