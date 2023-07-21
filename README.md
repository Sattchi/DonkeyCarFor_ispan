# RunRun DonkeyCar
## 專案說明
此專案引用 [Donkeycar 自駕車套件](https://github.com/autorope/donkeycar)，並嘗試做出延伸，包含模型管理、模型切換、架設網站、圖形化操控等。

## 專案下載與安裝
先完成官方套件安裝:
- 按照 Donkeycar 官網硬件安裝流程([How to Build a Donkeycar](https://docs.donkeycar.com/guide/build_hardware/)) 介紹組裝模型車、舵機、樹梅 Pi，之後按照 Donkeycar 在樹梅 Pi 上套件安裝流程([Get Your Raspberry Pi Working](https://docs.donkeycar.com/guide/robot_sbc/setup_raspberry_pi/)) 在樹梅 Pi 安裝 Donkeycar 套件，並按照新建應用流程([Create your car application](https://docs.donkeycar.com/guide/create_application/)) 新建一個自己控制 donkeycar 的應用資料夾 `mycar`。
- 為了方便在電腦上模擬，也可以按照 Donkeycar 在電腦上套件安裝流程([Install Software](https://docs.donkeycar.com/guide/install_software/))在電腦上安裝 Donkeycar 套件，並按照模擬器安裝流程([Donkey Simulator](https://docs.donkeycar.com/guide/deep_learning/simulator/))下載 [Donkeycar 模擬器](https://github.com/tawnkramer/gym-donkeycar/releases)，新建模擬用資料夾 `mysim`。

接著嘗試我們的專案:
- 先 fork 或下載我們的專案，將 `workSpace_donkey_web` 和 `web_car_DaRen` 之下 `src\config\net.json` `src\config\autoModel.json` `src\config\joystick.json` 幾個檔案打開，修改其中的 IP 和路徑，為正確的 IP 和路徑。舉例而言:
  - 將
    ```json
    "com1": {
                "host": "???",
                "comPort": "3000",
                "ownPort": "6543",
                "carPort": "8887",
                "name": "*** Com"
            },
    ```
    中的 "???" 改為用來架設主網站電腦的 local IP，將
    ```json
    "car1": {
                "host": "???",
                "comPort": "3000",
                "ownPort": "6543",
                "carPort": "8887",
                "name": "*** Rpi"
            },
    ```
    中的 "???" 改為樹梅 Pi 的 local IP。
  - 將
    ```json
    {
        "_id": {
            "$oid": "649b9f67cd4d2faca65d93e9"
        },
        "chinName": "順時針前進",
        "fileName": "manage.py",
        "modelID": "0",
        "option": {
            "cwd": "/home/pi/mycar2"
        },
        "para": [
            "drive",
            "--model",
            "./models/某個模型",
            "--myconfig",
            "./myconfig1.py"
        ]
    },
    ```
    中的 "option"."cwd" 改成樹梅 Pi 中應用資料夾 `mycar` 路徑、"para"."./models/某個模型" 改成自己通過 Donkeycar 訓練出來的模型名稱。
  - 修改 `web_car_DaRen\src\controllers\socketBind.js` 76 行
    ```python
    const commands = [
        'conda activate donkey',
        'python [絕對路徑]\\mysim\\manage.py drive --model [絕對路徑]\\mysim\\models\\某個模型 --myconfig ./myconfigVivo1.py',
    ]
    ```
    預設 conda env 為 Donkeycar 套件安裝的 donkey 環境，也可以自行修改，補上絕對路徑和模型名稱。
- `workSpace_donkey_web` 用來架設主網站，需部署在電腦上(或者可以連接資料庫的伺服器上)；`web_car_DaRen` 用來架設個人網站，可以部署在電腦上玩虛擬模擬器，也可部署在樹梅 Pi 上控制實體模型車。請參考下面流程。

## 主網伺服器架設
## 資料庫伺服器架設
## 客戶端架設