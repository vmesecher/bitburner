import React, { useState } from "react";

import { IPlayer } from "../../PersonObjects/IPlayer";

import { StdButtonPurchased } from "../../ui/React/StdButtonPurchased";
import { StdButton } from "../../ui/React/StdButton";
import { Money } from "../../ui/React/Money";
import { MathComponent } from "mathjax-react";

type IProps = {
  p: IPlayer;
};

export function CoresButton(props: IProps): React.ReactElement {
  const setRerender = useState(false)[1];
  function rerender(): void {
    setRerender((old) => !old);
  }

  const btnStyle = { display: "block" };

  const homeComputer = props.p.getHomeComputer();
  const maxCores = homeComputer.cpuCores >= 8;
  if (maxCores) {
    return (
      <StdButtonPurchased
        style={btnStyle}
        text={"Upgrade 'home' cores - MAX"}
      />
    );
  }

  const cost = 1e9 * Math.pow(7.5, homeComputer.cpuCores);

  function buy(): void {
    if (maxCores) return;
    if (!props.p.canAfford(cost)) return;
    props.p.loseMoney(cost);
    homeComputer.cpuCores++;
    rerender();
  }

  return (
    <StdButton
      disabled={!props.p.canAfford(cost)}
      onClick={buy}
      style={btnStyle}
      text={
        <>
          Upgrade 'home' cores ({homeComputer.cpuCores} -&gt;{" "}
          {homeComputer.cpuCores + 1}) - <Money money={cost} player={props.p} />
        </>
      }
      tooltip={
        <MathComponent
          tex={String.raw`\large{cost = 10^9 \times 7.5 ^{\text{cores}}}`}
        />
      }
    />
  );
}
