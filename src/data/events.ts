export interface GameEvent {
  id: string;
  title: string;
  description: string;
  trigger: {
    type: 'day' | 'clue' | 'reputation' | 'money' | 'random';
    value?: number | string;
    probability?: number;
  };
  choices: EventChoice[];
  isSpecial?: boolean;
}

export interface EventChoice {
  id: string;
  text: string;
  requiredClueId?: string;
  requiredMoney?: number;
  requiredReputation?: number;
  effects: {
    money?: number;
    reputation?: number;
    clueId?: string;
    unlocksStory?: string;
    unlocksHistory?: string;
    employeeMorale?: number;
    guestSatisfaction?: number;
  };
  resultText: string;
}

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'event_001',
    title: '水管爆裂',
    description: '二楼的水管突然爆裂，水漫了一地！需要立即处理。',
    trigger: { type: 'random', probability: 0.15 },
    choices: [
      {
        id: 'evt_001_1',
        text: '让张师傅立即修理',
        effects: { money: -200, reputation: -5 },
        resultText: '张师傅花了半天时间修好了水管，花了200元材料费。虽然有些损失，但处理及时。',
      },
      {
        id: 'evt_001_2',
        text: '先清理积水，再慢慢修',
        effects: { money: -500, reputation: -15 },
        resultText: '因为拖延，水渗到了一楼，损坏了一些家具。总共损失500元，客人也有怨言。',
      },
    ],
  },
  {
    id: 'event_002',
    title: '小镇美食节',
    description: '下周小镇要举办美食节，预计会有很多游客。这是提升酒店声誉的好机会！',
    trigger: { type: 'day', value: 7 },
    choices: [
      {
        id: 'evt_002_1',
        text: '参加美食节，让刘姐准备特色菜品',
        requiredMoney: 500,
        effects: { money: -500, reputation: 20 },
        resultText: '刘姐的拿手菜大受欢迎！酒店的名声大振，很多游客表示以后要住在这里。',
      },
      {
        id: 'evt_002_2',
        text: '不参加，成本太高',
        effects: { reputation: -5 },
        resultText: '虽然节省了成本，但错过了宣传机会。看到其他酒店生意兴隆，员工们有些失望。',
      },
    ],
  },
  {
    id: 'event_003',
    title: '神秘来信',
    description: '你收到了一封没有署名的信，信上只有一行字："小心地下室。"',
    trigger: { type: 'clue', value: 'clue_009' },
    isSpecial: true,
    choices: [
      {
        id: 'evt_003_1',
        text: '去找张师傅要地下室钥匙',
        effects: { clueId: 'clue_012' },
        resultText: '张师傅犹豫了很久，最终还是把钥匙给了你。"那里...很久没人去过了。"他说。',
      },
      {
        id: 'evt_003_2',
        text: '暂时不去，先收集更多线索',
        effects: {},
        resultText: '你决定先不冒险。也许等收集到更多线索后再去会更安全。',
      },
    ],
  },
  {
    id: 'event_004',
    title: '老照片',
    description: '王阿姨在打扫阁楼时发现了一本旧相册，里面有很多酒店早期的照片。',
    trigger: { type: 'clue', value: 'clue_002' },
    isSpecial: true,
    choices: [
      {
        id: 'evt_004_1',
        text: '仔细翻看相册',
        effects: { clueId: 'clue_004', reputation: 5 },
        resultText: '相册里有很多珍贵的历史照片，其中一张1947年的员工合影引起了你的注意——林婉儿站在后排，而陈德明坐在前排中央。',
      },
      {
        id: 'evt_004_2',
        text: '把相册收起来，以后再说',
        effects: {},
        resultText: '你把相册收在了办公室。也许以后有时间再仔细研究。',
      },
    ],
  },
  {
    id: 'event_005',
    title: '员工士气低落',
    description: '最近酒店生意不好，员工们看起来都很消沉。',
    trigger: { type: 'reputation', value: 20 },
    choices: [
      {
        id: 'evt_005_1',
        text: '请大家吃顿好的，鼓舞士气',
        requiredMoney: 300,
        effects: { money: -300, employeeMorale: 15 },
        resultText: '一顿丰盛的晚餐过后，员工们的心情好了很多。王阿姨甚至唱起了年轻时的歌谣。',
      },
      {
        id: 'evt_005_2',
        text: '开会训话，要求大家打起精神',
        effects: { employeeMorale: -10 },
        resultText: '你的训话并没有起到效果，反而让大家更加压抑。张师傅一整天都没说一句话。',
      },
      {
        id: 'evt_005_3',
        text: '什么都不做，让大家自己调节',
        effects: { employeeMorale: -5 },
        resultText: '气氛依然低迷。你注意到小李在偷偷看招聘网站。',
      },
    ],
  },
  {
    id: 'event_006',
    title: '夜半歌声',
    description: '深夜，你听到酒店里传来若有若无的歌声，像是民国时期的老歌。',
    trigger: { type: 'clue', value: 'clue_005' },
    isSpecial: true,
    choices: [
      {
        id: 'evt_006_1',
        text: '循声找去',
        effects: { clueId: 'clue_013' },
        resultText: '歌声把你引到了三楼走廊的尽头——302号房间门口。歌声戛然而止，门虚掩着，里面空无一人。',
      },
      {
        id: 'evt_006_2',
        text: '待在房间里，不敢出去',
        effects: {},
        resultText: '你把自己蒙在被子里，直到天亮。那歌声...真的存在吗？',
      },
    ],
  },
  {
    id: 'event_007',
    title: '暴风雨',
    description: '一场罕见的暴风雨袭击了小镇，许多游客滞留在外。',
    trigger: { type: 'random', probability: 0.1 },
    choices: [
      {
        id: 'evt_007_1',
        text: '开放大堂，免费收留滞留游客',
        effects: { money: -100, reputation: 25 },
        resultText: '你的善举被镇上的人交口称赞。很多游客表示以后一定会再来入住。',
      },
      {
        id: 'evt_007_2',
        text: '只收留已经预订的客人',
        effects: { reputation: 5 },
        resultText: '你按规矩办事，虽然没有得到太多赞誉，但也无可厚非。',
      },
      {
        id: 'evt_007_3',
        text: '趁机涨价',
        effects: { money: 500, reputation: -30 },
        resultText: '你狠狠赚了一笔，但镇上的人都在背后指指点点。酒店的名声一落千丈。',
      },
    ],
  },
  {
    id: 'event_008',
    title: '花园里的铁盒',
    description: '林婆婆拉着你的手，带你来到花园的老槐树下。"帮我把它挖出来。"她颤抖着说。',
    trigger: { type: 'clue', value: 'clue_014' },
    isSpecial: true,
    choices: [
      {
        id: 'evt_008_1',
        text: '按她说的做',
        effects: { unlocksStory: 'story_003', clueId: 'clue_016' },
        resultText: '你挖出了一个锈迹斑斑的铁盒。林婆婆泪流满面："这是婉儿姐的东西...70多年了，终于可以重见天日了。"',
      },
    ],
  },
];

export function checkForEvents(day: number, clueIds: string[], reputation: number, money: number): GameEvent[] {
  const triggered: GameEvent[] = [];

  for (const event of GAME_EVENTS) {
    const { trigger } = event;

    switch (trigger.type) {
      case 'day':
        if (day === trigger.value) {
          triggered.push(event);
        }
        break;
      case 'clue':
        if (trigger.value && clueIds.includes(trigger.value as string)) {
          triggered.push(event);
        }
        break;
      case 'reputation':
        if (reputation <= (trigger.value as number)) {
          triggered.push(event);
        }
        break;
      case 'random':
        if (Math.random() < (trigger.probability || 0.1)) {
          triggered.push(event);
        }
        break;
    }
  }

  return triggered;
}
