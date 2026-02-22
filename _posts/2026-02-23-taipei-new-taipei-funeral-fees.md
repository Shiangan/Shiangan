---
layout: post
title: "2026 雙北殯儀館規費懶人包：臺北懷愛館/板殯費用與市民優惠解析"
description: "整理 2026 最新雙北殯葬規費：臺北懷愛館市民冰存前 7 天免費！板殯 7 日內火化亦享免冷藏費。內建最新雙北階梯式計算器，助您精算規費避免超支。"
date: 2026-02-23 01:00:00 +0800
category: "治喪百科"
tags: ["規費計算", "臺北懷愛館", "板橋殯儀館", "市民優惠"]
image: "/images/blog/article-07-main.jpg"
has_faq: true
faqs:
  - question: "臺北市民辦理冰存真的有免費嗎？"
    answer: "是的，根據臺北市規費表，設籍本市之市民「前 7 日」冷藏費為 0 元。但需注意，若超過 7 日，第 8 日起將按表列金額累計（第 8-14 日每日 $400）。"
  - question: "新北市板殯的冷藏費如何計算？"
    answer: "新北市民若在進館「7 日內」完成出殯或火化，冷藏費全免。但若超過 7 日，則會從第 1 天起開始計費（追溯計費），這與臺北市的直接免收逻辑不同。"
  - question: "如何判定符合「市民資格」？"
    answer: "只要「逝者本人」、「配偶」或「直系血親」（父母、子女）任一人設籍於該市滿 6 個月，即可申請市民價格優惠。辦理時需檢附載明關係之戶籍謄本。"
---

<div style="background: #f4f1ea; padding: 25px; border-radius: 8px; border: 1px solid var(--sa-gold); margin-bottom: 40px;">
    <p style="margin: 0; font-size: 0.95rem; color: var(--sa-green);">
        <i class="fas fa-user-shield"></i> <strong>專業審訂：</strong> 本文依據雙北殯葬管理處最新規費表（如板殯收費標準）更新。
        <br>
        <i class="fas fa-check-circle"></i> <strong>最新優惠：</strong> 臺北市民享「前 7 日冷藏免費」；新北市民「7 日內火化」亦享免收優惠。
    </p>
</div>

## 一、2026 雙北規費核心政策對照

根據最新官方資料，雙北對於「市民優惠」的認定與計算邏輯有顯著差異：

| 比較項目 | 臺北市 (懷愛館) | 新北市 (板橋殯儀館) |
| :--- | :--- | :--- |
| **市民免收期** | **前 7 日免費** | **7 日內火化免收** |
| **超過免收期** | 第 8 日起開始計費 | **追溯自第 1 日起計費** |
| **冰存費 (市民)** | 第 8-14 日 $400/日 | 第 1-14 日 $400/日 |
| **冰存費 (非市民)** | 第 1-7 日 $400/日 (半價) | 第 1-14 日 $800/日 |

---

## 二、最新遺體冷藏規費試算器 (雙北綜合版)

此試算器已納入 **臺北直接免收** 與 **新北追溯計費** 的官方邏輯。

<div style="background: #fdfaf5; border: 1px solid var(--sa-gold); padding: 30px; border-radius: 10px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: var(--sa-green); text-align: center;">雙北階梯式規費估算器</h3>
    <form id="fee-calculator" style="display: grid; gap: 15px;">
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">1. 選擇辦理場館</label>
            <select id="location" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="TP">臺北懷愛館 (二殯)</option>
                <option value="NTP">新北板橋殯儀館</option>
            </select>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">2. 進館與出殯日期</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <input type="date" id="date-deceased" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
                <input type="date" id="date-funeral" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
            </div>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">3. 是否符合該市民資格</label>
            <select id="is-citizen" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="true">是 (市民)</option>
                <option value="false">否 (非本市)</option>
            </select>
        </div>
        <button type="button" onclick="calculateComplexFee()" style="background: var(--sa-green); color: #fff; padding: 12px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">精算規費支出</button>
    </form>

    <div id="calc-result" style="display: none; margin-top: 20px; padding: 20px; background: #fff; border-left: 5px solid var(--sa-gold);">
        <p style="margin: 0;">總計天數：<span id="days-count" style="font-weight: bold;">0</span> 天</p>
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
        alert('日期填寫錯誤'); return;
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let totalFee = 0;
    let note = "";

    if (loc === "TP") {
        note = isCitizen ? "臺北市民：前7日$0，8-14日$400/日，15日以上$800/日" : "外縣市：前7日$400/日，8-14日$800/日，15日以上$1600/日";
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
        note = isCitizen ? "新北市民：7日內火化免收；逾7日按第1日起計費($400/日)" : "外縣市：按日計費($800/日)";
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
    document.getElementById('fee-note').innerText = "*註：" + note;
    document.getElementById('calc-result').style.display = 'block';
}
</script>

---

## 三、常用規費對照表 (2026 官方版)

根據您的文件核對之重點項目：

| 項目 | 臺北市 (懷愛館) | 新北市 (板橋殯儀館) |
| :--- | :--- | :--- |
| **冷藏費 (市民)** | 前 7 日 $0 | 7 日內火化 $0 (逾期補收) |
| **冷藏費 (非市民)** | 前 7 日 $400/日 | $800/日 |
| **丁級禮廳** | **免收費** | **$100 /三小時** |
| **火化費 (市民)** | $2,000 | $2,000 |

---

## 四、常見問題 Q&A

<div class="faq-section" style="margin-top: 30px;">
    {% for faq in page.faqs %}
    <details style="background: #fff; border: 1px solid #eee; margin-bottom: 15px; border-radius: 8px; overflow: hidden;">
        <summary style="padding: 20px; font-weight: bold; color: var(--sa-green); cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none;">
            {{ faq.question }}
            <i class="fas fa-plus" style="font-size: 0.8rem; color: var(--sa-gold);"></i>
        </summary>
        <div style="padding: 0 20px 20px; color: #666; line-height: 1.8; border-top: 1px solid #f9f9f9; background: #fafafa;">
            {{ faq.answer }}
        </div>
    </details>
    {% endfor %}
</div>

---

<div style="background: var(--sa-green); color: #fff; padding: 35px; border-radius: 12px; margin-top: 50px; text-align: center;">
    <h3 style="color: var(--sa-gold); margin-top: 0;">對規費細目還有疑問？</h3>
    <p>祥安生命 24 小時專業團隊，為您現場核對規費收據，確保不花冤枉錢。</p>
    <a href="tel:0978583699" style="background: var(--sa-gold); color: #fff; padding: 15px 40px; border-radius: 30px; display: inline-block; text-decoration: none; font-weight: bold; font-size: 1.2rem; margin-top: 20px;">
        <i class="fas fa-phone-alt"></i> 0978-583-699
    </a>
</div>
