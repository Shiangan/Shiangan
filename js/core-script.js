<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>祥安生命 - 禮儀方案與服務報價</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/style.css"> 
    
    <style>
        /* 頁面專用樣式（確保顯示效果） */
        .plan-page-container { max-width: 1200px; margin: 40px auto; padding: 20px; }
        .plan-tabs { display: flex; justify-content: center; margin-bottom: 20px; border-bottom: 2px solid #eee; }
        .plan-tabs button { padding: 15px 25px; cursor: pointer; border: none; background: #f9f9f9; font-size: 18px; transition: all 0.3s; border-radius: 8px 8px 0 0; margin: 0 5px; }
        .plan-tabs button.active { background: #3c5a75; color: white; border-bottom: 2px solid #3c5a75; }
        .plan-tab-content { padding: 20px; border: 1px solid #eee; border-top: none; background: white; }
        
        /* 表格樣式 */
        .service-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px; }
        .service-table th, .service-table td { border: 1px solid #ddd; padding: 12px; text-align: left; vertical-align: top; }
        .service-table th { background-color: #f2f2f2; color: #333; width: 25%; }
        .table-header-group th { background-color: #3c5a75; color: white; text-align: center; }
        
        /* Modal 樣式 (請確保您的 style.css 中包含 modal-overlay 和 modal-content 樣式) */
        .modal-content { max-width: 900px; padding: 0; }
        .modal-content h3 { background: #3c5a75; color: white; padding: 15px; margin: 0; text-align: center; }
    </style>
</head>
<body>

    <header class="site-header"></header>

    <main class="plan-page-container">
        
        <section class="plan-directory">
            <h2 style="text-align: center; color: #3c5a75;">禮儀服務方案與報價總覽</h2>
            
            <div class="plan-tabs">
                <button id="tab-overview" class="active" onclick="window.openPlanTab('overview')">服務總覽</button>
                <button id="tab-united" onclick="window.openPlanTab('united')">聯合奠祭專案</button>
                <button id="tab-fine" onclick="window.openPlanTab('fine')">精緻奠祭專案</button>
                <button id="tab-honor" onclick="window.openPlanTab('honor')">尊榮奠祭專案</button>
                
                <button data-modal-id="reference-quote" onclick="window.openModal('reference-quote')" style="background: #e30a1c; color: white;">
                    <i class="fas fa-eye"></i> 參考報價單 (燈箱)
                </button>
            </div>
        </section>

        <section id="content-overview" class="plan-tab-content" style="display: block;">
            <h3>祥安生命服務比較</h3>
            <p>選擇祥安生命有限公司，不讓家人走冤枉路。</p>
            <table class="service-table">
                <colgroup>
                    <col style="width: 20%;">
                    <col style="width: 25%;">
                    <col style="width: 27%;">
                    <col style="width: 28%;">
                </colgroup>
                <thead>
                    <tr>
                        <th></th>
                        <th>祥安生命有限公司 (禮儀服務)</th>
                        <th>其它業者</th>
                        <th>集團公司</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>牌位暨靈堂</th>
                        <td>北台灣各區會館靈堂</td>
                        <td>殯儀館附設簡陋安靈區 (使用會館牌位堂費需另計)</td>
                        <td>殯儀館附設簡陋安靈區 (使用會館牌位堂費需另計)</td>
                    </tr>
                    <tr>
                        <th>禮儀師事</th>
                        <td>頭七、滿七 (契約內含)</td>
                        <td>無 (費用需另計)</td>
                        <td>無 (費用需另計)</td>
                    </tr>
                    <tr>
                        <th>佛事祭品</th>
                        <td>契約內含</td>
                        <td>家屬自行準備 (由業者準備費用需另計)</td>
                        <td>家屬自行準備 (由業者準備費用需另計)</td>
                    </tr>
                    <tr>
                        <th>商品差異化 (會場佈置)</th>
                        <td>會場達像以 1:1 人型立體輸出，增加追思會場佈置氛圍</td>
                        <td>15 吋遺像</td>
                        <td>15 吋遺像</td>
                    </tr>
                    <tr>
                        <th>商品差異化 (契約價格)</th>
                        <td>較人性化如未使用，可視需求彈性調整或是更換同等值之項目</td>
                        <td>預業者漫天開價，隨意增加金額無保障</td>
                        <td>禮儀師薪水採獎金制度，會要求家屬增加相關禮儀用品項目，造成家屬負擔。</td>
                    </tr>
                    <tr>
                        <th>優惠內容</th>
                        <td>預約簽約享折價優惠</td>
                        <td>無</td>
                        <td>無</td>
                    </tr>
                    <tr>
                        <th>骨灰罐</th>
                        <td>玉石等級骨灰罐</td>
                        <td>黑花崗</td>
                        <td>黑花崗</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section id="content-united" class="plan-tab-content" style="display: none;">
            <h3>聯合奠祭專案 - 參萬伍仟元整</h3>
            <table class="service-table">
                <thead>
                    <tr class="table-header-group">
                        <th colspan="2">服務項目</th>
                        <th>內容</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th rowspan="2">遺體服務</th>
                        <td>接體服務</td>
                        <td>24 小時禮儀接體專線：0800-889-258，禮儀師、接體員、禮儀專車接體，並提供 24 小時無休禮儀服務。</td>
                    </tr>
                    <tr>
                        <td>服務時間</td>
                        <td>24 小時服務專線：0978-583-699。</td>
                    </tr>
                    <tr>
                        <th rowspan="4">殮容</th>
                        <td>遺體服務</td>
                        <td>* 四小時標準淨身、穿著壽衣、化妝、入殮、靈堂佈置 (依政府規定)、棺木 (20 公尺)、靈車接送 (20 公里內)。</td>
                    </tr>
                    <tr>
                        <td>服務項目</td>
                        <td>* 靈堂會場 (佈置、擺設、燈光、音響、桌椅)、禮儀用品 (佛珠、壽衣、往生被)、棺木 (木材)。</td>
                    </tr>
                    <tr>
                        <td>遺體清洗、穿著壽衣</td>
                        <td>* 棺木 (依政府規定)、骨灰罐 (依契約內容)、相片 (12 吋、放大)、鮮花 (依政府規定)。</td>
                    </tr>
                    <tr>
                        <td>專業禮儀師服務</td>
                        <td>* 代辦手續、告別式用品、訃聞 (依政府規定)、專業花藝師設計、專業司儀主持。</td>
                    </tr>
                    <tr>
                        <th rowspan="3">告別儀式</th>
                        <td>告別式佈置 (聯合)</td>
                        <td>* 禮堂佈置 (依政府規定)、花藝佈置 (依政府規定)、電子輓聯 (依政府規定)、禮儀用品 (依政府規定)。</td>
                    </tr>
                    <tr>
                        <td>專業司儀服務</td>
                        <td>* 專業司儀主持告別式、告別式流程規劃。</td>
                    </tr>
                    <tr>
                        <td>火化</td>
                        <td>* 火化費用 (依政府規定)、骨灰罐 (依契約內容)。</td>
                    </tr>
                    <tr>
                        <th>後續關懷</th>
                        <td>後續關懷服務</td>
                        <td>* 辦理後續服務 (百日、對年、合爐)、提供生命教育諮詢、提供相關法律諮詢。</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section id="content-fine" class="plan-tab-content" style="display: none;">
            <h3>精緻奠祭專案 - 壹拾萬陸仟元整</h3>
            <table class="service-table">
                <thead>
                    <tr class="table-header-group">
                        <th colspan="2">服務項目</th>
                        <th>內容</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th rowspan="2">臨終諮詢</th>
                        <td>臨終關懷服務</td>
                        <td>24 小時專業服務，協助家屬處理後續事宜。</td>
                    </tr>
                    <tr>
                        <td>接體安置</td>
                        <td>接體、安置、靈堂佈置 (依契約內容)。</td>
                    </tr>
                    <tr>
                        <th rowspan="3">殮儀服飾</th>
                        <td>專業化妝、壽衣</td>
                        <td>遺體美容、化妝、穿著壽衣 (依契約內容)。</td>
                    </tr>
                    <tr>
                        <td>棺木、骨灰罐</td>
                        <td>高級棺木 (依契約內容)、玉石骨灰罐 (依契約內容)。</td>
                    </tr>
                    <tr>
                        <td>會場佈置</td>
                        <td>單一會場佈置，花藝設計 (依契約內容)。</td>
                    </tr>
                    <tr>
                        <th>法事功德</th>
                        <td>誦經超度</td>
                        <td>二七、三七誦經法事、四七、五七誦經法事、六七、七七誦經法事。</td>
                    </tr>
                    <tr>
                        <th>後續關懷</th>
                        <td>關懷服務</td>
                        <td>協助後續法事、提供法律諮詢。</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section id="content-honor" class="plan-tab-content" style="display: none;">
            <h3>尊榮奠祭專案 - 壹拾陸萬捌仟元整</h3>
            <table class="service-table">
                <thead>
                    <tr class="table-header-group">
                        <th colspan="3">服務項目與內容</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th rowspan="5" style="width: 15%;">臨終洽談</th>
                        <td style="width: 20%;">接體安置</td>
                        <td>24 小時服務，專業禮儀師協助家屬處理後事。</td>
                    </tr>
                    <tr>
                        <td>會場佈置</td>
                        <td>豪華單一會場佈置，專業花藝設計 (依契約內容)。</td>
                    </tr>
                    <tr>
                        <td>棺木/骨灰罐</td>
                        <td>高級棺木 (依契約內容)、玉石骨灰罐 (依契約內容)。</td>
                    </tr>
                    <tr>
                        <td>佛事祭品</td>
                        <td>契約內含。</td>
                    </tr>
                    <tr>
                        <td>遺體美容</td>
                        <td>專業美容、化妝、穿著壽衣。</td>
                    </tr>
                    <tr>
                        <th rowspan="3">法事功德</th>
                        <td>二七、三七誦經法事</td>
                        <td>地藏經、佛說阿彌陀經、藥師經 (擇一)。</td>
                    </tr>
                    <tr>
                        <td>四七、五七誦經法事</td>
                        <td>金剛經、心經、大悲咒 (擇一)。</td>
                    </tr>
                    <tr>
                        <td>六七、七七誦經法事</td>
                        <td>地藏經、佛說阿彌陀經、藥師經 (擇一)。</td>
                    </tr>
                    <tr>
                        <th>法會儀軌</th>
                        <td>圓滿法事</td>
                        <td>專業師父主持，圓滿所有法事儀軌。</td>
                    </tr>
                    <tr>
                        <th>後續關懷</th>
                        <td>後續服務</td>
                        <td>提供對年、合爐、百日等後續關懷與諮詢服務。</td>
                    </tr>
                </tbody>
            </table>
        </section>

    </main>
    
    <div id="modal-reference-quote" class="modal-overlay" aria-hidden="true" role="dialog" tabindex="-1">
        <div class="modal-content">
            <button class="close-btn" onclick="window.closeModal(event)" aria-label="關閉報價單視窗">
                <i class="fas fa-times"></i>
            </button>
            <h3>參考報價單 - 福祿壽禮儀服務流程與費用</h3>
            <div style="padding: 20px;">
                <p style="text-align: center; color: #e30a1c;">以下為市場參考報價，僅供比較參考，實際服務內容與費用請以祥安生命契約為準。</p>
                <table class="service-table" style="font-size: 14px;">
                    <thead>
                        <tr class="table-header-group">
                            <th colspan="4">福祿壽契約 - 中式契約/服務流程</th>
                        </tr>
                        <tr>
                            <th style="width: 15%;">項目分類</th>
                            <th style="width: 15%;">服務項目</th>
                            <th style="width: 50%;">內容</th>
                            <th style="width: 20%;">價格 (參考值)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th rowspan="2">禮儀接體</th>
                            <td>臨終關懷</td>
                            <td>1 式：提供臨終、臨終、後事處理等相關諮詢</td>
                            <td>$ 1,500</td>
                        </tr>
                        <tr>
                            <td>接體服務</td>
                            <td>1 輛：專業接體人員、接體專車、服務於合法設置地點</td>
                            <td>$ 1,500 ~ $ 2,500</td>
                        </tr>
                        <tr>
                            <th rowspan="3">安置</th>
                            <td>靈位引魂</td>
                            <td>2 名：關渡、將牌、引魂、靈堂佈置</td>
                            <td>$ 2,500</td>
                        </tr>
                        <tr>
                            <td>安靈用品</td>
                            <td>1 組：日式牌位、引魂旛、魂竹、香爐、供桌、蓮燈、孝誌</td>
                            <td>$ 2,000 ~ $ 3,000</td>
                        </tr>
                        <tr>
                            <td>遺體冰存</td>
                            <td>1 具：冰存 15 小時/日、靈柩棺木</td>
                            <td>$ 1,300</td>
                        </tr>
                        <tr>
                            <th rowspan="4">佛事</th>
                            <td>做七</td>
                            <td>1 式：頭七、滿七、法事</td>
                            <td>$ 3,000</td>
                        </tr>
                        <tr>
                            <td>牌位/塔位</td>
                            <td>1 式：牌位、塔位、安奉</td>
                            <td>$ 2,000</td>
                        </tr>
                        <tr>
                            <td>誦經法師</td>
                            <td>1 式：誦經超度 (依契約內容)</td>
                            <td>$ 1,300 ~ $ 2,500</td>
                        </tr>
                        <tr>
                            <td>祭祀用品</td>
                            <td>1 組：契約內含</td>
                            <td>$ 1,000 ~ $ 2,000</td>
                        </tr>
                        <tr>
                            <th rowspan="4">奠禮用品</th>
                            <td>遺體處理</td>
                            <td>1 式：淨身、穿衣、化妝</td>
                            <td>$ 6,000</td>
                        </tr>
                        <tr>
                            <td>棺木</td>
                            <td>1 具：依契約等級</td>
                            <td>$ 12,000 ~ $ 20,000</td>
                        </tr>
                        <tr>
                            <td>骨灰罐</td>
                            <td>1 個：依契約等級</td>
                            <td>$ 4,000 ~ $ 15,000</td>
                        </tr>
                        <tr>
                            <td>禮儀師</td>
                            <td>1 名：全程規劃與服務</td>
                            <td>$ 8,000 ~ $ 15,000</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <footer class="site-footer">
        <span id="current-year"></span> © 祥安生命 All Rights Reserved.
    </footer>

    <script src="js/core-script.js"></script> 
    
    <script>
        // 確保 initializeTabFromHash 被呼叫
        document.addEventListener('DOMContentLoaded', () => {
            // 由於核心腳本已包含所有初始化邏輯，這裡不需要額外呼叫。
            // 確保您的 core-script.js 路徑正確。
            
            // 預設啟動服務總覽 Tab
            if (window.openPlanTab) {
                 window.openPlanTab('overview');
            }
        });
    </script>

</body>
</html>
