import { StaneksGift } from "./StaneksGift";
import { ActiveFragment } from "./ActiveFragment";
import { Fragment } from "./Fragment";

export type IStaneksGift = {
    width: number;
    height: number;
    fragments: ActiveFragment[];
    canPlace(x: number, y: number, fragment: Fragment): boolean;
    place(x: number, y: number, fragment: Fragment): boolean;
    fragmentAt(worldX: number, worldY: number): ActiveFragment | null;
    clear(): void;
};