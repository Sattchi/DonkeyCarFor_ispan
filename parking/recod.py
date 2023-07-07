import cv2
import pytesseract
from PIL import Image
import pymysql
import random
import time
mybox=['0','1','2']
i=0
def myinsql(text,img_path):
    # 資料庫設定
    db_settings = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "123456",
    "db": "demo",
    "charset": "utf8"
    }
    conn = pymysql.connect(**db_settings)
    with conn.cursor() as cursor:
        # 查詢資料SQL語法
        command = "INSERT INTO parking (id, confirm, license_plate, space_id, enter_time, out_time, car_img_path) VALUES (NULL, '0', %s, %s, current_timestamp(), current_timestamp(), %s);"
        # 執行指令
        cursor.execute(command, (text,random.randint(1,100),img_path ))
        # 取得所有資料
        conn.commit()
        print('OK')
# 開啟影片檔案
cap = cv2.VideoCapture(0)
 
# 以迴圈從影片檔案讀取影格，並顯示出來
while(True):
  ret, frame = cap.read()
  image = Image.fromarray(frame)
  
  text = pytesseract.image_to_string(image, lang='eng')
  if len(text)>5:
      print(text)
      print(len(text))
      mybox.append(text)

  if mybox[0] == mybox[1] == mybox[2]:
    mysavetime=time.strftime("%Y%m%d%H%M%S", time.localtime())
    myinsql(text,f'img/{mysavetime}.jpg')
    cv2.imwrite(f'html/img/{mysavetime}.jpg',frame)
  #IF 檢測到三次結果相同
  # myinsql(text,'car1.jpg')
  #print(mybox[0],mybox[1],mybox[2])
  if len(mybox)>3:
    mybox.pop(0)
  cv2.imshow('frame',frame)
  

  if cv2.waitKey(1) & 0xFF == ord('0'):
    break
 
cap.release()
cv2.destroyAllWindows()