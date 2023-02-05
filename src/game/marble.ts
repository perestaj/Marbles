import { Color } from "./color";
import { Coordinates } from "./coordinates";

export class Marble {
    private _color: Color;

    public coordinates: Coordinates;

    public get color(): Color {
        return this._color;
    }


    constructor(private x: number, private y: number, private marbleColor: Color) {
        this.coordinates = new Coordinates(x, y);
        this._color = marbleColor;
    }
}