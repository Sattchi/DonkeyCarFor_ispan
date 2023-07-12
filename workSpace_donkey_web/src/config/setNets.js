const path = require('path');
const readline = require('readline/promises');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// const signal = AbortSignal.timeout(10_000);

// signal.addEventListener('abort', () => {
//   console.log('The question timed out');
// }, { once: true });

async function main() {
  const places = {
    1: ["資展302", "ispan302", "0"],
    2: ["資展15樓", "ispan15", "1"],
    3: ["家裡", "home", "2"],
    4: ["以上皆非"],
  }
  let answerNum1, place;
  const answer1 = await rl.question('接下來將查詢 IP, port 設定\n請問你網站架設地點?\n 1. 資展302; 2. 資展15樓; 3. 家裡; 4. 以上皆非 (請直接回答號碼) ');
  switch (answer1) {
    case 1:
    case "1":
    case "1.":
      answerNum1 = 1
      break;
    case 2:
    case "2":
    case "2.":
      answerNum1 = 2
      break
    case 3:
    case "3":
    case "3.":
      answerNum1 = 3
      break
    default:
      answerNum1 = 4
      break;
  }
  place = places[answerNum1][1]
  console.log(`你選擇了 ${answer1} ${places[answerNum1][0]}\n`);
  if (answerNum1 == 4) {
    const answer1_1 = await rl.question('\n因為架設地點你回答 4. 以上皆非\n請你為架設地點取一個簡單英文代號 (例如: school) ')
    place = answer1_1
    console.log(`你回答了 ${answer1_1} 已經設定為網站架設地點代稱\n`);
  }

  const names = {
    1: ["吳漢中", "Jack"],
    2: ["呂沍諺", "Ben"],
    3: ["吳達人", "Jason"],
    4: ["以上皆非"],
  }
  let answerNum2, name;
  const answer2 = await rl.question('\n請問你是誰，或者說網站主機由誰的電腦架設?\n 1. 吳漢中; 2. 呂沍諺; 3. 吳達人; 4. 以上皆非 (請直接回答號碼) ');
  switch (answer2) {
    case 1:
    case "1":
    case "1.":
      answerNum2 = 1
      break;
    case 2:
    case "2":
    case "2.":
      answerNum2 = 2
      break
    case 3:
    case "3":
    case "3.":
      answerNum2 = 3
      break
    default:
      answerNum2 = 4
      break;
  }
  name = names[answerNum2][1]
  console.log(`你選擇了 ${answer2} ${names[answerNum2][0]}\n`);
  if (answerNum2 == 4) {
    const answer2_1 = await rl.question('\n因為電腦擁有者你回答 4. 以上皆非\n請妳為電腦擁有者取一個簡單英文代號 (例如: John) ')
    name = answer2_1
    console.log(`你回答了 ${answer2_1} 已經設定為電腦擁有者代稱\n`);
  }

  let answerNum3, note;
  const answer3 = await rl.question('\n網站主機電腦是否使用筆電?\n 1. 是，用筆電; 2. 否，用桌電 (請直接回答號碼) ');
  switch (answer3) {
    case 1:
    case "1":
    case "1.":
      note = "Note"
      answerNum3 = 0
      break
    case 2:
    case "2":
    case "2.":
      note = ""
      answerNum3 = 1
      break
    default:
      note = ""
      answerNum3 = 1
      break;
  }
  console.log(`你選擇了 ${(note ? '用筆電' : '用桌電')}\n`);

  const key = place + name + note;
  const netData = require("./net.json")
  if (key in netData) {
    console.log(`\n你的選擇已有紀錄\n請查看\n\n ${path.join(__dirname, "net.json")}\n\n檔案，找到其中 ${key} 所對應的屬性值\ncom1 代表電腦主機、car1 代表自駕車Rpi、car2 代表第二輛自駕車、cv 代表物件辨識的Rpi\n如果有???請填寫對應的 IP`)
    console.log(`\n請複製並執行以下命令\n\n node src/server.js -w ${places[answerNum1][2]} -u ${name} ${(answerNum3)?'-d':''}\n\n套用此項 IP, port 設置`)
    rl.close()
    return
  }

  console.log('\n你的選擇沒有紀錄，所以接下來要一一設定 IP 和 port\n\n我們的網站會使用到電腦主機和自駕車上的樹梅pi')
  const comhost = await rl.question('請先設定電腦主機 IP: ')
  const rpihost = await rl.question('接著設定樹梅pi IP: ')
  console.log(`你設定的電腦主機 IP ${comhost} 、樹梅pi IP ${rpihost}\n`);
  
  console.log('我們的網站有三個主結構，分別是資料庫所在的主網、用戶個人使用的控制台、Donkeycar 提供的控制頁面');
  const comPort = (await rl.question('請先設定主網 port (預設 3000): ')) || '3000'
  const ownPort = (await rl.question('接著設定用戶個人 port (預設 6543): ')) || '6543'
  const carPort = (await rl.question('接著設定Donkeycar port (預設 8887): ')) || '8887'
  console.log(`你設定的主網 port ${comPort} 、用戶個人 port ${ownPort} 、Donkeycar port ${carPort}\n`);
  console.log(`\n請複製並執行以下命令\n\n node src/server.js --set-comHost ${comhost} --set-rpiHost ${rpihost} --set-comPort ${comPort} --set-ownPort ${ownPort} --set-carPort ${carPort}\n\n套用以上 IP, port 設置\n`)

  const answer4 = await rl.question('\n重複輸入指令令人煩躁\n如果你選擇同意，我們會將這些 IP, port 設置寫入設定檔\n 1. 同意; 2. 不同意 (請直接回答號碼) ')
  if ([1,"1","1."].includes(answer4)) {
    console.log('\n你同意將 IP, port 設置寫入設定檔，請稍等');
    // console.log(__dirname)
    // console.log(__filename)
    const fs = require('fs');
    // const netData = fs.readFileSync(path.join(__dirname, "net.json"),{ encoding: 'utf8', flag: 'r' })
    netData[key] = {
      "com1" : {
        "host": comhost,
        "comPort": comPort,
        "ownPort": ownPort,
        "carPort": carPort,
        "name": `${name} Com`
      },
      "car1" : {
        "host": rpihost,
        "ownPort": ownPort,
        "carPort": carPort,
        "name": `${name} Rpi`
      }
    }
    fs.writeFileSync(path.join(__dirname, "net.json"), JSON.stringify(netData))
    console.log(`\n已經將 IP, port 設置寫入設定檔\n請複製並執行以下命令\n\n node src/server.js --use-self ${key}\n\n使用此 IP, port 設置`);
  } else {
    console.log('\n你不同意將 IP, port 設置寫入設定檔\n感謝使用本系統。')
  }
  rl.close()
}
main()
