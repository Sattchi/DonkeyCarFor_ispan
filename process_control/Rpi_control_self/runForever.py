import time
import sys

if __name__ == "__main__":
    i = 0
    try:
        while True:
            i += 1
            print("永久跑動中...", i)
            sys.stdout.flush() # 有顯示 不斷刷新
            time.sleep(2)
    except:
        print("python 結束!!") # 有顯示
    sys.stdout.flush()
    sys.exit(6) # 有用
# SIGINT 能關閉
# 想執行 Python 檔案: runForever.py
# 非同步!
# Spawned child pid: 1457
# 已經執行 Python 檔案: runForever.py
# stdout: 永久跑動中... 1

# stdout: 永久跑動中... 2

# stdout: 永久跑動中... 3

# stdout: 永久跑動中... 4

# stdout: 永久跑動中... 5

# 停止程式!
# 想執行 Python 檔案: runForever2.py
# 非同步!
# Spawned child pid: 1459
# 已經執行 Python 檔案: runForever2.py
# stdout: python 結束!!

# child process exited with code 6
