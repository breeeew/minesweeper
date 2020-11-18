import React, {useCallback, useContext, useState} from 'react';
import styles from './App.module.css';
import {GameContext, BombsContext, MapContext, useBombs, useGameState, useMap} from './hooks';
import {TCellPoint} from './types';
import {Cell} from './Cell';

const RenderCells = React.memo(() => {
    const {map = []} = useContext(MapContext) ?? {};
    const {bombs, generateBombsMap} = useContext(BombsContext) ?? {};

    const onCellClick = useCallback((point: TCellPoint) => {
        if (!bombs?.length) {
            generateBombsMap?.(map, point);
        }
    }, [map, bombs, generateBombsMap]);

    const Cells = map.map(point =>
        <Cell
            onClick={onCellClick}
            key={point}
            point={point}
        />
    );

    return <>{Cells}</>
});

function App() {
    const [bombsCount, setBombsCount] = useState(50)

    const gameState = useGameState();
    const mapState = useMap();
    const bombsState = useBombs(bombsCount);

    const handleChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.id === 'rows') {
            mapState.setRows(Number(e.target.value) || mapState.rows);
        }

        if (e.target.id === 'cols') {
            mapState.setCols(Number(e.target.value) || mapState.cols);
        }

        if (e.target.id === 'bombs') {
            setBombsCount(Number(e.target.value) || bombsCount);
        }
    }, [bombsCount, mapState]);

    return (
        <div className={styles.App}>
            <GameContext.Provider value={gameState}>
                <MapContext.Provider value={mapState}>
                    <BombsContext.Provider value={bombsState}>
                        <div className={styles.Cells}>
                            <RenderCells/>
                        </div>
                        <div className={styles.Params}>
                            <div className={styles.Inputs}>
                                <div className={styles.InputRow}>
                                    <label className={styles.Label}>rows:</label>
                                    <input
                                        id={'rows'}
                                        onChange={handleChangeInput}
                                        value={mapState.rows}
                                        className={styles.Input}
                                    />
                                </div>
                                <div className={styles.InputRow}>
                                    <label className={styles.Label}>columns:</label>
                                    <input
                                        id={'cols'}
                                        onChange={handleChangeInput}
                                        value={mapState.cols}
                                        className={styles.Input}
                                    />
                                </div>
                                <div className={styles.InputRow}>
                                    <label className={styles.Label}>bombs:</label>
                                    <input
                                        id={'bombs'}
                                        onChange={handleChangeInput}
                                        value={bombsCount}
                                        className={styles.Input}
                                    />
                                </div>
                            </div>
                            <div className={styles.Smile} onClick={() => {
                                mapState.reset();
                                bombsState.reset();
                                gameState.setGameOver(false);
                            }}>
                                {!gameState.gameOver && '😎'}
                                {gameState.gameOver && '💀'}
                            </div>
                        </div>
                    </BombsContext.Provider>
                </MapContext.Provider>
            </GameContext.Provider>
        </div>
    );
}

export default App;
