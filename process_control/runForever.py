import time
import sys

if __name__ == "__main__":
    i = 0
    try:
        while True:
            i += 1
            print("永久跑動中...", i)
            sys.stdout.flush()
            time.sleep(2)
    except:
        print("python 結束!!")
    sys.stdout.flush()
    sys.exit(6)
