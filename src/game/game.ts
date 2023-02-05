import { Color, getRGBColor } from "./color";
import { Coordinates } from "./coordinates";
import { Direction } from "./direction";
import { Marble } from "./marble";
import { findRoute } from "./route";
import { GameState } from "./game-state";

export const CellsCount = 10;

const CellBorderWidth = 2;
const initialMarblesCount = 5;
const MarblesToCheckCount = 5;

export class Game {
    private selectedMarble: Marble | undefined;
    private selectedCell: Coordinates | undefined;

    private selectedMarbleVector: Coordinates | undefined;

    private marbles: Marble[] = [];

    private animating = false;

    private animationFrames: Coordinates[] = [];

    private gameCallbackTimestamp: number = 0;

    public cellSize: number = 0;    

    private score = 0;
    private gameState: GameState = GameState.Stopped;    

    constructor(private mapWidth: number, private mapHeight: number, private canvasContext: CanvasRenderingContext2D,
      private pointsScored: (points: number) => void, private gameStateChanged: (state: GameState) => void) {
      this.cellSize = mapWidth / CellsCount;
    }

    public start(): void {
      if (this.gameState === GameState.Started) {
        return;
      }

      this.changeGameState(GameState.Started);

      this.score = 0;
      this.pointsScored(this.score);

      this.marbles = [];
      this.addMarbles(initialMarblesCount);

      this.drawGame();
    }

    public mapTouched(x: number, y: number): void {
      if (this.animating) {
        return;
      }

      if (this.gameState === GameState.Stopped) {
        this.start();
        return;
      }

      let cellX = Math.floor(x / this.cellSize);
      let cellY = Math.floor(y / this.cellSize);

      this.selectedCell = new Coordinates(cellX, cellY);

      const selectedMarble = this.marbles.find((marble: Marble) => marble.coordinates.x === cellX && marble.coordinates.y === cellY);
      if (selectedMarble) {
        this.selectedMarble = selectedMarble;
      } else {
        if (this.selectedMarble) {          
          const start = { ...this.selectedMarble.coordinates };
          const end = { ...this.selectedCell };

          const map: number[][] = [];

          for (let x = 0; x < CellsCount; x++) {
            let columnArray: number[] = [];

            map.push(columnArray);

            for (let y = 0; y < CellsCount; y++) {
              columnArray.push(0);
            }
          }

          this.marbles.forEach(marble => {
            map[marble.coordinates.x][marble.coordinates.y] = Number.MAX_SAFE_INTEGER;
          });

          let animationFrames: Coordinates[] = [];
          let directions = findRoute(map, start, end);
          if (!directions || directions.length === 0) {
            return;
          }
          
          directions.forEach((direction: Direction) => {
            let x = 0;
            let y = 0;
            
            switch (direction) {
              case Direction.Up:
                y = -1;
                break;
              case Direction.Down:
                y = 1;
                break;
              case Direction.Left:
                x = -1;
                break;
              case Direction.Right:
                x = 1;
                break;
            }

            for (let i = 0; i < Math.floor(this.cellSize / 5); i++) {
              animationFrames.push(new Coordinates(5 * x, 5 * y));
            }

            const mod = this.cellSize % 5;

            if (mod > 0) {
              animationFrames.push(new Coordinates(mod * x, mod * y));
            }
          });          

          this.animationFrames = animationFrames.reverse();

          this.gameCallbackTimestamp = 0;
          this.animating = true;
          this.selectedMarbleVector = new Coordinates(0, 0);
          requestAnimationFrame(this.gameCallback.bind(this));          
        }
      }
      
      this.drawGame();      
    }
   
    private updateScore(color: Color, row: number, column: number): number {
      let points = 
        this.checkRow(color, row) ||
        this.checkColumn(color, column) ||
        this.checkLeftDiagonal(color, row, column) ||
        this.checkRightDiagonal(color, row, column);
      
      this.score += points;

      if (points) {
        this.drawGame();
        this.pointsScored(this.score);
      }

      return points;      
    }

    private animationEnded(): void {      
      this.selectedMarbleVector = undefined;

      if (this.selectedMarble && this.selectedCell) {
        this.selectedMarble.coordinates = new Coordinates(this.selectedCell.x, this.selectedCell.y);

        const color = this.selectedMarble.color;
        const row = this.selectedMarble.coordinates.y;
        const column = this.selectedMarble.coordinates.x;
        this.selectedMarble = undefined;
        this.selectedCell = undefined;

        this.drawGame();
        if (!this.updateScore(color, row, column)) {
          const addedMarbles = this.addMarbles(3);

          for (let i = 0; i < addedMarbles.length; i++) {
            const marble = addedMarbles[i];
            this.updateScore(marble.color, marble.coordinates.y, marble.coordinates.x);              
          }
        }
        
        this.drawGame();
      }

      if (this.marbles && this.marbles.length >= CellsCount * CellsCount) {
        this.changeGameState(GameState.Stopped);
      }
    }

    private checkRow(color: Color, row: number): number {
      let count = 0;
      let index = -1;
      let points = 0;
     
      for (let i = 0; i < CellsCount; i++) {
        if (this.marbles.some((marble: Marble) => marble.coordinates.x === i && marble.coordinates.y === row && marble.color === color)) {
          if (index === -1) {
            index = i;
          }

          count++;

          if (count > MarblesToCheckCount - 1) {
            for (let j = index; j < CellsCount; j++) {
              let marble = this.marbles.find((marble: Marble) => marble.coordinates.x === j && marble.coordinates.y === row);
              if (marble && marble.color === color) {
                points++;
                this.marbles = this.marbles.filter((m: Marble) => m !== marble);
              } else {
                break;
              }
            }

            return points;
          }
        } else {
          count = 0;
          index = -1;
        }
      }
        
      return 0;
    }     

    private checkColumn(color: Color, column: number): number {
      let count = 0;
      let index = -1;
      let points = 0;
     
      for (let i = 0; i < CellsCount; i++) {
        if (this.marbles.some((marble: Marble) => marble.coordinates.x === column && marble.coordinates.y === i && marble.color === color)) {
          if (index === -1) {
            index = i;
          }

          count++;

          if (count > MarblesToCheckCount - 1) {
            for (let j = index; j < CellsCount; j++) {
              let marble = this.marbles.find((marble: Marble) => marble.coordinates.x === column && marble.coordinates.y === j);
              if (marble && marble.color === color) {
                points++;
                this.marbles = this.marbles.filter((m: Marble) => m !== marble);
              } else {
                break;
              }
            }

            return points;
          }
        } else {
          count = 0;
          index = -1;
        }
      }
        
      return 0;
    }

    private checkLeftDiagonal(color: Color, row: number, column: number): number {
      let count = 0;
      let index = -1;
      let points = 0;
      let x = 0, y = 0, diagonal = 0;

      if (column <= row) {
        x = 0;
        y = row - column;
        diagonal = CellsCount - y;
      } else {
        y = 0;
        x = column - row;
        diagonal = CellsCount - x;
      }

      if (diagonal > MarblesToCheckCount - 1) {
        for (let i = 0; i < diagonal; i++) {            
          if (this.marbles.some((marble: Marble) => marble.coordinates.x === (x + i) && marble.coordinates.y === (y + i) && marble.color === color)) {
            if (index === -1) {
              index = i;
            }

            count++;
            if (count > MarblesToCheckCount - 1) {
                for (let j = index; j < diagonal; j++) {
                  let marble = this.marbles.find((marble: Marble) => marble.coordinates.x === (x + j) && marble.coordinates.y === (y + j));
                  if (!marble || marble.color !== color) {
                    return points;
                  }
                                            
                  points++;
                  this.marbles = this.marbles.filter((m: Marble) => m !== marble);
                }
                return points;
            }
          } else {
                count = 0;
                index = -1;
          }
        }
      }
      
      return 0;
    }

    private checkRightDiagonal(color: Color, row: number, column: number): number {
      let count = 0;
      let index = -1;
      let points = 0;
      let x = 0, y = 0, diagonal = 0;

      if (column + row >= CellsCount - 1) {
          x = CellsCount - 1;
          y = row + column - CellsCount + 1;
          diagonal = (CellsCount - y);
      } else {
          y = 0;
          x = column + row;
          diagonal = x + 1;
      }

      if (diagonal > MarblesToCheckCount - 1) {
        for (let i = 0; i < diagonal; i++) {
          if (this.marbles.some((marble: Marble) => marble.coordinates.x === (x - i) && marble.coordinates.y === (y + i) && marble.color === color)) {                    
            if (index === -1) {
              index = i;
            }

            count++;
            if (count > MarblesToCheckCount - 1) {
                for (let j = index; j < diagonal; j++) {
                  let marble = this.marbles.find((marble: Marble) => marble.coordinates.x === (x - j) && marble.coordinates.y === (y + j));
                  if (!marble || marble.color !== color) {
                    return points;
                  }
                                            
                  points++;
                  this.marbles = this.marbles.filter((m: Marble) => m !== marble);
                }
                return points;
            }                       
          } else {
            count = 0;
            index = -1;
          }
        }
      }

      return 0;
    }    

    private gameCallback(timestamp: number): void {
      if (!this.animating) {
        return;
      }

      if (timestamp - this.gameCallbackTimestamp > 0) {
        this.gameCallbackTimestamp = timestamp;

        if (!this.selectedMarbleVector) {
          this.selectedMarbleVector = new Coordinates(0, 0);
        }

        if (this.animationFrames && this.animationFrames.length > 0) {
          const coordinates = this.animationFrames.pop();
          this.selectedMarbleVector.x += coordinates!.x;
          this.selectedMarbleVector.y += coordinates!.y;
          
          this.drawGame();
        } else {
          this.animating = false;
          this.animationEnded();          
          return;
        }            
      }

      requestAnimationFrame(this.gameCallback.bind(this));
    }

    private drawGame(): void {
      this.canvasContext.clearRect(0, 0, this.mapWidth, this.mapHeight);

      this.drawMap();
      this.drawMarbles();
      this.drawSelectedCell();
    }

    private drawMap(): void {
        this.canvasContext.strokeStyle = '#EABD01';
        this.canvasContext.lineWidth = CellBorderWidth;    
            
        for (let x = 0; x < CellsCount; x++) {
          for (let y = 0; y < CellsCount; y++) {            
            this.canvasContext.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
          }
        }
    }

    private drawMarbles(): void {
      this.marbles.forEach((marble: Marble) => {  
        this.canvasContext.fillStyle = getRGBColor(marble.color);
        this.canvasContext.strokeStyle = "#000000";
        this.canvasContext.lineWidth = 2;

        this.canvasContext.beginPath();

        let x = marble.coordinates.x * this.cellSize + (this.cellSize / 2);
        let y = marble.coordinates.y * this.cellSize + (this.cellSize / 2);

        if (marble === this.selectedMarble && this.selectedMarbleVector) {
          x += this.selectedMarbleVector.x;
          y += this.selectedMarbleVector.y;
        }

        this.canvasContext.arc(x, y, this.cellSize / 2 - (3 * CellBorderWidth), 0, 2 * Math.PI);

        this.canvasContext.fill();
        this.canvasContext.stroke();
      });
    }

    private drawSelectedCell(): void {
      if (this.selectedCell) {
        this.canvasContext.strokeStyle = "#000000";
        this.canvasContext.lineWidth = 6;
        this.canvasContext.strokeRect(this.selectedCell.x * this.cellSize + 4, this.selectedCell.y * this.cellSize + 4, this.cellSize - 8, this.cellSize - 8);
      }
    }

    private addMarbles(count: number): Marble[] {
      let marblesAdded: Marble[] = [];
      
      let mapCells: Coordinates[] = [];
      let marblesCoordinates = this.marbles.map((marble: Marble) => marble.coordinates);

      for (let y = 0; y < CellsCount; y++) {
        for (let x = 0; x < CellsCount; x++) {
          if (marblesCoordinates.findIndex((coordinate: Coordinates) => coordinate.x === x && coordinate.y === y) === -1) {
            mapCells.push(new Coordinates(x, y));
          }
        }
      }

      for (let i = 0; i < count; i++) {
        const marbleCoordinatesIndex = Math.floor(Math.random() * mapCells.length);
        const coordinates = mapCells[marbleCoordinatesIndex];
        const color = Math.ceil(Math.random() * 6);
        
        const marble = new Marble(coordinates.x, coordinates.y, color);
        this.marbles.push(marble);
        
        marblesAdded.push(marble);

        mapCells.splice(marbleCoordinatesIndex, 1);

        if (mapCells.length === 0) {
          break;
        }
      }

      return marblesAdded;
    } 

    private changeGameState(state: GameState): void {
      this.gameState = state;
      this.gameStateChanged(state);
  }
}