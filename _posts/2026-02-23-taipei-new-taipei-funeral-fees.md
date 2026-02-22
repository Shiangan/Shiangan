---
layout: post
title: "2026 雙北殯儀館規費懶人包：臺北二殯/板殯費用與市民優惠解析"
description: "整理 2026 最新雙北殯葬規費：臺北懷愛館(二殯)市民冰存前 7 天免費！內建最新階梯式計算器，助您精算 5 倍價差，避免治喪超支。"
date: 2026-02-23 09:00:00 +0800
category: "治喪百科"
tags: ["規費計算", "臺北懷愛館", "板橋殯儀館", "市民優惠"]
image: "/images/blog/article-07-main.jpg"
has_faq: true
faqs:
  - question: "臺北市民辦理冰存真的有免費嗎？"
    answer: "是的，根據臺北市殯葬管理處最新規定，設籍臺北市之市民，遺體進館冰存「前 7 日」免收費用，第 8 日起才開始階梯式計費。這對家屬來說是極大的減輕負擔。"
  - question: "如何判定符合「市民資格」？"
    answer: "只要「逝者本人」、「配偶」或「直系血親」（父母、子女、祖父母）任一人設籍臺北市或新北市滿 6 個月，即可申請該市的市民價優惠。辦理時務必提供戶籍謄本證明關係。"
  - question: "新北市也有冰存免費嗎？"
    answer: "新北市的優惠政策與臺北市略有不同，主要針對設籍於殯儀館所在地（如板橋、三峽）的回饋區居民提供減免。一般新北市民仍需支付基本規費，但單價遠低於非市民。"
---

<div style="background: #f4f1ea; padding: 25px; border-radius: 8px; border: 1px solid var(--sa-gold); margin-bottom: 40px;">
    <p style="margin: 0; font-size: 0.95rem; color: var(--sa-green);">
        <i class="fas fa-user-shield"></i> <strong>專業審訂：</strong> 本文依據 2025-2026 年雙北殯葬管理處最新規費表更新。
        <br>
        <i class="fas fa-check-circle"></i> <strong>最新優惠：</strong> 臺北市民享「前 7 日冰存免費」，第 8 日起採階梯計費。
    </p>
</div>

## 一、2026 雙北規費核心政策

在雙北治喪，規費是政府收取的硬性成本。了解最新政策能幫您省下數萬元預算：

* **臺北市 (懷愛館)**：推廣節葬，**市民享前 7 天冰存 0 元**。
* **新北市 (板殯/三峽)**：雖無前 7 天免費，但對回饋區居民有大幅減免。
* **身分認證**：只要**申請人（直系血親）**設籍該市，即可套用市民價（約非市民的 1/5）。

---

## 二、最新遺體冰存規費試算器 (臺北懷愛館標準)

此試算器已納入 **「市民前 7 日免費」** 及 **「階梯式加成」** 邏輯。

<div style="background: #fdfaf5; border: 1px solid var(--sa-gold); padding: 30px; border-radius: 10px; margin: 30px 0;">
    <h3 style="margin-top: 0; color: var(--sa-green); text-align: center;">階梯式冰存費用估算器</h3>
    <form id="fee-calculator" style="display: grid; gap: 15px;">
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">1. 進館日期</label>
            <input type="date" id="date-deceased" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">2. 預計出殯日期</label>
            <input type="date" id="date-funeral" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" required>
        </div>
        <div>
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">3. 是否符合臺北市民資格</label>
            <select id="is-citizen" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                <option value="true">是 (享有前7日免費)</option>
                <option value="false">否 (非市民/外縣市)</option>
            </select>
        </div>
        <button type="button" onclick="calculateComplexFee()" style="background: var(--sa-green); color: #fff; padding: 12px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s;">計算精準規費</button>
    </form>

    <div id="calc-result" style="display: none; margin-top: 20px; padding: 20px; background: #fff; border-left: 5px solid var(--sa-gold);">
        <p style="margin: 0;">總計冰存：<span id="days-count" style="font-weight: bold;">0</span> 天</p>
        <p style="margin: 10px 0 0; font-size: 1.2rem; color: var(--sa-gold);">預估總規費：<span id="estimated-fee" style="font-weight: bold;">NT$ 0</span></p>
        <p style="font-size: 0.8rem; color: #888; margin-top: 10px;">*註：市民第 1-7 日 $0，第 8-14 日 $400/日，15 日起 $800/日。非市民則無免費期且單價 5 倍計費。</p>
    </div>
</div>

<script>
function calculateComplexFee() {
    const start = new Date(document.getElementById('date-deceased').value);
    const end = new Date(document.getElementById('date-funeral').value);
    const isCitizen = document.getElementById('is-citizen').value === 'true';
    
    if (!start || !end || end <= start) {
        alert('請確認日期填寫是否正確'); return;
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let totalFee = 0;

    for (let i = 1; i <= diffDays; i++) {
        if (isCitizen) {
            if (i <= 7) totalFee += 0;
            else if (i <= 14) totalFee += 400;
            else totalFee += 800;
        } else {
            // 非市民費率 (一般為市民單價之 5 倍，且無免費期)
            if (i <= 7) totalFee += 2000;
            else if (i <= 14) totalFee += 4000;
            else totalFee += 8000;
        }
    }

    document.getElementById('days-count').innerText = diffDays;
    document.getElementById('estimated-fee').innerText = 'NT$ ' + totalFee.toLocaleString();
    document.getElementById('calc-result').style.display = 'block';
}
</script>

---

## 三、最新規費項目對照表 (臺北懷愛館)

| 項目名稱 | 市民價格 | 非市民價格 | 備註 |
| :--- | :--- | :--- | :--- |
| **遺體冰存 (1-7日)** | **$0 (免費)** | **$2,000** /日 | 市民專屬優惠 |
| **遺體冰存 (8-14日)** | **$400** /日 | **$4,000** /日 | 階梯式計費開始 |
| **火化費** | **$2,000** | **$10,000** | 包含基本骨灰處理 |
| **洗身/穿衣/化妝** | **$1,300** | **$6,500** | 公立標準收費 |

---

## 四、常見問題 Q&A

<div class="faq-section" style="margin-top: 30px;">
    {% for faq in page.faqs %}
    <details style="background: #fff; border: 1px solid #eee; margin-bottom: 15px; border-radius: 8px;">
        <summary style="padding: 20px; font-weight: bold; color: var(--sa-green); cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">
            {{ faq.question }}
            <i class="fas fa-chevron-down" style="font-size: 0.8rem; color: var(--sa-gold);"></i>
        </summary>
        <div style="padding: 0 20px 20px; color: #666; line-height: 1.8; border-top: 1px solid #f9f9f9;">
            {{ faq.answer }}
        </div>
    </details>
    {% endfor %}
</div>

---

<div style="background: var(--sa-green); color: #fff; padding: 35px; border-radius: 12px; margin-top: 50px; text-align: center;">
    <h3 style="color: var(--sa-gold); margin-top: 0;">不確定如何申請市民減免？</h3>
    <p>祥安生命協助您備妥戶籍謄本，並精算最佳擇日，確保每一分規費都花在刀口上。</p>
    <a href="tel:0978583699" style="background: var(--sa-gold); color: #fff; padding: 15px 40px; border-radius: 30px; display: inline-block; text-decoration: none; font-weight: bold; font-size: 1.2rem; margin-top: 20px;">
        <i class="fas fa-phone-alt"></i> 0978-583-699
    </a>
</div>
