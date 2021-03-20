import * as React from "react";
import { Fragment, Fragments } from "../Fragment";
import { ActiveFragment } from "../ActiveFragment";
import { IStaneksGift } from "../IStaneksGift";
import { StdButton } from "../../ui/React/StdButton";
import { Cell } from "./Cell";
import { FragmentInspector } from "./FragmentInspector";
import { FragmentSelector } from "./FragmentSelector";

let selectedFragment: Fragment = Fragments[0];

type GridProps = {
    gift: IStaneksGift;
}

export function Grid(props: GridProps) {
    function zeros(dimensions: number[]): any {
        const array = [];

        for (let i = 0; i < dimensions[0]; ++i) {
            array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
        }

        return array;
    }

    const [grid, setGrid] = React.useState(zeros([props.gift.width, props.gift.height]));
    const [ghostGrid, setGhostGrid] = React.useState(zeros([props.gift.width, props.gift.height]));
    const [pos, setPos] = React.useState([0, 0]);

    function moveGhost(x: number, y: number) {
        const newgrid = zeros([props.gift.width, props.gift.height]);
        for(let i = 0; i < selectedFragment.shape.length; i++) {
            for(let j = 0; j < selectedFragment.shape[i].length; j++) {
                if(x+i > newgrid.length-1) continue;
                if(y+j > newgrid[x+i].length-1) continue;
                if(!selectedFragment.shape[j][i]) continue;
                newgrid[x+i][y+j] = 1;
            }
        }

        setGhostGrid(newgrid);
        setPos([x, y]);
    }

    function click(x: number, y: number) {
        if(!props.gift.canPlace(x, y, selectedFragment)) return;
        props.gift.place(x, y, selectedFragment);
        const newgrid = zeros([props.gift.width, props.gift.height]);
        for(let i = 0; i < props.gift.width; i++) {
            for(let j = 0; j < props.gift.height; j++) {
                const fragment = props.gift.fragmentAt(i, j);
                if(fragment === null) continue;
                newgrid[i][j] = 1;
            }
        }
        setGrid(newgrid);

        selectedFragment = Fragments[Math.floor(Fragments.length*Math.random())];
    }

    function randomColor(fragment: ActiveFragment): string {
       // Can't set Math.random seed so copy casino. TODO refactor both RNG later.
        let s1 = Math.pow((fragment.x+1)*(fragment.y+1), 10);
        let s2 = s1;
        let s3 = s1;

        let colors = [];
        for(let i = 0; i < 3; i++) {
            s1 = (171 * s1) % 30269;
            s2 = (172 * s2) % 30307;
            s3 = (170 * s3) % 30323;
            colors.push((s1/30269.0 + s2/30307.0 + s3/30323.0)%1.0);
        }

        return `rgb(${colors[0]*256}, ${colors[1]*256}, ${colors[2]*256})`;
    }

    function color(x: number, y: number): string {
        if(ghostGrid[x][y] && grid[x][y]) return "red";
        if(ghostGrid[x][y]) return "white";
        if(grid[x][y]) {
            const fragment = props.gift.fragmentAt(x, y);
            if(fragment === null) throw "ActiveFragment should not be null";
            return randomColor(fragment);
        }
        return "";
    }

    function clear() {
        props.gift.clear();
        setGrid(zeros([props.gift.width, props.gift.height]));
    }

    // switch the width/length to make axis consistent.
    const elems = [];
    for(let j = 0; j < props.gift.height; j++) {
        const cells = [];
        for(let i = 0; i < props.gift.width; i++) {
            cells.push(<Cell
                key={i}
                onMouseEnter={() => moveGhost(i, j)}
                onClick={()=>click(i, j)}
                color={color(i, j)}
            />);
        }
        elems.push(<div key={j} className="staneksgift_row">
            {...cells}
        </div>)
    }

    return (<div>
        <StdButton onClick={clear} text="Clear" />
        <div style={{float: 'left'}}>
            {...elems}
        </div>
        <div>
            <FragmentInspector fragment={props.gift.fragmentAt(pos[0], pos[1])}/>
            <FragmentSelector selectFragment={function(){}}/>
        </div>
    </div>)
}
