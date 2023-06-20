import cv2
import numpy as np

h = 480
w = 640
r = 20
row = h // r # 24
col = w // r # 32
font = cv2.FONT_HERSHEY_SIMPLEX

WHITE = (255,255,255)
BLUE = (255, 0, 0)
GREEN = (0,255,0)
RED = (0, 0, 255)
BLACK = (0,0,0)
# direct = 'R'
d = {'U': np.array([0, -1]), 'D': np.array([0, 1]),
     'R': np.array([1, 0]), 'L': np.array([-1, 0])}

times = [0.25, 0.2, 0.15, 0.13, 0.1, 0.09, 0.088, 0.085, 0.08]

class Snake:
    def __init__(self, x, y, r) -> None:
        self.head = np.array([x, y])
        self.length = 3
        self.bodys = [np.array([x-i, y]) for i in range(1,self.length)]
        self.direct = 'R'
        self.r = r

    def update(self):
        self.bodys.insert(0, np.array(self.head))
        self.head += d[self.direct]
        self.tail = self.bodys.pop()
        # print(self.tail)
        # print(self.head)
        # print(self.bodys)
        return

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

    def show(self, image1):
        leftup = self.head * self.r
        rightdown = [leftup[0] + self.r, leftup[1]+self.r]
        cv2.rectangle(image1, leftup, rightdown, GREEN, -1)
        for cor in self.bodys:
            leftup = cor * self.r
            rightdown = [leftup[0] + self.r, leftup[1]+self.r]
            cv2.rectangle(image1, leftup, rightdown, BLUE, -1)
        cv2.putText(image1, str(len(self.bodys)+1),
                    (50, 50), font, 2, BLACK, 2)

    def eat(self, ap=[-1, -1]):
        if self.head[0] == ap[0] and self.head[1] == ap[1]:
            self.bodys.append(self.tail)
            self.length += 1
            # print(self.tail)
            # print(self.head)
            # print(self.bodys)
            return True
        return False

    def boundary(self, row, col, noDie=False):
        if noDie:
            if self.head[0] >= col:
                self.head[0] = 0
                return False
            if self.head[0] < 0:
                self.head[0] = col - 1
                return False
            if self.head[1] >= row:
                self.head[1] = 0
                return False
            if self.head[1] < 0:
                self.head[1] = row - 1
                return False
        else:
            if self.head[0] >= col or self.head[0] < 0:
                return True
            if self.head[1] >= row or self.head[1] < 0:
                return True
        return False

    def hit(self, noDie=False):
        if noDie:
            return False
        for body in self.bodys:
            if self.head[0] == body[0] and self.head[1] == body[1]:
                return True
        return False


class Game:
    def __init__(self, h=480, w=640, r=20, background=None, noDie = False, fileName=None) -> None:
        self.h = h
        self.w = w
        self.r = r
        self.row = h // self.r
        self.col = w // self.r
        if background is not None:
            self.background = background
            shape = background.shape
            self.h = shape[0]
            self.w = shape[1]
            self.row = self.h // self.r
            self.col = self.w // self.r
        else:
            self.background = np.ones((self.h, self.w, 3), np.uint8) * 240

        self.snake = Snake(self.col//2, self.row//2, self.r)
        self.new_apple()
        self.level = 0
        self.noDie = noDie  # True 不死 False 會死
        self.fileName = fileName
        return

    def update(self):
        self.snake.update()
        return

    def changeSnakeDirect(self, key=None, string=None, num=None):
        self.snake.changeDirect(key=key, string=string, num=num)
        return

    def new_apple(self):
        newApple = np.random.randint([0, 0], [self.col, self.row])
        for body in self.snake.bodys:
            if body[0] == newApple[0] and body[1] == newApple[1]:
                self.new_apple()
                return
        self.apple = newApple

    def draw(self, inImage=None):
        if inImage is None:
            inImage = self.background
        image = np.array(inImage)
        apleftup = self.apple * self.r
        aprightsown = [apleftup[0]+self.r, apleftup[1]+self.r]
        cv2.rectangle(image, apleftup, aprightsown, RED, -1)

        if self.snake.eat(self.apple):
            self.new_apple()
            self.level = min(self.snake.length // 10, len(times) - 1)

        cv2.putText(image, str(self.level),
                    (self.w - 100, 50), font, 2, BLACK, 2)
        self.snake.show(image)
        self.image = image
        return image

    def show(self, inImage=None):
        cv2.imshow("Result", self.draw(inImage))
        if self.fileName:
            cv2.imwrite(self.fileName, self.image)
        return
    
    def getLevelTime(self):
        return int(times[self.level] * 1000)

    def check(self):
        if self.snake.boundary(self.row, self.col, self.noDie) or self.snake.hit(self.noDie):
            return not self.restart()
        return False

    def restart(self):
        cv2.putText(self.image, "You Die", (150, 150), font, 2, BLACK, 4)
        cv2.putText(self.image, "If You want Restart,",
                    (150, 200), font, 1, BLACK, 4)
        cv2.putText(self.image, "press Y or R", (150, 250), font, 1, BLACK, 4)
        cv2.imshow("Result", self.image)
        if self.fileName:
            cv2.imwrite(self.fileName, self.image)
        k = cv2.waitKey(0)
        if k == ord('y') or k == ord('r') or k == ord('Y') or k == ord('R'):
            self.__init__(self.h, self.w, self.r, self.background, self.noDie, self.fileName)
            return True
        return False


if __name__ == "__main__":
    game = Game(r=r, fileName="www2/img/photo.jpg")

    while True:
        game.update()
        game.show()
        k = cv2.waitKeyEx(game.getLevelTime())
        # print(k)
        if k == 27:
            break
        game.changeSnakeDirect(key=k)
        if game.check():
            break

    cv2.destroyAllWindows()
