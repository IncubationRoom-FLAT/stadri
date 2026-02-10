'use client';

import { useRouter } from 'next/navigation';

export default function RulePage() {
  const router = useRouter();

  return (
    <div className="container">
      <div id="rule-screen" className="screen active">
        <h2>ゲームの流れ</h2>
        <div className="rule-scroll">
          <h3>【全体像】</h3>
          <ul>
              <li>このゲームは、お題に対して最高のアイデアを考え、投資家から支援を集めて起業の成功を目指すゲームです。</li>
              <li>全３ラウンドで、最も多くの資金（SC）を集めた人の勝利です。</li>
          </ul>
          <h3>【各ラウンドの流れ】</h3>
          <ol>
              <li><b>お題の確認：</b>各プレイヤーに、アイデアを考える元となる「お題」が配られます。</li>
              <li><b>シンキングタイム（３分）：</b>お題を元に、どんなサービスや商品を作るか、アイデアを考えます。アイデアが固まったら「プレゼン開始」！</li>
              <li><b>プレゼンタイム：</b>１人ずつ、自分のアイデアを他のプレイヤー（投資家）に発表します。</li>
              <li><b>投資タイム：</b>各プレイヤーは、他のプレイヤーのアイデアに投資するかどうかを決めます。</li>
              <li><b>ガチャタイム：</b>集めた支援額に応じて、事業が成功するかどうかの「ガチャ」に挑戦します。成功すれば資金大量ゲット！失敗すれば負債を抱えることも…。</li>
          </ol>
          <h3>【投資タイム詳細】</h3>
          <ul>
              <li>各ラウンドで投資に使える上限額は「現在のラウンド数 × 3 SC」です。（R1なら3SC, R2なら6SC...）</li>
              <li>１人のプレイヤーには最大３SCまで投資できます。</li>
              <li>自分の所持金を超える投資はできません。</li>
          </ul>
          <h3>【ガチャタイム詳細】</h3>
          <ul>
              <li>集めた支援額が多いほど、ガチャの成功率は上がります。</li>
              <li><b>ハイリスク・ハイリターン：</b>成功時のリターンは大きいですが、失敗時のリスクも高くなります。</li>
              <li><b>ローリスク・ローリターン：</b>リターンもリスクも控えめです。</li>
          </ul>
        </div>
        
        <button className="main-btn" onClick={() => router.push('/setup')}>設定へ進む</button>
      </div>
    </div>
  );
}
