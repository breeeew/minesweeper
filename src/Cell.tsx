import cn from 'classnames';
import React, {useCallback, useContext, useMemo} from 'react';
import styles from './App.module.css';
import {BombsContext, GameContext, getNearBombCount, MapContext} from './hooks';
import {TCellProps} from './types';

const height = 32;
const width = 32;

export const Cell = React.memo<TCellProps>((props) => {
    const gameState = useContext(GameContext);
    const {bombs, setFlag, flags} = useContext(BombsContext) ?? {};
    const mapState = useContext(MapContext);

    const {gameOver, setGameOver} = gameState ?? {};

    const hasBomb = useMemo(() => bombs?.some(
        point => point === props.point
    ), [bombs, props.point]);

    const hasFlag = useMemo(() => flags?.some(
        point => point === props.point
    ), [flags, props.point]);

    const isDiscovered = useMemo(() => mapState?.discovered.some(
        point => point === props.point
    ), [mapState?.discovered, props.point]);

    const cellCount = useMemo(() => {
        if (!isDiscovered) {
            return 0;
        }

        return getNearBombCount(props.point, bombs ?? [], mapState?.rows ?? 0, mapState?.cols ?? 0);
    }, [isDiscovered, props.point, bombs, mapState?.rows, mapState?.cols]);

    const onClick = useCallback(() => {
        if (hasBomb) {
            setGameOver?.(true);
        } else if (!gameOver) {
            mapState?.discover(props.point, bombs ?? []);
        }

        props.onClick(props.point);
    }, [hasBomb, bombs, gameOver, props, setGameOver, mapState]);

    const onRightClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setFlag?.(props.point);
    }, [props.point, setFlag]);

    const [left, top] = props.point.split(':');

    return (
        <div
            onClick={onClick}
            onContextMenu={onRightClick}
            className={cn(styles.Cell, {
                [styles.Discovered]: isDiscovered,
                [styles.BombIsNear]: isDiscovered && cellCount,
            })}
            style={{
                left: `${Number(left) * width}px`,
                top: `${Number(top) * height}px`,
            }}
        >
            {gameOver && hasBomb && !hasFlag && '💣'}
            {!hasFlag && !hasBomb && isDiscovered && !!cellCount && `${cellCount}`}
            {hasFlag && '👍'}
        </div>
    );
});
