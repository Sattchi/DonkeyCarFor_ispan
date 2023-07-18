# DonkeyCarFor_ispan

## git 使用建議
建議用 vscode 並且先安裝 "git graph" extension 擴充，此擴充能直觀的看到版本提交樹狀結構，方便使用 git 工具。安裝後在左側 "Source control"(資源控制/版本控制 三個圓圈一個直線一個曲線的那一個)欄位，可以看到面板上方多出 "View Git Graph (git log)" 欄位(和 "git graph" 擴充 圖案相似的那一個)，點擊後可以開啟 版本樹。
### 初次操作流程
只在抓取專案時使用，以後不用再做。找一個你想放置專案的位置(一般是 C: 或者 D:)，進入該資料夾後，在空白處滑鼠右鍵開啟功能選單，其中會有 "Git Bash Here" 選項，點選。(如果你有裝 git 且沒有亂選安裝項目的話一定會有此選項)

接下來輸入
1. `git clone https://github.com/Sattchi/DonkeyCarFor_ispan.git`: 複製整個儲存庫 repo。可能會跑一下子，完成後會出現一個新的資料夾，稱為專案資料夾。

打開 vscode，選擇以專案資料夾為工作區。打開專端(`ctrl + ~`)。繼續下面操作:

2. `git branch -c main <新分支名稱>`: 開啟新分支，自己取名。例如: `git branch -c main wu`，以後只在自己的分支上操作。
3. `git checkout <自己分支名稱>`: 跳到自己的分支，該分支需存在。例如: `git checkout wu`，這裡我們跳到剛剛新建的分支上。
4. `git push -u origin <自己分支名稱>`: 推送自己的分支，並給分支設定"上游"。有推送雲端(GitHub)才會有你的分支，至於"上游"以後說明。例如: `git push -u origin wu`，這裡我們推送剛剛新建的分支。

### 平常操作流程
以後做，平常針對專案的操作，會很經常做，最好另外建個檔案記下來。注意，有些操作是在編輯檔案(新增、修改、刪除)前做的。如果你先編輯檔案了才看到這個操作流程，或者忘了先做這個操作流程，請見常見問題 [Q1 平常操作流程忘記先做](#q1-平常操作流程忘記先做)。

打開 vscode，選擇以專案資料夾為工作區。打開專端(ctrl + `)。繼續下面操作:
1. `git checkout main`: 先跳到主分支，優先更新主分支。
2. `git pull --all`: 從 GitHub 拉取所有分支下來本地。這裡可能會有問題，解決方法請見常見問題 [Q2 本地分支與遠端分支](#q2-本地分支與遠端分支)、[Q3 合併發生衝突](#q3-合併發生衝突)。
3. `git checkout <自己分支名稱>`: 跳到自己的分支。例如: `git checkout wu`，因為我們提倡在自己的分支操作，所以先跳回自己的分支。
4. `git merge origin/<自己分支名稱>`: 合併 本地自己的分支 和 遠端自己的分支，例如: `git checkout origin/wu`，統一不同電腦中自己的進度，這很重要。這裡可能有衝突，解決方法請見常見問題 [Q3 合併發生衝突](#q3-合併發生衝突)。
5. `git merge origin/main`: 合併 本地自己的分支 和 遠端main主分支，追上專案進度(沒需要的話可以不做)。主分支是專案的重點，通常會由整個開發組共同維護。 這裡可能有衝突，解決方法請見常見問題 [Q3 合併發生衝突](#q3-合併發生衝突)。
6. 編輯檔案，包含新增、修改、刪除檔案。
7. `git add <檔案名稱>` 或 `git add .`: 將"有變更"的檔案放到暫存區，檔案名稱須為相對路徑，例如: `git add workSpace_donkey_web\readme.md` (如果不知道，可以用 `git status` 查詢)，`git add .` 是一次性把所有變更放到站存區。
8. `git commit -m "說明文字"` 或者用 vscode 提交: 將暫存區的變更提交為新版本，推薦用 vscode 編輯說明文字。說明文字內容涵蓋這個提交對專案進行那些操作，是新增、修改、刪除了甚麼檔案、功能、風格樣式，又或是解決了甚麼 bug，或者解決甚麼衝突等等。這裡 git 可能要求輸入使用者名稱和使用者信箱，請見常見問題 [Q4 輸入使用者名稱和信箱](#q4-輸入使用者名稱和信箱)。
9. `git push`: 將自己的分支推送到 GitHub。標準語句應該要寫成 `git push origin <本地分支名稱>:<遠端分支名稱>` 或者 `git push origin <分支名稱>`。但因為我們在[初次操作中](#初次操作流程)，有將自己分支先推送一次並且設定"上游"，所以這裡可以用簡短語句 `git push` 即可。關於"上游"請見常見問題 [Q5 上游的概念與設定上游](#q5-上游的概念與設定上游)。

### 常見問題集合
#### Q1 平常操作流程忘記先做
一不小心先編輯檔案了，忘記做[平常操作流程](#平常操作流程)中的 1,2,3 步驟，也沒關係，按照下面操作
1. 所有檔案先存檔。
2. `git stash`: 暫時儲存現狀的操作。
3. `git fetch --all`: 從 GitHub 複製所有分支到本地追蹤。
4. `git checkout <自己分支名稱>`: 跳到自己的分支。例如: `git checkout wu`。
5. `git merge origin/<自己分支名稱>`: 跟自己遠端的分支合併。例如: `git merge origin/wu`，理論上不會有衝突，若有衝突見 [Q3 合併發生衝突](#q3-合併發生衝突)。
6. `git merge origin/main`: 和 遠端主分支 合併，追上專案進度(沒需要的話可以不做)。這裡可能有衝突，解決方法請見常見問題 [Q3 合併發生衝突](#q3-合併發生衝突)。
7. `git stash pop`: 恢復暫存的操作。
8. `git add .`: 將所有變更加到暫存區。
9. `git commit -m "說明文字"` 或者用 vscode 提交: 提交變更，編輯說明文字。
10. `git push`: 將自己的分支推送到 雲端(GitHub)。

若有需要，可以在最後嘗試更新主分支:

11.  `git checkout main`: 跳到主分支，更新主分支。
12.  `git pull`: 讓 本地主分支 跟上 遠端主分支。
13.  `git checkout <自己分支名稱>`: 跳回自己的分支。

#### Q2 本地分支與遠端分支
其實 git 中同名的分支會有三大類，一個是本地分支、一個是遠端分支、一個是本地追蹤遠端分支(簡稱追蹤分支)。(這三個稱呼是我自己想的，外面人不一定用這三個詞)
- 本地分支: 可以用 `git branch` 命令查看，也可以從 "git graph" 擴充上看到，那些沒有 `／` 符號的都是本地分支。(請不要故意取有 `／` 符號的本地分支)。你在 git 中，主要操作的其實都是本地分支。
- 遠端分支: 在雲端(GitHub)專案中必然可以找到 "** branch(es)" 的字眼，按下去你就可以看到該專案的所有分支，這些就是遠端分支。
- 本地追蹤遠端分支(簡稱追蹤分支): 需要用 `git branch -a` 命令查看，那些帶有 `remotes` 字眼和 `／` 符號的就是追蹤分支；也可以從 "git graph" 擴充上看到，那些有 `／` 符號的都是追蹤分支(可能要勾選 "Show Remotes Branches")。

因為僅需一個 `git fetch` 命令(多個遠端用 `git fetch --all`)，追蹤分支就會更新為遠端分支進度，所以通常會用遠端分支(remote branch)通稱這兩者。\
至於本地分支和遠端分支之間的更新，則依靠 `git pull`(拉取)、`git push`(推送)、`git merge`(合併)命令進行。
- `git pull`(拉取): 其實執行的是 `git fetch` 將追蹤分支更新為遠端分支進度，在然後用 `git merge` 將有設定"上游"且名稱相同的本地分支和追蹤分支合併。因為會執行合併命令，所以有可能發生合併衝突，詳情見下一問。
- `git push`(推送): git 會先檢查你有沒有設定"上游"，沒有的話會要求你用完整推送語句 `git push origin <本地分支名稱>:<遠端分支名稱>` 或者 `git push origin <分支名稱>`；若你有設定"上游"或使用完整語句，git 接著會檢查本地和遠端兩邊分支進度，若此時遠端分支有超前本地分支的版本==提交，也就是你的本地分支落後於遠端分支(behind)，git 會先要求你拉取最新進度後才進行推送；倘若上述兩關都過了，git 才會將你的本地進度更新到雲端的遠端分支，並同步更新追蹤分支。
- `git merge`(合併): 有時候你不只要更新自己的進度，甚至要跟上別人的進度，這時你就需要 `git merge <對方分支名稱>` 合併命令。除此之外，拉取命令也會自動執行合併命令。合併有可能發生衝突，詳情見下一問。

#### Q3 合併發生衝突
當你使用 `git merge <對方分支名稱>` 合併命令或者 `git pull` 拉取命令之後，有可能發生"合併衝突"，命令列會出現 "CONFLICT"(衝突)字眼，同時若用 `git status` 查看現在狀態，會有以下語句出現
```
You have unmerged paths.
  (fix conflicts and run "git commit")
```
這是 git 在提醒你，自動合併發生衝突，應先解決衝突才可以繼續。

所謂衝突，指的是相同的檔案，在不同的分支上，有不同的處理方式(新增、修改、刪除)，若此兩分支合併就會發生衝突。例如，一個 123.txt 的檔案在 A 分支內容是 "你好"，在 B 分支內容卻是 "他好"，那麼這兩分支合併時會發生衝突；又會者，一個檔案在某個分支還存在，在另一個分支卻刪除了，也會發生衝突。

發生衝突就要解決(fix, solve)衝突，你可以通過 `git status` 查看發生衝突的檔案，然後點開來編輯他，存檔。這裡推薦使用 vscode 編輯器，因為她有針對解決衝突非常友好的小功能。\
對於文字檔案的衝突可以打開後編輯，對於非文字檔(圖片、音樂、影片)的衝突，請參考 [合併發生衝突了，怎麼辦？](https://gitbook.tw/chapters/branch/fix-conflict) 網頁最後一節 [那如果不是文字檔的衝突怎麼解？]，使用
```
git checkout --ours <檔案名稱>
```
命令選擇自己分支的檔案和
```
git checkout --theirs <檔案名稱>
```
命令選擇對方分支的檔案。

修改完衝突並存檔後，用 `git add <檔案名稱>` 加入暫存區、`git commit` 提交解決衝突後的版本，(建議解決所有衝突後一次性提交)。這才完成了解決衝突。

#### Q4 輸入使用者名稱和信箱
git 作為版本控制工具，他希望後來的使用者可以找到前面的版本提交的人，所以 git 會希望提交者留下使用者名稱和信箱。

使用者名稱用以下語句設定
```
git config --local user.name "你的名稱"
```
`--local` 代表只適用於這個儲藏庫(repo)，也就是只適用於這個專案。若要適用於整台電腦所有專案，請改成 `--global` 參數
```
git config --global user.name "你的名稱"
```
一般而言，自己家裡電腦使用 `--global`，而公司提供的電腦、或不知那裡的電腦使用 `--local`。\
建議使用者名稱使用和雲端(GitHub)相同的名稱，方便管理辨認。

使用者信箱用以下語句設定
```
git config --local user.email "你的信箱"
```
同樣有 `--local` 和 `--global` 的差別。\
建議使用 GitHub 提供的亂碼信箱，查詢方式如下:
1. 登入 GitHub 網頁
2. 點擊右上角使用者頭像，選擇 Settings(設定)
3. 左側欄位找到並點選 Access(使用權) 之下的 Emails(電子信箱)

Emails(電子信箱)頁面包含

1. 最上方可以新增、刪除信箱，GitHub 要求至少保有一個信箱，預設會有你註冊 GitHub 用的信箱。
2. Primary email address 主要信箱欄位，這裡可以設定主要信箱地址，預設是你註冊 GitHub 用的信箱。
3. Backup email address 備份信箱欄位，用於安全通知、也可以用於密碼重設。
4. Keep my email addresses private 是否將信箱保密 選項，勾選後 GitHub 會用如 `ID+USERNAME@users.noreply.github.com` 取代你的信箱，保護你的信箱不外洩。推薦使用的就是這個亂碼信箱。


#### Q5 上游的概念與設定上游
完整的推送命令語句其實是 `git push <遠端簡稱> <本地分支名稱>:<遠端分支名稱>`(同名用 `git push <遠端簡稱> <分支名稱>`)，例如: `git push origin main`。懶惰的程序員不想每次都打這麼長，所以 git 提供了設定上游功能，一個分支若有設定上游且分支名稱相同，僅需簡短命令 `git push` 即可完成推送。

查看上游的方法，你可以用 `git branch -vv` 查看各個本地分支是否有設定上游，若有的話中間會有中括號包起來的追蹤分支，那就是上游(還會有進度差距)；也可以用 `git status` 查看現在所在分支有沒有上游，若有的話，命令列最開始顯示的語句為
```
On branch <你所在分支名稱>
Your branch is up to date with '<上游的追蹤分支>'.
```
從雲端(GitHub) `git clone` 下來的專案，預設所有複製下來的分支都會有上游。

如果本地分支沒有上游，或者想修改上游分支，用 `git branch -u <遠端簡稱>/<遠端分支名稱> <本地分支名稱>` 例如: `git branch -u origin/main main`，想取消上游設定，用 `git branch --unset-upstream <本地分支名稱>`。


# This is an <h1> tag
## This is an <h2> tag
![GITHUB]( https://cc.tvbs.com.tw/img/upload/2022/05/20/20220520170357-1298d211.jpg "tkcat")
* Item 1
* Item 2
  * Item 2a
  * Item 2b
- [x] This is a complete item
- [ ] This is an incomplete item
 `Format one word or one line`
    code (4 spaces indent)
1. This is step 1.
1. This is the next step.
1. This is yet another step, the third.
1. Set up your table and code blocks.
1. Perform this step.



1. Make sure that your table looks like this:

   | Hello | World |
   |---|---|
   | How | are you? |

1. This is the fourth step.

   >[!NOTE]
   >
   >This is note text.

1. Do another step.
[如何編輯這個介紹檔案](https://markdown.tw/)

 >[!IMPORTANT]
>
>1.新增資料夾.<br>
>1.再新增檔案的名稱上面加入/資料夾名稱/123.file.<br>
>1.新增的時候必須要有檔案在資料夾內 <br>
