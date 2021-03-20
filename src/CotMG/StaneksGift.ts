import { Fragment, FragmentById } from "./Fragment";
import { ActiveFragment } from "./ActiveFragment";

export class StaneksGift {
    width: number = 8;
    height: number = 10;
    fragments: ActiveFragment[] = [];

    canPlace(x: number, y: number, fragment: Fragment): boolean {
        if(x + fragment.width() > this.width) return false;
        if(y + fragment.height() > this.height) return false;
        const newFrag = new ActiveFragment(x, y, fragment);
        for(const aFrag of this.fragments) {
            if(aFrag.collide(newFrag)) return false;
        }
        return true;
    }

    place(x: number, y: number, fragment: Fragment): boolean {
        if(!this.canPlace(x, y, fragment)) return false;
        this.fragments.push(new ActiveFragment(x, y, fragment));
        return true;
    }

    fragmentAt(worldX: number, worldY: number): ActiveFragment | null {
        for(const aFrag of this.fragments) {
            if(aFrag.fullAt(worldX, worldY)) {
                return aFrag;
            }
        }

        return null;
    }

    clear(): void {
        this.fragments = [];
    }
}