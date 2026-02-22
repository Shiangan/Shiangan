---
layout: post
title: "2026 雙北殯儀館規費懶人包：臺北懷愛館/板殯費用與最新冰存算法解析"
description: "祥安生命整理：臺北市民享前 7 日冰存免費，新北市民 7 日內火化亦免收。內建最新雙北階梯式計算器，助您精算 5 倍價差與追溯計費陷阱。"
date: 2026-02-23 01:00:00 +0800
category: "治喪百科"
tags: ["規費計算", "臺北懷愛館", "板橋殯儀館", "市民優惠"]
image: "/images/blog/article-07-main.jpg"
# 設定為 true，系統會自動從下方的 faqs 抓取資料並在網頁末端渲染一次
has_faq: true
faqs:
  - question: "臺北市民辦理冰存真的有免費嗎？"
    answer: "根據臺北市最新費率表，本市民眾遺體冷藏「前 7 日」費用為 $0 元。自第 8 日起才開始按階梯計費。"
  - question: "新北市板殯的冷藏費超過 7 天怎麼算？"
    answer: "新北市民若在 7 日內出殯或火化免收冷藏費。但若超過 7 日，則會從第 1 天起「追溯計費」，每日收費 $400。"
  - question: "如何判定符合「市民資格」？"
    answer: "只要逝者本人、配偶或「直系血親」（父母、子女）任一人設籍於該市滿 6 個月以上，即可享有市民價格。"
---

<div style="background: #f4f1ea; padding: 25px; border-radius: 8px; border: 1px solid var(--sa-gold); margin-bottom: 40px;">
    <p style="margin: 0; font-size: 0.95rem; color: var(--sa-green);">
        <i class="fas fa-user-shield"></i> <strong>專業審訂：</strong> 本文依據雙北殯葬管理處 2026 最新正式收費表核對。
        <br>
        <i class="fas fa-exclamation-circle"></i> <strong>算法提醒：</strong> 臺北為「直接扣除制」，新北為「限期火化免收制（逾期則追溯）」。
    </p>
</div>

## 一、雙北遺體冷藏/停柩規費對照表

根據官方最新公告（圖 1、圖 2），雙北市民與非市民的收費標準如下：

| 項目分類 | 臺北市 (市民) | 臺北市 (非市民) | 新北市 (市民) | 新北市 (非市民) |
| :--- | :--- | :--- | :--- | :--- |
| **1-7 日 (每日)** | **$0** | **$400** | **$0 (限7日內火化)** | **$800** |
| **8-14 日 (每日)** | **$400** | **$800** | **$400** | **$800** |
| **15 日以上 (每日)** | **$800** | **$1,600** | **$800** | **$1,600** |

---

## 二、階梯式規費自動試算器

<div style="background: #fdfaf5; border: 1px solid var(--sa-gold); padding: 30px; border-radius: 10px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: var(--sa-green); text-align: center;">雙北殯儀館冷藏費試算</h3>
    <form id="fee-calculator" style="display: grid; gap: 15px;">
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">選擇辦理場館</label>
            <select id="location" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="TP">臺北懷愛館 (前7日免費)</option>
                <option value="NTP">新北板橋/三峽 (7日內免收/逾期追溯)</option>
            </select>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">進館與出殯日期</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <input type="date" id="date-deceased" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
                <input type="date" id="date-funeral" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
            </div>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">市民資格判定</label>
            <select id="is-citizen" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="true">符合市民資格</option>
                <option value="false">非市民 (外縣市身分)</option>
            </select>
        </div>
        <button type="button" onclick="calculateComplexFee()" style="background: var(--sa-green); color: #fff; padding: 12px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">計算預估冷藏規費</button>
    </form>

    <div id="calc-result" style="display: none; margin-top: 20px; padding: 20px; background: #fff; border-left: 5px solid var(--sa-gold);">
        <p style="margin: 0; color: #666;">總計天數：<span id="days-count" style="font-weight: bold; color: #000;">0</span> 天</p>
        <p style="margin: 10px 0 0; font-size: 1.2rem; color: var(--sa-gold);">預估冷藏費：<span id="estimated-fee" style="font-weight: bold;">NT$ 0</span></p>
        <p id="fee-note" style="font-size: 0.8rem; color: #888; margin-top: 10px;"></p>
    </div>
</div>

<script>
function calculateComplexFee() {
    const start = new Date(document.getElementById('date-deceased').value);
    const end = new Date(document.getElementById('date-funeral').value);
    const isCitizen = document.getElementById('is-citizen').value === 'true';
    const loc = document.getElementById('location').value;
    
    if (!start || !end || end <= start) {
        alert('請確認日期輸入正確'); return;
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let totalFee = 0;

    if (loc === "TP") {
        // 臺北邏輯：前 7 日市民 $0，非市民 $400
        for (let i = 1; i <= diffDays; i++) {
            if (isCitizen) {
                if (i > 14) totalFee += 800;
                else if (i > 7) totalFee += 400;
            } else {
                if (i > 14) totalFee += 1600;
                else if (i > 7) totalFee += 800;
                else totalFee += 400;
            }
        }
    } else {
        // 新北邏輯：市民 7 日內免費；逾 7 日追溯至第 1 日起算
        if (isCitizen && diffDays <= 7) {
            totalFee = 0;
        } else {
            for (let i = 1; i <= diffDays; i++) {
                const base = isCitizen ? 400 : 800;
                totalFee += (i >= 15) ? (base * 2) : base;
            }
        }
    }

    document.getElementById('days-count').innerText = diffDays;
    document.getElementById('estimated-fee').innerText = 'NT$ ' + totalFee.toLocaleString();
    document.getElementById('calc-result').style.display = 'block';
}
</script>

---

## 三、其他常用設施費用 (新北市板殯標準)

依據新北市政府殯葬管理處收費標準（圖 1）：
* **丁級禮廳使用費**：每三小時 **$100** 元（超過三小時每小時加收 $50）。
* **多功能室冷氣費**：每小時 **$50** 元（未滿一小時以一小時計）。
* **守夜使用費 (丙級)**：每次 **$200** 元。
* **移動式冷凍櫃**：每日 **$250** 元（需繳納保證金 $3,000）。
* **遺體接運費**：本市、臺北市里程 30 公里以內收費 **$1,000** 元。

---

<div style="background: var(--sa-green); color: #fff; padding: 35px; border-radius: 12px; margin-top: 50px; text-align: center;">
    <h3 style="color: var(--sa-gold); margin-top: 0;">24 小時規費試算與在地代辦服務</h3>
    <p>祥安生命協助您精算每一分預算，確保所有文件證明符合市民減免資格。</p>
    <a href="tel:0978583699" style="background: var(--sa-gold); color: #fff; padding: 15px 40px; border-radius: 30px; display: inline-block; text-decoration: none; font-weight: bold; font-size: 1.2rem; margin-top: 20px;">
        <i class="fas fa-phone-alt"></i> 0978-583-699
    </a>
</div>
