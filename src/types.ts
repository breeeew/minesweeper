export type TCellPoint = string;

export type TCellProps = {
    point: TCellPoint;
    onClick(point: TCellPoint): void;
}
