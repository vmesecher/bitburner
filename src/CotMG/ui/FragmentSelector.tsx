import * as React from "react";
import { Fragments } from "../Fragment";

type IProps = {
    selectFragment: () => void;
}

export function FragmentSelector(props: IProps) {
    return (<li>
        <ul className="text">F0</ul>
        <ul className="text">F1</ul>
        <ul className="text">F2</ul>
    </li>)
}

