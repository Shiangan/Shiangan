---
layout: post
title: "【2026 虛擬貨幣遺產稅完全指南】比特幣、NFT 價值認定、申報流程與私鑰傳承全解析"
date: 2026-03-27 14:00:00 +0800
category: 流程指引
description: "比特幣、以太幣、NFT 也要繳遺產稅！祥安生命整理 2026 國稅局數位資產課稅實務：價值認定方式、申報「其他財產」欄位要點、冷錢包私鑰遺失的因應策略，以及生前數位遺產規劃建議。"
permalink: /article-crypto-estate.html
image: /images/blog-crypto-tax.jpg
tags: ["虛擬貨幣遺產稅", "比特幣繼承", "NFT遺產", "加密資產申報", "數位遺產", "遺產稅2026"]
has_faq: true
faqs:
  - question: "虛擬貨幣存在國外交易所（如 Binance），台灣國稅局查得到嗎？"
    answer: "目前台灣國稅局會透過多種管道追蹤：包括逝者銀行帳戶中的法幣出入紀錄（如曾大額轉帳至交易所）、海外所得申報資料，以及對境外交易所的主動函詢。雖然台灣尚未正式參與 OECD CRS（共同申報準則）國際稅務資訊交換，但國稅局的追蹤能力已逐年強化。若刻意隱匿，一旦查獲除補稅外，可能面臨最高 2 倍罰鍰，建議誠實申報。"
  - question: "冷錢包內的資產如果私鑰遺失，還要繳遺產稅嗎？"
    answer: "法律上，冷錢包資產仍屬遺產，需納入申報。但若確實因私鑰遺失導致「客觀上完全無法取得資產」，可嘗試檢具相關佐證（如硬體錢包購買紀錄、鏈上地址餘額截圖）向國稅局說明情況。然而，目前台灣法規尚無明確的私鑰遺失減免條款，實務上案例極少，建議委請稅務律師評估個案可行性。最根本的解決方案是「生前做好私鑰傳承規劃」，本文第五章有詳細說明。"
  - question: "NFT 的價值如何認定？如果沒有市場成交紀錄怎麼辦？"
    answer: "國稅局目前參考的評估基礎包括：死亡當日該系列的地板價（Floor Price）、近期成交價，以及購入成本。若 NFT 屬冷門且無近期成交紀錄，地板價可能為零，但仍應申報並說明估價依據。若持有高價值 NFT（如藍籌系列），建議委請數位資產估價機構出具正式評估報告，作為申報佐證，避免事後被國稅局補稅。"
  - question: "穩定幣（USDT、USDC）算遺產嗎？匯率怎麼計算？"
    answer: "算。USDT、USDC 等穩定幣依法屬遺產，需依「死亡當日台灣銀行公告之美元對台幣匯率」折算台幣價值後申報。由於各日匯率略有差異，建議保存申報時使用的匯率來源截圖（如台灣銀行官網公告）作為佐證，確保核算有據可查。"
  - question: "繼承了逝者的虛擬貨幣，之後賣出還要再繳稅嗎？"
    answer: "繼承取得的虛擬貨幣本身只需繳「遺產稅」（於死亡事實發生後 6 個月內申報）。若繼承後賣出，因台灣目前對虛擬貨幣的所得稅課稅制度仍持續修訂中，以 2026 年現行規定，所得部分可能需申報為「財產交易所得」（非薪資所得），建議申報時諮詢熟悉數位資產的稅務顧問確認最新規定。"
  - question: "虛擬貨幣遺產稅申報要填在哪個欄位？"
    answer: "填入遺產稅申報書的「其他財產」欄位，並附上以下文件：死亡當日的交易所帳戶餘額截圖（需顯示日期時間）、交易所出具的帳戶資產證明、價值換算台幣的計算說明（含匯率來源）。若為冷錢包，則附上鏈上地址的餘額查詢截圖及私鑰持有說明。"
---

<style>
/* ── 虛擬貨幣遺產稅文章專屬樣式 ── */

.article-lead {
    font-size: clamp(.97rem, 2vw, 1.08rem);
    color: #444;
    border-left: 5px solid #b8975a;
    padding: 20px 24px; margin-bottom: 44px;
    background: rgba(184,151,90,.04);
    line-height: 1.9; border-radius: 0 4px 4px 0;
}
.article-lead strong { color: #1a241a; }

.tip-box {
    background: #fffbf4; border-left: 4px solid #b8975a;
    padding: 14px 18px; margin: 16px 0;
    font-size: clamp(.84rem, 2vw, .93rem);
    color: #555; line-height: 1.85; border-radius: 0 4px 4px 0;
}
.tip-box strong { color: #9a7c42; }

.warn-box {
    background: #fff8f5; border-left: 4px solid #c0522a;
    padding: 14px 18px; margin: 16px 0;
    font-size: clamp(.84rem, 2vw, .93rem);
    color: #555; line-height: 1.85; border-radius: 0 4px 4px 0;
}
.warn-box strong { color: #a03a1a; }

.good-box {
    background: #f5fbf5; border-left: 4px solid #3a8a3a;
    padding: 14px 18px; margin: 16px 0;
    font-size: clamp(.84rem, 2vw, .93rem);
    color: #555; line-height: 1.85; border-radius: 0 4px 4px 0;
}
.good-box strong { color: #2a6a2a; }

/* 資產類型標記 */
.asset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px; margin: 20px 0;
}
.asset-card {
    background: #fff; border: 1px solid #e8e4de;
    border-radius: 4px; padding: clamp(16px, 2.5vw, 22px);
    border-left: 4px solid #b8975a;
    transition: box-shadow .3s;
}
.asset-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
.asset-card__type {
    font-size: .7rem; font-weight: 700; letter-spacing: 1px;
    color: #b8975a; display: block; margin-bottom: 6px;
}
.asset-card h4 {
    font-family: 'Noto Serif TC', serif;
    font-size: .97rem; color: #1a241a;
    margin: 0 0 8px;
}
.asset-card p { font-size: .83rem; color: #666; line-height: 1.7; margin: 0; }
.asset-card ul { padding-left: 16px; margin: 0; }
.asset-card li { font-size: .82rem; color: #666; line-height: 1.75; margin-bottom: 3px; }

/* 課稅標準表格 */
.fee-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 20px 0; }
.fee-table {
    width: 100%; border-collapse: collapse;
    min-width: 480px;
    font-size: clamp(.8rem, 1.8vw, .9rem); background: #fff;
}
.fee-table thead tr { background: #1a241a; color: #fff; }
.fee-table th { padding: 12px 14px; text-align: left; font-weight: 700; border: 1px solid #2d3e2d; }
.fee-table td { padding: 11px 14px; border: 1px solid #e8e4de; vertical-align: top; color: #555; line-height: 1.65; }
.fee-table td:first-child { font-weight: 700; color: #1a241a; background: #fdfaf4; }
.fee-table tr:nth-child(even) td:not(:first-child) { background: #fafaf8; }
.fee-table .note { font-size: .76rem; color: #aaa; display: block; margin-top: 3px; }
.fee-table .warn-inline { color: #c0522a; font-size: .78rem; font-weight: 700; display: block; margin-top: 3px; }
.fee-table tfoot td {
    background: #f4f0e8; font-size: .78rem;
    color: #777; padding: 10px 14px;
    border-top: 2px solid #e0ddd7;
    font-style: italic;
}

/* 流程步驟 */
.step-box {
    display: flex; gap: 18px; align-items: flex-start;
    padding: clamp(16px, 3vw, 24px);
    background: #fff; border: 1px solid #e8e4de;
    border-radius: 4px; margin-bottom: 10px;
    transition: border-color .3s, box-shadow .3s;
}
.step-box:hover { border-color: #b8975a; box-shadow: 0 4px 16px rgba(0,0,0,.07); }
.step-num {
    font-family: 'Playfair Display', 'Noto Serif TC', serif;
    font-style: italic; font-size: clamp(1.8rem, 4.5vw, 2.6rem);
    color: rgba(184,151,90,.25); line-height: 1;
    flex-shrink: 0; width: 48px; text-align: center; margin-top: 2px;
}
.step-content h3 {
    font-family: 'Noto Serif TC', serif;
    font-size: clamp(1rem, 2.3vw, 1.15rem);
    color: #1a241a; margin: 0 0 8px;
}
.step-content p, .step-content ul {
    font-size: clamp(.87rem, 2vw, .95rem);
    color: #555; line-height: 1.85; margin: 0 0 8px;
}
.step-content ul { padding-left: 18px; }
.step-content li { margin-bottom: 5px; }
.step-content strong { color: #1a241a; }

/* 私鑰傳承規劃卡 */
.plan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px; margin: 20px 0;
}
.plan-card {
    background: #fff; border: 1px solid #e8e4de;
    border-radius: 4px; padding: clamp(18px, 3vw, 24px);
    border-top: 4px solid #1a241a;
    transition: border-color .3s, box-shadow .3s;
}
.plan-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.08); border-color: #b8975a; }
.plan-card__num {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: 1.5rem; color: rgba(184,151,90,.3);
    display: block; margin-bottom: 6px; line-height: 1;
}
.plan-card h4 {
    font-family: 'Noto Serif TC', serif;
    font-size: .97rem; color: #1a241a; margin: 0 0 8px;
}
.plan-card p { font-size: .84rem; color: #666; line-height: 1.75; margin: 0; }
.plan-card strong { color: #1a241a; }
.plan-card .caution { color: #c0522a; font-size: .8rem; font-weight: 700; display: block; margin-top: 6px; }

/* 免責聲明 */
.disclaimer-box {
    background: #f9f9f7; border: 1px solid #e8e4de;
    border-radius: 4px; padding: 14px 18px; margin: 24px 0;
    font-size: .8rem; color: #888; line-height: 1.75;
}
.disclaimer-box strong { color: #555; }

/* 延伸閱讀 */
.further-reading {
    margin-top: 48px; padding: 26px 22px;
    background: #fdfaf4; border: 1px solid #e8e4de; border-radius: 4px;
}
.further-reading h3 {
    font-family: 'Noto Serif TC', serif;
    font-size: 1rem; color: #1a241a; margin: 0 0 14px;
    display: flex; align-items: center; gap: 10px;
}
.further-reading h3::before {
    content: ''; display: inline-block;
    width: 28px; height: 1.5px; background: #b8975a; flex-shrink: 0;
}
.further-reading ul { list-style: none; padding: 0; margin: 0; }
.further-reading li { margin-bottom: 10px; }
.further-reading a {
    color: #1a241a; text-decoration: none; font-size: .92rem; font-weight: 700;
    border-bottom: 1.5px solid rgba(184,151,90,.35); padding-bottom: 2px;
    transition: color .2s, border-color .2s;
}
.further-reading a:hover { color: #b8975a; border-color: #b8975a; }
.further-reading a span { font-size: .78rem; color: #aaa; margin-left: 8px; font-weight: 400; }

/* 底部 CTA */
.post-cta {
    margin-top: 64px;
    padding: clamp(30px, 5vw, 48px) clamp(20px, 5vw, 40px);
    background: linear-gradient(135deg, #1a241a 0%, #2c3e2c 100%);
    color: #fff; border-radius: 4px; text-align: center;
    border: 1px solid rgba(197,160,89,.4);
    box-shadow: 0 12px 36px rgba(0,0,0,.3);
}
.post-cta__title {
    color: #c5a059; font-size: clamp(1.2rem, 3.5vw, 1.75rem);
    margin: 0 0 12px; font-family: 'Noto Serif TC', serif;
}
.post-cta__desc {
    font-size: clamp(.9rem, 2vw, 1.05rem); opacity: .85;
    max-width: 560px; margin: 0 auto 32px; line-height: 1.9;
}
.post-cta__tel {
    display: block; font-size: clamp(1.5rem, 4vw, 2rem);
    color: #fff; text-decoration: none; font-weight: 800;
    margin-bottom: 20px; letter-spacing: 2px; transition: color .3s;
}
.post-cta__tel i { color: #c5a059; margin-right: 10px; }
.post-cta__tel:hover { color: #c5a059; }
.post-cta__line {
    display: inline-flex; align-items: center; gap: 9px;
    background: #06C755; padding: 13px 36px; font-size: .97rem;
    color: #fff; text-decoration: none; border-radius: 50px;
    font-weight: 700; box-shadow: 0 4px 16px rgba(6,199,85,.3);
    transition: background .3s, transform .3s;
}
.post-cta__line:hover { background: #05b04a; transform: translateY(-2px); }

@media (max-width: 600px) {
    .step-box { flex-direction: column; gap: 10px; }
    .step-num { width: auto; font-size: 1.8rem; }
    .post-cta__line { width: 100%; justify-content: center; }
}
</style>

<!-- 免責聲明 -->
<div class="disclaimer-box">
    <strong>法律聲明：</strong>本文為一般性資訊說明，不構成法律或稅務建議。虛擬貨幣相關法規持續修訂中，具體個案建議委請熟悉數位資產的稅務律師或會計師提供專業意見。本文資訊以 2026 年初現行規定為基準，<strong>實際申報前請確認國稅局最新公告</strong>。
</div>

<!-- 引言 -->
<div class="article-lead">
    比特幣、以太幣、NFT……這些「看不見、摸不著」的數位資產，在台灣法律上都是明確的<strong>遺產</strong>，須依法申報遺產稅。隨著越來越多家庭持有加密資產，「虛擬貨幣遺產怎麼處理」已成為殯葬行政中不可迴避的新課題。本篇由祥安生命整理 2026 年實務要點，<strong>協助家屬在最複雜的數位遺產問題上有所依循</strong>——但再次提醒，具體案件請務必委請專業稅務律師評估。
</div>

## 一、虛擬貨幣在法律上算「遺產」嗎？

**答案是肯定的。** 依《遺產及贈與稅法》，虛擬通貨屬「具有財產價值的財產」，無論儲存位置為何，皆須納入遺產總額申報：

<div class="asset-grid">
    <div class="asset-card">
        <span class="asset-card__type">國內交易所</span>
        <h4>中心化交易所（國內）</h4>
        <ul>
            <li>MaiCoin（MAX）</li>
            <li>BitoPro</li>
            <li>Rybit</li>
            <li>其他受金管會監管的 VASP</li>
        </ul>
        <p style="margin-top:8px; font-size:.8rem; color:#2a6a2a; font-weight:700;">繼承程序較完整，可向交易所申請帳戶資產證明</p>
    </div>
    <div class="asset-card">
        <span class="asset-card__type">國際交易所</span>
        <h4>中心化交易所（境外）</h4>
        <ul>
            <li>Binance（幣安）</li>
            <li>OKX</li>
            <li>Bybit</li>
            <li>Coinbase 等</li>
        </ul>
        <p style="margin-top:8px; font-size:.8rem; color:#c0522a; font-weight:700;">繼承程序較複雜，需依各交易所客服程序辦理，建議委由專業處理</p>
    </div>
    <div class="asset-card">
        <span class="asset-card__type">熱錢包（軟體）</span>
        <h4>去中心化熱錢包</h4>
        <ul>
            <li>MetaMask</li>
            <li>Trust Wallet</li>
            <li>各類手機 App 錢包</li>
        </ul>
        <p style="margin-top:8px; font-size:.8rem; color:#c0522a; font-weight:700;">需取得助記詞或私鑰才可存取，繼承難度高</p>
    </div>
    <div class="asset-card">
        <span class="asset-card__type">冷錢包（硬體）</span>
        <h4>硬體冷錢包</h4>
        <ul>
            <li>Ledger</li>
            <li>Trezor</li>
            <li>其他硬體設備</li>
        </ul>
        <p style="margin-top:8px; font-size:.8rem; color:#c0522a; font-weight:700;">私鑰遺失將導致資產永久無法存取，風險最高</p>
    </div>
</div>

<div class="warn-box">
    <strong>⚠ 關於國際稅務資訊交換：</strong>目前台灣因政治因素尚未正式參與 OECD CRS（共同申報準則）國際稅務資訊自動交換機制。但國稅局仍可透過逝者的<strong>銀行大額出入帳紀錄、結匯紀錄，以及對境外金融機構的個案函詢</strong>等方式追蹤境外資產。<strong>隱匿申報一旦查獲，除補稅外可能面臨最高 2 倍罰鍰。</strong>
</div>

---

## 二、2026 年國稅局認定標準：各類資產怎麼估價

虛擬貨幣 24 小時不停歇交易，無傳統「收盤價」概念。國稅局目前採用的認定方式：

<div class="fee-table-wrap">
    <table class="fee-table">
        <thead>
            <tr>
                <th>資產類型</th>
                <th>估價基準</th>
                <th>注意事項</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>主流幣<br>（BTC、ETH 等）</td>
                <td>死亡當日台灣時間 00:00 之各主要交易所參考均價，折合台幣申報<span class="note">建議保存 CoinGecko、CoinMarketCap 或交易所當日報價截圖為佐證</span></td>
                <td>各交易所報價略有差異，建議與稅務律師確認採用哪個交易所報價</td>
            </tr>
            <tr>
                <td>穩定幣<br>（USDT、USDC 等）</td>
                <td>死亡當日<strong>台灣銀行公告之美元對台幣匯率</strong>折算<span class="note">保存台灣銀行官網當日匯率截圖</span></td>
                <td>各日匯率略有差異，需以死亡當日匯率為準，不可使用申報日匯率</td>
            </tr>
            <tr>
                <td>NFT<br>（非同質化代幣）</td>
                <td>以下依序參考：<br>① 死亡當日該系列地板價（Floor Price）<br>② 近 30 日內最近一筆成交價<br>③ 購入成本<br>④ 委請數位資產估價機構出具報告<span class="warn-inline">若地板價為零或無市場，應說明原因</span></td>
                <td>高價值 NFT（如藍籌系列）強烈建議委請估價機構出具正式估價報告</td>
            </tr>
            <tr>
                <td>DeFi 流動性代幣<br>質押收益等</td>
                <td>依標的資產折算台幣，分別申報<span class="note">DeFi 協議內的收益需一一拆解計算</span></td>
                <td>DeFi 資產計算複雜，建議委由熟悉數位資產的稅務顧問處理</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3">※ 以上為 2026 年初實務參考，國稅局尚未就虛擬貨幣估價發布統一標準作業程序，實際認定方式可能因案件而異，建議申報前與稅務律師確認。</td>
            </tr>
        </tfoot>
    </table>
</div>

---

## 三、繼承申報完整流程

<div class="step-box">
    <div class="step-num">01</div>
    <div class="step-content">
        <h3>資產盤點與清查</h3>
        <p>優先翻查逝者的電腦、手機、實體記事本，尋找以下線索：</p>
        <ul>
            <li>交易所帳號（Email、手機號）</li>
            <li>助記詞（12 或 24 個英文單字）或私鑰</li>
            <li>硬體錢包設備（Ledger、Trezor 等）</li>
            <li>密碼管理器（如 1Password、Bitwarden）的主密碼</li>
        </ul>
        <p><strong>國內交易所：</strong>持死亡證明書及繼承關係文件向交易所客服申請帳戶餘額證明。各國內 VASP（虛擬資產服務提供商）通常有繼承申請程序，可直接聯繫客服。</p>
        <p><strong>境外交易所：</strong>程序因平台而異，部分需委由律師以英文書函申請，難度較高，建議及早處理。</p>
    </div>
</div>

<div class="step-box">
    <div class="step-num">02</div>
    <div class="step-content">
        <h3>估算台幣價值與備妥佐證</h3>
        <ul>
            <li>查詢死亡當日各資產的報價，截圖存檔（含日期時間戳記）</li>
            <li>查詢死亡當日台灣銀行公告匯率（用於穩定幣換算）</li>
            <li>NFT 另行備妥交易市場（OpenSea 等）的地板價或成交紀錄截圖</li>
            <li>加總換算為新台幣總額，填入遺產稅申報書的「<strong>其他財產</strong>」欄位</li>
        </ul>
    </div>
</div>

<div class="step-box">
    <div class="step-num">03</div>
    <div class="step-content">
        <h3>申報遺產稅（死亡後 6 個月內）</h3>
        <p>向國稅局申報時應附上：</p>
        <ul>
            <li>各交易所出具的帳戶資產餘額證明（正式文件或截圖）</li>
            <li>死亡當日報價截圖及換算說明</li>
            <li>DeFi 或 NFT 的估價說明文件</li>
        </ul>
        <div class="warn-box" style="margin-top: 10px;">
            <strong>⚠ 期限嚴格：</strong>遺產稅申報期限為死亡後 6 個月，可申請延期最長 3 個月，但須在原期限前提出申請。虛擬貨幣資產盤點耗時，<strong>建議往生後立即開始清查</strong>，不宜拖延。
        </div>
    </div>
</div>

<div class="step-box">
    <div class="step-num">04</div>
    <div class="step-content">
        <h3>取得完稅證明後辦理資產轉移</h3>
        <p>憑國稅局核發的<strong>「遺產稅繳清證明書」或「免稅證明書」</strong>，聯繫各交易所辦理帳戶繼承過戶，或將資產提領至繼承人的錢包地址。不同交易所的繼承程序差異較大，需逐一確認。</p>
    </div>
</div>

---

## 四、冷錢包私鑰遺失：最糟的情境與因應

私鑰遺失是虛擬貨幣遺產最棘手的情況，也是我們在個案中最常遇到的遺憾。

<div class="warn-box">
    <strong>⚠ 目前的法律現實：</strong>台灣尚無明確法規針對「私鑰遺失導致無法繼承」提供遺產稅減免。若您嘗試向國稅局說明無法存取，<strong>目前實務上極難獲得減免，仍需申報該資產的估算價值</strong>。建議委請熟悉數位資產法律的稅務律師評估個案。
</div>

若不幸發生私鑰遺失，可採取以下步驟：

1. **備妥所有佐證**：硬體錢包購買發票、鏈上地址查詢截圖（顯示餘額但無法存取）、協助尋找私鑰的記錄
2. **委請稅務律師評估**：以「客觀上無法取得資產」為由，嘗試與國稅局協商，但需理解目前成功機率低
3. **繼續嘗試恢復**：若記得部分助記詞，可委請專業的助記詞恢復服務嘗試暴力解密（費用高，成功率依遺忘程度而定）

---

## 五、生前規劃：避免「看得到拿不到」的五個做法

最好的解決方案，是在生前做好數位遺產傳承規劃：

<div class="plan-grid">
    <div class="plan-card">
        <span class="plan-card__num">01</span>
        <h4>使用國內受監管交易所</h4>
        <p>將部分資產存放於金管會監管的國內 VASP（如 MAX、BitoPro），繼承程序有法律保障，家屬更容易辦理資產過戶。</p>
    </div>
    <div class="plan-card">
        <span class="plan-card__num">02</span>
        <h4>多重簽署錢包</h4>
        <p>設置 Multi-Sig 錢包（如 Gnosis Safe），需多人共同簽署才能動用資產，可設計為「本人 + 家屬」共同持有，避免單點遺失風險。</p>
    </div>
    <div class="plan-card">
        <span class="plan-card__num">03</span>
        <h4>助記詞安全分拆儲存</h4>
        <p>將 24 個助記詞分為兩組或三組，分別由不同可信任的家屬保管，或存放於不同地點的保險箱，任何一份遺失不影響恢復。</p>
        <span class="caution">禁止：將助記詞完整存入手機照片、雲端硬碟、Email</span>
    </div>
    <div class="plan-card">
        <span class="plan-card__num">04</span>
        <h4>預立「數位資產清單」</h4>
        <p>以紙本方式列明資產分布位置（交易所名稱、帳號、錢包地址），存放於律師事務所或保險箱，<strong>不可直接寫上私鑰或助記詞明文</strong>。</p>
    </div>
    <div class="plan-card">
        <span class="plan-card__num">05</span>
        <h4>委請律師預立數位遺囑</h4>
        <p>在正式遺囑中載明數位資產的處置方式與存取指引（間接指向保管位置，而非直接揭露私鑰），並搭配執行人確保資訊安全傳遞。</p>
    </div>
</div>

<div class="good-box">
    <strong>✅ 最重要的一件事：</strong>現在就把您持有的虛擬資產清單告訴一個您最信任的人，並說明存取方式。這是預防數位遺產消失在區塊鏈上最直接有效的做法——不需要任何技術，只需要一個誠實的對話。
</div>

<div class="further-reading">
    <h3>延伸閱讀</h3>
    <ul>
        <li>
            <a href="{{ '/article-inheritance.html' | relative_url }}">2026 遺產繼承全攻略：除戶、財產查詢到遺產稅申報</a>
            <span>— 虛擬資產之外的一般遺產繼承流程</span>
        </li>
        <li>
            <a href="{{ '/article-funeral-process.html' | relative_url }}">親人過世後 21 步治喪流程全攻略</a>
            <span>— 虛擬資產盤點應在治喪初期同步進行</span>
        </li>
        <li>
            <a href="{{ '/article-subsidy.html' | relative_url }}">勞保、國保喪葬補助完全攻略</a>
            <span>— 申請喪葬補助所需的死亡證明，同樣是申請交易所繼承的必備文件</span>
        </li>
    </ul>
</div>

<div class="post-cta">
    <h3 class="post-cta__title">虛擬貨幣繼承遇到困難？祥安協助對接專業資源</h3>
    <p class="post-cta__desc">
        從資產盤點、稅務申報到私鑰安全處理，<br>
        祥安生命可協助您對接稅務律師與數位資產專家。
    </p>
    <a href="tel:+886978583699" class="post-cta__tel">
        <i class="fas fa-phone-alt" aria-hidden="true"></i> 0978-583-699
    </a>
    <!-- LINE ID：請將 @shiangan 替換為實際帳號 -->
    <a href="https://line.me/ti/p/@shiangan"
       target="_blank"
       rel="noopener noreferrer"
       class="post-cta__line">
        <i class="fab fa-line" aria-hidden="true"></i> LINE 即時諮詢
    </a>
</div>
