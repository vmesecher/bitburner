import { Fragment, FragmentById } from "./Fragment";

export class ActiveFragment {
    id: number;
    charge: number;
    heat: number;
    x: number;
    y: number;

    constructor(x: number, y: number, fragment: Fragment) {
        this.id = fragment.id;
        this.x = x;
        this.y = y;
        this.charge = 0;
        this.heat = 0;
    }

    collide(other: ActiveFragment): boolean {
        const thisFragment = this.fragment();
        const otherFragment = other.fragment();
        // These 2 variables converts 'this' local coordinates to world to other local.
        const dx: number = other.x-this.x;
        const dy: number = other.y-this.y;
        for(let j = 0; j < thisFragment.shape.length; j++) {
            for(let i = 0; i < thisFragment.shape[j].length; i++) {
                if(thisFragment.fullAt(i, j) && otherFragment.fullAt(i-dx, j-dy)) return true;
            }
        }

        return false;
    }

    fragment(): Fragment {
        const fragment = FragmentById(this.id);
        if(fragment === null) throw "ActiveFragment id refers to unknown Fragment.";
        return fragment;
    }

    fullAt(worldX: number, worldY: number): boolean {
        return this.fragment().fullAt(worldX-this.x, worldY-this.y);
    }
}