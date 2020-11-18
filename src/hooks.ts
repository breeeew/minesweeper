import {createContext, useCallback, useEffect, useState} from 'react';
import {TCellPoint} from './types';

export const GameContext = createContext<ReturnType<typeof useGameState>|null>(null);
export const MapContext = createContext<ReturnType<typeof useMap>|null>(null);
export const BombsContext = createContext<ReturnType<typeof useBombs>|null>(null);

export const useGameState = () => {
    const [gameOver, setGameOver] = useState<boolean>(false);

    return {
        gameOver,
        setGameOver,
    };
};

export const useMap = () => {
    const [map, setMap] = useState<TCellPoint[]>([]);
    const [rows, setRows] = useState(20);
    const [cols, setCols] = useState(20);

    const [discovered, setDiscovered] = useState<TCellPoint[]>([]);

    const discover = useCallback((point: TCellPoint, bombs: TCellPoint[]) => {
        const current = new Set(discovered);
        const bombsSet = new Set(bombs);

        const discoverNeighbours = (point: TCellPoint) => {
            if (bombsSet.has(point)) {
                return;
            }


            if (!current.has(point)) {
                current.add(point);

                const neighbours = getNeighbours(point, rows, cols);

                for (const neighbour of neighbours) {
                    const count = getNearBombCount(point, bombs, rows, cols);
                    if (count === 0) {
                        discoverNeighbours(neighbour);
                    }
                }
            }
        };

        if (bombs.length) {
            discoverNeighbours(point);
        }
        current.add(point);
        setDiscovered(Array.from(current));
    }, [cols, discovered, rows]);

    useEffect(() => {
        setMap(generateMap(rows, cols));
    }, [rows, cols]);

    const reset = useCallback(() => {
        setDiscovered([]);
        setMap(generateMap(rows, cols));
    }, [cols, rows]);

    return {
        map,
        discovered,
        discover,
        reset,
        setRows,
        setCols,
        rows,
        cols,
    };
};

export const useBombs = (count: number) => {
    const [bombs, setBombs] = useState<TCellPoint[]>([]);
    const generateBombsMap = useCallback((map: TCellPoint[], exclude: TCellPoint) => {
        setBombs(getBombsPoints(map, count, exclude));
    }, [count]);

    return {
        bombs,
        generateBombsMap,
        reset: () => setBombs([]),
    };
};

const generateMap = (rows: number, cols: number): TCellPoint[] => {
    const result: TCellPoint[] = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            result.push(`${row}:${col}`);
        }
    }

    return result;
};

const getBombsPoints = (map: TCellPoint[], bombCount: number, exclude: TCellPoint): TCellPoint[] => {
    const shuffled: TCellPoint[] = [...map];

    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled
        .filter(point => point !== exclude)
        .slice(0, bombCount);
};

const getNeighbours = (point: TCellPoint, rows: number, cols: number): TCellPoint[] => {
    const [rowStr, colStr] = point.split(':');
    const [row, col] = [Number(rowStr), Number(colStr)];

    let leftRow: number|null = row - 1;

    if (leftRow < 0) {
        leftRow = null;
    }

    let rightRow: number|null = row + 1;
    if (rightRow >= rows) {
        rightRow = null;
    }

    let topCol: number|null = col - 1;
    if (topCol < 0) {
        topCol = null;
    }

    let bottomCol: number|null = col + 1;
    if (bottomCol >= cols) {
        bottomCol = null;
    }

    const result: TCellPoint[] = [];

    if (leftRow !== null) {
        result.push(`${leftRow}:${col}`);

        if (topCol !== null) {
            result.push(`${leftRow}:${topCol}`);
        }
        if (bottomCol !== null) {
            result.push(`${leftRow}:${bottomCol}`);
        }
    }

    if (rightRow !== null) {
        result.push(`${rightRow}:${col}`);

        if (topCol !== null) {
            result.push(`${rightRow}:${topCol}`);
        }

        if (bottomCol !== null) {
            result.push(`${rightRow}:${bottomCol}`);
        }
    }

    if (topCol !== null) {
        result.push(`${row}:${topCol}`);
    }

    if (bottomCol !== null) {
        result.push(`${row}:${bottomCol}`);
    }
    return result;
};

export const getNearBombCount = (point: TCellPoint, bombs: TCellPoint[], rows: number, cols: number): number => {
    const bombsSet = new Set<string>(bombs);

    if (bombsSet.has(point)) {
        return 1;
    }

    const neighbours = getNeighbours(point, rows, cols);

    let currentCellCount = 0;

    for (const neighbour of neighbours) {
        if (bombsSet.has(neighbour)) {
            currentCellCount++;
        }
    }

    return currentCellCount;
};
