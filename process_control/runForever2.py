import time
import sys

if __name__ == "__main__":
    try:
        args = sys.argv[1:]
        while True:
            print("永久跑動中 2222...", args)
            time.sleep(1)
    except:
        print("程序停止!!")
    # sys.exit(6)
