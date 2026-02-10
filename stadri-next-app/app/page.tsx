'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="container">
      <div id="title-screen" className="screen active">
        <h1 className="title-logo">STARTUP<br />DREAMER</h1>
        <button className="main-btn" onClick={() => router.push('/setup')}>ゲームスタート</button>
        <button className="main-btn accent-btn" onClick={() => router.push('/rule')}>ルールを確認</button>
      </div>
    </div>
  );
}
