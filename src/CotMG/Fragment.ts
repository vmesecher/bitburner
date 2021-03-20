import { FragmentType } from "./FragmentType";

export const Fragments: Fragment[] = [];

export class Fragment {
    id: number;
    shape: boolean[][];
    type: FragmentType;
    limit: number;

    constructor(id: number, shape: boolean[][], type: FragmentType, limit: number) {
        this.id = id;
        this.shape = shape;
        this.type = type;
        this.limit = limit;
    }

    fullAt(x: number, y: number): boolean {
        if(y < 0) return false;
        if(y >= this.shape.length) return false;
        if(x < 0) return false;
        if(x >= this.shape[y].length) return false;
        // Yes it's ordered y first.
        return this.shape[y][x];
    }

    width() {
        // check every line for robustness.
        return Math.max(...this.shape.map(line => line.length));
    }

    height() {
        return this.shape.length;
    }
}

export function FragmentById(id: number): Fragment | null {
    for(const fragment of Fragments) {
        if(fragment.id === id) return fragment;
    }
    return null;
}


(function() {
    const _ = false;
    const X = true;
    Fragments.push(new Fragment(
        0, // id
        [ // shape
            [X,X,X],
            [_,_,X],
            [_,_,X],
        ],
        FragmentType.HackingSkill, // type
        1, // limit
    ));
    Fragments.push(new Fragment(
        1, // id
        [ // shape
            [_,X,_],
            [X,X,X],
            [_,X,_],
        ],
        FragmentType.HackingSkill, // type
        1, // limit
    ));
    Fragments.push(new Fragment(
        2, // id
        [ // shape
            [X,X,X],
            [X,_,X],
            [X,X,X],
        ],
        FragmentType.Booster, // type
        3, // limit
    ));
    Fragments.push(new Fragment(
        3, // id
        [ // shape
            [X,X],
            [X,X],
        ],
        FragmentType.Cooling, // type
        Infinity, // limit
    ));
    Fragments.push(new Fragment(
        4, // id
        [ // shape
            [X],
        ],
        FragmentType.Cooling, // type
        1, // limit
    ));
})();