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
  flags: {
    greet: "",
    pace: "",
    order: "",
    topic: "",
    overload: "",
    aftercare: "",
    street: "",
    ending: "",
  },
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
let resizeTimer = null;
const paginationCache = new Map();

const measurerEl = document.createElement("div");
measurerEl.style.position = "fixed";
measurerEl.style.visibility = "hidden";
measurerEl.style.pointerEvents = "none";
measurerEl.style.left = "-9999px";
measurerEl.style.top = "-9999px";
measurerEl.style.whiteSpace = "pre-wrap";
measurerEl.style.wordBreak = "break-word";
measurerEl.style.overflowWrap = "anywhere";
document.body.appendChild(measurerEl);

const gameData = {
  intro_01: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她比我想像中更早到。
白天的車站外很亮，亮到連人臉上的猶豫都藏不太住。
我穿過出站口前的空地時，幾乎一眼就認出了她。`,
    next: "intro_02",
  },
  intro_02: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `米白色針織上衣，藍灰色長裙，手指搭在包包背帶上，站得很乖，也很僵。
她比照片裡更瘦一點，也比深夜通話時聲音給人的想像更安靜。
三個月的訊息、深夜的對話、她在某些時候會故意停很久才回我的習慣，都在這一秒變得很像真的。`,
    next: "intro_03",
  },
  intro_03: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她也看見了我。
視線碰上的瞬間，她像是忘了原本想好的表情，只好很快低頭。
我停在她面前一步的位置，等她先把呼吸找回來。`,
    choices: [
      {
        text: "「抱歉，讓妳等了。」",
        effects: { safety: 2 },
        setFlags: { greet: "warm" },
        next: "intro_greet_warm",
      },
      {
        text: "「妳跟我想的不太一樣。」",
        effects: { recognition: 2, pull: 1 },
        setFlags: { greet: "observe" },
        next: "intro_greet_observe",
      },
      {
        text: "「妳現在比在訊息裡安靜很多。」",
        effects: { recognition: 1, pressure: 2, pull: 1 },
        setFlags: { greet: "direct" },
        next: "intro_greet_direct",
      },
    ],
  },
  intro_greet_warm: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「沒有，我也才剛到。」
她停了一下，又很小聲地補了一句。
「其實我提前了二十分鐘。」`,
    next: "intro_merge_01",
  },
  intro_greet_observe: {
    background: "stationDay",
    character: { name: "yutang", expression: "surprised" },
    speaker: "語棠",
    text: `她抬頭看我，明顯愣了一下。
「是……哪裡不一樣？」
問完之後，她的手指又收緊了，像已經開始後悔自己把這句話問出口。`,
    next: "intro_merge_01",
  },
  intro_greet_direct: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「可能是因為……真的見到了。」
她自己也知道這句辯解沒有什麼說服力，說到後面聲音越來越小。
耳朵倒是很誠實地先紅了。`,
    next: "intro_merge_01",
  },
  intro_merge_01: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `我沒有立刻把那份緊張戳破，只是替她把節奏往日常那邊挪了一點。
「先走吧，裡面應該比較不吵。」
她點頭，跟在我旁邊。`,
    next: "walk_01",
  },
  walk_01: {
    background: "stationDay",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `剛開始的幾步，她走得很小心，像連步伐都不想太顯眼。
直到離開車站前的空地，她才終於像想起什麼似的開口。
「我本來有想過，你會不會認不出我。」`,
    next: "walk_02",
  },
  walk_02: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `我笑了一下。
「不至於。妳的打字方式太有辨識度了。」
她下意識看了我一眼，像想確認我是不是在故意逗她。`,
    next: "walk_03",
  },
  walk_03: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `我把後面的話補完。
「本人站在這裡，看起來也很像會在凌晨一點半突然傳一句『你還沒睡喔』的人。」
她嘴上沒反駁，耳朵卻先紅了。`,
    choices: [
      {
        text: "改聊她一路過來順不順，讓她先放鬆。",
        effects: { safety: 1 },
        setFlags: { pace: "care" },
        next: "walk_choice_care",
      },
      {
        text: "低聲說她今天比自己想像中還要乖。",
        effects: { pull: 1, pressure: 1 },
        setFlags: { pace: "test" },
        next: "walk_choice_test",
      },
      {
        text: "直接問她出門前是不是差點想逃。",
        effects: { recognition: 1, pressure: 1 },
        setFlags: { pace: "tease" },
        next: "walk_choice_tease",
      },
    ],
  },
  walk_choice_care: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "語棠",
    text: `她像鬆了一口氣，終於肯把注意力放回比較平常的事情上。
「其實路上還好，就是快到的時候有點想繞一圈再來。」
她說完自己先笑了一下，好像也知道這句太誠實。`,
    next: "walk_branch_01",
  },
  walk_choice_test: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她明顯怔了一下，連腳步都慢了半拍。
「你不要一開始就說這種話……」
嘴上像在抗議，聲音卻沒有真的硬起來。`,
    next: "walk_branch_01",
  },
  walk_choice_tease: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她安靜了兩秒。
「有。」
停了一下，她又很小聲地補了一句：「不是不想來，是怕真的來了之後，我會變得很不像我自己。」`,
    next: "walk_branch_01",
  },
  walk_branch_01: {
    resolve: (currentState) => {
      if (currentState.flags.greet === "warm") return "walk_greet_warm";
      if (currentState.flags.greet === "observe") return "walk_greet_observe";
      return "walk_greet_direct";
    },
  },
  walk_greet_warm: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `她看起來比剛見面時放鬆了一點。
大概是因為我沒有急著去證明什麼，反而先替她把今天接成一場普通約會。
那份鬆動很小，卻是真實的。`,
    next: "walk_merge_01",
  },
  walk_greet_observe: {
    background: "stationDay",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她雖然還是緊張，但已經開始更在意我在看她什麼。
那種在意不是壞事，甚至有點像把線上的某部分直接帶到了現實裡。
她開始用更小心的方式回應我。`,
    next: "walk_merge_01",
  },
  walk_greet_direct: {
    background: "stationDay",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她的安靜裡多了一點被點破之後的侷促。
我知道自己一開始就踩得比較前面，現在她雖然還跟著我走，卻會下意識更在意我下一句要說什麼。
那種緊張感沒有退掉，只是被她努力藏了起來。`,
    next: "walk_merge_01",
  },
  walk_merge_01: {
    background: "stationDay",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `前面的咖啡廳招牌已經看得見。
我替她拉開門，讓她先進去。
門上的鈴聲很輕，像替今天真正的開始補上了一個正式的音。`,
    next: "cafe_01",
  },
  cafe_01: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `咖啡廳裡比外面安靜。
她坐下之後，手還是放得很規矩，像怕自己一不小心就顯得太奇怪。
我把菜單推過去時，她明顯又遲疑了一下。`,
    choices: [
      {
        text: "替她點那杯她以前提過的熱拿鐵。",
        effects: { safety: 1, recognition: 2 },
        setFlags: { order: "remember" },
        next: "cafe_order_remember",
      },
      {
        text: "把菜單留給她，讓她自己慢慢選。",
        effects: { safety: 2 },
        setFlags: { order: "ask" },
        next: "cafe_order_ask",
      },
      {
        text: "直接替她決定，說今晚喝這個比較好。",
        effects: { pull: 1, pressure: 2 },
        setFlags: { order: "decide" },
        next: "cafe_order_decide",
      },
    ],
  },
  cafe_order_remember: {
    background: "cafe",
    character: { name: "yutang", expression: "surprised" },
    speaker: "語棠",
    text: `她看了我一眼。
「你還記得喔？」
不是誇張的驚訝，比較像某個她原本以為不該被帶到現實的細節，突然真的出現在桌上。`,
    next: "cafe_order_branch",
  },
  cafe_order_ask: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "語棠",
    text: `她明顯鬆了一口氣。
「謝謝。」
這句謝不是客氣，比較像她終於拿回一點能自己決定的空間。`,
    next: "cafe_order_branch",
  },
  cafe_order_decide: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她低頭看著杯子，安靜了兩秒。
「你真的幫我點了。」
她的語氣裡不是生氣，更多是現實裡的這一幕，比線上那種玩笑式的默契還要真得多。`,
    next: "cafe_order_branch",
  },
  cafe_order_branch: {
    resolve: (currentState) => {
      if (currentState.flags.order === "remember") return "cafe_order_follow_remember";
      if (currentState.flags.order === "ask") return "cafe_order_follow_ask";
      return "cafe_order_follow_decide";
    },
  },
  cafe_order_follow_remember: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `我把吸管拆開，慢條斯理地回她。
「妳自己說過，下午喝太酸的胃會不舒服。」
她垂下眼，像是那點被記住的小事，比任何曖昧的話都更讓她難應付。`,
    next: "cafe_talk_01",
  },
  cafe_order_follow_ask: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `她自己點完之後，坐姿也沒有剛才那麼繃。
我看得出來，她對「線上和線下到底能不能一樣」這件事還在很小心地摸索。
至少在喝什麼這件事上，她暫時不想把主導交出去。`,
    next: "cafe_talk_01",
  },
  cafe_order_follow_decide: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `她沒有拒絕，卻也沒有完全放鬆。
杯子被端上來的那一刻，她下意識看了我一下，像是在確認我是不是把線上的做法太快帶到了現實。
那點遲疑被她藏得很細，但還是在。`,
    next: "cafe_talk_01",
  },
  cafe_talk_01: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `前半段對話先從安全的地方開始。
工作、新生活、通勤、租屋處附近那間總是半夜還很多人的便利商店。
她說話還是有點慢，可比剛見面時好得多。`,
    next: "cafe_talk_02",
  },
  cafe_talk_02: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `「其實我本來以為，我今天會更會聊天一點。」
她用吸管碰了碰冰塊，像是在對自己的表現做一個很小聲的檢討。
「至少不會像現在這樣，一直覺得自己講什麼都很奇怪。」`,
    next: "cafe_talk_03",
  },
  cafe_talk_03: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `我說她在線上比較會，她立刻心虛地低頭。
「那不一樣。隔著螢幕的時候，我可以慢慢想自己要講什麼，也可以假裝自己沒有那麼在意。」
她停了一下，才承認：「現在太容易被你看出來。」`,
    next: "cafe_topic_choice",
  },
  cafe_topic_choice: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `那句話說完之後，氣氛慢慢偏離普通初次見面的軌道。
她還是會提到上班第一週有多亂，也會抱怨主管總愛在下班前丟新工作。
可那些話的縫隙裡，明顯還塞著另一層她沒講完的東西。`,
    choices: [
      {
        text: "問她：那妳最後為什麼還是來了？",
        effects: { safety: 1, recognition: 1 },
        setFlags: { topic: "meet" },
        next: "cafe_topic_meet",
      },
      {
        text: "問她：妳其實最在意我們之間的哪一部分？",
        effects: { recognition: 1, pull: 2 },
        setFlags: { topic: "dynamic" },
        next: "cafe_topic_dynamic",
      },
      {
        text: "問她：妳有沒有想過，把之前答應過的事全部收回去？",
        effects: { recognition: 1, pressure: 2 },
        setFlags: { topic: "regret" },
        next: "cafe_topic_regret",
      },
    ],
  },
  cafe_topic_meet: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她安靜了幾秒。
「因為我不想一直把你放在只有訊息的地方。」
她抿了下唇，聲音更低了一點。
「可是我今天站在車站外面的時候，真的有想過要不要再繞一圈。」`,
    next: "cafe_topic_merge_01",
  },
  cafe_topic_dynamic: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `她沒有立刻回答，像是在想哪一種誠實不會太超過。
「我以前以為，我在意的是那些比較明顯的東西。」
「可是見到你之後，我才發現真正讓我沒辦法裝沒事的，反而是……我好像很容易因為你變得安心。」`,
    next: "cafe_topic_merge_01",
  },
  cafe_topic_regret: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她低頭看著杯子。
「有。」
她像怕我誤會，又立刻補了一句。
「不是因為不想，是因為有幾次我真的差點被自己嚇到。會想說，如果現在停下來，是不是還來得及裝作那些話都只是半夜亂講。」`,
    next: "cafe_topic_merge_01",
  },
  cafe_topic_merge_01: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `她把這些話說完之後，像是終於把今晚最難承認的一層打開了。
我沒有立刻接得太快，只是讓那幾秒安靜停在我們中間。
然後她忽然也問了我一句。`,
    next: "cafe_topic_merge_02",
  },
  cafe_topic_merge_02: {
    background: "cafe",
    character: { name: "yutang", expression: "base" },
    speaker: "語棠",
    text: `「那你呢？」
「你今天真的見到我之後……有沒有覺得我其實很麻煩？」`,
    next: "cafe_topic_merge_03",
  },
  cafe_topic_merge_03: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她問完後自己先避開了我的視線。
比起想知道答案，更像是在試探：如果我現在真的說實話，她撐不撐得住。
而我真正讓她亂掉的那句，也就在這裡問出口了。`,
    next: "incident_trigger_branch",
  },
  incident_trigger_branch: {
    resolve: (currentState) => {
      if (currentState.flags.topic === "meet") return "incident_trigger_meet";
      if (currentState.flags.topic === "dynamic") return "incident_trigger_dynamic";
      return "incident_trigger_regret";
    },
  },
  incident_trigger_meet: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "我",
    text: `「妳今天到底是以什麼心情來見我的？」`,
    next: "incident_01",
  },
  incident_trigger_dynamic: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "我",
    text: `「那如果我今天不像線上那樣說話，妳還是會這麼在意我嗎？」`,
    next: "incident_01",
  },
  incident_trigger_regret: {
    background: "cafe",
    character: { name: "yutang", expression: "composed" },
    speaker: "我",
    text: `「那妳現在坐在我面前的時候，想收回去的到底是那些話，還是妳自己？」`,
    next: "incident_01",
  },
  incident_01: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `她像是早就知道這句會來。
只是等它真的落下來時，她還是沒有辦法立刻接住。
她張了張口，卻沒發出聲音。`,
    next: "incident_02",
  },
  incident_02: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `握著杯子的手指收得很緊，連指節都白了一點。
我原本以為她只是在想，可下一秒，我看見她的呼吸明顯亂了。
她低著頭，睫毛顫了一下，像是在很努力地把某種反應壓回去。`,
    next: "incident_03",
  },
  incident_03: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "語棠",
    text: `「我沒事。」`,
    next: "incident_04",
  },
  incident_04: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `她說得太快，快得像是在搶在自己撐不住之前，把場面先補起來。
可她的手在發冷，眼神也明顯飄開，不再敢停在我臉上。
這不是單純的害羞，是緊張、期待和現實感一起壓上來之後，她一下子不知道該把自己放在哪裡。`,
    choices: [
      {
        text: "先把話題停下來：「先不用回答，跟我出去一下。」",
        effects: { safety: 3, recognition: 1, pressure: -1 },
        setFlags: { overload: "outside" },
        next: "incident_outside_01",
      },
      {
        text: "壓低聲音：「看著我，慢慢呼吸。」",
        effects: { safety: 1, recognition: 1, pull: 2, pressure: 1 },
        setFlags: { overload: "breathe" },
        next: "incident_breathe_01",
      },
      {
        text: "低聲問她：「妳現在是在怕我，還是在怕妳自己？」",
        effects: { recognition: 2, pressure: 3, pull: 1 },
        setFlags: { overload: "pierce" },
        next: "incident_pierce_01",
      },
    ],
  },
  incident_outside_01: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `我沒再逼她把那句話說完，只是替她把杯子往裡推了一點，結了帳，帶她走出咖啡廳。
晚風吹過來時，她肩膀很輕地顫了一下，像整個人這才從剛才那個太密的空氣裡退回來。
她站在玻璃窗外，低頭深呼吸了好幾次。`,
    next: "incident_outside_02",
  },
  incident_outside_02: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「對不起。」
「我不是不想回答，只是剛剛那一瞬間，我忽然覺得如果真的把話說完，今天就不會只是今天了。」`,
    choices: [
      {
        text: "告訴她今天到這裡也沒關係，不用硬撐。",
        effects: { safety: 2 },
        setFlags: { aftercare: "stop" },
        next: "outside_aftercare_stop",
      },
      {
        text: "說先慢慢走到車站，不急著把今晚說完。",
        effects: { safety: 1, recognition: 1, pull: 1 },
        setFlags: { aftercare: "walk" },
        next: "outside_aftercare_walk",
      },
      {
        text: "說剛才那句先欠著，妳總要在今晚給我一點答案。",
        effects: { recognition: 1, pull: 2, pressure: 1 },
        setFlags: { aftercare: "hold" },
        next: "outside_aftercare_hold",
      },
    ],
  },
  outside_aftercare_stop: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她抬頭看我，像沒想到我會先替她踩煞車。
那個反應幾乎比任何回答都更誠實。
她沒有立刻說謝謝，只是很輕地點了一下頭。`,
    next: "street_01",
  },
  outside_aftercare_walk: {
    background: "streetEvening",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `她看起來鬆了一口氣。
「好。」
那個字很輕，卻像她今晚第一次真正把節奏交回到我手上。`,
    next: "street_01",
  },
  outside_aftercare_hold: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她明顯又緊了一下，卻沒有退開。
「你這樣講，會讓我很難裝作剛才只是突然不舒服。」
她的語氣像在抱怨，卻還是跟著我往前走了。`,
    next: "street_01",
  },
  incident_breathe_01: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "我",
    text: `「語棠，看著我。先別急著回答。」`,
    next: "incident_breathe_02",
  },
  incident_breathe_02: {
    background: "cafe",
    character: { name: "yutang", expression: "nervous" },
    speaker: "",
    text: `她呼吸停了一拍。
停了兩秒，才真的慢慢把眼睛抬起來。
她跟著我的節奏吸氣、吐氣，肩膀才沒那麼僵。`,
    next: "incident_breathe_03",
  },
  incident_breathe_03: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `「你不要……這樣看著我。」
她耳根紅得很明顯。
「像是我現在在想什麼，你都知道一樣。」`,
    choices: [
      {
        text: "低聲說她剛才其實做得很好。",
        effects: { safety: 1, pull: 1 },
        setFlags: { aftercare: "praise" },
        next: "breathe_aftercare_praise",
      },
      {
        text: "換回比較平常的語氣，故意逗她一句。",
        effects: { pull: 1, pressure: 1 },
        setFlags: { aftercare: "tease" },
        next: "breathe_aftercare_tease",
      },
      {
        text: "問她要不要先出去走走，再回來說。",
        effects: { safety: 1, recognition: 1 },
        setFlags: { aftercare: "walk" },
        next: "breathe_aftercare_walk",
      },
    ],
  },
  breathe_aftercare_praise: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "我",
    text: `「妳剛才已經比妳自己以為的穩很多了。」
她像被這句話弄得更不知道該怎麼擺表情，只能低頭去捏紙巾邊角。
但那份緊張裡，確實多了一點被接住的安靜。`,
    next: "street_01",
  },
  breathe_aftercare_tease: {
    background: "cafe",
    character: { name: "yutang", expression: "shy" },
    speaker: "我",
    text: `「我都還沒怎樣，妳就先亂成這樣？」
她瞪了我一眼，眼神一點也不兇。
「你不要現在又故意……」嘴上這麼說，呼吸卻真的比剛剛順了。`,
    next: "street_01",
  },
  breathe_aftercare_walk: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `她點頭後，我帶她離開店裡。
外面的風把剛才那種太近的壓迫感沖淡了一點。
她走在我旁邊，雖然還很安靜，但已經不像剛才那樣快要撐不住。`,
    next: "street_01",
  },
  incident_pierce_01: {
    background: "cafe",
    character: { name: "yutang", expression: "surprised" },
    speaker: "我",
    text: `「妳現在是在怕我，還是在怕妳自己？」`,
    next: "incident_pierce_02",
  },
  incident_pierce_02: {
    background: "cafe",
    character: { name: "yutang", expression: "surprised" },
    speaker: "",
    text: `她整個人都靜住了。
不是被嚇到，更像是那句話直接碰到她最不想承認的地方。
她握著杯子的手微微顫了一下。`,
    next: "incident_pierce_03",
  },
  incident_pierce_03: {
    background: "cafe",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「你這樣問，太犯規了。」
她沉默了很久，才很小聲地承認：
「我怕的不是你，是我自己真的會相信。」`,
    next: "street_01",
  },
  street_01: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `走出咖啡廳時，天色已經暗下來了。
街上的燈一盞一盞亮起，玻璃窗裡的暖光落在地上，把人的影子拉得很長。
她走在我旁邊，比來時更安靜，但那種安靜已經不一樣了。`,
    next: "street_branch_01",
  },
  street_branch_01: {
    resolve: (currentState) => {
      if (currentState.flags.order === "remember") return "street_order_remember";
      if (currentState.flags.order === "ask") return "street_order_ask";
      return "street_order_decide";
    },
  },
  street_order_remember: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「你連那杯咖啡都記得，真的很過分。」
她聲音很輕，像抱怨，又像只是終於承認這件事一直卡在心裡。
「那會讓我很難把今天當成只是出來見一面。」`,
    next: "street_middle_01",
  },
  street_order_ask: {
    background: "streetEvening",
    character: { name: "yutang", expression: "base" },
    speaker: "語棠",
    text: `「我剛剛其實有注意到，你沒有在一開始就替我決定。」
她低著頭走路，語氣卻比白天穩一些。
「這樣讓我比較敢承認，我今天真的很緊張。」`,
    next: "street_middle_01",
  },
  street_order_decide: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「你剛剛幫我點飲料的時候，我有嚇到。」
她沒有怪我，只是把那個瞬間撿起來放到我們中間。
「在線上跟真的坐在你對面，還是差很多。」`,
    next: "street_middle_01",
  },
  street_middle_01: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "",
    text: `我沒有急著替自己辯解。
晚上的街道比白天更適合讓那些本來會被打斷的情緒慢慢浮上來。
過了半條街，她忽然又開口。`,
    next: "street_middle_02",
  },
  street_middle_02: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `「我剛剛不是後悔。」
「我只是本來以為自己可以表現得更像平常那樣。」
她沒看我，只是盯著前面的路燈。`,
    next: "street_middle_03",
  },
  street_middle_03: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `我說她在線上比較會裝沒事，她耳朵紅了一下，卻沒有否認。
「因為隔著螢幕比較容易。」
她停了一下，才補上後半句：「現在不是。」`,
    next: "street_choice",
  },
  street_choice: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `前面已經能遠遠看見車站的燈。
我知道如果現在不把話說到更深，今晚最後大概只會停在若有似無的地方。
可說得太快，也可能把她剛穩住的東西又一次逼散。`,
    choices: [
      {
        text: "問她：妳是從什麼時候開始，發現自己會依賴這段關係？",
        effects: { recognition: 2, pull: 1 },
        setFlags: { street: "depend" },
        next: "street_choice_depend",
      },
      {
        text: "告訴她：今晚妳不用證明自己有多撐得住。",
        effects: { safety: 2 },
        setFlags: { street: "ease" },
        next: "street_choice_ease",
      },
      {
        text: "問她：如果把這段關係帶到現實裡，妳需要什麼？",
        effects: { safety: 1, recognition: 1, pull: 1 },
        setFlags: { street: "need" },
        next: "street_choice_need",
      },
    ],
  },
  street_choice_depend: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她安靜了很久，像是在挑一個不會太丟臉的答案。
「不是在那些比較明顯的時候。」
「反而是有一次我加班到很晚，你只說了句『去吃點東西再回我』，我那天就忽然發現……原來我會把那句話記到睡前。」`,
    next: "street_extra_branch",
  },
  street_choice_ease: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她明顯愣了一下。
「可是我今天從出門開始，就一直在想自己不能太不像樣。」
她苦笑了一下。
「你現在這樣講，會讓我很想承認我其實已經撐得很累了。」`,
    next: "street_extra_branch",
  },
  street_choice_need: {
    background: "streetEvening",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `這次她沒有躲。
「我需要你不要把線上那套直接搬過來。」
她停了一下，又很慢地把後半句補上。
「但我也不希望你把今天當成普通到什麼都不算。」`,
    next: "street_extra_branch",
  },
  street_extra_branch: {
    resolve: (currentState) => {
      if (
        currentState.flags.order === "remember" &&
        currentState.flags.overload === "outside" &&
        currentState.safety >= 7
      ) {
        return "street_extra_good";
      }
      if (
        currentState.flags.order === "decide" &&
        currentState.flags.overload === "pierce" &&
        currentState.pressure >= 6
      ) {
        return "street_extra_tense";
      }
      return "street_merge_final";
    },
  },
  street_extra_good: {
    background: "streetEvening",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她像是下了很大決心，忽然又把話題拉回到更前面。
「我今天其實不是提前二十分鐘。」
她頓了頓。
「我是提早四十分鐘到，在對街站了很久，才真的走過去的。」`,
    next: "street_extra_good_02",
  },
  street_extra_good_02: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `「我本來以為，只要真的看到你，我可能就會知道自己該不該停。」
她抬頭看我一眼，聲音很低。
「結果更糟。我現在反而比較沒有辦法裝作這些都沒那麼重要。」`,
    next: "street_merge_final",
  },
  street_extra_tense: {
    background: "streetEvening",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她沉默了一路，最後才忽然開口。
「你是不是在線下也想替我把所有反應都做完？」
這句話沒有很重，卻明顯比剛才更冷。
我知道她不是在發脾氣，她只是開始把距離往回拉。`,
    next: "street_merge_final",
  },
  street_merge_final: {
    background: "streetEvening",
    character: { name: "yutang", expression: "base" },
    speaker: "",
    text: `前面的車站越來越近，白天見面的地方現在被夜色整個換了一層表情。
我忽然覺得這樣也好。從哪裡開始，就在哪裡確認今晚到底留下了什麼。
她像也意識到終點到了，腳步不自覺慢了下來。`,
    next: "station_night_01",
  },
  station_night_01: {
    background: "stationNight",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `回到車站時，和白天幾乎像兩個地方。
玻璃裡的燈更亮，外面的風更冷。
白天那種人來人往的安全感退掉之後，很多話反而更容易在這裡留下來。`,
    next: "station_night_branch",
  },
  station_night_branch: {
    resolve: (currentState) => {
      if (currentState.flags.street === "depend") return "station_night_depend";
      if (currentState.flags.street === "ease") return "station_night_ease";
      return "station_night_need";
    },
  },
  station_night_depend: {
    background: "stationNight",
    character: { name: "yutang", expression: "downcast" },
    speaker: "語棠",
    text: `她站在我面前，像白天剛見面時那樣安靜。
只是這次她沒有一開始就躲開視線。
「我今天是不是把很多不該講的話都講出來了？」`,
    next: "station_night_choice",
  },
  station_night_ease: {
    background: "stationNight",
    character: { name: "yutang", expression: "shy" },
    speaker: "語棠",
    text: `她站在驗票口前，手還放在包包背帶上。
「你剛剛說我不用證明自己。」
她像是把那句話又在心裡重念了一次。
「我今天一直都很需要有人這樣跟我說。」`,
    next: "station_night_choice",
  },
  station_night_need: {
    background: "stationNight",
    character: { name: "yutang", expression: "composed" },
    speaker: "語棠",
    text: `她停在我面前，像在逼自己別再退。
「如果真的要把這段關係帶到現實裡，我應該沒有辦法一直靠猜。」
她吸了一口氣。
「可是我今天也沒有要你把我當普通朋友。」`,
    next: "station_night_choice",
  },
  station_night_choice: {
    background: "stationNight",
    character: { name: "yutang", expression: "composed" },
    speaker: "",
    text: `我知道她現在要的不是漂亮答案。
她要的是我會怎麼定義今晚，怎麼定義她剛剛那些幾乎已經算是交出來的東西。
而我的回答，會直接決定這次見面是停在這裡，還是留下下一次。`,
    choices: [
      {
        text: "「今天先到這裡就好。」",
        effects: { safety: 1 },
        setFlags: { ending: "hold" },
        next: "station_end_hold",
      },
      {
        text: "「妳今晚已經比妳自己想的更誠實了。」",
        effects: { safety: 1, recognition: 1 },
        setFlags: { ending: "affirm" },
        next: "station_end_affirm",
      },
      {
        text: "「如果下次我不想只停在今天這樣，妳還會來嗎？」",
        effects: { pull: 2, pressure: 1, recognition: 1 },
        setFlags: { ending: "invite" },
        next: "station_end_invite",
      },
    ],
  },
  station_end_hold: {
    background: "stationNight",
    character: { name: "yutang", expression: "surprised" },
    speaker: "",
    text: `她明顯愣了一下，像沒想到我會先替她踩煞車。
那個反應幾乎比任何回答都更誠實。
她沒有立刻說謝謝，只是看著我，眼神慢慢鬆下來。`,
    next: "ending_check",
  },
  station_end_affirm: {
    background: "stationNight",
    character: { name: "yutang", expression: "shy" },
    speaker: "",
    text: `她的睫毛很輕地顫了一下，像是這句話比她預期的還要直接。
她沒有立刻接，卻也沒有把視線移開。
那份沉默不像逃避，更像是在努力把這句話收進去。`,
    next: "ending_check",
  },
  station_end_invite: {
    background: "stationNight",
    character: { name: "yutang", expression: "surprised" },
    speaker: "",
    text: `她明顯吸了一口氣。
不是退縮，而是被這句話逼得必須在心裡很快做一個誠實的判斷。
那個反應裡的緊張，比白天剛見面時還要真。`,
    next: "ending_check",
  },
  ending_check: {
    resolve: (currentState) => resolveEnding(currentState),
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
她避開我的視線，終於把真正的那句說完。
「我本來以為，就算真的跟你見面，至少也不會讓我覺得自己一直被逼著反應。我不喜歡這樣。」
她說完就轉身往站裡走，連回頭都沒有。
【結局：不歡而散】`,
  },
};

function getTrackForNode(nodeId) {
  if (nodeId.startsWith("intro_") || nodeId.startsWith("walk_") || nodeId.startsWith("cafe_")) {
    return "day";
  }

  if (nodeId.startsWith("incident_") || nodeId.startsWith("outside_") || nodeId.startsWith("breathe_") || nodeId.startsWith("street_")) {
    return "tension";
  }

  if (nodeId.startsWith("station_") || nodeId.startsWith("ending_")) {
    return "night";
  }

  return "day";
}

function updateAudioToggleLabel() {
  audioToggleEl.textContent = audioEnabled ? "音樂：開" : "音樂：關";
}

function getNodePages(node) {
  const normalizedText = node.text.replace(/\n{2,}/g, "\n");
  const width = Math.max(Math.round(textEl.clientWidth || 0), 1);
  const cacheKey = `${state.currentId}:${width}`;

  if (paginationCache.has(cacheKey)) {
    return paginationCache.get(cacheKey);
  }

  const computedStyle = window.getComputedStyle(textEl);
  measurerEl.style.width = `${width}px`;
  measurerEl.style.font = computedStyle.font;
  measurerEl.style.fontSize = computedStyle.fontSize;
  measurerEl.style.fontWeight = computedStyle.fontWeight;
  measurerEl.style.lineHeight = computedStyle.lineHeight;
  measurerEl.style.letterSpacing = computedStyle.letterSpacing;
  measurerEl.style.fontFamily = computedStyle.fontFamily;

  const lineHeight = parseFloat(computedStyle.lineHeight);
  const maxHeight = lineHeight * 3 + 1;
  const breakChars = new Set(["。", "，", "、", "！", "？", "；", "」", "』", "\n"]);
  const chars = Array.from(normalizedText);

  if (chars.length === 0) {
    return [""];
  }

  const pages = [];
  let buffer = "";
  let lastBreak = -1;

  const measureFits = (content) => {
    measurerEl.textContent = content || " ";
    return measurerEl.scrollHeight <= maxHeight;
  };

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    const candidate = buffer + char;

    if (measureFits(candidate)) {
      buffer = candidate;
      if (breakChars.has(char)) {
        lastBreak = buffer.length;
      }
      continue;
    }

    if (!buffer.trim()) {
      buffer = candidate;
      lastBreak = breakChars.has(char) ? buffer.length : -1;
      continue;
    }

    if (lastBreak > 0) {
      const page = buffer.slice(0, lastBreak).trim();
      if (page) {
        pages.push(page);
      }
      buffer = buffer.slice(lastBreak).replace(/^\n+/, "").trimStart();
    } else {
      const page = buffer.trim();
      if (page) {
        pages.push(page);
      }
      buffer = "";
    }

    lastBreak = -1;
    i -= 1;
  }

  if (buffer.trim()) {
    pages.push(buffer.trim());
  }

  const result = pages.length > 0 ? pages : [normalizedText];
  paginationCache.set(cacheKey, result);
  return result;
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

function resolveEnding(currentState) {
  const worst =
    currentState.pressure >= 8 ||
    (currentState.pressure >= 6 && currentState.safety <= 2) ||
    (currentState.flags.overload === "pierce" &&
      currentState.flags.order === "decide" &&
      currentState.flags.ending === "invite");

  const good =
    currentState.safety >= 8 &&
    currentState.recognition >= 7 &&
    currentState.pull >= 5 &&
    currentState.pressure <= 4;

  const bad =
    currentState.pressure >= 6 ||
    currentState.safety <= 2 ||
    (currentState.flags.topic === "regret" &&
      currentState.flags.overload === "pierce" &&
      currentState.flags.ending === "invite");

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

function applyFlags(setFlags = {}) {
  Object.assign(state.flags, setFlags);
}

function restartGame() {
  const fresh = initialState();
  Object.assign(state, fresh);
  paginationCache.clear();
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

function resolveNode() {
  let node = gameData[state.currentId];

  while (node && typeof node.resolve === "function") {
    const nextId = node.resolve(state);
    state.currentId = nextId;
    state.pageIndex = 0;
    node = gameData[nextId];
  }

  return node;
}

function renderNode() {
  const node = resolveNode();
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

  const availableChoices = (node.choices || []).filter(
    (choice) => !choice.condition || choice.condition(state)
  );

  if (availableChoices.length > 0 && isLastPage) {
    nextEl.classList.add("hidden");

    availableChoices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.textContent = choice.text;
      button.disabled = true;
      button.addEventListener("click", () => {
        if (button.disabled) return;
        applyEffects(choice.effects);
        applyFlags(choice.setFlags);
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
  const node = resolveNode();
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
restartBottomEl?.addEventListener("click", restartGame);
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

window.addEventListener("resize", () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  resizeTimer = setTimeout(() => {
    paginationCache.clear();
    state.pageIndex = 0;
    renderNode();
    resizeTimer = null;
  }, 150);
});

updateAudioToggleLabel();
renderNode();
