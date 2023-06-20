import time
import sys
if __name__ == "__main__":
    i = 0
    try:
        while True:
            print("永久跑動中 11...",i)
            i += 1
            sys.stdout.flush() # 有顯示 不斷刷新
            time.sleep(1)
    except:
        print("python 結束!! 11 ... ") # 有顯示
    sys.exit(1) # 有用
# SIGINT 能關閉
# 想執行 Python 檔案: runForever1.py
# 非同步!
# Spawned child pid: 1363
# 已經執行 Python 檔案: runForever1.py
# stdout: 永久跑動中 11... 0

# stdout: 永久跑動中 11... 1

# stdout: 永久跑動中 11... 2

# stdout: 永久跑動中 11... 3

# stdout: 永久跑動中 11... 4

# 停止程式!
# 想執行 Python 檔案: runForever2.py
# 非同步!
# Spawned child pid: 1365
# 已經執行 Python 檔案: runForever2.py
# stdout: python 結束!! 11 ...  

# child process exited with code 1
