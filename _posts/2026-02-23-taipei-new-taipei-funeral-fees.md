---
layout: post
title: "2026 雙北殯儀館規費懶人包：臺北懷愛館/板殯費用與最新冰存算法解析"
description: "祥安生命專業對照：臺北市民享前 7 日冰存免費，新北市民 7 日內火化亦免收。內建最新雙北階梯式計算器，精準掌握市民與非市民價差，避免治喪支出超支。"
date: 2026-02-23 01:00:00 +0800
category: "治喪百科"
tags: ["規費計算", "臺北懷愛館", "板橋殯儀館", "市民優惠"]
image: "/images/blog/article-07-main.jpg"
# 註：若您的模板會自動抓取 FAQ，請保留此處；若否，請手動在下方 HTML 區塊調整。
has_faq: true
faqs:
  - question: "臺北市民辦理冰存真的有免費嗎？"
    answer: "是的，根據台北市最新費率表，本市民眾「前 7 日」冷藏費與停柩費皆為 0 元（免費）。第 8 日起才開始按階梯計費。"
  - question: "新北市板殯的冷藏費如何計算？"
    answer: "根據板殯收費標準，新北市民若在進館「7 日內」完成出殯或火化則免收冷藏費。但若超過 7 日，則會從第 1 天起「追溯計費」，每日收費 $400。"
  - question: "如何判定符合「市民資格」？"
    answer: "只需逝者本人、配偶或「直系血親」（父母、子女）任一人設籍於該市滿 6 個月以上，即可享有市民價格優惠。"
---

<div style="background: #f4f1ea; padding: 25px; border-radius: 8px; border: 1px solid var(--sa-gold); margin-bottom: 40px;">
    <p style="margin: 0; font-size: 0.95rem; color: var(--sa-green);">
        <i class="fas fa-user-shield"></i> <strong>專業審訂：</strong> 本文依據臺北市殯葬管理處與新北市政府殯葬管理處最新正式收費表校對。
        <br>
        <i class="fas fa-calculator"></i> <strong>核心差異：</strong> 臺北市為「直接免收制」，新北市為「限期火化免收制（逾期則追溯）」。
    </p>
</div>

## 一、雙北遺體冷藏規費對照表 (2026 最新)

根據官方最新標準彙整如下：

| 項目分類 | 臺北市 (市民) | 臺北市 (非市民) | 新北市 (市民) | 新北市 (非市民) |
| :--- | :--- | :--- | :--- | :--- |
| **1-7 日 (每日)** | **$0 (免收)** | **$400 (半價)** | **$0 (限7日內火化)** | **$800** |
| **8-14 日 (每日)** | $400 | $800 | $400 | $800 |
| **15 日以上 (每日)** | $800 | $1,600 | $800 | $1,600 |

---

## 二、階梯式規費自動試算器 (雙北綜合版)

此工具已依照您提供的官方表格邏輯開發，包含「臺北免收」與「新北追溯」機制。

<div style="background: #fdfaf5; border: 1px solid var(--sa-gold); padding: 30px; border-radius: 10px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: var(--sa-green); text-align: center;">雙北殯儀館冷藏費試算</h3>
    <form id="fee-calculator" style="display: grid; gap: 15px;">
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">選擇辦理場館</label>
            <select id="location" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="TP">臺北懷愛館 (直接免收制)</option>
                <option value="NTP">新北板橋/三峽 (追溯計費制)</option>
            </select>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">日期選擇 (進館與出殯)</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <input type="date" id="date-deceased" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
                <input type="date" id="date-funeral" style="padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
            </div>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">市民資格判定</label>
            <select id="is-citizen" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="true">符合市民資格 (本人或直系血親)</option>
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
    let note = "";

    if (loc === "TP") {
        // 臺北邏輯
        note = isCitizen ? "臺北市民：前7日$0。第8-14日$400/日。" : "外縣市：前7日$400/日。第8-14日$800/日。";
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
        // 新北邏輯
        note = isCitizen ? "新北市民：7日內火化$0；逾7日自第1日起按$400計。" : "外縣市：按日計費$800。";
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
    document.getElementById('fee-note').innerText = "*說明：" + note;
    document.getElementById('calc-result').style.display = 'block';
}
</script>

---

## 三、其他常用場地與設施費用

根據**板橋殯儀館收費標準**（圖 1），除冷藏費外，家屬常接觸的項目如下：

| 項目名稱 | 單位 | 收費標準 (市民) | 備註 |
| :--- | :--- | :--- | :--- |
| **丁級禮廳** | 三小時 | **$100** | 逾一小時加收 $50 |
| **守夜使用費** | 次/丙級 | **$200** | 限本市亡者 |
| **多功能室冷氣費** | 小時 | **$50** | 未滿一小時以一小時計 |
| **移動式冷凍櫃** | 日 | **$250** | 需另繳保證金 $3,000 |

---

## 四、禮儀師的真心建議

面對複雜的規費計算，最簡單的省錢方式就是：**「在 7 日內完成火化或出殯」**。

* **設籍優勢**：務必檢查配偶或直系血親是否設籍雙北滿 6 個月，這能直接幫您省下 50% 以上的行政費用。
* **擇日精算**：若遇到大日子禮廳全滿，導致冰存天數增加，應提前試算階梯加成後的成本差異。

---

## 五、常見問題 Q&A

<div class="faq-section" style="margin-top: 30px;">
    {% for faq in page.faqs %}
    <details style="background: #fff; border: 1px solid #eee; margin-bottom: 15px; border-radius: 8px;">
        <summary style="padding: 20px; font-weight: bold; color: var(--sa-green); cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none;">
            {{ faq.question }}
            <i class="fas fa-plus" style="font-size: 0.8rem; color: var(--sa-gold);"></i>
        </summary>
        <div style="padding: 20px; color: #666; line-height: 1.8; border-top: 1px solid #f9f9f9; background: #fafafa;">
            {{ faq.answer }}
        </div>
    </details>
    {% endfor %}
</div>

---

<div style="background: var(--sa-green); color: #fff; padding: 35px; border-radius: 12px; margin-top: 50px; text-align: center;">
    <h3 style="color: var(--sa-gold); margin-top: 0;">24 小時規費諮詢與在地代辦</h3>
    <p>祥安生命協助您精算每一分預算，確保所有文件證明符合市民減免資格。</p>
    <a href="tel:0978583699" style="background: var(--sa-gold); color: #fff; padding: 15px 40px; border-radius: 30px; display: inline-block; text-decoration: none; font-weight: bold; font-size: 1.2rem; margin-top: 20px;">
        <i class="fas fa-phone-alt"></i> 0978-583-699
    </a>
</div>
