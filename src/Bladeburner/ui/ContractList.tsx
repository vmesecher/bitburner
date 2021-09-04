import React from "react";
import { ContractElem } from "./ContractElem";
import { IBladeburner } from "../IBladeburner";
import { IPlayer } from "../../PersonObjects/IPlayer";

interface IProps {
  bladeburner: IBladeburner;
  player: IPlayer;
}

export function ContractList(props: IProps): React.ReactElement {
  const names = Object.keys(props.bladeburner.contracts);
  const contracts = props.bladeburner.contracts;
  return (
    <>
      {names.map((name: string) => (
        <li key={name} className="bladeburner-action">
          <ContractElem
            bladeburner={props.bladeburner}
            action={contracts[name]}
            player={props.player}
          />
        </li>
      ))}
    </>
  );
}
