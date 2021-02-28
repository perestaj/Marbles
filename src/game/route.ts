import { Coordinates } from "./coordinates";
import { Direction } from "./direction";
import { Queue } from "./queue";

export function findRoute(map: number[][], start: Coordinates, end: Coordinates): Direction[] {
   if (!map || map.length === 0 || map[0].length === 0) {
       return [];
   }

   const columnsCount = map.length;
   const rowsCount = map[0].length;

  let stack = new Queue<Coordinates>();
  stack.enqueue(end);

  let found = false;

  while(stack.length > 0) {
    let coordinate = stack.dequeue();
    let current = map[coordinate!.x][coordinate!.y];
    current++;

    if (coordinate!.x > 0) {
      if ((coordinate!.x - 1 === start.x) && (coordinate!.y === start.y)) {
        found = true;
        break;
      } else if (map[coordinate!.x - 1][coordinate!.y] === 0) {
          map[coordinate!.x - 1][coordinate!.y] = current;
          stack.enqueue(new Coordinates(coordinate!.x - 1, coordinate!.y));                
      }
    }

    if (coordinate!.x < columnsCount - 1) {
      if ((coordinate!.x + 1 === start.x) && (coordinate!.y === start.y)) {
        found = true;
        break;
      } else if (map[coordinate!.x + 1][coordinate!.y] === 0) {
          map[coordinate!.x + 1][coordinate!.y] = current;
          stack.enqueue(new Coordinates(coordinate!.x + 1, coordinate!.y));              
      }
    }

    if (coordinate!.y > 0) {
      if ((coordinate!.y - 1 === start.y) && (coordinate!.x === start.x)) {
        found = true;
        break;
      } else if (map[coordinate!.x][coordinate!.y - 1] === 0) {
          map[coordinate!.x][coordinate!.y - 1] = current;
          stack.enqueue(new Coordinates(coordinate!.x, coordinate!.y - 1));
      }
    }

    if (coordinate!.y < rowsCount - 1) {
      if ((coordinate!.y + 1 === start.y) && (coordinate!.x === start.x)) {
        found = true;
        break;
      } else if (map[coordinate!.x][coordinate!.y + 1] === 0) {
          map[coordinate!.x][coordinate!.y + 1] = current;
          stack.enqueue(new Coordinates(coordinate!.x, coordinate!.y + 1));              
      }
    }
  }

  if (found) {
    let directions = createDirectionsList(map, start, end);
    return directions;
  }

  return [];
}

function createDirectionsList(map: number[][], start: Coordinates, end: Coordinates): Direction[] {
  let directions: Direction[] = [];

  const columnsCount = map.length;
  const rowsCount = map[0].length;

  map[start.x][start.y] = 0;
  let counter = 0;
  let x = start.x;
  let y = start.y;

  if (x > 0 && map[x - 1][y] > 0 && map[x - 1][y] < Number.MAX_SAFE_INTEGER) {
      counter = map[x - 1][y];
  }
  else if (x < columnsCount - 1 && map[x + 1][y] > 0 && map[x + 1][y] < Number.MAX_SAFE_INTEGER) {
    counter = map[x + 1][y];
  } else if (y > 0 && map[x][y - 1] > 0 && map[x][y - 1] < Number.MAX_SAFE_INTEGER) {
    counter = map[x][y - 1];
  } else if (y < rowsCount - 1 && map[x][y + 1] > 0 && map[x][y + 1] < Number.MAX_SAFE_INTEGER) {
    counter = map[x][y + 1];
  }
  else {
    counter = 0;
  }

  do
  {
    if (counter === 0) {
      if ((x === end.x - 1) && y === end.y) {
        directions.push(Direction.Right);
      } else if ((x === end.x + 1) && y === end.y) {
        directions.push(Direction.Left);
      } else if (x === end.x && (y === end.y - 1)) {
        directions.push(Direction.Down);
      } else if (x === end.x && y === end.y + 1) {
        directions.push(Direction.Up);
      }
        
      break;
    }

    if ((x < columnsCount - 1) && ((map[x + 1][y] === counter))) {
        directions.push(Direction.Right);
        x++; 
        counter--;
        continue;
    }

    if ((x > 0) && ((map[x - 1][y] === counter))) {
        directions.push(Direction.Left);
        x--; 
        counter--;
        continue;
    }

    if ((y < rowsCount - 1) && ((map[x][y + 1] === counter))) {
        directions.push(Direction.Down);
        y++;
        counter--;
        continue;
    }

    if (y > 0 && map[x][y - 1] === counter) {
        directions.push(Direction.Up);
        y--;
        counter--;
        continue;
    }
  } while (true);

  return directions;
}