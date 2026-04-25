const assets = {
  backgrounds: {
    stationDay: "img/bg-station-day.jpeg",
    cafe: "img/bg-cafe-interior.jpeg",
    streetEvening: "img/bg-street-evening.jpeg",
    stationNight: "img/bg-station-night.jpeg",
  },
  characters: {
    yutang: {
      base: "img/yutang-base.jpeg",
      shy: "img/yutang-shy.jpeg",
      nervous: "img/yutang-nervous.jpeg",
      smile: "img/yutang-smile.jpeg",
      downcast: "img/yutang-downcast.jpeg",
      surprised: "img/yutang-surprised.jpeg",
      composed: "img/yutang-composed.jpeg",
    },
  },
};

const initialState = () => ({
  currentId: "intro_01",
  pageIndex: 0,
  safety: 0,
  pressure: 0,
  recognition: 0,
  pull: 0,
});

const state = initialState();

const backgroundEl = document.getElementById("scene-background");
const spriteEl = document.getElementById("character-sprite");
const speakerEl = document.getElementById("speaker-name");
const textEl = document.getElementById("dialogue-text");
const choicesEl = document.getElementById("choice-list");
const nextEl = document.getElementById("next-button");
const restartTopEl = document.getElementById("restart-top");
const restartBottomEl = document.getElementById("restart-bottom");
const audioToggleEl = document.getElementById("audio-toggle");
const bgmPlayerEl = document.getElementById("bgm-player");

const musicTracks = {
  day: "sound/bgm-day.mp3",
  tension: "sound/bgm-tension.mp3",
  night: "sound/bgm-night.mp3",
};

let audioUnlocked = false;
let audioEnabled = true;
let currentTrackKey = "";
let choiceUnlockTimer = null;

const gameData = {
  intro_01: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她比我想像中更早到。

白天的車站外很亮，亮到連人臉上的猶豫都藏不太住。`,
    next: "intro_02",
  },
  intro_02: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `我穿過出站口前的空地時，一眼就看見她站在那裡。

米白色針織上衣，藍灰色長裙。手指搭在包包背帶上，站得很乖，也很僵。`,
    next: "intro_03",
  },
  intro_03: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她也看見了我。

視線碰上的瞬間，她像是忘了原本想好的表情，只好很快低頭。

三個月的訊息、深夜的對話、她在螢幕另一端比平常更坦白的語氣，都在這一秒變得很像真的。`,
    next: "intro_choice",
  },
  intro_choice: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `我停在她面前一步的位置，等她先把呼吸找回來。`,
    choices: [
      {
        text: "「抱歉，讓妳等了。」",
        effects: { safety: 1 },
        next: "intro_apology",
      },
      {
        text: "「妳跟我想的不太一樣。」",
        effects: { recognition: 1, pull: 1 },
        next: "intro_different",
      },
      {
        text: "「妳現在比在訊息裡安靜很多。」",
        effects: { recognition: 1, pressure: 1, pull: 1 },
        next: "intro_quiet",
      },
    ],
  },
  intro_apology: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「沒有，我也才剛到。」 

她停了一下，又很小聲地補了一句。

「其實我提前了二十分鐘。」`,
    next: "intro_merge_01",
  },
  intro_different: {
    background: "stationDay",
    character: { name: "yutang", expression: "surprised" },
    speaker: "語棠",
    text: `她抬頭看我，明顯愣了一下。

「是……哪裡不一樣？」

問完之後，她的手指又收緊了，像已經開始後悔自己把這句話問出口。`,
    next: "intro_merge_01",
  },
  intro_quiet: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「可能是因為……真的見到了。」 

她自己也知道這句辯解沒有什麼說服力，說到後面聲音越來越小。`,
    next: "intro_merge_01",
  },
  intro_merge_01: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `我沒有立刻把那份緊張戳破，只是替她把節奏往日常那邊挪了一點。

「先走吧，裡面應該比較不吵。」`,
    next: "intro_merge_02",
  },
  intro_merge_02: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `她點頭，跟在我旁邊。

剛開始的幾步，她走得很小心，像連步伐都不想太顯眼。直到過了前面的轉角，她才終於像想起什麼似的開口。`,
    next: "walk_01",
  },
  walk_01: {
    background: "stationDay",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `「我本來有想過……你會不會認不出我。」`,
    next: "walk_02",
  },
  walk_02: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "我",
    text: `「不至於。」`,
    next: "walk_03",
  },
  walk_03: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她看了我一眼，像想確認我是不是在安慰她。

我笑了笑，才把後面的話補完。

「妳的打字方式太有辨識度了。本人站在那裡，看起來也很像會在凌晨一點半突然傳一句『你還沒睡喔』的人。」`,
    next: "walk_04",
  },
  walk_04: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「……我哪有那麼明顯。」`,
    next: "walk_05",
  },
  walk_05: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `她嘴上這麼說，耳朵卻已經先紅了。

那點紅讓我忽然意識到，線上那個會在某些時候故意停頓、故意等我追問的人，現在真的就在我旁邊，而且比我以為的還要不擅長把自己藏好。`,
    next: "walk_06",
  },
  walk_06: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "我",
    text: `「妳今天出門前有沒有後悔過？」`,
    next: "walk_07",
  },
  walk_07: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她安靜了兩秒。

「有。」

說完之後，她像怕我誤會，立刻又補了一句。

「不是不想來，是出門前忽然覺得，如果真的見到你，我可能會變得很不像我自己。」`,
    next: "walk_08",
  },
  walk_08: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `這句話很誠實。

也正因為太誠實，所以我沒有立刻接。

前面的咖啡廳招牌已經看得見。我替她拉開門，讓她先進去。`,
    next: "cafe_01",
  },
  cafe_01: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `咖啡廳裡比外面安靜。

她坐下之後，手還是放得很規矩，像怕自己一不小心就顯得太奇怪。`,
    next: "cafe_02",
  },
  cafe_02: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `前半段對話先從安全的地方開始。

工作、新生活、通勤、租屋處附近那間總是半夜還很多人的便利商店。她說話還是有點慢，可比剛見面時好得多。`,
    next: "cafe_03",
  },
  cafe_03: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "語棠",
    text: `「其實我本來以為，我今天會更會聊天一點。」`,
    next: "cafe_04",
  },
  cafe_04: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "我",
    text: `「妳在線上比較會。」`,
    next: "cafe_05",
  },
  cafe_05: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她被我說得有點心虛，低頭攪了兩下杯子裡的冰塊。

「那不一樣。」`,
    next: "cafe_06",
  },
  cafe_06: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「隔著螢幕的時候，我可以慢慢想自己要講什麼。也可以假裝自己沒有那麼在意。」`,
    next: "cafe_07",
  },
  cafe_07: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "我",
    text: `「現在不能？」`,
    next: "cafe_08",
  },
  cafe_08: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她沒有立刻回答，只是抬頭看了我一眼，又很快移開。

「現在太容易被你看出來。」`,
    next: "cafe_09",
  },
  cafe_09: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `那句話說完之後，氣氛慢慢開始偏離普通初次見面的軌道。

她還是會聊工作，也會提到最近主管交給她的新專案，可中間總會混進幾句只屬於我們兩個的停頓。`,
    next: "cafe_10",
  },
  cafe_10: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `「我昨天其實想了很久。」`,
    next: "cafe_11",
  },
  cafe_11: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "我",
    text: `「想什麼？」`,
    next: "cafe_12",
  },
  cafe_12: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「想今天見到你之後，我會不會……很不像原本那個我。」`,
    next: "cafe_choice",
  },
  cafe_choice: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她把這句話說完之後，就低頭去碰杯緣，像是把真正想問的後半句一起藏了起來。`,
    choices: [
      {
        text: "「妳能來，我就已經很滿意了。」",
        effects: { safety: 2 },
        next: "cafe_choice_a",
      },
      {
        text: "「我本來以為，妳至少會比現在鎮定一點。」",
        effects: { recognition: 1, pull: 1, pressure: 1 },
        next: "cafe_choice_b",
      },
      {
        text: "「那妳希望我今天把妳當成哪一種身分來見？」",
        effects: { recognition: 2, pull: 1 },
        next: "cafe_choice_c",
      },
    ],
  },
  cafe_choice_a: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她抬頭看我，像沒想到我會先把這句話說出來。

「……你這樣講，會讓我更不知道怎麼辦。」`,
    next: "cafe_after_choice_01",
  },
  cafe_choice_b: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她的耳根一下子就紅了。

「我、我有在努力了……」

說完之後，她連眼神都不敢抬。`,
    next: "cafe_after_choice_01",
  },
  cafe_choice_c: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `她沉默了幾秒。

「我本來以為見到你之後，自己會比較知道。」

她垂下眼。

「可是現在好像更不確定了。」`,
    next: "cafe_after_choice_01",
  },
  cafe_after_choice_01: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `我沒有急著把那份不確定逼成答案。

我們又聊了一小段別的。她提到自己前幾天差點在公司會議上叫錯主管名字，我提到上個月有個客戶在凌晨三點還在改需求。`,
    next: "cafe_after_choice_02",
  },
  cafe_after_choice_02: {
    background: "cafe",
    character: { name: "yutang", expression: "smile" },
    speaker: "",
    text: `她終於笑了一次。

不是剛剛那種禮貌地彎一下嘴角，而是真的被逗到，連肩膀都鬆了一點。`,
    next: "cafe_after_choice_03",
  },
  cafe_after_choice_03: {
    background: "cafe",
    character: { name: "yutang", expression: "smile" },
    speaker: "語棠",
    text: `「你跟我想像中的有一點像，又有一點不像。」`,
    next: "cafe_after_choice_04",
  },
  cafe_after_choice_04: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "我",
    text: `「哪裡不像？」`,
    next: "cafe_after_choice_05",
  },
  cafe_after_choice_05: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「你在線上比較……」 

她想了一下，像在找一個不會太誇張的形容。

「比較讓人可以亂想。」`,
    next: "cafe_after_choice_06",
  },
  cafe_after_choice_06: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她說完才意識到這句話的危險，睫毛明顯顫了一下。

我看著她，沒有立刻解圍。`,
    next: "cafe_after_choice_07",
  },
  cafe_after_choice_07: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "我",
    text: `「那現在呢？」`,
    next: "cafe_after_choice_08",
  },
  cafe_after_choice_08: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她安靜了很久。

「現在比較像……不能亂想。」

她的聲音低下去。

「因為一亂想，就會太像真的。」`,
    next: "incident_01",
  },
  incident_01: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `真正讓她安靜下來的，不是什麼很重的話。

只是某個瞬間，我忽然問了她一句：`,
    next: "incident_02",
  },
  incident_02: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "我",
    text: `「妳今天到底是以什麼心情來見我的？」`,
    next: "incident_03",
  },
  incident_03: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `她像是早就知道這句會來。

只是等它真的落下來時，她還是沒有辦法立刻接住。`,
    next: "incident_04",
  },
  incident_04: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `她張了張口，卻沒發出聲音。握著杯子的手指收得很緊，連指節都白了一點。

我原本以為她只是在想，可下一秒，我看見她的呼吸明顯亂了。`,
    next: "incident_05",
  },
  incident_05: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "語棠",
    text: `「我沒事。」`,
    next: "incident_06",
  },
  incident_06: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `她說得太快。

快得像是在搶在自己撐不住之前，把場面先補起來。可她的手在發冷，眼神也明顯飄開，不再敢停在我臉上。`,
    choices: [
      {
        text: "先把話題停下來：「先不用回答，跟我出去一下。」",
        effects: { safety: 2, recognition: 1, pressure: -1 },
        next: "incident_a_01",
      },
      {
        text: "壓低聲音：「看著我，慢慢呼吸。」",
        effects: { safety: 1, pull: 2, pressure: 1 },
        next: "incident_b_01",
      },
      {
        text: "低聲問她：「妳現在是在怕我，還是在怕妳自己？」",
        effects: { recognition: 2, pull: 1, pressure: 2 },
        next: "incident_c_01",
      },
    ],
  },
  incident_a_01: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `我沒再逼她把那句話說完，只是替她把杯子往裡推了一點。

「先不用回答。」`,
    next: "incident_a_02",
  },
  incident_a_02: {
    background: "cafe",
    character: { name: "yutang", expression: "surprised" },
    speaker: "我",
    text: `「跟我出去一下。」`,
    next: "incident_a_03",
  },
  incident_a_03: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她跟著我走出咖啡廳後，站在玻璃窗外，像是終於能好好吸一口氣。

晚風吹過來時，她肩膀很輕地顫了一下，像是整個人這才從剛才那個太密的空氣裡退回來。`,
    next: "incident_a_04",
  },
  incident_a_04: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「對不起。」`,
    next: "incident_a_05",
  },
  incident_a_05: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "我",
    text: `「妳不用道歉。」`,
    next: "incident_a_06",
  },
  incident_a_06: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她低著頭，手指還有點緊。

「我不是不想回答。我只是……突然覺得，真的見到你之後，有些事情比訊息裡更像真的。」`,
    next: "street_01",
  },
  incident_b_01: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "我",
    text: `「語棠。」`,
    next: "incident_b_02",
  },
  incident_b_02: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "我",
    text: `「看著我。先別急著回答。」`,
    next: "incident_b_03",
  },
  incident_b_03: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `她呼吸停了一拍。

停了兩秒，才真的慢慢把眼睛抬起來。她跟著我的節奏吸氣、吐氣，肩膀才沒那麼僵。`,
    next: "incident_b_04",
  },
  incident_b_04: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「你不要……這樣看著我。」`,
    next: "incident_b_05",
  },
  incident_b_05: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "我",
    text: `「哪樣？」`,
    next: "incident_b_06",
  },
  incident_b_06: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她耳根紅得很明顯。

「像是我現在在想什麼，你都知道一樣。」`,
    next: "street_01",
  },
  incident_c_01: {
    background: "cafe",
    character: { name: "yutang", expression: "surprised" },
    speaker: "我",
    text: `「妳現在是在怕我，還是在怕妳自己？」`,
    next: "incident_c_02",
  },
  incident_c_02: {
    background: "cafe",
    character: { name: "yutang", expression: "surprised" },
    speaker: "",
    text: `她整個人都靜住了。

不是被嚇到，更像是那句話直接碰到她最不想承認的地方。`,
    next: "incident_c_03",
  },
  incident_c_03: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「你這樣問，太犯規了。」`,
    next: "incident_c_04",
  },
  incident_c_04: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她沉默了很久，才很小聲地承認：

「我怕的不是你。」`,
    next: "incident_c_05",
  },
  incident_c_05: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「是我自己真的會相信。」`,
    next: "street_01",
  },
  street_01: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `走出咖啡廳時，天色已經暗下來了。

街上的燈一盞一盞亮起，玻璃窗裡的暖光落在地上，把人的影子拉得很長。`,
    next: "street_02",
  },
  street_02: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `我們沒有立刻說很多話。

她走在我旁邊，比來時更安靜，但那種安靜已經不一樣了。不是防備，更像是有些東西真的被碰到了，所以她一時不知道該怎麼重新整理自己。`,
    next: "street_03",
  },
  street_03: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「我剛剛不是後悔。」`,
    next: "street_04",
  },
  street_04: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "我",
    text: `「我知道。」`,
    next: "street_05",
  },
  street_05: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她盯著前面的路燈，像是不看我比較容易把後面的話講完。

「我只是本來以為自己可以表現得更像平常那樣。」`,
    next: "street_06",
  },
  street_06: {
    background: "streetEvening",
    character: { name: "yutang", expression: "base" },
    speaker: "我",
    text: `「妳在線上比較會裝沒事。」`,
    next: "street_07",
  },
  street_07: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她耳朵紅了一下，卻沒有否認。`,
    next: "street_08",
  },
  street_08: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「因為隔著螢幕比較容易。」`,
    next: "street_09",
  },
  street_09: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她停了一下，才補上後半句。

「現在不是。」`,
    next: "street_10",
  },
  street_10: {
    background: "streetEvening",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `我沒有接得太快。

晚上的街道比白天更適合讓那些本來會被打斷的情緒慢慢浮上來。前面有一段店家燈光很暖的騎樓，我們經過時，她忽然又開口。`,
    next: "street_11",
  },
  street_11: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `「其實我這三個月有很多次都在想，為什麼我會答應見你。」`,
    next: "street_12",
  },
  street_12: {
    background: "streetEvening",
    character: { name: "yutang", expression: "base" },
    speaker: "我",
    text: `「想到答案了？」`,
    next: "street_13",
  },
  street_13: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `「本來沒有。」 

她輕輕咬了下唇。

「可是剛剛在咖啡廳裡，我有一瞬間突然覺得，原來我不是在跟你玩。」`,
    next: "street_14",
  },
  street_14: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `這句話讓我停了一秒。

她說的不是那些線上故意曖昧的句子，也不是某個只有我們才懂的稱呼。她說的是更麻煩的東西。`,
    next: "street_15",
  },
  street_15: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「我不是說我現在就很確定。」 

「只是……跟你見面之後，我好像比較不能再把自己當成只是好奇。」`,
    next: "street_16",
  },
  street_16: {
    background: "streetEvening",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `她把這些話說出來的時候，沒有看我。

可那種不看我，和白天剛見面時的躲避已經不一樣。白天她是不敢，現在更像是她怕自己一旦真的看過來，後面的誠實就會停不住。`,
    next: "street_17",
  },
  street_17: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "我",
    text: `「那妳現在最怕的是什麼？」`,
    next: "street_18",
  },
  street_18: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她安靜了很久，最後只是很小聲地說：

「怕我沒有自己想像的那麼會撐。」`,
    next: "street_19",
  },
  street_19: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她說完之後，自己先笑了一下。

那個笑很淡，卻比剛才在咖啡廳裡的任何一句話都更像她。`,
    next: "station_night_01",
  },
  station_night_01: {
    background: "stationNight",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `回到車站時，和白天幾乎像兩個地方。

玻璃裡的燈更亮，外面的風更冷。白天那種人來人往的安全感退掉之後，很多話反而更容易在這裡留下來。`,
    next: "station_night_02",
  },
  station_night_02: {
    background: "stationNight",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `她站在我面前，像白天剛見面時那樣安靜。可這次她沒有一開始就躲開視線。

她只是看了我一會兒，像在等我，也像在逼自己別再逃。`,
    next: "station_night_03",
  },
  station_night_03: {
    background: "stationNight",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「我今天是不是表現得很差？」`,
    next: "station_night_04",
  },
  station_night_04: {
    background: "stationNight",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `這句話大概從咖啡廳撐到現在，才終於被她問出來。`,
    next: "station_night_choice",
  },
  station_night_choice: {
    background: "stationNight",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `我知道她現在要的不是漂亮答案，而是我會怎麼定義今天。`,
    choices: [
      {
        text: "「今天先到這裡就好。」",
        effects: { safety: 1 },
        next: "station_night_a",
      },
      {
        text: "「妳今天已經比妳自己想的更誠實了。」",
        effects: { safety: 1, recognition: 1 },
        next: "station_night_b",
      },
      {
        text: "「如果下次我不想只停在今天這樣，妳還會來嗎？」",
        effects: { pull: 1, pressure: 1, recognition: 1 },
        next: "station_night_c",
      },
    ],
  },
  station_night_a: {
    background: "stationNight",
    character: { name: "yutang", expression: "downcast" },
    speaker: "我",
    text: `「今天先到這裡就好。」`,
    next: "station_night_a2",
  },
  station_night_a2: {
    background: "stationNight",
    character: { name: "yutang", expression: "surprised" },
    speaker: "",
    text: `她愣了一下，像沒想到我會先替她踩煞車。`,
    next: "ending_check",
  },
  station_night_b: {
    background: "stationNight",
    character: { name: "yutang", expression: "shy" },
    speaker: "我",
    text: `「妳今天已經比妳自己想的更誠實了。」`,
    next: "station_night_b2",
  },
  station_night_b2: {
    background: "stationNight",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她的睫毛很輕地顫了一下，像是這句話比她預期的還要直接。`,
    next: "ending_check",
  },
  station_night_c: {
    background: "stationNight",
    character: { name: "yutang", expression: "surprised" },
    speaker: "我",
    text: `「如果下次我不想只停在今天這樣，妳還會來嗎？」`,
    next: "station_night_c2",
  },
  station_night_c2: {
    background: "stationNight",
    character: { name: "yutang", expression: "surprised" },
    speaker: "",
    text: `她明顯吸了一口氣。

不是退縮，而是被這句話逼得必須在心裡很快做一個誠實的判斷。`,
    next: "ending_check",
  },
  ending_check: {
    branch: true,
  },
  ending_good: {
    background: "stationNight",
    character: { name: "yutang", expression: "smile" },
    speaker: "",
    text: `她安靜了兩秒，然後很輕地吸了一口氣。

「我今天是不是很不像樣？」

她低下頭，耳朵一點一點紅起來。

「可是如果下次還是你……我可能會比今天誠實一點。」

我看著她，沒有立刻接。她像被這點安靜弄得更緊張，卻沒有把話收回去。

進站前，她又回頭看我一次。

「你到家之後，要跟我說一聲。」

【結局：下次也交給你】`,
  },
  ending_normal: {
    background: "stationNight",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `她站在驗票口前，手還放在包包背帶上。

「我今天回去之後，應該會想很多。」

她立刻搖頭。

「不是後悔。只是我可能需要一點時間，才能把今天跟原本想像的那些事情接起來。」

她抬頭看我，像是鬆了一口氣。

「那你到家之後……還是跟我說一聲。」

【結局：慢慢來也沒關係】`,
  },
  ending_bad: {
    background: "stationNight",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她站在車站燈下，安靜得幾乎像白天剛見面時那樣。

「今天……對我來說有點太快了。」

她很努力不讓這句話變成責怪。

「不是你的問題。」

可也因為太客氣，反而比什麼都遠。

她對我點了點頭，轉身往裡走。

【結局：停在入口前】`,
  },
  ending_worst: {
    background: "stationNight",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她站在車站燈下，臉色已經不是單純的緊張。

那是一種很努力想把情緒壓回去，卻還是壓不住失望的表情。

「我覺得今天就到這裡吧。」

這句話她說得很平，平得像是已經不打算再解釋。

我還沒來得及開口，她就先避開了我的視線。

「我本來以為，就算真的跟你見面，至少也不會讓我覺得自己一直被逼著反應。」

她把包包背帶往肩上拉了一點，像是在把最後那點猶豫也一起收回去。

「我不喜歡這樣。」

這次不是客氣，也不是保留。

她說完就轉身往站裡走，連回頭都沒有。

我站在原地，看著玻璃門把她的身影隔開。白天在這裡開始的東西，到最後什麼都沒留下。

【結局：不歡而散】`,
  },
};

function getTrackForNode(nodeId) {
  if (nodeId.startsWith("intro_") || nodeId.startsWith("walk_") || nodeId.startsWith("cafe_")) {
    if (nodeId.startsWith("incident_") || nodeId.startsWith("street_")) {
      return "tension";
    }
    return "day";
  }

  if (nodeId.startsWith("incident_") || nodeId.startsWith("street_")) {
    return "tension";
  }

  if (nodeId.startsWith("station_night_") || nodeId.startsWith("ending_")) {
    return "night";
  }

  return "day";
}

function updateAudioToggleLabel() {
  audioToggleEl.textContent = audioEnabled ? "音樂：開" : "音樂：關";
}

function getNodePages(node) {
  const normalizedText = node.text.replace(/\n{2,}/g, "\n");
  const lines = normalizedText.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length === 0) return [""];

  const pages = [];
  for (let i = 0; i < lines.length; i += 3) {
    pages.push(lines.slice(i, i + 3).join("\n"));
  }

  return pages;
}

function playBgmForNode(nodeId) {
  const trackKey = getTrackForNode(nodeId);

  if (!audioEnabled || !audioUnlocked) {
    currentTrackKey = trackKey;
    return;
  }

  if (currentTrackKey !== trackKey || !bgmPlayerEl.src || !bgmPlayerEl.src.endsWith(musicTracks[trackKey])) {
    bgmPlayerEl.src = musicTracks[trackKey];
  }
  currentTrackKey = trackKey;

  bgmPlayerEl.volume = trackKey === "tension" ? 0.5 : 0.42;
  const playPromise = bgmPlayerEl.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      audioUnlocked = false;
    });
  }
}

function ensureAudioStarted() {
  if (audioUnlocked || !audioEnabled) return;
  audioUnlocked = true;
  playBgmForNode(state.currentId);
}

function resolveEnding() {
  const worst =
    state.pressure >= 6 ||
    (state.pressure >= 5 && state.safety <= 0) ||
    (state.pressure >= 4 && state.safety <= 0 && state.recognition <= 1);

  const good =
    state.safety >= 4 &&
    state.recognition >= 4 &&
    state.pull >= 2 &&
    state.pressure <= 3;

  const bad =
    state.pressure >= 5 ||
    (state.recognition >= 3 && state.safety <= 1) ||
    (state.pull >= 3 && state.safety <= 2 && state.pressure >= 3);

  if (worst) return "ending_worst";
  if (good) return "ending_good";
  if (bad) return "ending_bad";
  return "ending_normal";
}

function getCharacterSrc(character) {
  if (!character) return "";
  return assets.characters[character.name]?.[character.expression] || "";
}

function applyEffects(effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    if (typeof state[key] === "number") {
      state[key] += value;
    }
  });
}

function restartGame() {
  const fresh = initialState();
  Object.assign(state, fresh);
  if (choiceUnlockTimer) {
    clearTimeout(choiceUnlockTimer);
    choiceUnlockTimer = null;
  }
  currentTrackKey = "";
  if (audioEnabled && audioUnlocked) {
    playBgmForNode(state.currentId);
  } else {
    bgmPlayerEl.pause();
    bgmPlayerEl.currentTime = 0;
  }
  renderNode();
}

function goToNode(nextId) {
  state.currentId = nextId;
  state.pageIndex = 0;
  renderNode();
}

function renderNode() {
  let node = gameData[state.currentId];
  if (node.branch) {
    const nextId = resolveEnding();
    state.currentId = nextId;
    state.pageIndex = 0;
    node = gameData[nextId];
  }

  playBgmForNode(state.currentId);

  backgroundEl.style.backgroundImage = `url("${assets.backgrounds[node.background]}")`;

  const spriteSrc = getCharacterSrc(node.character);
  if (spriteSrc) {
    spriteEl.src = spriteSrc;
    spriteEl.classList.remove("hidden");
  } else {
    spriteEl.classList.add("hidden");
  }

  speakerEl.textContent = node.speaker || "我";
  const pages = getNodePages(node);
  const currentPage = pages[state.pageIndex] || pages[0];
  const isLastPage = state.pageIndex >= pages.length - 1;

  textEl.textContent = currentPage;
  choicesEl.innerHTML = "";

  if (node.choices && isLastPage) {
    nextEl.classList.add("hidden");
    node.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.textContent = choice.text;
      button.disabled = true;
      button.addEventListener("click", () => {
        if (button.disabled) return;
        applyEffects(choice.effects);
        goToNode(choice.next);
      });
      choicesEl.appendChild(button);
    });

    if (choiceUnlockTimer) {
      clearTimeout(choiceUnlockTimer);
    }

    choiceUnlockTimer = setTimeout(() => {
      choicesEl.querySelectorAll(".choice-button").forEach((button) => {
        button.disabled = false;
      });
      choiceUnlockTimer = null;
    }, 1000);
  } else {
    if (choiceUnlockTimer) {
      clearTimeout(choiceUnlockTimer);
      choiceUnlockTimer = null;
    }
    const shouldShowNext = !isLastPage || Boolean(node.next);
    nextEl.classList.toggle("hidden", !shouldShowNext);
    nextEl.disabled = !shouldShowNext;
  }
}

nextEl.addEventListener("click", () => {
  ensureAudioStarted();
  const node = gameData[state.currentId];
  const pages = getNodePages(node);
  if (state.pageIndex < pages.length - 1) {
    state.pageIndex += 1;
    renderNode();
    return;
  }

  if (node?.next) {
    goToNode(node.next);
  }
});

restartTopEl.addEventListener("click", restartGame);
restartBottomEl.addEventListener("click", restartGame);
audioToggleEl.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  updateAudioToggleLabel();

  if (!audioEnabled) {
    bgmPlayerEl.pause();
    return;
  }

  ensureAudioStarted();
  playBgmForNode(state.currentId);
});

choicesEl.addEventListener("click", () => {
  ensureAudioStarted();
});

updateAudioToggleLabel();
renderNode();
