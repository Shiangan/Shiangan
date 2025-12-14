/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終精煉整合版 V2.0
 * 整合功能：Modal A11Y/焦點陷阱、Tab 切換/錨點、RWD 菜單手風琴、通用 Accordion、
 * 性能優化 (Lazy Load/Fit Text/AOS)、表單處理、RWD 清理。
 * * ❗ 新增：勞保試算機功能 (calculateLaborInsurance)
 * ====================================================================
 */

'use strict';

// ====================================================
// Z. 試算機功能 (暴露到全域供 HTML 呼叫)
// ====================================================

/**
 * 勞保喪葬給付試算機：根據平均薪資和遺屬狀況計算並顯示建議金額。
 * (此函數需暴露於 window 供 HTML 元素的 onclick 屬性呼叫)
 */
function calculateLaborInsurance() {
    const avgSalaryInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor').value;
    const resultBox = document.getElementById('resultBox');
    
    // 取得輸入值並轉換為數字
    const avgSalary = parseFloat(avgSalaryInput.value);
    
    // 1. 輸入驗證：確保是有效數字，並符合投保薪資上限 (目前為 45800)
    if (isNaN(avgSalary) || avgSalary <= 0 || avgSalary > 45800) {
        resultBox.innerHTML = '<p style="color:red;">請輸入有效的平均月投保薪資 (上限為 45,800 元)。</p>';
        resultBox.style.display = 'block';
        return; // 驗證失敗，停止執行
    }

    let funeralAllowance = 0; 
    let recommendationText = '';
    
    // 格式化金額函數
    const formatCurrency = (amount) => {
        // 使用 toLocaleString 確保數字有千分位分隔符號，並帶有貨幣符號
        return amount.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });
    };

    // 2. 根據是否有遺屬計算喪葬津貼和提供建議
    if (hasSurvivor === 'yes') {
        // A. 有遺屬：喪葬津貼為 5 個月
        funeralAllowance = avgSalary * 5;
        
        // B. 遺屬給付預估 (僅為提醒性質的簡化預估：通常遺屬年金總額會遠高於一次性給付，這裡用 12 個月薪資作為最低參考值)
        const estimatedSurvivorBenefit = avgSalary * 12; 

        recommendationText = `
            <p>✅ **喪葬津貼 (一次金)：** ${formatCurrency(funeralAllowance)}</p>
            <p>⚠️ **遺屬給付 (年金/一次金)：** 預估總金額約 **${formatCurrency(estimatedSurvivorBenefit)}** 或更高 (需詳細計算)。</p>
            <p class="recommendation">您的情況**強烈建議優先評估遺屬年金！**總金額通常遠高於喪葬津貼，請立即諮詢專業人士。</p>
        `;

    } else {
        // C. 無遺屬：喪葬津貼為 10 個月
        funeralAllowance = avgSalary * 10;
        
        recommendationText = `
            <p>✅ **您可請領的喪葬津貼：** ${formatCurrency(funeralAllowance)}</p>
            <p class="recommendation">無符合資格的遺屬，您應請領此筆 **10 個月**的喪葬津貼。</p>
        `;
    }

    // 3. 顯示結果
    resultBox.innerHTML = recommendationText;
    resultBox.style.display = 'block';
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

})(); // IIFE 結束
