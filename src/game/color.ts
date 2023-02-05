export enum Color {
    Blue = 1,
    Orange = 2,
    Yellow = 3,
    Brown = 4,
    Green = 5,
    Red = 6
}

export function getRGBColor(color: Color): string {
    switch(color) {
        case Color.Blue:
            return "#0000FF";
        case Color.Brown:
            return "#800000";
        case Color.Green:
            return "#00FF00";
        case Color.Orange:
            return "#FF8000";
        case Color.Red:
            return "#FF0000";
        case Color.Yellow:
            return "#FFFF00";
    }
}