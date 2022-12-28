import "./App.css";
import React, { useEffect, useRef } from "react";
import { Game } from "./Game/index";

function App() {
  const renderCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = renderCanvasRef.current;

    const game = new Game(canvas!);

    return () => {
      game.destroy();
    };
  }, []);

  return (
    <div id="app">
      <canvas
        ref={renderCanvasRef}
        id="renderCanvas"
        touch-action="none"
      ></canvas>
    </div>
  );
}

export default App;
