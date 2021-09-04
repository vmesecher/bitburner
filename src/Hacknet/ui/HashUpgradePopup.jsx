/**
 * Create the pop-up for purchasing upgrades with hashes
 */
import React from "react";

import { purchaseHashUpgrade } from "../HacknetHelpers";
import { HashManager } from "../HashManager";
import { HashUpgrades } from "../HashUpgrades";

import { Player } from "../../Player";

import { numeralWrapper } from "../../ui/numeralFormat";

import { ServerDropdown, ServerType } from "../../ui/React/ServerDropdown";

import { dialogBoxCreate } from "../../../utils/DialogBox";
import { CopyableText } from "../../ui/React/CopyableText";
import { Hashes } from "../../ui/React/Hashes";

class HashUpgrade extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedServer: "ecorp",
    };

    this.changeTargetServer = this.changeTargetServer.bind(this);
    this.purchase = this.purchase.bind(
      this,
      this.props.hashManager,
      this.props.upg,
    );
  }

  changeTargetServer(e) {
    this.setState({
      selectedServer: e.target.value,
    });
  }

  purchase(hashManager, upg) {
    const canPurchase =
      hashManager.hashes >= hashManager.getUpgradeCost(upg.name);
    if (canPurchase) {
      const res = purchaseHashUpgrade(upg.name, this.state.selectedServer);
      if (res) {
        this.props.rerender();
      } else {
        dialogBoxCreate(
          "Failed to purchase upgrade. This may be because you do not have enough hashes, " +
            "or because you do not have access to the feature this upgrade affects.",
        );
      }
    }
  }

  render() {
    const hashManager = this.props.hashManager;
    const upg = this.props.upg;
    const cost = hashManager.getUpgradeCost(upg.name);
    const level = hashManager.upgrades[upg.name];
    const effect = upg.effectText(level);

    // Purchase button
    const canPurchase = hashManager.hashes >= cost;
    const btnClass = canPurchase ? "std-button" : "std-button-disabled";

    // We'll reuse a Bladeburner css class
    return (
      <div className={"bladeburner-action"}>
        <CopyableText value={upg.name} />
        <p>
          Cost: {Hashes(cost)}, Bought: {level} times
        </p>

        <p>{upg.desc}</p>
        <button className={btnClass} onClick={this.purchase}>
          Purchase
        </button>
        {level > 0 && effect && <p>{effect}</p>}
        {upg.hasTargetServer && (
          <ServerDropdown
            serverType={ServerType.Foreign}
            onChange={this.changeTargetServer}
            style={{ margin: "5px" }}
          />
        )}
      </div>
    );
  }
}

export class HashUpgradePopup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalHashes: Player.hashManager.hashes,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1e3);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  tick() {
    this.setState({
      totalHashes: Player.hashManager.hashes,
    });
  }

  render() {
    const rerender = this.props.rerender;

    const hashManager = Player.hashManager;
    if (!(hashManager instanceof HashManager)) {
      throw new Error(`Player does not have a HashManager)`);
    }

    const upgradeElems = Object.keys(HashUpgrades).map((upgName) => {
      const upg = HashUpgrades[upgName];
      return (
        <HashUpgrade
          upg={upg}
          hashManager={hashManager}
          key={upg.name}
          rerender={rerender}
        />
      );
    });

    return (
      <div>
        <p>Spend your hashes on a variety of different upgrades</p>
        <p>Hashes: {numeralWrapper.formatHashes(this.state.totalHashes)}</p>
        {upgradeElems}
      </div>
    );
  }
}
