import time
import sys

if __name__ == "__main__":
    try:
        args = sys.argv[1:]
        while True:
            print("永久跑動中 2222...", args) # 有顯示 結束時一次出現
            time.sleep(5)
    except:
        print("python 結束!! 222 ...") # 有顯示
        sys.stdout.flush()
    sys.exit(0) # 有用
# SIGINT 能關閉
# 想執行 Python 檔案: runForever2.py
# 非同步!
# Spawned child pid: 1393
# 已經執行 Python 檔案: runForever2.py
# 停止程式!
# 想執行 Python 檔案: runForever2.py
# 非同步!
# Spawned child pid: 1394
# 已經執行 Python 檔案: runForever2.py
# stdout: 永久跑動中 2222... []
# 永久跑動中 2222... []
# 永久跑動中 2222... []
# 永久跑動中 2222... []
# python 結束!! 222 ...

# child process exited with code 0

