import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import produce from 'immer';

const numRows = 25;
const numCols = 25;
const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [-1, 0],
  [-1, -1],
  [-1, 1]
]
const emptyGrid = () => {
  const rows = [];
  for (let i = 0; i<numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
}

function App() {

  const [grid, setGrid] = useState(() => {
    return emptyGrid();
  });
  const [slowmo, setSlowmo] = useState(false)
  const [running, setRunning] = useState(false)
 
  const runningRef = useRef(running);
  runningRef.current = running

  const runSimulation = useCallback(() => {
    if(!runningRef.current) {
      return;
    }
    setGrid((g) => {
      return produce(g, gridCopy => {
        for (let i=0; i<numRows; i++) {
          for (let k=0; k<numCols; k++){
            let neighbors = 0;
            operations.forEach(([x,y]) => {
              const newI = i + x;
              const newK = k + y;
              if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols){
                neighbors += g[newI][newK]
              }
            });
            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }           
            }
          }
      });
    })
    
    setTimeout(runSimulation, slowmo? 1000 : 100);
  }, [slowmo])
  return (
    <div className="App">
      <button
        onClick = {() => {
          setSlowmo(!slowmo)
        }}
        style={{
          backgroundColor: slowmo? 'red' : 'white'
        }}>
          Slow-mo
      </button>
      <button
        onClick={()=> {
          const rows = [];
          for (let i = 0; i<numRows; i++) {
            rows.push(Array.from(Array(numCols), () => Math.random() > .5 ? 1 : 0));
          }
          setGrid(rows);
      }}>
        Random
      </button>
      <button
        onClick={()=>{
          setGrid(emptyGrid)
        }}>
        Clear
      </button>
      <button
        onClick = {() => {
          setRunning(!running);
          if (!running) {
            runningRef.current = true;
            runSimulation()
          }
        }}
      >
        {running ? 'stop' : 'start'}
      </button>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 20px)`
      }}>
        {grid.map((rows, i) =>
        rows.map((col, k) => (
          <div 
          key={`${i}-${k}`}
          onClick={() => {
            const newGrid = produce(grid, gridCopy => {
              gridCopy[i][k] = gridCopy[i][k] ? 0 : 1;
            });
            setGrid(newGrid);
          }} 
          style={{
            width: 20,
            height:20,
            backgroundColor: grid[i][k] ? "lightblue" : undefined,
            border: "solid 1px black"
          }}
          />
        )))}
      </div>
      <h1>If a cell has two neighbors it will give birth to two more neighbors, if it has fewer than two it will die</h1>
    </div>
  );
}

export default App;
