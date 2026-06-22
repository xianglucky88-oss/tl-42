import type { Guest, SatisfactionDimensions, SentimentKeyword, GuestReview } from '../types/guest';
import { KEYWORD_TO_ATTRIBUTE } from './hotel';

export const GUEST_POOL: Guest[] = [
  {
    id: 'guest_001',
    name: '陈老先生',
    occupation: '退休历史教授',
    avatar: '👴',
    portrait: '👴',
    description: '一位看起来很有学问的老人，总是随身带着一本旧相册。他似乎对这家酒店的历史非常感兴趣。',
    age: 78,
    personality: ['博学', '怀旧', '神秘'],
    stayDuration: 3,
    currentDayOfStay: 1,
    patience: 90,
    maxPatience: 100,
    mood: 'content',
    satisfaction: 70,
    totalBill: 0,
    paid: false,
    needs: [
      { id: 'need_001_1', type: 'quiet_room', description: '需要一个安静的房间', urgency: 2, status: 'unmet', met: false },
      { id: 'need_001_2', type: 'tea_service', description: '每天下午需要喝茶', urgency: 1, status: 'unmet', met: false, requiredItems: ['item_beverage_001'] },
    ],
    observations: [
      { id: 'obs_001_1', description: '他总是在凌晨独自在大堂徘徊，看着墙上的老照片。', time: 'evening', location: 'lobby', discovered: false, clueId: 'clue_001' },
      { id: 'obs_001_2', description: '他的相册里有一张1950年代的酒店老照片，上面有一个年轻女子。', time: 'afternoon', location: 'restaurant', discovered: false, clueId: 'clue_002' },
    ],
    dialogueOptions: [
      {
        id: 'dia_001_1',
        text: '您好，欢迎来到百年酒店。请问有什么可以帮您的？',
        responses: [
          {
            id: 'resp_001_1_1',
            text: '谢谢。我年轻时曾在这里住过，那是1960年代的事了。这家酒店...承载了太多回忆。',
            effect: { reputation: 2, clueId: 'clue_003' },
          },
        ],
      },
      {
        id: 'dia_001_2',
        text: '您对这家酒店的历史似乎很了解？',
        requiredClueId: 'clue_003',
        responses: [
          {
            id: 'resp_001_2_1',
            text: '（叹气）何止了解...我的父亲曾是这里的经理。1947年，这里发生了一件事，改变了很多人的命运。',
            effect: { reputation: 5, clueId: 'clue_004' },
          },
        ],
      },
      {
        id: 'dia_001_3',
        text: '1947年发生了什么？',
        requiredClueId: 'clue_004',
        responses: [
          {
            id: 'resp_001_3_1',
            text: '（沉默良久）...有一位女歌手在这里失踪了。没有人知道她去了哪里。但我相信，答案就在这家酒店的某个角落。',
            effect: { reputation: 10, unlocksStory: 'story_001', clueId: 'clue_005' },
          },
        ],
      },
    ],
    secretId: 'secret_001',
    unlockedClues: [],
    isCheckOut: false,
    arrivalDay: 1,
    departureDay: 4,
    status: 'staying',
    isVIP: true,
    background: '退休历史教授，父亲曾是酒店经理',
    preferredPrice: 300,
    secret: { discovered: false, content: '他知道1947年女歌手失踪案的真相' },
    dialogues: [],
    satisfactionDimensions: {
      room: 85,
      service: 78,
      food: 70,
      facilities: 65,
      location: 90,
      cleanliness: 80,
    },
    sentimentKeywords: [
      { word: '怀旧', polarity: 'positive', weight: 8 },
      { word: '安静', polarity: 'positive', weight: 7 },
      { word: '历史感', polarity: 'positive', weight: 9 },
      { word: '服务周到', polarity: 'positive', weight: 6 },
      { word: '茶点不错', polarity: 'positive', weight: 5 },
    ],
  },
  {
    id: 'guest_002',
    name: '苏小姐',
    occupation: '悬疑小说作家',
    avatar: '👩‍🦰',
    portrait: '👩‍🦰',
    description: '一位年轻的女作家，正在写一部关于民国时期酒店的悬疑小说。她总是用笔记录着什么。',
    age: 28,
    personality: ['敏锐', '好奇', '固执'],
    stayDuration: 5,
    currentDayOfStay: 1,
    patience: 70,
    maxPatience: 100,
    mood: 'neutral',
    satisfaction: 60,
    totalBill: 0,
    paid: false,
    needs: [
      { id: 'need_002_1', type: 'suite', description: '需要套房工作', urgency: 3, status: 'unmet', met: false },
      { id: 'need_002_2', type: 'coffee', description: '每天需要大量咖啡', urgency: 2, status: 'unmet', met: false, requiredItems: ['item_beverage_002'] },
      { id: 'need_002_3', type: 'no_disturb', description: '晚上不要打扰', urgency: 1, status: 'unmet', met: false },
    ],
    observations: [
      { id: 'obs_002_1', description: '她经常在酒店各处拍照，特别是那些有年代感的角落。', time: 'morning', location: 'hotel', discovered: false, clueId: 'clue_006' },
      { id: 'obs_002_2', description: '深夜看到她在翻阅旧报纸合订本，似乎在找什么新闻。', time: 'evening', location: 'library', discovered: false, clueId: 'clue_007' },
    ],
    dialogueOptions: [
      {
        id: 'dia_002_1',
        text: '苏小姐，写作进展如何？',
        responses: [
          {
            id: 'resp_002_1_1',
            text: '在找灵感。这家酒店的氛围太棒了，简直就是为我的小说量身定做的。你知道吗？我在查1940年代这里发生的一桩悬案。',
            effect: { reputation: 3, clueId: 'clue_008' },
          },
        ],
      },
      {
        id: 'dia_002_2',
        text: '你找到了什么线索吗？',
        requiredClueId: 'clue_008',
        responses: [
          {
            id: 'resp_002_2_1',
            text: '（压低声音）我在旧报纸上看到，1947年有位叫林婉儿的歌手在这里失踪。警方后来在地下室发现了血迹...但从未找到尸体。',
            effect: { reputation: 5, clueId: 'clue_009' },
          },
        ],
      },
    ],
    secretId: 'secret_002',
    unlockedClues: [],
    isCheckOut: false,
    arrivalDay: 2,
    departureDay: 7,
    status: 'staying',
    isVIP: false,
    background: '悬疑小说作家，正在调查酒店历史悬案',
    preferredPrice: 250,
    secret: { discovered: false, content: '她的小说原型就是1947年的失踪案' },
    dialogues: [],
    satisfactionDimensions: {
      room: 75,
      service: 82,
      food: 70,
      facilities: 78,
      location: 85,
      cleanliness: 72,
    },
    sentimentKeywords: [
      { word: '灵感', polarity: 'positive', weight: 8 },
      { word: '氛围好', polarity: 'positive', weight: 7 },
      { word: '安静', polarity: 'positive', weight: 6 },
      { word: '咖啡不错', polarity: 'positive', weight: 5 },
      { word: '有故事感', polarity: 'positive', weight: 9 },
    ],
  },
  {
    id: 'guest_003',
    name: '王老板',
    occupation: '房地产开发商',
    avatar: '🧔',
    portrait: '🧔',
    description: '财大气粗的商人，似乎对收购这家酒店很感兴趣。态度傲慢，但出手大方。',
    age: 55,
    personality: ['傲慢', '精明', '有目的'],
    stayDuration: 2,
    currentDayOfStay: 1,
    patience: 50,
    maxPatience: 100,
    mood: 'neutral',
    satisfaction: 50,
    totalBill: 0,
    paid: false,
    needs: [
      { id: 'need_003_1', type: 'best_room', description: '要最好的房间', urgency: 3, status: 'unmet', met: false },
      { id: 'need_003_2', type: 'gourmet', description: '需要高档餐饮', urgency: 2, status: 'unmet', met: false, requiredItems: ['item_food_005'] },
    ],
    observations: [
      { id: 'obs_003_1', description: '他私下里和张师傅密谈，似乎在打听什么。', time: 'afternoon', location: 'backyard', discovered: false, clueId: 'clue_010' },
      { id: 'obs_003_2', description: '他的公文包里有一份酒店地产评估报告。', time: 'evening', location: 'bar', discovered: false, clueId: 'clue_011' },
    ],
    dialogueOptions: [
      {
        id: 'dia_003_1',
        text: '王老板，住得还习惯吗？',
        responses: [
          {
            id: 'resp_003_1_1',
            text: '（冷哼）这破地方也叫酒店？要不是看中这块地...算了，说正事，我要收购这家酒店，开个价吧。',
            effect: { reputation: -5 },
          },
        ],
      },
      {
        id: 'dia_003_2',
        text: '您为什么想买下这家酒店？',
        requiredClueId: 'clue_011',
        responses: [
          {
            id: 'resp_003_2_1',
            text: '（眼神闪烁）商业机密。不过...告诉你也无妨，这下面可能埋着什么宝贝。1947年，有个女人带着一笔巨款失踪了。',
            effect: { reputation: 8, clueId: 'clue_012' },
          },
        ],
      },
    ],
    secretId: 'secret_003',
    unlockedClues: [],
    isCheckOut: false,
    arrivalDay: 3,
    departureDay: 5,
    status: 'staying',
    isVIP: false,
    background: '房地产开发商，企图收购酒店地块',
    preferredPrice: 500,
    secret: { discovered: false, content: '他知道酒店地下可能埋有宝藏' },
    dialogues: [],
    satisfactionDimensions: {
      room: 55,
      service: 60,
      food: 75,
      facilities: 50,
      location: 85,
      cleanliness: 58,
    },
    sentimentKeywords: [
      { word: '位置好', polarity: 'positive', weight: 7 },
      { word: '菜好吃', polarity: 'positive', weight: 6 },
      { word: '设施陈旧', polarity: 'negative', weight: 8 },
      { word: '房间小', polarity: 'negative', weight: 5 },
      { word: '价格贵', polarity: 'negative', weight: 4 },
    ],
  },
  {
    id: 'guest_004',
    name: '林婆婆',
    occupation: '退休护士',
    avatar: '👵',
    portrait: '👵',
    description: '一位慈祥的老太太，她说自己年轻时曾在这里工作过。她看酒店的眼神里充满了复杂的情感。',
    age: 92,
    personality: ['慈祥', '忧伤', '有秘密'],
    stayDuration: 4,
    currentDayOfStay: 1,
    patience: 85,
    maxPatience: 100,
    mood: 'content',
    satisfaction: 75,
    totalBill: 0,
    paid: false,
    needs: [
      { id: 'need_004_1', type: 'first_floor', description: '需要一楼的房间', urgency: 2, status: 'unmet', met: false },
      { id: 'need_004_2', type: 'special_food', description: '需要软食', urgency: 2, status: 'unmet', met: false, requiredItems: ['item_food_001', 'item_food_004'] },
    ],
    observations: [
      { id: 'obs_004_1', description: '她总是独自坐在302号房间门口发呆，那间房已经锁了很多年。', time: 'afternoon', location: '3rd_floor', discovered: false, clueId: 'clue_013' },
      { id: 'obs_004_2', description: '她在花园里埋了什么东西，然后在那里哭了很久。', time: 'evening', location: 'garden', discovered: false, clueId: 'clue_014' },
    ],
    dialogueOptions: [
      {
        id: 'dia_004_1',
        text: '林婆婆，您说您以前在这里工作过？',
        responses: [
          {
            id: 'resp_004_1_1',
            text: '（点头）是啊...1946年，我15岁，在这里做帮工。那时候，这家酒店是全城最好的地方。（擦眼睛）婉儿姐曾是这里的招牌...',
            effect: { reputation: 5, clueId: 'clue_015' },
          },
        ],
      },
      {
        id: 'dia_004_2',
        text: '婉儿姐就是那位失踪的歌手吗？',
        requiredClueId: 'clue_015',
        responses: [
          {
            id: 'resp_004_2_1',
            text: '（震惊地看着你）你...你怎么知道？（长叹）这件事压在我心里70多年了。婉儿不是失踪，她是...她是被人害死的。我看到了，但我不敢说。',
            effect: { reputation: 15, unlocksStory: 'story_002', clueId: 'clue_016' },
          },
        ],
      },
    ],
    secretId: 'secret_004',
    unlockedClues: [],
    isCheckOut: false,
    arrivalDay: 5,
    departureDay: 9,
    status: 'staying',
    isVIP: true,
    background: '退休护士，1946年曾在酒店做帮工',
    preferredPrice: 200,
    secret: { discovered: false, content: '她亲眼目睹了1947年的谋杀案' },
    dialogues: [],
    satisfactionDimensions: {
      room: 80,
      service: 90,
      food: 78,
      facilities: 70,
      location: 95,
      cleanliness: 85,
    },
    sentimentKeywords: [
      { word: '温馨', polarity: 'positive', weight: 9 },
      { word: '回忆满满', polarity: 'positive', weight: 10 },
      { word: '服务贴心', polarity: 'positive', weight: 8 },
      { word: '安静舒适', polarity: 'positive', weight: 7 },
      { word: '软食可口', polarity: 'positive', weight: 6 },
    ],
  },
];

export const SAMPLE_REVIEWS: GuestReview[] = [
  {
    id: 'review_001',
    guestId: 'guest_hist_001',
    guestName: '张先生',
    rating: 4,
    content: '整体入住体验不错，房间干净整洁，服务态度很好。早餐种类可以再丰富一些，设施稍微有点陈旧但维护得不错。下次来还会考虑入住。',
    keywords: [
      { word: '干净', polarity: 'positive', weight: 8, relatedAttribute: 'cleanliness' },
      { word: '服务好', polarity: 'positive', weight: 7, relatedAttribute: 'service' },
      { word: '早餐一般', polarity: 'neutral', weight: 5, relatedAttribute: 'food' },
      { word: '设施陈旧', polarity: 'negative', weight: 4, relatedAttribute: 'facilities' },
    ],
    dimensions: { room: 85, service: 90, food: 65, facilities: 70, location: 80, cleanliness: 88 },
    overallSatisfaction: 78,
    stayStartDay: 1,
    stayEndDay: 3,
    createdAt: Date.now() - 86400000 * 10,
    isVIP: false,
    isBadReview: false,
    isResolved: false,
  },
  {
    id: 'review_002',
    guestId: 'guest_hist_002',
    guestName: '李女士',
    rating: 5,
    content: '非常满意的一次入住体验！酒店的历史感很浓，服务员都很热情，房间布置得很有特色。特别喜欢大堂的老照片，很有故事感。强烈推荐！',
    keywords: [
      { word: '历史感', polarity: 'positive', weight: 9, relatedAttribute: 'location' },
      { word: '热情', polarity: 'positive', weight: 8, relatedAttribute: 'service' },
      { word: '有特色', polarity: 'positive', weight: 7, relatedAttribute: 'room' },
      { word: '推荐', polarity: 'positive', weight: 10, relatedAttribute: 'service' },
    ],
    dimensions: { room: 92, service: 95, food: 85, facilities: 88, location: 90, cleanliness: 90 },
    overallSatisfaction: 90,
    stayStartDay: 5,
    stayEndDay: 7,
    createdAt: Date.now() - 86400000 * 5,
    isVIP: true,
    isBadReview: false,
    isResolved: false,
  },
  {
    id: 'review_003',
    guestId: 'guest_hist_003',
    guestName: '赵先生',
    rating: 3,
    content: '酒店位置不错，但是房间隔音效果差了点，晚上有点吵。空调制冷效果一般，希望能改进一下。前台服务还是挺不错的。',
    keywords: [
      { word: '位置好', polarity: 'positive', weight: 7, relatedAttribute: 'location' },
      { word: '隔音差', polarity: 'negative', weight: 8, relatedAttribute: 'room' },
      { word: '吵', polarity: 'negative', weight: 6, relatedAttribute: 'room' },
      { word: '空调一般', polarity: 'negative', weight: 5, relatedAttribute: 'facilities' },
      { word: '前台好', polarity: 'positive', weight: 6, relatedAttribute: 'service' },
    ],
    dimensions: { room: 55, service: 80, food: 60, facilities: 50, location: 92, cleanliness: 70 },
    overallSatisfaction: 62,
    stayStartDay: 8,
    stayEndDay: 10,
    createdAt: Date.now() - 86400000 * 2,
    isVIP: false,
    isBadReview: true,
    isResolved: false,
  },
];

export function generateRandomDimensions(baseSatisfaction: number): SatisfactionDimensions {
  const variance = 15;
  return {
    room: Math.max(0, Math.min(100, baseSatisfaction + Math.floor(Math.random() * variance * 2) - variance)),
    service: Math.max(0, Math.min(100, baseSatisfaction + Math.floor(Math.random() * variance * 2) - variance)),
    food: Math.max(0, Math.min(100, baseSatisfaction + Math.floor(Math.random() * variance * 2) - variance)),
    facilities: Math.max(0, Math.min(100, baseSatisfaction + Math.floor(Math.random() * variance * 2) - variance)),
    location: Math.max(0, Math.min(100, baseSatisfaction + Math.floor(Math.random() * variance * 2) - variance)),
    cleanliness: Math.max(0, Math.min(100, baseSatisfaction + Math.floor(Math.random() * variance * 2) - variance)),
  };
}

const POSITIVE_WORDS = ['舒适', '干净', '热情', '周到', '美味', '安静', '方便', '温馨', '满意', '推荐', '贴心', '专业', '友好', '值得', '惊喜'];
const NEUTRAL_WORDS = ['一般', '还行', '普通', '标准', '常规', '正常', '基础'];
const NEGATIVE_WORDS = ['陈旧', '吵闹', '失望', '老旧', '糟糕', '冷漠', '脏乱', '拥挤', '闷热', '异味'];

export function generateRandomKeywords(satisfaction: number): SentimentKeyword[] {
  const keywords: SentimentKeyword[] = [];
  const count = 4 + Math.floor(Math.random() * 3);
  const positiveRatio = satisfaction / 100;

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let polarity: 'positive' | 'neutral' | 'negative';
    let wordPool: string[];

    if (rand < positiveRatio * 0.8) {
      polarity = 'positive';
      wordPool = POSITIVE_WORDS;
    } else if (rand < positiveRatio * 0.8 + 0.15) {
      polarity = 'neutral';
      wordPool = NEUTRAL_WORDS;
    } else {
      polarity = 'negative';
      wordPool = NEGATIVE_WORDS;
    }

    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    if (!keywords.some(k => k.word === word)) {
      keywords.push({
        word,
        polarity,
        weight: 3 + Math.floor(Math.random() * 7),
        relatedAttribute: KEYWORD_TO_ATTRIBUTE[word],
      });
    }
  }

  return keywords;
}

export function generateDailyGuests(day: number): Guest[] {
  const guests: Guest[] = [];
  const shuffled = [...GUEST_POOL].sort(() => Math.random() - 0.5);

  const numGuests = Math.min(3 + Math.floor(day / 3), 6);

  for (let i = 0; i < numGuests; i++) {
    if (i < shuffled.length) {
      const baseSatisfaction = 50 + Math.floor(Math.random() * 30);
      const guest = { ...shuffled[i] };
      guest.arrivalDay = day;
      guest.departureDay = day + (guest.stayDuration || 0);
      guest.currentDayOfStay = 1;
      guest.isCheckOut = false;
      guest.totalBill = 0;
      guest.paid = false;
      guest.satisfaction = baseSatisfaction;
      guest.satisfactionDimensions = generateRandomDimensions(baseSatisfaction);
      guest.sentimentKeywords = generateRandomKeywords(baseSatisfaction);
      guest.observations = guest.observations.map(o => ({ ...o, discovered: false }));
      guest.unlockedClues = [];
      guest.status = 'checking_in';
      guest.secret = { ...guest.secret, discovered: false };
      guests.push(guest);
    }
  }

  return guests;
}
