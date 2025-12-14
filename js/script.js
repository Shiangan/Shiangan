/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終精煉整合版 V3.2
 * 修正：FOUC 處理優化、勞保試算邏輯邊界、農曆計算警告強化、RWD/A11Y 焦點管理。
 * ====================================================================
 */

'use strict';

// 建立一個單一的命名空間來儲存所有需要暴露給全域的函式，以避免污染 window 物件
window.SALife = window.SALife || {};

// ====================================================
// Z. 試算機功能 I: 勞保喪葬給付試算
// ====================================================

const LABOR_INSURANCE_MAX_SALARY = 45800; // 法定上限
const LABOR_INSURANCE_MIN_SALARY = 27470; // 法定下限 (依最新規定調整)
const FUNERAL_ALLOWANCE_SURVIVOR = 5; // 有遺屬：5 個月
const FUNERAL_ALLOWANCE_NO_SURVIVOR = 10; // 無遺屬：10 個月

/**
 * 格式化金額函數
 * @param {number} amount - 金額數字
 * @returns {string} - 格式化後的貨幣字串
 */
const formatCurrency = (amount) => {
    return amount.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });
};

/**
 * 勞保喪葬給付試算機：根據平均薪資和遺屬狀況計算並顯示建議金額。
 * @public
 */
window.SALife.calculateLaborInsurance = function() {
    const avgSalaryInput = document.getElementById('avgSalary');
    const hasSurvivorSelect = document.getElementById('hasSurvivor');
    const resultBox = document.getElementById('resultBox');
    
    const avgSalary = parseFloat(avgSalaryInput.value);
    const hasSurvivor = hasSurvivorSelect.value;
    
    // 1. 輸入驗證：處理空值或無效數字
    if (!avgSalaryInput.value || isNaN(avgSalary) || avgSalary <= 0) {
        resultBox.innerHTML = `<p style="color:red;">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 2. V3.2 修正：應用法定薪資上下限進行實際計算
    const finalSalary = Math.min(Math.max(avgSalary, LABOR_INSURANCE_MIN_SALARY), LABOR_INSURANCE_MAX_SALARY);
    
    let allowanceMonths = 0;
    let recommendationText = '';
    
    const salaryAdjustedNote = avgSalary !== finalSalary ? 
        `<p class="warning-note" style="color:#ff8c00; font-size:0.95em;">⚠️ 備註：您的輸入已按法定規定調整至 **${formatCurrency(finalSalary)}** 進行計算。</p>` : '';

    // 3. 根據是否有遺屬計算喪葬津貼和提供建議
    if (hasSurvivor === 'yes') {
        allowanceMonths = FUNERAL_ALLOWANCE_SURVIVOR;
        const funeralAllowance = finalSalary * allowanceMonths;
        const estimatedSurvivorBenefit = finalSalary * 12; // 提醒性質

        recommendationText = `
            ${salaryAdjustedNote}
            <p>✅ **喪葬津貼 (一次金)：** ${allowanceMonths} 個月 (按${formatCurrency(finalSalary)}計算) = **${formatCurrency(funeralAllowance)}**</p>
            <p>⚠️ **遺屬給付提醒：** 預估總金額約 **${formatCurrency(estimatedSurvivorBenefit)}** 或更高 (需依年資詳細計算)。</p>
            <p class="recommendation">您的情況**強烈建議優先評估「遺屬年金」**。總金額通常遠高於喪葬津貼，請立即諮詢專業人士。</p>
        `;

    } else {
        allowanceMonths = FUNERAL_ALLOWANCE_NO_SURVIVOR;
        const funeralAllowance = finalSalary * allowanceMonths;
        
        recommendationText = `
            ${salaryAdjustedNote}
            <p>✅ **您可請領的喪葬津貼：** ${allowanceMonths} 個月 (按${formatCurrency(finalSalary)}計算) = **${formatCurrency(funeralAllowance)}**</p>
            <p class="recommendation">無符合資格的遺屬，您應請領此筆 **${allowanceMonths} 個月**的喪葬津貼。</p>
        `;
    }

    // 4. 顯示結果
    resultBox.innerHTML = recommendationText;
    resultBox.style.display = 'block';
};


// ====================================================
// Z. 試算機功能 II: 對年日期計算 (含閏月邏輯)
// ====================================================

/**
 * 模擬農曆轉換函式：將陽曆字串 (YYYY-MM-DD) 轉換為包含農曆資訊的物件
 * ⚠️【重要聲明】此處為模擬邏輯，實際應用需引入完整的農曆轉換庫！
 * @param {string} solarDateString - 往生當天的陽曆日期字串 (YYYY-MM-DD)
 */
function getLunarDate(solarDateString) {
    const date = new Date(solarDateString.replace(/-/g, '/')); // 修正日期解析兼容性問題
    if (isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 模擬農曆年和閏月判斷 (需依真實農民曆調整)
    const hasLeapMonth = (year === 2024 || year === 2025); 

    return {
        solar: solarDateString,
        lunarYear: year, // 模擬
        lunarMonth: month, // 模擬
        lunarDay: day, // 模擬
        hasLeapMonth: hasLeapMonth, // 模擬該農曆年是否有閏月
        isLeap: false
    };
}

/**
 * 計算對年日期 (農曆滿一年) 並應用閏月提前一個月的習俗邏輯。
 * @param {object} lunarInfo - 往生當天的農曆資訊物件
 */
function calculateDuinian(lunarInfo) {
    const { lunarYear, lunarMonth, lunarDay, hasLeapMonth } = lunarInfo;
    
    let duinianLunarYear = lunarYear + 1;
    let duinianLunarMonth = lunarMonth;
    let duinianLunarDay = lunarDay;
    let note = '';
    
    // 閏月處理邏輯
    if (hasLeapMonth) {
        duinianLunarMonth -= 1;
        
        if (duinianLunarMonth <= 0) {
            duinianLunarMonth += 12; 
            duinianLunarYear -= 1;
        }
        
        note = '<strong>⚠️ 閏月提示 (農曆模擬)：</strong> 治喪年遇閏月，按習俗對年需**提前一個月**完成。此計算已為您應用此邏輯。';
    } else {
        note = '本次對年計算不涉及閏月處理。';
    }

    return {
        lunarOriginal: `${lunarYear} 年 ${lunarMonth} 月 ${lunarDay} 日`,
        lunarDuinian: `${duinianLunarYear} 年 ${duinianLunarMonth} 月 ${duinianLunarDay} 日`,
        note: note
    };
}

/**
 * 前端介面邏輯：設置對年計算器事件監聽 (暴露到 SALife)
 * @public
 */
window.SALife.setupDuinianCalculator = function() {
    const calculateBtn = document.getElementById('calculateDuinian');
    const dateInput = document.getElementById('dateOfDeath');
    const resultOutput = document.getElementById('resultOutput');
    const lunarDateElem = document.getElementById('lunarDate');
    const duinianDateElem = document.getElementById('duinianDate');
    const duinianNoteElem = document.getElementById('duinianNote');

    if (!calculateBtn || !dateInput) return;

    calculateBtn.addEventListener('click', function() {
        const solarDate = dateInput.value;
        
        if (!solarDate) {
            alert('請選擇往生日期。');
            return;
        }
        
        const lunarInfo = getLunarDate(solarDate);

        if (!lunarInfo) {
            alert('日期轉換失敗，請檢查輸入格式。');
            return;
        }
        
        const duinianResult = calculateDuinian(lunarInfo);

        // V3.2 修正：顯示結果並強化警告
        lunarDateElem.innerHTML = `**陽曆：** ${solarDate} → **農曆 (模擬轉換)：** ${duinianResult.lunarOriginal}`;
        duinianDateElem.innerHTML = `**對年日期 (農曆估算)：** ${duinianResult.lunarDuinian}`;
        
        duinianNoteElem.innerHTML = `
            ${duinianResult.note}
            <br>
            <span style="color:#b22222; font-weight:bold;">🚨 重要警告：此為模擬計算，請務必以實際農民曆或諮詢禮儀師為準。</span>
        `;
        duinianNoteElem.classList.remove('hidden');

        resultOutput.classList.remove('hidden');

        // 捲動到結果區塊
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}


// IIFE 啟動核心功能
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
    // 統一的 Tab 名稱對應
    const TAB_MAP = ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']; 
    
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
            
            if (contentElement.style.maxHeight === '0px') {
                contentElement.style.removeProperty('max-height');
                contentElement.style.removeProperty('overflow');
            }
            if (contentElement.style.opacity === '0') {
                 contentElement.style.removeProperty('opacity');
                 contentElement.style.removeProperty('display');
            }

            contentElement.removeEventListener('transitionend', handleTransitionEnd);
        };
        contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
    };


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
    // B. FOUC 處理 (已移至 <head> 內，此處省略，但保留功能註記)
    // ====================================================
    // V3.2: FOUC 處理邏輯已移至 <head> 內的最小化腳本，以確保在 DOM 載入前執行。

    // ====================================================
    // C. Modal 模組 (A11Y 強化與焦點陷阱)
    // ====================================================

    /** 處理 Modal 內的 Tab 鍵盤導航 (焦點陷阱) */
    function handleModalKeydown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            window.SALife.closeModal(e); 
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

            if (e.shiftKey) { 
                if (document.activeElement === first) { last.focus(); e.preventDefault(); }
            } else { 
                if (document.activeElement === last) { first.focus(); e.preventDefault(); }
            }
        }
    }

    /** 開啟 Modal (暴露到 SALife) */
    window.SALife.openModal = function(modalId) {
        const modal = document.getElementById('modal-' + modalId);
        if (modal) {
            focusedElementBeforeModal = document.activeElement;
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

    /** 關閉 Modal (暴露到 SALife) */
    window.SALife.closeModal = function(event) {
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
                // 恢復 Modal 開啟前的焦點
                if (focusedElementBeforeModal) {
                    focusedElementBeforeModal.focus();
                }
            }, TRANSITION_DURATION_MS);
        }
    }
    
    // 全局 ESC 鍵關閉 Modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') { window.SALife.closeModal(event); }
    });
    // 點擊 Modal 外部時關閉
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            window.SALife.closeModal(e);
        }
    });

    // ====================================================
    // D. 導航菜單模組
    // ====================================================

    /** 關閉所有行動裝置子選單 (優化動畫) */
    const closeAllMobileSubmenus = (excludeLi = null) => {
        if (mainNav) {
            Array.from(mainNav.querySelectorAll('li.dropdown.active')).forEach(li => {
                if (li === excludeLi) return;
                
                const submenu = li.querySelector('.submenu-container, .submenu');
                const targetLink = li.querySelector('a');

                if (submenu && targetLink) {
                    li.classList.remove('active');
                    targetLink.setAttribute('aria-expanded', 'false');
                    
                    if (submenu.style.maxHeight !== '0px') {
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`; 
                        submenu.style.overflow = 'hidden';
                        requestAnimationFrame(() => {
                            submenu.style.maxHeight = '0px';
                            onTransitionEndCleanup(submenu);
                        });
                    }
                }
            });
        }
    };

    /** 關閉主菜單 (V3.2 修正焦點管理) */
    const closeMainMenu = () => {
        if (mainNav?.classList.contains('active')) {
            mainNav.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const menuIcon = menuToggle.querySelector('i');
                if (menuIcon) menuIcon.classList.replace('fa-times', 'fa-bars');
                
                // 修正：將焦點返回給 menuToggle
                menuToggle.focus(); 
            }
            body.classList.remove('no-scroll');
            body.classList.remove('menu-open');
            closeAllMobileSubmenus(); 
        }
    };

    /** 處理頁面滾動時 Header 的樣式變化 */
    const handleHeaderScroll = () => {
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

            // 點擊菜單連結後關閉主菜單 (行動裝置視圖下)
            mainNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (isMobileView() && link.hash.length > 0 && link.hash !== '#') {
                        // 給予足夠時間讓瀏覽器處理滾動
                        setTimeout(closeMainMenu, TRANSITION_DURATION_MS + 50); 
                    }
                });
            });
        }
    };

    /** 設置行動裝置菜單手風琴效果 (Accordion) */
    const setupMobileAccordion = () => {
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
                        // 展開
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
                        // 收起
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

    /** 開啟選定的 Tab 並處理錨點滾動 (V3.2 修正 Tabindex/A11Y) */
    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        let tabcontent;
        
        // 隱藏所有內容，重置所有 Tab 按鈕狀態
        tabcontent = document.getElementsByClassName("plan-tab-content");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            const tabElement = document.getElementById("tab-" + tabcontent[i].id.replace('content-', ''));
            if (tabElement) {
                tabElement.classList.remove('active');
                tabElement.setAttribute('aria-selected', 'false');
                // 修正：移除 tabindex，只讓 active tab 可被 Tab 鍵選中 (遵循 ARIA 慣例)
                tabElement.removeAttribute('tabindex'); 
            }
        }
        
        const contentId = "content-" + tabName;
        const tabId = "tab-" + tabName;

        const contentElement = document.getElementById(contentId);
        const tabElement = document.getElementById(tabId);

        if (contentElement) { contentElement.style.display = "block"; }
        if (tabElement) { 
            tabElement.classList.add("active"); 
            tabElement.setAttribute('aria-selected', 'true'); 
            tabElement.setAttribute('tabindex', '0'); // 設置 active Tab 為可聚焦
        }
        
        const headerHeight = header?.offsetHeight || 0;
        
        requestAnimationFrame(() => {
            if (anchorId) {
                const targetElement = document.querySelector(anchorId);
                if (targetElement) {
                    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                    targetElement.focus({ preventScroll: true }); 
                }
            } else {
                const planTabs = document.querySelector('.plan-tabs');
                if (planTabs) {
                    const tabTop = planTabs.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({ top: tabTop, behavior: 'smooth' });
                    tabElement?.focus();
                }
            }
        });
    }

    /** 處理 URL Hash 以決定初始 Tab */
    const initializeTabFromHash = () => {
        let hash = window.location.hash.substring(1); 
        let targetAnchorId = null;
        let defaultTab = 'buddhist-taoist'; 
        if (document.querySelector('#content-comparison')) defaultTab = 'comparison'; 

        if (hash.startsWith('tab-')) {
            const tabName = hash.split('-')[1];
            if (TAB_MAP.includes(tabName)) defaultTab = tabName;
        } 
        else if (hash.startsWith('plan-')) {
            targetAnchorId = '#' + hash;
            const targetElement = document.getElementById(hash);
            const tabContent = targetElement?.closest('.plan-tab-content'); 
            if (tabContent) {
                const tabNameFromContent = tabContent.id.replace('content-', '');
                if (TAB_MAP.includes(tabNameFromContent)) defaultTab = tabNameFromContent;
            }
        }
        else if (TAB_MAP.includes(hash)) {
            defaultTab = hash;
        }
        
        window.SALife.openPlanTab(defaultTab, targetAnchorId);
    };


    // ====================================================
    // F. 互動組件 (Accordion / Details)
    // ====================================================

    /** 設置通用手風琴 (Accordion) 功能 */
    const setupAccordion = () => {
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
            const headerElement = item.querySelector('.accordion-title');
            const content = item.querySelector('.accordion-content');
            if (!headerElement || !content) return;

            // 設置 A11Y 屬性
            const uniqueId = `faq-item-${index}`;
            content.id = `${uniqueId}-content`;
            headerElement.setAttribute('aria-controls', content.id);
            const isActive = item.classList.contains('active');
            headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            headerElement.setAttribute('tabindex', '0');
            headerElement.setAttribute('role', 'button'); 
            
            // 預設樣式處理
            content.style.display = 'block';
            content.style.overflow = 'hidden';
            content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';

            headerElement.addEventListener('click', function () {
                const isCurrentlyActive = item.classList.contains('active');
                
                // 關閉其他已開啟的項目 (摺疊)
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
                    // 展開動畫
                    content.style.maxHeight = '0px';
                    void content.offsetHeight;
                    content.style.overflow = 'hidden';
                    requestAnimationFrame(() => {
                        content.style.maxHeight = `${content.scrollHeight}px`;
                        onTransitionEndCleanup(content);
                    });
                } else {
                    // 收起動畫
                    content.style.overflow = 'hidden';
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    requestAnimationFrame(() => content.style.maxHeight = '0px');
                    onTransitionEndCleanup(content);
                }
            });

            // 鍵盤 Enter/Space 觸發點擊 (A11Y)
            headerElement.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    };

    /** 展開/收起商品詳細資訊 (Plan Details Toggle) (暴露到 SALife) */
    window.SALife.toggleDetails = (button) => {
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
            // 展開
            details.style.maxHeight = '0px';
            void details.offsetHeight;
            details.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                details.style.maxHeight = `${details.scrollHeight}px`;
                onTransitionEndCleanup(details);
            });
        } else {
            // 收起
            details.style.overflow = 'hidden';
            details.style.maxHeight = `${details.scrollHeight}px`;
            requestAnimationFrame(() => details.style.maxHeight = '0px');
            onTransitionEndCleanup(details);
        }
    };


    // ====================================================
    // G. 性能優化與其他工具
    // ====================================================

    /** 設置 Lazy Load 功能 */
    const setupLazyLoading = () => {
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
        const MAX_FONT = 22, MIN_FONT = 8, PRECISION = 0.5; 
        
        const fitOne = (el) => {
            const parentWidth = el.parentElement?.offsetWidth || 0;
            const text = el.textContent?.trim() || '';
            
            if (parentWidth <= 50 || text === '' || !el.parentElement) { 
                el.style.fontSize = `${MAX_FONT}px`; 
                return; 
            }
            
            let low = MIN_FONT, high = MAX_FONT, bestSize = MIN_FONT, iterations = 0;
            while (low <= high && iterations < 30) { 
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
            
            // 使用 ResizeObserver 監聽父容器寬度變化 (高性能)
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
        
        return fitAll; 
    };

    /** 設置平滑滾動到錨點功能 (不包含 Tab 滾動) */
    const setupSmoothScrolling = () => {
        if (!header) return;
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId || '');
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
                    headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate' } 
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
            
            // 重新計算所有手風琴或詳細資訊的高度
            setTimeout(() => {
                document.querySelectorAll('.accordion-item.active .accordion-content, .plan-card.expanded .plan-details-expanded')
                    .forEach(content => {
                        if (content.closest('.accordion-item')?.classList.contains('active') || content.closest('.plan-card')?.classList.contains('expanded')) {
                            requestAnimationFrame(() => {
                                content.style.maxHeight = `${content.scrollHeight}px`;
                                content.style.overflow = 'hidden'; 
                            });
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
        
        // **新功能初始化**：設置對年日期計算器
        window.SALife.setupDuinianCalculator(); 

        // 視窗大小改變監聽 (Debounce 處理性能問題)
        window.addEventListener('resize', debounce(handleResizeCleanupInner, 150));
    });

})(); // IIFE 結束
