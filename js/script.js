/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終精煉整合版 V2.0
 * 整合功能：Modal A11Y/焦點陷阱、Tab 切換/錨點、RWD 菜單手風琴、通用 Accordion、
 * 性能優化 (Lazy Load/Fit Text/AOS)、表單處理、RWD 清理。
 * ====================================================================
 */

'use strict';

(function () {

    // ====================================================
    // 0. 環境設定與常量
    // ====================================================
    const MOBILE_BREAKPOINT = 900;
    const SCROLL_THRESHOLD = 10;
    const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
    const TRANSITION_DURATION_MS = 350;
    const FIT_TEXT_SELECTOR = '.text-line-container span';
    const AOS_ROOT_MARGIN = '0px 0px -15% 0px';
    const FOUC_TIMEOUT_MS = 3000;
    const TAB_MAP = ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']; // 擴充 Tab 名稱
    
    // 元素快取
    const header = document.querySelector('.site-header, .main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    const body = document.body;
    const backToTopButton = document.querySelector('.back-to-top');

    let focusedElementBeforeModal;

    // ====================================================
    // A. 輔助函數 (高性能優化)
    // ====================================================

    /**
     * 在 CSS Transition 結束後清理行內樣式，防止 RWD 衝突。
     * @param {HTMLElement} contentElement - 執行 transition 的元素。
     */
    const onTransitionEndCleanup = (contentElement) => {
        const handleTransitionEnd = (e) => {
            if (e.target !== contentElement || (e.propertyName !== 'max-height' && e.propertyName !== 'opacity')) return;
            
            const isExpanded = contentElement.style.maxHeight !== '0px';

            if (!isExpanded) {
                contentElement.style.removeProperty('max-height');
                contentElement.style.removeProperty('overflow');
            }
            if (contentElement.style.display === 'none') {
                 contentElement.style.removeProperty('opacity');
                 contentElement.style.removeProperty('display');
            }

            contentElement.removeEventListener('transitionend', handleTransitionEnd);
        };
        contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
    };

好的，這是一個很好的實務操作步驟。要將 HTML、CSS 和 JavaScript 分開，同時保持原有的功能和外觀，您需要做以下三件事：
 * 建立檔案結構： 在您的專案資料夾中，建立三個檔案：
   * article-hospital-death.html (主結構)
   * css/style.css (樣式表內容)
   * js/script.js (功能腳本內容)
 * 分離內容： 將我先前提供的完整 HTML 程式碼中的 <style> 內容移到 style.css；將最下方的 <script> 內容移到 script.js。
 * 保持連結： 確保 article-hospital-death.html 檔案正確引用了這兩個外部檔案。
以下是分離後的完整程式碼，請您在同一資料夾中，依照指示建立相應的檔案和子資料夾。
📂 檔案結構
/專案資料夾
├── article-hospital-death.html  <-- 主檔案
├── css/
│   └── style.css              <-- 樣式檔案
└── js/
    └── script.js              <-- 腳本檔案

1. HTML 檔案：article-hospital-death.html
這個檔案將移除所有的 <style> 和主要的 JavaScript 程式碼，僅保留檔案引用連結。
<!DOCTYPE html>
<html lang="zh-Hant" class="js-loading">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    
    <title>【醫院死亡緊急SOP】親人在醫院過世後：死亡證明、接體與冰存 5 個關鍵步驟 | 祥安生命</title>
    
    <meta name="description" content="專業禮儀師指導，親人在醫院往生後家屬應立即處理的 5 個緊急關鍵步驟：包括取得足夠份數的死亡證明、聯繫接體、選擇冰存或返家設靈。讓您在緊急時刻不慌亂，避免時間壓力下的錯誤決策。">
    <meta name="keywords" content="醫院死亡流程, 親人過世SOP, 死亡證明書份數, 禮儀師接體, 醫院冰存, 初終處理, 臨終關懷, 治喪流程, 臨終SOP">
    
    <link rel="canonical" href="https://24hour.台灣/Shiangan/article-hospital-death.html"> 
    
    <link rel="preload" href="css/style.css" as="style">
    <link rel="stylesheet" href="css/style.css">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@300;400;700&display=swap" rel="stylesheet">
    

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": { "@type": "WebPage", "@id": "https://24hour.台灣/Shiangan/article-hospital-death.html" },
      "headline": "【醫院死亡緊急SOP】親人在醫院過世後：死亡證明、接體與冰存 5 個關鍵步驟",
      "image": [ "https://24hour.台灣/Shiangan/images/blog-first-step-1.jpg" ],
      "datePublished": "2025-11-20T00:00:00+08:00",
      "dateModified": "2025-12-12T00:00:00+08:00",
      "author": { "@type": "Person", "name": "陳妍如 (國家認證禮儀師)" },
      "publisher": { "@type": "Organization", "name": "祥安生命有限公司", "logo": { "@type": "ImageObject", "url": "https://24hour.台灣/Shiangan/images/logo.png" } },
      "description": "親人在醫院過世後，家屬應立即處理的 5 個緊急關鍵步驟：開立死亡證明、聯繫禮儀師、接體、冰存等。"
    }
    </script>
</head>

<body>
    
    <header class="main-header" role="banner">
        <div class="header-container container"> 
            <div class="logo"><a href="index.html" title="祥安生命有限公司 - 專業生命禮儀服務"><img src="images/logo.png" alt="祥安生命有限公司 Logo" class="site-logo" loading="lazy"></a></div>
            <nav class="main-nav" id="main-nav" role="navigation" aria-label="主要網站導覽">
                <ul>
                    <li><a href="index.html">首頁</a></li><li><a href="about.html">關於我們</a></li> 
                    <li class="dropdown"><a href="services.html" aria-expanded="false" aria-haspopup="true">專業生命禮儀服務 <i class="fas fa-chevron-down"></i></a>
                        <ul class="submenu"><li><a href="services.html#buddhist-taoist">中式禮儀 (佛/道)</a></li><li><a href="services.html#Western-etiquette">西式禮儀 (基督/天主)</a></li></ul></li>
                    <li class="dropdown"><a href="plans.html" aria-expanded="false" aria-haspopup="true">喪葬費用公開方案 <i class="fas fa-chevron-down"></i></a>
                        <ul class="submenu"><li><a href="plans.html#basic">國民契約 6.8萬</a></li><li><a href="plans.html#eight-eight">中式契約 8.8萬</a></li></ul></li>
                    <li class="dropdown active"><a href="blog.html" aria-expanded="true" aria-haspopup="true">殯葬百科知識 <i class="fas fa-chevron-down"></i></a>
                        <ul class="submenu"><li><a href="blog.html#first-step">臨終/初終處理</a></li><li><a href="blog.html#law-guide">法規與補助指南</a></li></ul></li>
                    <li><a href="order.html">花禮訂購</a></li> 
                    <li class="contact-nav"><a href="tel:0978583699" class="cta-button primary small">📞 24H 聯絡我們</a></li>
                </ul>
            </nav>
            <button class="menu-toggle" aria-label="切換導覽選單"><i class="fas fa-bars"></i> 選單</button>
        </div>
    </header>
    
    <main role="main">
        <section class="container-v-padding">
            <div class="container blog-main-layout">
                
                <aside class="article-sidebar" role="complementary">
                    <div class="toc-sidebar">
                        <h4><i class="fas fa-list-ol"></i> 緊急流程目錄</h4>
                        <nav aria-label="文章導覽">
                            <ol>
                                <li><a href="#step-1">步驟 1：開立死亡證明 (文件準備)</a></li>
                                <li><a href="#step-2">步驟 2：即時聯繫禮儀師 (緊急接體)</a></li>
                                <li><a href="#step-3">步驟 3：醫院辦理出院與接運</a></li>
                                <li><a href="#step-4">步驟 4：決定大體安置地點</a></li>
                                <li><a href="#step-5">步驟 5：協調流程與簽約</a></li>
                                <li><a href="#faq-section">實務 Q&A (文件與時效)</a></li>
                            </ol>
                        </nav>
                    </div>

                    <div class="sidebar-block emergency-contact-box primary-highlight" style="margin-top: 20px;">
                        <h4>🚨 您需要立即的幫助嗎？</h4>
                        <p>親人在醫院往生，時間緊迫，請立即聯繫我們，專車立即前往。</p>
                        <a href="tel:0978583699" class="cta-button primary full-width-btn small"><i class="fas fa-phone"></i> 24H 專線：0978-583-699</a>
                        <a href="https://line.me/ti/p/[您的LINE ID]" target="_blank" rel="noopener noreferrer external" class="cta-button line-button full-width-btn small" title="LINE 即時諮詢"><i class="fab fa-line"></i> LINE 線上諮詢</a>
                    </div>
                </aside>
                
                <article class="article-body" itemscope itemtype="https://schema.org/Article">
                    
                    <nav aria-label="Breadcrumb" class="article-breadcrumb" style="margin-bottom: 20px;">
                        <ol class="breadcrumb">
                            <li><a href="index.html">首頁</a></li>
                            <li><a href="blog.html">殯葬百科知識庫</a></li>
                            <li aria-current="page">醫院過世 SOP</li>
                        </ol>
                    </nav>

                    <h1 class="article-h1-title" itemprop="headline">【醫院死亡緊急SOP】親人在醫院過世後：**死亡證明、接體與冰存** 5 個關鍵步驟</h1>
            
                    <div class="article-meta text-muted" style="margin-bottom: 25px;">
                        作者：<span itemprop="author">國家認證禮儀師 陳妍如</span> |
                        分類：<span class="category"><i class="fas fa-ambulance"></i> 臨終SOP</span> |
                        發布日期：<time datetime="2025-11-20" itemprop="datePublished">2025/11/20</time> |
                        更新日期：<time datetime="2025-12-12" itemprop="dateModified">2025/12/12</time>
                    </div>
            
                    <figure itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
                         <img src="images/blog-first-step-1.jpg" alt="醫院往生後續流程圖與專業禮儀師，象徵緊急處理" class="article-image-main" loading="lazy">
                         <meta itemprop="url" content="https://24hour.台灣/Shiangan/images/blog-first-step-1.jpg">
                         <figcaption style="text-align: center; font-style: italic; color: #777;">親人在醫院往生後，家屬需在 1~2 小時內完成初步行政手續並決定大體去向。</figcaption>
                    </figure>

                    <blockquote class="summary-blockquote">
                        <p>**🚨 務必冷靜：** 當親人在醫院往生，家屬需要於極短時間內（通常是 **1~2 小時內**）完成行政程序並決定大體去向。醫院太平間的禮儀公司通常會立即接觸家屬，此時**切勿倉促簽約**，請先聯繫您信任的禮儀公司協助處理。</p>
                    </blockquote>

                    <div class="article-content">
                        
                        <h2 id="step-1"><i class="fas fa-file-invoice" style="color: var(--accent-color);"></i> 步驟一：停止急救與取得死亡證明（文件關鍵）</h2>
                        <p>當醫師宣告死亡後，家屬需簽署放棄急救（DNR）或相關文件。此時最重要的任務，是確認並取得法律文件。</p>
                        <div class="process-step">
                            <h3>📜 法律文件關鍵行動：</h3>
                            <ol>
                                <li>**停止急救/確認DNR：** 依意願簽署相關文件，並由醫師填寫**死亡證明書**。</li>
                                <li>**文件份數提醒：** 請醫院一次開立**至少 15~20 份**死亡證明書正本或蓋醫院關防的影本。這將用於除戶、保險、補助、公務機關等用途，未來補發極為繁瑣。</li>
                                <li>**確認時限：** 詢問大體可在病房或加護病房停留的最長時間（通常不超過 2 小時）。</li>
                            </ol>
                        </div>

                        <h2 id="step-2"><i class="fas fa-phone-alt" style="color: var(--accent-color);"></i> 步驟二：即時聯繫 24H 禮儀師（避免被綁標）</h2>
                        <p>由於醫院有時效壓力，取得死亡證明後，應**立即撥打您信任的禮儀公司 24 小時服務專線**（例如：祥安生命）。</p>
                        <ul>
                            <li>**緊急協調：** 禮儀師會同步向您確認逝者資訊、宗教信仰及**接體地點（自宅或殯儀館）**。</li>
                            <li>**安排專車：** 禮儀師會立即安排專業的接體專車前往醫院，避免醫院駐點業者直接包攬。</li>
                        </ul>
                        
                        <h2 id="step-3"><i class="fas fa-car-side" style="color: var(--accent-color);"></i> 步驟三：禮儀師接體與辦理出院手續</h2>
                        <p>專業禮儀師團隊抵達醫院後，會進行謹慎的大體護理，並持死亡證明與家屬一同**辦理出院手續**，支付所有醫療費用。</p>
                        <div class="process-step">
                            <h3>✨ 專業接體要點：</h3>
                            <p>禮儀師將使用專業接體裝備，以最莊重的方式將大體接運至您指定的地點。這是確保逝者不受二次移動干擾的關鍵服務。</p>
                        </div>
                        
                        <h2 id="step-4"><i class="fas fa-hotel" style="color: var(--accent-color);"></i> 步驟四：安置大體並確定治喪地點</h2>
                        <p>大體安置地點決定了後續流程的長短與複雜度，禮儀師將根據您的需求協助決策：</p>
                        <ul>
                            <li>**首選：安置於殯儀館（冰存）。** 大體直接送往殯儀館冰存，並租賃靈位或牌位區。優點是設施專業、家屬不必操心繁瑣事宜。</li>
                            <li>**次選：運回自宅設靈。** 需要準備冰櫃，並由禮儀師協助在家中架設簡易靈堂。此方式更符合傳統，但家屬需承擔較多的雜務與禁忌。</li>
                        </ul>
                        
                        <h2 id="step-5"><i class="fas fa-handshake" style="color: var(--accent-color);"></i> 步驟五：協調流程與簽訂契約（確認細節）</h2>
                        <p>在安置完成後，禮儀師會與家屬進行**治喪流程協調會議**。這是確定整個喪禮方向、費用與細節的關鍵時刻。此時請務必：</p>
                        <ol>
                            <li>**確認宗教儀式與天數：** 決定採中式、西式，以及辦理的天數（三天、五天、七天）。</li>
                            <li>**釐清費用明細：** 詳閱契約內容，確認費用包含項目（公開透明的費用是選擇禮儀公司的基本條件）。</li>
                            <li>**擇定日期：** 儘早確認火化或土葬的日期，以便預訂禮廳與火化爐檔期。</li>
                        </ol>

                        <h2 id="faq-section" style="color: var(--primary-dark);"><i class="fas fa-question-circle" style="color: var(--accent-color);"></i> 實務 Q&A：家屬最常見的緊急問題</h2>
                        <div class="faq-list">
                            <details class="faq-item">
                                <summary>Q1：親人過世後，醫院會提供禮儀公司名單嗎？</summary>
                                <div class="faq-content">
                                    <p>A：醫院通常會提供**駐點**或**合作**的禮儀服務名單。但請留意，這些業者可能因為時間壓力而要求家屬立即簽約。您有權利選擇自己信任的禮儀公司，**不需**接受醫院駐點業者的服務。</p>
                                </div>
                            </details>
                            <details class="faq-item">
                                <summary>Q2：死亡證明書到底需要多少份？</summary>
                                <div class="faq-content">
                                    <p>A：我們強烈建議**至少申請 15~20 份**正本或醫院蓋章影本。因為未來辦理除戶、國稅局申報遺產稅、領取保險金、勞保/農保補助、以及繼承等手續，都會用到這份文件。份數寧可多，不可少。</p>
                                </div>
                            </details>
                        </div>

                        <div class="related-articles">
                            <h3>延伸閱讀：讓您在治喪路上更清晰</h3>
                            <ul>
                                <li><a href="article-home-death.html">👉 在家中過世怎麼辦？查看報驗相驗流程</a></li>
                                <li><a href="article-days-process.html">👉 現代喪禮該辦幾天？流程差異解析</a></li>
                            </ul>
                        </div>
                    </div>
                </article>
            </div>
        </section>
        
        <div class="text-center cta-section" style="margin-top: 60px; padding: 40px; background-color: #f5f5f5; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <h3 style="color: var(--primary-dark); margin-bottom: 15px;">您需要立即的幫助嗎？祥安禮儀師 24H 待命</h3>
            <p style="font-size: 1.1rem;">若您正處於緊急狀況，或對醫院流程有任何疑問，請立即與我們聯繫，我們將在電話中提供第一時間的指導。</p>
            <a href="tel:0978583699" class="cta-button primary large" rel="nofollow" style="margin-top: 20px;">📞 24H 禮儀師即時諮詢：0978-583-699</a>
        </div>
        
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "親人過世後，醫院會提供禮儀公司名單嗎？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "醫院通常會提供駐點或合作的禮儀服務名單。但請留意，這些業者可能因為時間壓力而要求家屬立即簽約。您有權利選擇自己信任的禮儀公司，不需接受醫院駐點業者的服務。"
              }
            },
            {
              "@type": "Question",
              "name": "死亡證明書到底需要多少份？",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "我們強烈建議至少申請 15~20 份正本或醫院蓋章影本。因為未來辦理除戶、國稅局申報遺產稅、領取保險金、勞保/農保補助、以及繼承等手續，都會用到這份文件。份數寧可多，不可少。"
              }
            }
          ]
        }
        </script>
        
    </main>

    <footer role="contentinfo">
        <div class="container footer-grid wide-footer-grid">
            <div class="footer-block footer-links"><h4>專業生命禮儀服務</h4><ul><li><a href="services.html">所有服務總覽</a></li><li><a href="services.html#buddhist-taoist">中式禮儀 (佛/道)</a></li><li><a href="services.html#Western-etiquette">西式禮儀 (基督/天主)</a></li></ul></div>
            <div class="footer-block footer-links"><h4>喪葬費用公開方案</h4><ul><li><a href="plans.html">所有方案與價格總覽</a></li><li><a href="plans.html#basic">國民契約 6.8萬</a></li><li><a href="plans.html#eightdoteight">中式契約 8.8萬起</a></li></ul><h4>殯葬百科知識</h4><ul><li><a href="blog.html">常見問題與流程</a></li><li><a href="blog.html#law-guide">法規與補助指南</a></li></ul></div>
            <div class="footer-block footer-contact" itemscope itemtype="https://schema.org/LocalBusiness"><h4 style="margin-bottom: 5px;">24H 禮儀師陳妍如 專線</h4><p style="font-size: 1.5rem; color: var(--accent-color); margin-top: 0;">📞 <a href="tel:0978583699" itemprop="telephone">0978-583-699</a></p><h4>公司資訊與服務範圍</h4><address itemprop="address" itemscope itemtype="https://schema.org/PostalAddress"><p>主要聯絡地址：<span itemprop="streetAddress">新北市板橋區雙十路二段XX號 (僅供業務聯繫)</span></p></address><p>服務地區：<strong itemprop="areaServed">全台服務</strong> (雙北/桃園即時協助)</p><div class="footer-social-links"><a href="https://line.me/ti/p/[您的LINE ID]" target="_blank" rel="noopener noreferrer external" title="LINE ID"><i class="fab fa-line"></i> LINE</a> | <a href="[您的 Facebook 專頁網址]" target="_blank" rel="noopener noreferrer external" title="Facebook 粉絲專頁"><i class="fab fa-facebook"></i> Facebook</a></div><meta itemprop="name" content="祥安生命有限公司"><meta itemprop="url" content="https://24hour.台灣/Shiangan/"></div>
        </div>
        <div class="footer-copyright"><div class="container"><div class="footer-logo">祥安生命有限公司 © <span id="current-year">2025</span></div><div class="footer-meta"><a href="about.html" rel="nofollow">關於我們 (E-E-A-T)</a> | <a href="privacy.html" rel="nofollow">隱私權政策</a></div></div></div>
    </footer>
    <a href="#top" class="back-to-top" aria-label="返回頁面頂部"><i class="fas fa-chevron-up"></i></a>
    <div class="floating-cta" aria-label="快速聯繫方式"><a href="tel:0978583699" title="24H 緊急電話諮詢"><i class="fas fa-phone"></i></a><a href="https://line.me/ti/p/[您的LINE ID]" target="_blank" rel="noopener noreferrer external" title="LINE 即時諮詢"><i class="fab fa-line"></i></a></div>

    <script src="js/script.js" defer></script>
</body>
</html>

2. CSS 檔案：css/style.css
請在 css 資料夾內建立此檔案，並貼入以下內容。
/* 1. 基礎設定與變數 */
:root {
    --primary-color: #34495e; /* 深藍/灰藍 */
    --primary-dark: #2c3e50;
    --accent-color: #e67e22; /* 橘色 (強調/警示) */
    --secondary-color: #95a5a6; /* 輔助灰 */
    --light-bg: #ecf0f1;
    --container-width: 1200px;
}

/* 重設與排版 */
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
    font-family: 'Noto Sans TC', sans-serif;
    color: var(--primary-dark);
    line-height: 1.6;
    margin: 0;
    background-color: #f7f7f7;
}

h1, h2, h3, h4 {
    font-family: 'Noto Serif TC', serif;
    color: var(--primary-dark);
    line-height: 1.3;
}

.container {
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 0 15px;
}

/* 2. Header 與導覽 */
.main-header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    position: sticky;
    top: 0;
    z-index: 1000;
}
.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
}
.site-logo { height: 40px; }
.main-nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
}
.main-nav li { position: relative; }
.main-nav a {
    display: block;
    padding: 15px 20px;
    text-decoration: none;
    color: var(--primary-dark);
    font-weight: 400;
    transition: color 0.3s;
}
.main-nav a:hover, .main-nav li.active > a { color: var(--accent-color); }

/* 下拉選單 */
.submenu {
    display: none;
    position: absolute;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    min-width: 180px;
    z-index: 10;
    padding: 10px 0;
    list-style: none;
}
.dropdown:hover .submenu { display: block; }
.submenu a { padding: 8px 20px; font-size: 0.95rem; }

.menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: var(--primary-dark);
}

/* CTA 按鈕 */
.cta-button {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 4px;
    text-decoration: none;
    text-align: center;
    font-weight: 700;
    transition: background-color 0.3s;
}
.cta-button.primary {
    background-color: var(--primary-color);
    color: #fff;
}
.cta-button.primary:hover { background-color: var(--primary-dark); }
.cta-button.line-button {
    background-color: #00c300;
    color: #fff;
    margin-top: 10px;
}
.cta-button.line-button:hover { background-color: #009900; }
.cta-button.small { padding: 8px 15px; font-size: 0.9rem; }
.cta-button.large { padding: 15px 30px; font-size: 1.2rem; }
.cta-button.full-width-btn { width: 100%; }

/* 3. 文章特定樣式 (整合與擴充) */
.container-v-padding { padding: 40px 0; }

/* 佈局 */
.blog-main-layout { 
    display: flex; 
    gap: 30px; 
    max-width: var(--container-width); 
    margin: 0 auto; 
    align-items: flex-start; 
}
.article-body { flex: 1; min-width: 0; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }

/* 側欄 (Sticky) */
.article-sidebar { 
    flex: 0 0 300px; 
    position: sticky; 
    top: 20px; 
    height: fit-content; 
}
.toc-sidebar { 
    border: 1px solid #eee; 
    padding: 15px; 
    border-radius: 8px; 
    background-color: #fff; 
    box-shadow: 0 2px 5px rgba(0,0,0,0.05); 
}
.toc-sidebar h4 { color: var(--accent-color); margin-top: 0; font-size: 1.1rem; }
.toc-sidebar ol { padding-left: 20px; }
.toc-sidebar li { margin-bottom: 8px; font-size: 0.95rem; }
.toc-sidebar a { color: var(--primary-dark); text-decoration: none; }
.toc-sidebar a:hover { color: var(--accent-color); text-decoration: underline; }

.emergency-contact-box {
    padding: 20px;
    background-color: var(--light-bg);
    border: 1px solid #ddd;
    border-radius: 8px;
    text-align: center;
}
.emergency-contact-box h4 { margin-top: 0; color: #dc3545; }

/* 文章內容 */
.article-h1-title { font-size: 2.2rem; margin-bottom: 10px; }
.article-meta { font-size: 0.9rem; color: var(--secondary-color) !important; margin-bottom: 25px; }

.article-content { line-height: 1.8; font-size: 1.1rem; }
.article-content h2, .article-content h3 { margin-top: 2rem; margin-bottom: 1rem; color: var(--primary-dark); }

.article-image-main { width: 100%; height: auto; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 30px; }

.summary-blockquote {
     border-left: 5px solid var(--accent-color); 
     padding: 15px 20px;
     margin: 20px 0;
     background-color: #fff8f8; 
     border-radius: 4px;
}
.summary-blockquote p { margin: 0; font-weight: 400; font-size: 1.05rem; }


.process-step { 
    border-left: 5px solid var(--accent-color); 
    margin: 25px 0; 
    background-color: #fcfcfc; 
    padding: 15px 20px; 
    border-radius: 4px; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.process-step h3 { 
    color: var(--accent-color); 
    margin-top: 0; 
    font-size: 1.3rem; 
    margin-bottom: 10px;
}
.process-step ol { padding-left: 20px; }

/* FAQ 區塊 */
.faq-list { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-top: 20px; }
.faq-item { border-bottom: 1px solid #eee; padding: 10px 0; }
.faq-item:last-child { border-bottom: none; }
.faq-item summary { cursor: pointer; font-weight: bold; padding: 5px 0; color: var(--primary-dark); list-style: none; }
.faq-item summary::before { content: "\f054"; font-family: "Font Awesome 6 Free"; font-weight: 900; margin-right: 10px; color: var(--accent-color); font-size: 0.8em; }
details[open] summary::before { content: "\f078"; }
.faq-content { padding: 10px 0 5px 30px; background-color: #f9f9f9; margin-top: 5px; border-radius: 4px; }
.faq-content p { margin: 0; }

.related-articles { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ddd; }
.related-articles h3 { color: var(--primary-color); }
.related-articles ul { list-style: none; padding-left: 0; }
.related-articles li a { color: var(--accent-color); text-decoration: none; }
.related-articles li a:hover { text-decoration: underline; }

/* 4. Footer 樣式 */
footer {
    background-color: var(--primary-dark);
    color: #fff;
    padding: 40px 0 0;
    font-size: 0.95rem;
}
.footer-grid {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-bottom: 30px;
}
.footer-block { width: 30%; min-width: 250px; margin-bottom: 20px; }
.footer-block h4 { color: var(--accent-color); margin-bottom: 15px; font-size: 1.1rem; }
.footer-block ul { list-style: none; padding: 0; }
.footer-block a { color: #ccc; text-decoration: none; line-height: 2; }
.footer-block a:hover { color: #fff; }

.footer-contact a { color: var(--accent-color); text-decoration: none; }
.footer-contact a:hover { text-decoration: underline; }

.footer-social-links a { margin-right: 15px; font-size: 1.1rem; }
.footer-social-links .fa-line { color: #00c300; }
.footer-social-links .fa-facebook { color: #3b5998; }

.footer-copyright {
    background-color: #2c3e50;
    padding: 15px 0;
    border-top: 1px solid #333;
}
.footer-copyright .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #aaa;
}
.footer-meta a { color: #aaa; text-decoration: none; }
.footer-meta a:hover { color: #fff; }

/* 5. 浮動元件 */
.back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--accent-color);
    color: #fff;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    text-align: center;
    line-height: 45px;
    font-size: 1.2rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    display: none; 
    transition: opacity 0.3s;
    z-index: 990;
}

.floating-cta {
    position: fixed;
    bottom: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 990;
}
.floating-cta a {
    background-color: var(--primary-color);
    color: #fff;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.floating-cta .fa-line { background-color: #00c300; }

/* 6. 響應式設計 (RWD) */
@media (max-width: 1024px) {
    .blog-main-layout { flex-direction: column; }
    .article-sidebar { 
        position: static; 
        width: 100%;
        margin-bottom: 20px;
    }
    .article-body { padding: 20px; }
    .footer-grid { justify-content: space-around; }
    .footer-block { width: 45%; min-width: 0; }
}

@media (max-width: 768px) {
    .header-container { padding: 10px 15px; }
    .main-nav { 
        display: none;
        flex-direction: column;
        position: absolute;
        top: 60px; 
        left: 0;
        width: 100%;
        background-color: #fff;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        padding: 10px 0;
    }
    .main-nav.active { display: flex; }
    .main-nav ul { flex-direction: column; }
    .main-nav li { border-bottom: 1px solid #eee; }
    .main-nav li:last-child { border-bottom: none; }
    .dropdown:hover .submenu, .submenu { 
        position: static; 
        display: block; 
        background: #f8f8f8;
        box-shadow: none;
    }
    .contact-nav { margin-top: 10px; padding: 0 15px; }
    .contact-nav a { width: 100%; }

    .menu-toggle { display: block; }
    .footer-grid { flex-direction: column; }
    .footer-block { width: 100%; }
    .footer-copyright .container { flex-direction: column; text-align: center; }
    .footer-meta { margin-top: 10px; }
}

3. JavaScript 檔案：js/script.js
請在 js 資料夾內建立此檔案，並貼入以下內容。
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const backToTop = document.querySelector('.back-to-top');
    const currentYear = document.getElementById('current-year');

    // 移除 Loading Class
    body.classList.remove('js-loading');
    
    // 頁腳年份更新
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // 選單切換功能 (RWD)
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // 返回頂部按鈕邏輯
    if (backToTop) {
        const toggleVisibility = () => {
            // 滾動超過 300px 顯示按鈕
            if (window.scrollY > 300) {
                backToTop.style.display = 'flex'; 
            } else {
                backToTop.style.display = 'none';
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        toggleVisibility(); // 首次載入檢查

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});



    /** 節流函數 (Debounce) */
    const debounce = (func, delay = 50) => {
        let timeoutId = null;
        let lastArgs, lastThis;
        const run = () => {
            timeoutId = setTimeout(() => {
                requestAnimationFrame(() => func.apply(lastThis, lastArgs));
                timeoutId = null;
            }, delay);
        };
        return function (...args) {
            lastArgs = args;
            lastThis = this;
            if (timeoutId) clearTimeout(timeoutId);
            run();
        };
    };
    const debounceFitText = (func) => debounce(func, 100);

    /** 檢查是否處於行動裝置視圖 (Mobile View) */
    const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

    // ====================================================
    // B. FOUC 處理 (Flash of Unstyled Content)
    // ====================================================
    const removeLoadingClass = () => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('js-loading');
            body.classList.remove('js-loading');
        });
    };
    document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });
    setTimeout(removeLoadingClass, FOUC_TIMEOUT_MS);

    // ====================================================
    // C. Modal 模組 (A11Y 強化與焦點陷阱)
    // ====================================================

    /** 處理 Modal 內的 Tab 鍵盤導航 (焦點陷阱) */
    function handleModalKeydown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            window.closeModal(e);
            return;
        }
        if (e.key === 'Tab') {
            const modal = e.currentTarget;
            if (!modal.classList.contains('active')) return;

            const focusableElements = modal.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');

            const visibleFocusableElements = Array.from(focusableElements).filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && (el.offsetWidth > 0 || el.offsetHeight > 0);
            });

            if (visibleFocusableElements.length === 0) return;

            const first = visibleFocusableElements[0];
            const last = visibleFocusableElements[visibleFocusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab: 從第一個跳到最後一個
                if (document.activeElement === first) { last.focus(); e.preventDefault(); }
            } else { // Tab: 從最後一個跳到第一個
                if (document.activeElement === last) { first.focus(); e.preventDefault(); }
            }
        }
    }

    /** 開啟 Modal (暴露到全域) */
    window.openModal = function(modalId) {
        const modal = document.getElementById('modal-' + modalId);
        if (modal) {
            focusedElementBeforeModal = document.activeElement;
            // 關閉所有其他已開啟的 Modal
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                m.classList.remove('active');
                m.style.display = 'none';
                m.removeEventListener('keydown', handleModalKeydown);
            });

            modal.style.display = 'flex';

            requestAnimationFrame(() => {
                setTimeout(() => {
                    modal.classList.add('active');
                    body.classList.add('no-scroll');
                    modal.scrollTop = 0;
                    modal.setAttribute('aria-hidden', 'false');

                    const focusTarget = modal.querySelector('.close-btn') || modal;
                    focusTarget.focus();

                    modal.addEventListener('keydown', handleModalKeydown);
                }, 10);
            });
        }
    }

    /** 關閉 Modal (暴露到全域) */
    window.closeModal = function(event) {
        if (event && event.type === 'click') {
            const isModalOverlay = event.target.classList.contains('modal-overlay');
            const isCloseButton = event.target.closest('.close-btn');
            if (!isModalOverlay && !isCloseButton) {
                return;
            }
        }

        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            activeModal.setAttribute('aria-hidden', 'true');

            setTimeout(() => {
                activeModal.style.display = 'none';
                body.classList.remove('no-scroll');
                activeModal.removeEventListener('keydown', handleModalKeydown);
                if (focusedElementBeforeModal) {
                    focusedElementBeforeModal.focus();
                }
            }, TRANSITION_DURATION_MS);
        }
    }
    
    // 全局 ESC 鍵關閉 Modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') { window.closeModal(event); }
    });
    // 點擊 Modal 外部時關閉
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            window.closeModal(e);
        }
    });

    // ====================================================
    // D. 導航菜單模組
    // ====================================================

    /** 關閉所有行動裝置子選單 (優化動畫) */
    const closeAllMobileSubmenus = (excludeLi = null) => {
        // ... (邏輯不變)
        if (mainNav) {
            Array.from(mainNav.querySelectorAll('li.dropdown.active')).forEach(li => {
                if (li === excludeLi) return;
                
                const submenu = li.querySelector('.submenu-container, .submenu');
                const targetLink = li.querySelector('a');

                if (submenu && targetLink) {
                    li.classList.remove('active');
                    targetLink.setAttribute('aria-expanded', 'false');
                    
                    if (submenu.scrollHeight > 0 && submenu.style.maxHeight !== '0px') {
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                        submenu.style.overflow = 'hidden';
                        requestAnimationFrame(() => {
                            submenu.style.maxHeight = '0px';
                            onTransitionEndCleanup(submenu);
                        });
                    } else if (submenu.style.maxHeight !== '0px') {
                         submenu.style.maxHeight = '0px';
                         onTransitionEndCleanup(submenu);
                    }
                }
            });
        }
    };

    /** 關閉主菜單 */
    const closeMainMenu = () => {
        // ... (邏輯不變)
        if (mainNav?.classList.contains('active')) {
            mainNav.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const menuIcon = menuToggle.querySelector('i');
                if (menuIcon) {
                    menuIcon.classList.replace('fa-times', 'fa-bars');
                }
            }
            body.classList.remove('no-scroll');
            body.classList.remove('menu-open');
            closeAllMobileSubmenus(); 
        }
    };

    /** 處理頁面滾動時 Header 的樣式變化 */
    const handleHeaderScroll = () => {
        // ... (邏輯不變)
        const updateHeaderScrollClass = () => {
            const scrollY = window.scrollY;
            if (header) header.classList.toggle('scrolled', scrollY > SCROLL_THRESHOLD);
            if (backToTopButton) backToTopButton.classList.toggle('show', scrollY > 300);
        };
        updateHeaderScrollClass();
        window.addEventListener('scroll', debounce(updateHeaderScrollClass, 10), { passive: true });
    };

    /** 設置 RWD 菜單開關功能 */
    const setupRwdMenuToggle = () => {
        // ... (邏輯不變)
        if (menuToggle && mainNav) {
            const menuIcon = menuToggle.querySelector('i');
            menuToggle.addEventListener('click', function () {
                const isExpanded = mainNav.classList.contains('active');
                if (!isExpanded) {
                    mainNav.classList.add('active');
                    this.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                    if (menuIcon) menuIcon.classList.replace('fa-bars', 'fa-times');
                    if (isMobileView()) body.classList.add('no-scroll');
                } else {
                    closeMainMenu();
                }
            });

            mainNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (isMobileView() && link.hash.length > 0 && link.hash !== '#') {
                        setTimeout(closeMainMenu, TRANSITION_DURATION_MS + 50); 
                    }
                });
            });
        }
    };

    /** 設置行動裝置菜單手風琴效果 (Accordion) - 優化版 */
    const setupMobileAccordion = () => {
        // ... (邏輯不變)
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
                targetLink.addEventListener('click', (e) => {
                    const parentLi = targetLink.closest('li.dropdown');
                    if (!parentLi || !isMobileView()) return;
                    
                    const submenu = parentLi.querySelector('.submenu-container, .submenu');
                    if (!submenu) return; 

                    e.preventDefault();
                    const isCurrentlyActive = parentLi.classList.contains('active');
                    
                    closeAllMobileSubmenus(parentLi);
                    
                    if (!isCurrentlyActive) {
                        parentLi.classList.add('active');
                        targetLink.setAttribute('aria-expanded', 'true');
                        
                        submenu.style.maxHeight = '0px';
                        submenu.style.overflow = 'hidden';
                        void submenu.offsetHeight; 
                        
                        requestAnimationFrame(() => {
                            submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                            onTransitionEndCleanup(submenu);
                        });
                        
                    } else {
                        parentLi.classList.remove('active');
                        targetLink.setAttribute('aria-expanded', 'false');
                        
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                        submenu.style.overflow = 'hidden';
                        requestAnimationFrame(() => {
                            submenu.style.maxHeight = '0px';
                            onTransitionEndCleanup(submenu);
                        });
                    }
                });
            });
        }
    };

    /** 設置桌面版菜單的鍵盤 A11Y (focus-within) */
    const setupDesktopA11y = () => {
        // ... (邏輯不變)
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
                dropdown.addEventListener('focusin', function () {
                    if (!isMobileView()) this.classList.add('focus-within');
                });
                dropdown.addEventListener('focusout', function () {
                    setTimeout(() => {
                        if (!isMobileView() && !this.contains(document.activeElement)) {
                            this.classList.remove('focus-within');
                        }
                    }, 0);
                });
            });
        }
    };

    // ====================================================
    // E. Tab 切換邏輯 (支援錨點滾動 - 唯一版本)
    // ====================================================

    /** 開啟選定的 Tab 並處理錨點滾動 (暴露到全域) */
    window.openPlanTab = function(tabName, anchorId = null) {
        let tabcontent;
        
        // 隱藏所有內容，重置所有 Tab 按鈕狀態
        tabcontent = document.getElementsByClassName("plan-tab-content");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            // 由於您的 Tab ID 可能有多種命名方式 (tab-buddhist-taoist 或 tab-comparison)，我們統一檢查
            const contentId = tabcontent[i].id;
            const tabIdMatch = contentId.match(/content-(.*)/);
            if (tabIdMatch) {
                const tabId = "tab-" + tabIdMatch[1];
                const tabElement = document.getElementById(tabId);
                if (tabElement) {
                    tabElement.classList.remove('active');
                    tabElement.setAttribute('aria-selected', 'false');
                    tabElement.setAttribute('tabindex', '-1');
                }
            }
        }
        
        const contentId = "content-" + tabName;
        const tabId = "tab-" + tabName;

        const contentElement = document.getElementById(contentId);
        const tabElement = document.getElementById(tabId);

        // 顯示選定的內容，啟用選定的 Tab 按鈕
        if (contentElement) { contentElement.style.display = "block"; }
        if (tabElement) { 
            tabElement.classList.add("active"); 
            tabElement.setAttribute('aria-selected', 'true'); 
            tabElement.setAttribute('tabindex', '0'); 
        }
        
        // 平滑滾動邏輯
        const headerHeight = header?.offsetHeight || 0;
        
        requestAnimationFrame(() => {
            if (anchorId) {
                // 滾動到精確錨點 (#plan-168)
                const targetElement = document.querySelector(anchorId);
                if (targetElement) {
                    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                    targetElement.focus({ preventScroll: true }); 
                }
            } else {
                // 滾動到 Tab 按鈕的容器頂部
                const planTabs = document.querySelector('.plan-tabs');
                if (planTabs) {
                    const tabTop = planTabs.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({ top: tabTop, behavior: 'smooth' });
                    tabElement?.focus();
                }
            }
        });
    }

    /** 處理 URL Hash 以決定初始 Tab - 修正：使用統一的 TAB_MAP */
    const initializeTabFromHash = () => {
        let hash = window.location.hash.substring(1); 
        let targetAnchorId = null;
        let defaultTab = 'buddhist-taoist'; // 預設 Tab
        if (document.querySelector('#content-comparison')) defaultTab = 'comparison'; // 如果有「服務比較」Tab，則優先使用

        // 1. 檢查是否是 Tab ID (#tab-buddhist-taoist)
        if (hash.startsWith('tab-')) {
            const tabName = hash.split('-')[1];
            if (TAB_MAP.includes(tabName)) {
                defaultTab = tabName;
            }
        } 
        // 2. 檢查是否是精確錨點 (#plan-168)
        else if (hash.startsWith('plan-')) {
            targetAnchorId = '#' + hash;
            const targetElement = document.getElementById(hash);
            const tabContent = targetElement?.closest('.plan-tab-content'); 
            if (tabContent) {
                const tabNameFromContent = tabContent.id.split('-')[1];
                if (TAB_MAP.includes(tabNameFromContent)) {
                    defaultTab = tabNameFromContent;
                }
            }
        }
        // 3. 檢查是否是 Tab Name (buddhist-taoist)
        else if (TAB_MAP.includes(hash)) {
            defaultTab = hash;
        }
        
        // 啟用正確的 Tab
        window.openPlanTab(defaultTab, targetAnchorId);
    };


    // ====================================================
    // F. 互動組件 (Accordion / Details)
    // ====================================================

    /** 設置通用手風琴 (Accordion) 功能 */
    const setupAccordion = () => {
        // ... (邏輯不變)
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
            const headerElement = item.querySelector('.accordion-title');
            const content = item.querySelector('.accordion-content');
            if (!headerElement || !content) return;

            const uniqueId = `faq-item-${index}`;
            content.id = `${uniqueId}-content`;
            headerElement.setAttribute('aria-controls', content.id);
            const isActive = item.classList.contains('active');
            headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            headerElement.setAttribute('tabindex', '0');
            headerElement.setAttribute('role', 'button'); 

            content.style.display = 'block';
            content.style.overflow = 'hidden';
            content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';

            headerElement.addEventListener('click', function () {
                const isCurrentlyActive = item.classList.contains('active');
                
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        const otherContent = activeItem.querySelector('.accordion-content');
                        const otherHeader = activeItem.querySelector('.accordion-title');
                        activeItem.classList.remove('active');
                        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                        if (otherContent) {
                            otherContent.style.overflow = 'hidden';
                            otherContent.style.maxHeight = `${otherContent.scrollHeight}px`;
                            requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                            onTransitionEndCleanup(otherContent);
                        }
                    }
                });

                item.classList.toggle('active', !isCurrentlyActive);
                this.setAttribute('aria-expanded', (!isCurrentlyActive).toString());
                
                if (!isCurrentlyActive) {
                    content.style.maxHeight = '0px';
                    void content.offsetHeight;
                    content.style.overflow = 'hidden';
                    requestAnimationFrame(() => {
                        content.style.maxHeight = `${content.scrollHeight}px`;
                        onTransitionEndCleanup(content);
                    });
                } else {
                    content.style.overflow = 'hidden';
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    requestAnimationFrame(() => content.style.maxHeight = '0px');
                    onTransitionEndCleanup(content);
                }
            });

            headerElement.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    };

    /** 展開/收起商品詳細資訊 (Plan Details Toggle) (暴露到全域) */
    const toggleDetails = (button) => {
        // ... (邏輯不變)
        const card = button.closest('.plan-card');
        const details = card?.querySelector('.plan-details-expanded');
        if (!card || !details) return;

        const isExpanded = card.classList.contains('expanded');
        card.classList.toggle('expanded', !isExpanded);

        const icon = button.querySelector('i');
        const newText = !isExpanded ? '收起完整細項 ' : '查看完整細項 ';
        button.setAttribute('aria-expanded', (!isExpanded).toString());

        if (icon) {
            button.textContent = newText;
            const newIconClass = !isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
            const oldIconClass = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
            
            icon.classList.replace(oldIconClass, newIconClass);
            button.appendChild(icon);
        } else {
            button.textContent = newText;
        }

        if (!isExpanded) {
            details.style.maxHeight = '0px';
            void details.offsetHeight;
            details.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                details.style.maxHeight = `${details.scrollHeight}px`;
                onTransitionEndCleanup(details);
            });
        } else {
            details.style.overflow = 'hidden';
            details.style.maxHeight = `${details.scrollHeight}px`;
            requestAnimationFrame(() => details.style.maxHeight = '0px');
            onTransitionEndCleanup(details);
        }
    };
    if (typeof window.toggleDetails === 'undefined') window.toggleDetails = toggleDetails;

    // ====================================================
    // G. 性能優化與其他工具
    // ====================================================

    /** 設置 Lazy Load 功能 */
    const setupLazyLoading = () => {
        // ... (邏輯不變)
        const lazyTargets = document.querySelectorAll('img[data-src], source[data-srcset], picture');
        const loadImage = (el) => {
            if (el.classList.contains('loaded')) return;
            if (el.tagName === 'IMG') {
                const imgEl = el;
                if (imgEl.dataset.src) { imgEl.src = imgEl.dataset.src; imgEl.removeAttribute('data-src'); }
                if (imgEl.dataset.srcset) { imgEl.srcset = imgEl.dataset.srcset; imgEl.removeAttribute('data-srcset'); }
                imgEl.classList.add('loaded');
            } else if (el.tagName === 'SOURCE') {
                const sourceEl = el;
                if (sourceEl.dataset.srcset) { sourceEl.srcset = sourceEl.dataset.srcset; sourceEl.removeAttribute('data-srcset'); }
            }
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.tagName === 'PICTURE') {
                            element.querySelectorAll('source[data-srcset]').forEach(loadImage); 
                            const img = element.querySelector('img');
                            if (img) loadImage(img);
                        } else loadImage(element); 
                        
                        obs.unobserve(element);
                    }
                });
            }, { 
                root: null, 
                rootMargin: LAZY_LOAD_ROOT_MARGIN, 
                threshold: 0.01
            });
            lazyTargets.forEach(el => observer.observe(el));
        } else {
            lazyTargets.forEach(loadImage);
        }
    };

    /** 設置 Fit Text 功能 (文本自動縮放以適應容器寬度) */
    const setupFitText = () => {
        // ... (邏輯不變)
        const MAX_FONT = 22, MIN_FONT = 8, PRECISION = 0.1;
        
        const fitOne = (el) => {
            const parentWidth = el.parentElement?.offsetWidth || 0;
            const text = el.textContent?.trim() || '';
            
            if (parentWidth <= 50 || text === '' || !el.parentElement) { 
                el.style.fontSize = `${MAX_FONT}px`; 
                return; 
            }
            
            let low = MIN_FONT, high = MAX_FONT, bestSize = MIN_FONT, iterations = 0;
            while (low <= high && iterations < 20) { 
                const mid = (low + high) / 2;
                el.style.fontSize = `${mid}px`;
                
                if (el.scrollWidth <= parentWidth) { 
                    bestSize = mid; 
                    low = mid + PRECISION; 
                } else {
                    high = mid - PRECISION;
                }
                iterations++;
            }
            el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
        };

        const fitAll = () => {
            const nodes = document.querySelectorAll(FIT_TEXT_SELECTOR);
            requestAnimationFrame(() => nodes.forEach(fitOne));
        };
        
        const debounceFunc = debounceFitText(fitAll);
        
        const start = () => {
            fitAll();
            
            if (window.ResizeObserver) {
                const observer = new ResizeObserver(entries => {
                    if (entries.some(e => e.contentRect.width > 0)) debounceFunc();
                });
                const observedParents = new Set();
                document.querySelectorAll(FIT_TEXT_SELECTOR).forEach(el => {
                    const parent = el.parentElement;
                    if (parent && !observedParents.has(parent)) { 
                        observer.observe(parent); 
                        observedParents.add(parent); 
                    }
                });
            } else {
                window.addEventListener('resize', debounceFunc);
            }
        };

        if (document.fonts?.ready) document.fonts.ready.then(start).catch(start); 
        else window.addEventListener('load', start);
        
        return fitAll; // 返回函數以便在 resize 清理時調用
    };

    /** 設置平滑滾動到錨點功能 (不包含 Tab 滾動) */
    const setupSmoothScrolling = () => {
        // ... (邏輯不變)
        if (!header) return;
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId || '');
                // 排除 Tab 按鈕和 Modal 開關
                if (targetElement && !this.closest('.plan-tabs') && !this.dataset.modalId) {
                    e.preventDefault();
                    requestAnimationFrame(() => {
                        const headerOffset = header.offsetHeight || 0;
                        const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerOffset);
                        
                        window.scrollTo({ top: targetTop, behavior: 'smooth' });
                        
                        if (mainNav?.classList.contains('active')) setTimeout(closeMainMenu, TRANSITION_DURATION_MS + 50);
                    });
                }
            });
        });
        
        // 設置 Back-to-Top 按鈕
        if (backToTopButton) backToTopButton.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    };

    /** 設置表單提交處理 (AJAX) */
    const setupFormSubmission = () => {
        // ... (邏輯不變)
        const form = document.getElementById('product-order-form');
        const statusMessage = document.getElementById('form-status-message');
        if (!form) return;
        
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            if (!submitButton) return;
            
            const originalText = submitButton.textContent;
            submitButton.textContent = '送出中... 請稍候';
            submitButton.disabled = true;
            if (statusMessage) statusMessage.textContent = '';
            this.classList.add('is-loading');

            const cleanup = (success = false) => {
                const delay = success ? 5000 : 50;
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    this.classList.remove('is-loading');
                    if (statusMessage && !success) statusMessage.textContent = ''; 
                }, delay);
            };

            try {
                if (form.action.includes('your_form_endpoint')) {
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = '❗ 請先替換表單 action URL！'; }
                    cleanup(); 
                    return;
                }
                
                const formData = new FormData(this);
                const response = await fetch(this.action, { 
                    method: this.method, 
                    body: formData, 
                    headers: { 
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache, no-store, must-revalidate' 
                    } 
                });

                if (response.ok) {
                    if (statusMessage) { statusMessage.style.color = '#28a745'; statusMessage.textContent = '🎉 訂購資訊已成功送出！我們將儘速與您聯繫。'; }
                    this.reset(); 
                    submitButton.textContent = '訂購成功！'; 
                    cleanup(true);
                } else {
                    const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤或非 JSON' }));
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = `❗ ${errorData.error || '表單送出失敗'}，請直接撥打 24H 專線訂購：0978-583-699`; }
                    cleanup();
                }
            } catch (err) {
                console.error('Form Submission Error:', err);
                if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = '❗ 網路錯誤或伺服器無回應，請直接撥打 24H 專線訂購：0978-583-699'; }
                cleanup();
            }
        });
    };

    /** 更新頁腳版權年份 */
    const updateCopyrightYear = () => {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear().toString();
    };

    /** 設置動畫滾動顯示 (AOS) */
    const setupAos = () => {
        // ... (邏輯不變)
        const aosElements = document.querySelectorAll('.animate-on-scroll');
        if ('IntersectionObserver' in window && aosElements.length) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => { 
                    if (entry.isIntersecting) { 
                        requestAnimationFrame(() => entry.target.classList.add('is-visible')); 
                        obs.unobserve(entry.target);
                    } 
                });
            }, { 
                root: null, 
                rootMargin: AOS_ROOT_MARGIN,
                threshold: 0.01 
            });
            
            aosElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    requestAnimationFrame(() => el.classList.add('is-visible'));
                } else {
                    observer.observe(el);
                }
            });
        } else {
            aosElements.forEach(el => requestAnimationFrame(() => el.classList.add('is-visible')));
        }
    };


    // ====================================================
    // H. 總初始化 (DOMContentLoaded)
    // ====================================================
    document.addEventListener('DOMContentLoaded', () => {
        
        // 性能優化 - FitText 初始化
        const fitAllTexts = setupFitText(); 

        // RWD 清理函數 (使用閉包訪問 fitAllTexts)
        const handleResizeCleanupInner = () => {
            if (!isMobileView()) closeMainMenu();
            
            // 清理所有菜單的 inline max-height 樣式
            mainNav?.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                const targetLink = dropdown.querySelector('a');
                if(targetLink) targetLink.setAttribute('aria-expanded', 'false');

                const submenu = dropdown.querySelector('.submenu-container, .submenu');
                if (submenu) {
                    submenu.style.removeProperty('max-height');
                    submenu.style.removeProperty('overflow');
                }
            });
            
            // 重新計算所有手風琴或詳細資訊的高度 (優化)
            setTimeout(() => {
                document.querySelectorAll('.accordion-item.active .accordion-content, .plan-card.expanded .plan-details-expanded')
                    .forEach(content => {
                        // 僅在有設置 max-height 且非 0 時重新計算
                        if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                            requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);
                        }
                    });
            }, 100);

            // 重新執行 Fit Text
            fitAllTexts(); 
        };
        
        // 菜單與滾動
        handleHeaderScroll();
        setupRwdMenuToggle();
        setupDesktopA11y();
        setupMobileAccordion();
        
        // 互動組件
        setupAccordion();
        setupSmoothScrolling();
        setupFormSubmission();
        updateCopyrightYear();
        
        // Tab 初始化 (處理 URL Hash)
        initializeTabFromHash();
        
        // 性能優化
        setupLazyLoading();
        
        // 動畫
        setupAos();
        
        // 視窗大小改變監聽
        window.addEventListener('resize', debounce(handleResizeCleanupInner, 150));
    });

})();

