# donkeycar 設定的修改都在這裡
## ea92ed23
- donkeycar/parts/
  - keras.py: 32,36 加輔助說明
  - controller.py: 1024 嘗試加入前進、後退的閾值
  - web_controller/tempates/static/
    - main.js: 124~134 -> 124~147 加入 keyup 使鍵盤更好控制 473~489 -> 484~509 加入油門轉向清零、修正項改成0.5 使鍵盤更好控制
## 3635985
- donkeycar/parts/web_controller/templates/
  - vehicle.html: 168~170 -> 172~195 綁定各種事件 希望更好的控制網頁刷新和自動駕駛的結束停止問題