/**
 * React Component for a single stock ticker in the Stock Market UI
 */
import * as React from "react";

import { StockTickerHeaderText } from "./StockTickerHeaderText";
import { StockTickerOrderList } from "./StockTickerOrderList";
import { StockTickerPositionText } from "./StockTickerPositionText";
import { StockTickerTxButton } from "./StockTickerTxButton";
import { PlaceOrderPopup } from "./PlaceOrderPopup";

import { Order } from "../Order";
import { Stock } from "../Stock";
import { getBuyTransactionCost, getSellTransactionGain, calculateBuyMaxAmount } from "../StockMarketHelpers";
import { OrderTypes } from "../data/OrderTypes";
import { PositionTypes } from "../data/PositionTypes";

import { IPlayer } from "../../PersonObjects/IPlayer";
import { SourceFileFlags } from "../../SourceFile/SourceFileFlags";
import { numeralWrapper } from "../../ui/numeralFormat";
import { BBAccordion } from "../../ui/React/BBAccordion";
import { Money } from "../../ui/React/Money";
import { createPopup } from "../../ui/React/createPopup";

import { dialogBoxCreate } from "../../ui/React/DialogBox";

enum SelectorOrderType {
  Market = "Market Order",
  Limit = "Limit Order",
  Stop = "Stop Order",
}

export type txFn = (stock: Stock, shares: number) => boolean;
export type placeOrderFn = (
  stock: Stock,
  shares: number,
  price: number,
  ordType: OrderTypes,
  posType: PositionTypes,
) => boolean;

type IProps = {
  buyStockLong: txFn;
  buyStockShort: txFn;
  cancelOrder: (params: any) => void;
  orders: Order[];
  p: IPlayer;
  placeOrder: placeOrderFn;
  rerenderAllTickers: () => void;
  sellStockLong: txFn;
  sellStockShort: txFn;
  stock: Stock;
};

type IState = {
  orderType: SelectorOrderType;
  position: PositionTypes;
  qty: string;
};

export class StockTicker extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      orderType: SelectorOrderType.Market,
      position: PositionTypes.Long,
      qty: "",
    };

    this.getBuyTransactionCostContent = this.getBuyTransactionCostContent.bind(this);
    this.getSellTransactionCostContent = this.getSellTransactionCostContent.bind(this);
    this.handleBuyButtonClick = this.handleBuyButtonClick.bind(this);
    this.handleBuyMaxButtonClick = this.handleBuyMaxButtonClick.bind(this);
    this.handleHeaderClick = this.handleHeaderClick.bind(this);
    this.handleOrderTypeChange = this.handleOrderTypeChange.bind(this);
    this.handlePositionTypeChange = this.handlePositionTypeChange.bind(this);
    this.handleQuantityChange = this.handleQuantityChange.bind(this);
    this.handleSellButtonClick = this.handleSellButtonClick.bind(this);
    this.handleSellAllButtonClick = this.handleSellAllButtonClick.bind(this);
  }

  getBuyTransactionCostContent(): JSX.Element | null {
    const stock = this.props.stock;
    const qty: number = this.getQuantity();
    if (isNaN(qty)) {
      return null;
    }

    const cost = getBuyTransactionCost(stock, qty, this.state.position);
    if (cost == null) {
      return null;
    }

    return (
      <>
        Purchasing {numeralWrapper.formatShares(qty)} shares (
        {this.state.position === PositionTypes.Long ? "Long" : "Short"}) will cost <Money money={cost} />.
      </>
    );
  }

  getQuantity(): number {
    return Math.round(parseFloat(this.state.qty));
  }

  getSellTransactionCostContent(): JSX.Element | null {
    const stock = this.props.stock;
    const qty: number = this.getQuantity();
    if (isNaN(qty)) {
      return null;
    }

    if (this.state.position === PositionTypes.Long) {
      if (qty > stock.playerShares) {
        return <>You do not have this many shares in the Long position</>;
      }
    } else {
      if (qty > stock.playerShortShares) {
        return <>You do not have this many shares in the Short position</>;
      }
    }

    const cost = getSellTransactionGain(stock, qty, this.state.position);
    if (cost == null) {
      return null;
    }

    return (
      <>
        Selling {numeralWrapper.formatShares(qty)} shares (
        {this.state.position === PositionTypes.Long ? "Long" : "Short"}) will result in a gain of <Money money={cost} />
        .
      </>
    );
  }

  handleBuyButtonClick(): void {
    const shares = this.getQuantity();
    if (isNaN(shares)) {
      dialogBoxCreate(`Invalid input for quantity (number of shares): ${this.state.qty}`);
      return;
    }

    switch (this.state.orderType) {
      case SelectorOrderType.Market: {
        if (this.state.position === PositionTypes.Short) {
          this.props.buyStockShort(this.props.stock, shares);
        } else {
          this.props.buyStockLong(this.props.stock, shares);
        }
        this.props.rerenderAllTickers();
        break;
      }
      case SelectorOrderType.Limit: {
        const popupId = `place-order-popup`;
        createPopup(popupId, PlaceOrderPopup, {
          text: "Enter the price for your Limit Order",
          placeText: "Place Buy Limit Order",
          place: (price: number) =>
            this.props.placeOrder(this.props.stock, shares, price, OrderTypes.LimitBuy, this.state.position),
          popupId: popupId,
        });
        break;
      }
      case SelectorOrderType.Stop: {
        const popupId = `place-order-popup`;
        createPopup(popupId, PlaceOrderPopup, {
          text: "Enter the price for your Stop Order",
          placeText: "Place Buy Stop Order",
          place: (price: number) =>
            this.props.placeOrder(this.props.stock, shares, price, OrderTypes.StopBuy, this.state.position),
          popupId: popupId,
        });
        break;
      }
      default:
        break;
    }
  }

  handleBuyMaxButtonClick(): void {
    const playerMoney: number = this.props.p.money.toNumber();

    const stock = this.props.stock;
    let maxShares = calculateBuyMaxAmount(stock, this.state.position, playerMoney);
    maxShares = Math.min(maxShares, Math.round(stock.maxShares - stock.playerShares - stock.playerShortShares));

    switch (this.state.orderType) {
      case SelectorOrderType.Market: {
        if (this.state.position === PositionTypes.Short) {
          this.props.buyStockShort(stock, maxShares);
        } else {
          this.props.buyStockLong(stock, maxShares);
        }
        this.props.rerenderAllTickers();
        break;
      }
      default: {
        dialogBoxCreate(`ERROR: 'Buy Max' only works for Market Orders`);
        break;
      }
    }
  }

  handleHeaderClick(e: React.MouseEvent<HTMLButtonElement>): void {
    const elem = e.currentTarget;
    elem.classList.toggle("active");

    const panel: HTMLElement = elem.nextElementSibling as HTMLElement;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  }

  handleOrderTypeChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const val = e.target.value;

    // The select value returns a string. Afaik TypeScript doesnt make it easy
    // to convert that string back to an enum type so we'll just do this for now
    switch (val) {
      case SelectorOrderType.Limit:
        this.setState({
          orderType: SelectorOrderType.Limit,
        });
        break;
      case SelectorOrderType.Stop:
        this.setState({
          orderType: SelectorOrderType.Stop,
        });
        break;
      case SelectorOrderType.Market:
      default:
        this.setState({
          orderType: SelectorOrderType.Market,
        });
    }
  }

  handlePositionTypeChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const val = e.target.value;

    if (val === PositionTypes.Short) {
      this.setState({
        position: PositionTypes.Short,
      });
    } else {
      this.setState({
        position: PositionTypes.Long,
      });
    }
  }

  handleQuantityChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      qty: e.target.value,
    });
  }

  handleSellButtonClick(): void {
    const shares = this.getQuantity();
    if (isNaN(shares)) {
      dialogBoxCreate(`Invalid input for quantity (number of shares): ${this.state.qty}`);
      return;
    }

    switch (this.state.orderType) {
      case SelectorOrderType.Market: {
        if (this.state.position === PositionTypes.Short) {
          this.props.sellStockShort(this.props.stock, shares);
        } else {
          this.props.sellStockLong(this.props.stock, shares);
        }
        this.props.rerenderAllTickers();
        break;
      }
      case SelectorOrderType.Limit: {
        const popupId = `place-order-popup`;
        createPopup(popupId, PlaceOrderPopup, {
          text: "Enter the price for your Limit Order",
          placeText: "Place Sell Limit Order",
          place: (price: number) =>
            this.props.placeOrder(this.props.stock, shares, price, OrderTypes.LimitSell, this.state.position),
          popupId: popupId,
        });
        break;
      }
      case SelectorOrderType.Stop: {
        const popupId = `place-order-popup`;
        createPopup(popupId, PlaceOrderPopup, {
          text: "Enter the price for your Stop Order",
          placeText: "Place Sell Stop Order",
          place: (price: number) =>
            this.props.placeOrder(this.props.stock, shares, price, OrderTypes.StopSell, this.state.position),
          popupId: popupId,
        });
        break;
      }
      default:
        break;
    }
  }

  handleSellAllButtonClick(): void {
    const stock = this.props.stock;

    switch (this.state.orderType) {
      case SelectorOrderType.Market: {
        if (this.state.position === PositionTypes.Short) {
          this.props.sellStockShort(stock, stock.playerShortShares);
        } else {
          this.props.sellStockLong(stock, stock.playerShares);
        }
        this.props.rerenderAllTickers();
        break;
      }
      default: {
        dialogBoxCreate(`ERROR: 'Sell All' only works for Market Orders`);
        break;
      }
    }
  }

  // Whether the player has access to orders besides market orders (limit/stop)
  hasOrderAccess(): boolean {
    return this.props.p.bitNodeN === 8 || SourceFileFlags[8] >= 3;
  }

  // Whether the player has access to shorting stocks
  hasShortAccess(): boolean {
    return this.props.p.bitNodeN === 8 || SourceFileFlags[8] >= 2;
  }

  render(): React.ReactNode {
    return (
      <li>
        <BBAccordion
          headerContent={<StockTickerHeaderText p={this.props.p} stock={this.props.stock} />}
          panelContent={
            <div>
              <input
                className="stock-market-input"
                onChange={this.handleQuantityChange}
                placeholder="Quantity (Shares)"
                value={this.state.qty}
              />
              <select
                className="stock-market-input dropdown"
                onChange={this.handlePositionTypeChange}
                value={this.state.position}
              >
                <option value={PositionTypes.Long}>Long</option>
                {this.hasShortAccess() && <option value={PositionTypes.Short}>Short</option>}
              </select>
              <select
                className="stock-market-input dropdown"
                onChange={this.handleOrderTypeChange}
                value={this.state.orderType}
              >
                <option value={SelectorOrderType.Market}>{SelectorOrderType.Market}</option>
                {this.hasOrderAccess() && <option value={SelectorOrderType.Limit}>{SelectorOrderType.Limit}</option>}
                {this.hasOrderAccess() && <option value={SelectorOrderType.Stop}>{SelectorOrderType.Stop}</option>}
              </select>

              <StockTickerTxButton
                onClick={this.handleBuyButtonClick}
                text={"Buy"}
                tooltip={this.getBuyTransactionCostContent()}
              />
              <StockTickerTxButton
                onClick={this.handleSellButtonClick}
                text={"Sell"}
                tooltip={this.getSellTransactionCostContent()}
              />
              <StockTickerTxButton onClick={this.handleBuyMaxButtonClick} text={"Buy MAX"} />
              <StockTickerTxButton onClick={this.handleSellAllButtonClick} text={"Sell ALL"} />
              <StockTickerPositionText p={this.props.p} stock={this.props.stock} />
              <StockTickerOrderList
                cancelOrder={this.props.cancelOrder}
                orders={this.props.orders}
                p={this.props.p}
                stock={this.props.stock}
              />
            </div>
          }
        />
      </li>
    );
  }
}
