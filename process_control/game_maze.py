import numpy as np
import cv2
import random

WHITE = (255, 255, 255)
YELLOW = (0, 255, 255)
PURPLE = (255, 0, 255)
AQUA = (255, 255, 0)
BLUE = (255, 0, 0)
GREEN = (0, 255, 0)
RED = (0, 0, 255)
GRAY = (128, 128, 128)
BLACK = (0, 0, 0)


d = {'U': np.array([0, -1]), 'D': np.array([0, 1]),
     'R': np.array([1, 0]), 'L': np.array([-1, 0])}

font = cv2.FONT_HERSHEY_SIMPLEX


def index(i=0, j=0, cols=40, rows=20):
    if i < 0 or j < 0 or (i > cols-1) or (j > rows-1):
        return -1
    return i+j*cols


class Cell:
    def __init__(self, i, j) -> None:
        self.i = i
        self.j = j
        # self.walls = [True, True, True, True]  # top right bottom left
        self.walls = {"U": True, "D": True, "L": True, "R": True}
        self.visited = False
        return

    def draw(self, image, sideLen, color=(255, 0, 255, 100), lineThickness=3):
        x = self.i * sideLen
        y = self.j * sideLen

        if self.visited and color:
            cv2.rectangle(image, (x, y), (x+sideLen, y+sideLen),
                          color, -1)
        if self.walls["U"]:  # top
            cv2.line(image, (x, y), (x+sideLen, y), BLACK, lineThickness)
        if self.walls["R"]:  # right
            cv2.line(image, (x+sideLen, y), (x+sideLen,
                     y+sideLen), BLACK, lineThickness)
        if self.walls["D"]:  # bottom
            cv2.line(image, (x, y+sideLen), (x+sideLen,
                     y+sideLen), BLACK, lineThickness)
        if self.walls["L"]:  # left
            cv2.line(image, (x, y), (x, y+sideLen), BLACK, lineThickness)

        return

    def highlight(self, image, sideLen, color=(0, 255, 0)):
        self.draw(image, sideLen, color)
        return

    def checkNeighbors(self, cols, rows, grid):
        neighbors = []
        possibleNeigh = [(self.i, self.j-1),
                         (self.i+1, self.j), (self.i, self.j+1), (self.i-1, self.j)]

        for itemi, itemj in possibleNeigh:
            # print(itemi, itemj)
            itemIndex = index(itemi, itemj, cols, rows)
            if itemIndex == -1:
                continue
            item = grid[itemIndex]
            if not item.visited:
                neighbors.append(item)

        if len(neighbors) > 0:
            r = random.choice(neighbors)
            # print(r.i, r.j)
            return r
        else:
            return None

    def tryMove(self, direct):
        if direct in ["U", "D", "L", "R"] and not self.walls[direct]:
            return True, self.i+d[direct][0], self.j+d[direct][1]
        return False, self.i, self.j


class MazeGenerator:
    def __init__(self, width=600, height=400, sideLen=40) -> None:
        self.width = width
        self.height = height
        self.cols = width // sideLen
        self.rows = height // sideLen
        self.sideLen = sideLen
        self.grid = []
        self.stack = []
        self.current = 0
        return

    def setup(self):
        self.grid = []
        for j in range(self.rows):
            for i in range(self.cols):
                cell = Cell(i, j)
                self.grid.append(cell)

        self.current = self.grid[0]
        return

    def draw(self, image, color):
        for item in self.grid:
            item.draw(image, self.sideLen, color)
        self.current.highlight(image, self.sideLen)
        return image

    def show(self, title=""):
        background = np.ones((self.height, self.width, 3),
                             dtype=np.uint8) * 255
        self.draw(background, (255, 0, 255, 100))
        cv2.imshow(title, background)

    def update(self):
        # print("Current", self.current.i, self.current.j)
        self.current.visited = True
        nextCell = self.current.checkNeighbors(self.cols, self.rows, self.grid)
        # print("Next", nextCell)

        if nextCell:
            # print(nextCell.i, nextCell.j)
            self.stack.append(self.current)
            self.removeWalls(self.current, nextCell)
            nextCell.visited = True
            self.current = nextCell
            return False
        elif len(self.stack) > 0:
            self.current = self.stack.pop()
            return False

        return True

    def removeWalls(self, a, b):
        x = a.i - b.i
        if x == 1:
            a.walls["L"] = False
            b.walls["R"] = False
            return
        if x == -1:
            a.walls["R"] = False
            b.walls["L"] = False
            return
        y = a.j - b.j
        if y == 1:
            a.walls["U"] = False
            b.walls["D"] = False
            return
        if y == -1:
            a.walls["D"] = False
            b.walls["U"] = False
            return
        return

    def generate(self):
        self.setup()
        while True:
            if self.update():
                break
        return self.grid


class MazeGame:
    def __init__(self, width=600, height=400, sideLen=40, fileName=None) -> None:
        self.width = width
        self.height = height
        self.sideLen = sideLen
        self.mazeGenerator = MazeGenerator(width, height, sideLen)
        self.cols = self.mazeGenerator.cols
        self.rows = self.mazeGenerator.rows
        self.grid = self.mazeGenerator.generate()
        self.start = self.grid[0]
        self.current = self.grid[0]
        self.target = self.grid[-1]
        self.direct = "D"
        self.fileName = fileName
        return

    def setCurrentIJ(self, i, j):
        currentIndex = index(i, j, self.cols, self.rows)
        self.current = self.grid[currentIndex]
        return

    def update(self, needRestart=False):
        canMove, nextCellI, nextCellJ = self.current.tryMove(self.direct)
        if canMove:
            nextIndex = index(nextCellI, nextCellJ, self.cols, self.rows)
            self.current = self.grid[nextIndex]
        elif needRestart:
            self.restart()
        return canMove, self.current

    def changeDirect(self, key=None, string=None, num=None):
        if key and key != -1:
            if key == ord('w') or key == ord('W') or key == 2490368:
                self.direct = 'U'
            if key == ord('s') or key == ord('S') or key == 2621440:
                self.direct = 'D'
            if key == ord('a') or key == ord('A') or key == 2424832:
                self.direct = 'L'
            if key == ord('d') or key == ord('D') or key == 2555904:
                self.direct = 'R'
            return
        if string:
            self.direct = string
            return
        if num and num != 0:
            if num == 1:
                self.direct = "U"
            if num == 2:
                self.direct = "D"
            if num == 3:
                self.direct = "L"
            if num == 4:
                self.direct = "R"
            return

    def draw(self, image=None, width=None, height=None):
        if image is None:
            if not width:
                width = self.width
            if not height:
                height = self.height
            background = np.ones(
                (height, width, 3), dtype=np.uint8) * 255
        else:
            background = np.array(image)

        self.mazeGenerator.draw(background, None)
        self.start.highlight(background, self.sideLen, GREEN)
        self.target.highlight(background, self.sideLen, RED)
        self.current.highlight(background, self.sideLen, BLUE)
        self.image = background
        return background

    def show(self, title="", image=None, width=None, height=None):
        self.draw(image, width, height)
        cv2.imshow(title, self.image)
        if self.fileName:
            cv2.imwrite(self.fileName, self.image)
        return self.image

    def checkWin(self):
        if self.current == self.target:
            return True
        return False

    def restart(self):
        self.current = self.start
        self.direct = "D"
        return

    def reset(self, title="Maze"):
        self.show(title, self.image)
        cv2.putText(self.image, "You Win",
                    (150, 150), font, 2, BLACK, 4)
        cv2.putText(self.image, "If You want Restart,",
                    (150, 200), font, 1, BLACK, 4)
        cv2.putText(self.image, "press Y or R", (150, 250), font, 1, BLACK, 4)
        cv2.imshow(title, self.image)
        if self.fileName:
            cv2.imwrite(self.fileName, self.image)
        k = cv2.waitKey(0)
        if k == ord('y') or k == ord('r') or k == ord('Y') or k == ord('R'):
            self.grid = self.mazeGenerator.generate()
            self.start = self.grid[0]
            self.current = self.grid[0]
            self.target = self.grid[-1]
            self.direct = "D"
            return True
        return False


if __name__ == '__main__':
    game = MazeGame(600, 400, 40, fileName="www/img/photo.jpg")
    lineThickness = 3
    needRestart = True
    while True:
        game.show("Maze")
        k = cv2.waitKeyEx(1)
        if k == 27 or k == ord('q'):
            break

        if k != -1:
            game.changeDirect(k)
            game.update(needRestart)

        if k == ord('n'):
            needRestart = not needRestart

        if game.checkWin():
            if not game.reset("Maze"):
                break

    # cv2.waitKey(0)
    cv2.destroyAllWindows()
