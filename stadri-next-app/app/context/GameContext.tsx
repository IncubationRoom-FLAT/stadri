'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const ODAIS = {
    "ファミリー": [
        "子どもの教育・遊び・体験の機会をつくるのが難しい ",
        "出産・育児に向けた準備や情報が十分でない ",
        "夫婦間で家事・育児の負担が偏っている ",
        "掃除や整理整頓を習慣化できない ",
        "お金の管理がうまくできていない ",
        "家族の送り迎えに時間や手間がかかりすぎている ",
        "家族の健康が心配だ ",
        "家族関係のコミュニケーションが不足している ",
        "毎日の食事準備や献立決めが負担になっている ",
        "地域・社会とのつながりが弱いと感じる ",
        "子どものスマホ・ゲーム・ネットとの付き合い方に不安がある ",
        "子どもの体調不良や急なトラブル時の対応に余裕がない ",
        "家族旅行やレジャーの計画を立てる余裕がない ",
        "ワンオペ育児がしんどい ",
        "家族がペットを飼いたがっているが不安がある ",
        "不要になったものの処分に困っている ",
        "家族の弁当作りが大変だ ",
        "住まいの老朽化や構造面に不安がある ",
        "災害時の安全への備えが十分でない ",
        "物が多すぎで収納に困っている "
    ],
    "ヤングアダルト": [
        "自分の方向性や軸を定められていない ",
        "行動に移すための勇気やきっかけが不足している ",
        "自己肯定感が低く、自分を肯定的に評価できていない ",
        "対人関係やつながりを広げられていない ",
        "場面に応じたコミュニケーションに不安がある ",
        "学業・仕事・時間の管理がうまくできていない ",
        "金欠で日々の生活が苦しい ",
        "フォーマルな服装や身だしなみの判断に迷いがある ",
        "生活リズムが乱れている ",
        "割り勘の手間を減らしたい ",
        "異性と話す機会がない ",
        "恋人との過ごし方がマンネリ化している ",
        "どんなプレゼントを選べばよいか分からない ",
        "ホームシックがつらい ",
        "遠距離恋愛がつらい ",
        "食生活をどう整えればいいか分からない ",
        "他人と自分を比較してしまい疲れる ",
        "身近に頼ったり相談できる人がいない ",
        "自分に似合う髪型や服装が分からず迷っている ",
        "遠方へ出かけたいが、交通手段の選択や手配に困る "
    ],
    "ビジネス層": [
        "仕事やタスクに追われ、余裕がなくなりがち ",
        "キャリアの方向性が定まらず、将来像がぼんやりしている ",
        "自信が持てず、気持ちが下がりやすい ",
        "職場の人間関係に気を遣い、ストレスを感じている ",
        "体調やコンディション管理がうまくできていない ",
        "お金に余裕がなく、将来への不安がある ",
        "身だしなみや第一印象に自信がない ",
        "恋愛やパートナー探しを後回しにしてしまっている ",
        "趣味や息抜きが見つからず、気分転換ができていない ",
        "通勤時にストレスが溜まりやすい ",
        "日々の暮らしに癒しがない ",
        "イベントや飲み会の幹事がしんどい ",
        "名刺管理が大変だ ",
        "出張の予約が大変だ ",
        "自分に合ったフィット感やデザインの服を見つけるのが難しい ",
        "職務中に眠気に襲われる ",
        "部下や上司とのジェネレーションギャップがつらい ",
        "思い出に残るプロポーズが思いつかない ",
        "運動したいが思い切りがつかない ",
        "家事スキルに不安がある "
    ],
    "シニア層": [
        "健康や体力の衰えが気になってきている ",
        "スマホや家電の操作が難しい ",
        "社会との関わりが減り、孤立感がある ",
        "生きがいや自分の役割を見つけにくい ",
        "家族や若い世代との距離を感じている ",
        "住まいの今後をどうするか迷っている ",
        "趣味や楽しみの幅が広がらない ",
        "遺品整理などのことが気がかりだ ",
        "詐欺・悪質商法にあわないか不安がある ",
        "もしものときに頼れる人がいない ",
        "運動を習慣化できない ",
        "新しいパートナーを見つけたい ",
        "外出する機会がない ",
        "交通手段の不足 ",
        "自分の葬儀の形を事前に決めておきたい ",
        "遠方に住む孫や親戚になかなか会えない ",
        "料理をするのが面倒くさい ",
        "自分の入院・死亡後のペットの行き先が不安 ",
        "昔を思い出せるものがない ",
        "新しい学びの場が欲しい "
    ],
    "ユニーク": [
        "身体的なハンデがあり、日常生活や仕事で不便さや制限を感じることがある ",
        "仕事上お酒を飲む機会が多く、健康や体調への影響が気になっている ",
        "運動が苦手で、スポーツや身体を使う場面に緊張感がある ",
        "人前に立つと強い緊張を感じ、実力を発揮しにくい ",
        "自分の技術や仕事を引き継ぐ人が見つからず、将来が不安だ ",
        "趣味を楽しみたいが周囲の目や偏見が気になる ",
        "ペットを飼っており、長期の外出や旅行がしにくい ",
        "方向音痴で、初めての場所に行くと迷いやすい ",
        "楽しく満足感のある推し活ライフを送りたい ",
        "海外での生活や移動に不安があり、一歩を踏み出しきれない ",
        "役所の手続きが複雑でわからない "
    ]
};

const GACHA_RATES = {
    'Low': { success: 0.7, fail: 0.3 },
    'High': { success: 0.4, fail: 0.6 }
};

const GACHA_RESULTS = {
    'Low': { success: [1.5, 1.2, 1], fail: [-0.5, -0.2] },
    'High': { success: [3, 2, 1.5], fail: [-1, -0.5] }
};

interface Player {
    name: string;
    sc: number;
    debt: number;
}

interface GameState {
    players: Player[];
    curR: number;
    pIdx: number;
    invIdx: number;
    invests: number[];
    modes: string[];
    invLog: any[];
    playerOdai: any[];
    gachaResult: any;
    finalRanking?: any[];
}

interface GameContextType {
    gameState: GameState;
    setGameState: (state: GameState) => void;
    odaiRevealed: boolean;
    setOdaiRevealed: (revealed: boolean) => void;
    timeLeft: number;
    setTimeLeft: (time: number) => void;
    timerActive: boolean;
    setTimerActive: (active: boolean) => void;
    isRolling: boolean;
    setIsRolling: (rolling: boolean) => void;
    rouletteResult: string | null;
    setRouletteResult: (result: string | null) => void;
    slotResults: (string | null)[];
    setSlotResults: (results: (string | null)[]) => void;
    successRate: number;
    setSuccessRate: (rate: number) => void;
    ODAIS: typeof ODAIS;
    GACHA_RATES: typeof GACHA_RATES;
    GACHA_RESULTS: typeof GACHA_RESULTS;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameState, setGameState] = useState<GameState>({
        players: [],
        curR: 1,
        pIdx: 0,
        invIdx: 0,
        invests: [],
        modes: [],
        invLog: [],
        playerOdai: [],
        gachaResult: null,
    });

    const [odaiRevealed, setOdaiRevealed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(180);
    const [timerActive, setTimerActive] = useState(false);
    const [isRolling, setIsRolling] = useState(false);
    const [rouletteResult, setRouletteResult] = useState<string | null>(null);
    const [slotResults, setSlotResults] = useState<(string | null)[]>([null, null, null]);
    const [successRate, setSuccessRate] = useState(0);

    return (
        <GameContext.Provider
            value={{
                gameState,
                setGameState,
                odaiRevealed,
                setOdaiRevealed,
                timeLeft,
                setTimeLeft,
                timerActive,
                setTimerActive,
                isRolling,
                setIsRolling,
                rouletteResult,
                setRouletteResult,
                slotResults,
                setSlotResults,
                successRate,
                setSuccessRate,
                ODAIS,
                GACHA_RATES,
                GACHA_RESULTS,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
