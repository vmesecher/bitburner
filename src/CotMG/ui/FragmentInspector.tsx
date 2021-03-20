import * as React from "react";
import { ActiveFragment } from "../ActiveFragment";
import { FragmentType } from "../FragmentType";

type IProps = {
    fragment: ActiveFragment | null;
}

export function FragmentInspector(props: IProps) {
    if(props.fragment === null) {
        return (<pre className="text">
            ID:     N/A<br />
            Type:   N/A<br />
            Charge: N/A<br />
            Heat:   N/A<br />
            [X, Y]  N/A<br />
        </pre>)
    }
    const f = props.fragment.fragment();
    return (<pre className="text">
        ID:     {props.fragment.id}<br />
        Type:   {FragmentType[f.type]}<br />
        Charge: {props.fragment.charge}<br />
        Heat:   {props.fragment.heat}<br />
        [X, Y]  {props.fragment.x}, {props.fragment.y}<br />
    </pre>)
}