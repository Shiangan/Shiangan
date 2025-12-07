/**
 * ====================================================
 * 程式夥伴 - 網站核心互動腳本 (V14.0 最終整合與優化版)
 * 確保所有頁面功能 (導航、手風琴、滾動) 及文章功能 (TOC 高亮) 完整且高效。
 * 採 ES6 最佳實踐、優化效能、全面 A11y 支援。
 * ====================================================
 */

document.addEventListener('DOMContentLoaded', initApp);

// 通用配置常量
const MOBILE_BREAKPOINT = 900; // 與 CSS 斷點同步
const SCROLL_OFFSET_BUFFER = 10; // 平滑滾動的額外緩衝距離

/**
 * ----------------------------------------------------
 * 核心應用程式初始化
 * ----------------------------------------------------
 */
function initApp() {
    // 獲取通用元素 (使用 const 鎖定，提升可讀性)
    const header = document.querySelector('header');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const dropdowns = document.querySelectorAll('#main-nav .dropdown');
    
    // --- 初始化所有模組 ---
    initNavigation(header, menuToggle, mainNav, dropdowns);
    initAccordion();
    initSmoothScroll(header, mainNav, menuToggle); // 傳遞相關元素用於交互
    initArticleTOC(header);
    
    // 監聽視窗大小變化，用於重置桌面/手機模式下的導航狀態
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            resetMobileNav(mainNav, menuToggle);
        }
    }, 150));
}

/**
 * ----------------------------------------------------
 * 輔助函數：Debounce 去抖 (用於 resize 等頻繁事件)
 * ----------------------------------------------------
 */
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

/**
 * ----------------------------------------------------
 * 1. 導航功能 (Header Navigation) 模組
 * ----------------------------------------------------
 */
function initNavigation(header, menuToggle, mainNav, dropdowns) {
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => toggleMobileMenu(mainNav, menuToggle));
    }

    // 初始化下拉選單事件
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        if (!dropdownLink) return;

        // --- 手機子選單（手風琴邏輯）---
        dropdownLink.addEventListener('click', (e) => handleMobileDropdown(e, dropdown, dropdowns));
        
        // --- 桌面下拉選單的鍵盤 A11Y 處理 ---
        // 使用 mouseenter/mouseleave 結合 focusin/focusout 確保良好的桌面體驗
        dropdown.addEventListener('mouseenter', () => dropdown.classList.add('active'));
        dropdown.addEventListener('mouseleave', () => dropdown.classList.remove('active'));
        
        dropdown.addEventListener('focusin', () => dropdown.classList.add('active'));
        dropdown.addEventListener('focusout', () => {
            // 延遲檢查，確保焦點確實移出了整個 dropdown 容器
            setTimeout(() => {
                if (!dropdown.contains(document.activeElement)) {
                    dropdown.classList.remove('active');
                }
            }, 0);
        });
    });

    // 處理 Header 滾動透明度/變色/陰影 (提升滾動體驗)
    if (header) {
        window.addEventListener('scroll', throttle(() => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, 100));
    }
}

/** * 輔助函數：Throttle 節流 (用於 scroll 等頻繁事件) 
 */
const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};


/**
 * 處理手機選單開合
 */
function toggleMobileMenu(mainNav, menuToggle) {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    const newState = !isExpanded;

    mainNav.classList.toggle('active', newState);
    menuToggle.setAttribute('aria-expanded', newState);
    document.body.classList.toggle('no-scroll', newState); 
    
    // 確保 Tab 鍵導航只在開啟時有效
    document.querySelectorAll('#main-nav a, #main-nav button').forEach(el => {
        el.setAttribute('tabindex', newState ? '0' : '-1');
    });
}

/**
 * 處理手機模式下的下拉選單 (轉為手風琴)
 */
function handleMobileDropdown(e, currentDropdown, allDropdowns) {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
        e.preventDefault(); // 阻止連結跳轉
        
        const wasActive = currentDropdown.classList.contains('active');
        const newState = !wasActive;

        // 關閉所有其他開啟的手機子選單 (確保手風琴效果)
        allDropdowns.forEach(otherDropdown => {
            if (otherDropdown !== currentDropdown && otherDropdown.classList.contains('active')) {
                otherDropdown.classList.remove('active');
                otherDropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');
            }
        });

        // 切換當前 dropdown 的 active 狀態
        currentDropdown.classList.toggle('active', newState);
        currentDropdown.querySelector('a').setAttribute('aria-expanded', newState);
    }
}

/**
 * 輔助函數：重置手機導航狀態
 */
function resetMobileNav(mainNav, menuToggle) {
     if (mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        document.body.classList.remove('no-scroll');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    // 確保桌面模式下所有連結可訪問
    document.querySelectorAll('#main-nav a, #main-nav button').forEach(el => {
        el.setAttribute('tabindex', '0');
    });
}


/**
 * ----------------------------------------------------
 * 2. 泛用型手風琴功能 (Universal Accordion) 模組
 * ----------------------------------------------------
 */
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        const item = header.closest('.accordion-item');
        const content = item?.querySelector('.accordion-content');
        if (!content) return;

        const isInitiallyActive = item.classList.contains('active');

        // 初始化 ARIA 屬性
        header.setAttribute('aria-expanded', isInitiallyActive);
        content.setAttribute('aria-hidden', !isInitiallyActive);
        content.id = content.id || `accordion-content-${Math.random().toString(36).substring(2, 9)}`;
        header.setAttribute('aria-controls', content.id);

        header.addEventListener('click', handleAccordionToggle);
    });
}

/**
 * 處理手風琴開合邏輯
 */
function handleAccordionToggle(e) {
    const header = e.currentTarget;
    const item = header.closest('.accordion-item');
    const content = item.querySelector('.accordion-content');
    const isActive = item.classList.contains('active');
    const newState = !isActive;

    // 關閉所有其他開啟的手風琴 (保持單一開啟狀態)
    document.querySelectorAll('.accordion-item.active').forEach(openItem => {
        if (openItem !== item) {
            openItem.classList.remove('active');
            const openHeader = openItem.querySelector('.accordion-header');
            const openContent = openItem.querySelector('.accordion-content');
            openHeader.setAttribute('aria-expanded', 'false');
            openContent.setAttribute('aria-hidden', 'true');
        }
    });

    // 切換當前手風琴的狀態和 ARIA 屬性
    item.classList.toggle('active', newState);
    header.setAttribute('aria-expanded', newState);
    content.setAttribute('aria-hidden', !newState);
    
    // 讓內容平滑展開/收起
    // content.style.maxHeight = newState ? `${content.scrollHeight}px` : null; // 需要 CSS 配合
}


/**
 * ----------------------------------------------------
 * 3. 平滑滾動至目標 (Smooth Scroll) 模組
 * ----------------------------------------------------
 */
function initSmoothScroll(header, mainNav, menuToggle) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href.length <= 1) return; // 排除無效的 #

        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // 1. 關閉手機選單 (如果開啟)
                if (mainNav?.classList.contains('active')) {
                     // 避免直接調用 toggleMobileMenu，因為我們只想要關閉
                    mainNav.classList.remove('active');
                    menuToggle?.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('no-scroll');
                }
                
                // 2. 計算滾動位置
                const headerHeight = header ? header.offsetHeight : 0;
                // 使用 requestAnimationFrame 確保在下次重繪時進行滾動，避免抖動
                window.requestAnimationFrame(() => {
                    const targetPosition = targetElement.offsetTop - headerHeight - SCROLL_OFFSET_BUFFER;
    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // 3. 更新 URL Hash (確保回退按鈕正常，並觸發 :target CSS)
                    history.pushState(null, '', href);
                    // 4. 對目標元素設定焦點，提高 A11y
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                });
            }
        });
    });
}


/**
 * ----------------------------------------------------
 * 4. 文章頁面：目錄 (TOC) 自動高亮顯示 模組
 * ----------------------------------------------------
 */
function initArticleTOC(header) {
    const articleBody = document.querySelector('.article-body');
    const tocLinks = document.querySelectorAll('.table-of-contents a');

    if (!articleBody || tocLinks.length === 0) return;

    // 收集所有文章內部的 H2 標題元素
    const headings = Array.from(articleBody.querySelectorAll('h2, h3')); // 納入 H3 讓 TOC 更細緻
    
    const getHeaderHeight = () => header ? header.offsetHeight : 0;
    
    // =======================================================
    // 使用 Intersection Observer API 進行高性能滾動監聽
    // =======================================================
    
    // 設定 Observer 選項：觸發點在固定 Header 的下方 (HeaderHeight + 20px)
    const observerOptions = {
        root: null, // 視窗為根元素
        // rootMargin 必須動態計算，但 Intersection Observer 的 margin 不支援函式調用
        // 所以我們改為在 callback 內計算 rect 偏移，並使用較保守的 margin
        rootMargin: `-10% 0px -80% 0px`, // 頂部 10% 進入/離開，底部 80% 進入/離開
        threshold: [0, 1.0] // 觀察 0% 和 100%
    };
    
    // 建立 ID 對應，確保所有標題都有 ID 且格式正確
    headings.forEach(heading => {
        if (!heading.id) {
            // 穩定的 ID 生成：移除數字/符號，轉小寫，用'-'連接
            heading.id = heading.textContent
                                .replace(/^[\u0030-\u0039\s\.\-—–]+/, '') 
                                .trim()
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, '') // 移除特殊字元
                                .replace(/\s+/g, '-'); 
        }
    });

    const observer = new IntersectionObserver(debounce(entries => {
        let currentActiveId = null;
        let activeHeading = null;
        const headerHeight = getHeaderHeight();

        // 1. 找到第一個頂部被越過（或正好進入觀察區）的標題
        //    遍歷所有標題，尋找最靠近頂部且頂部位置已越過 Header 的標題
        for (let i = 0; i < headings.length; i++) {
            const rect = headings[i].getBoundingClientRect();
            // 條件：標題的頂部位置 (rect.top) 已經在 Header 下方（即 <= HeaderHeight + buffer）
            // +20 是給予緩衝區
            if (rect.top <= headerHeight + 20) {
                activeHeading = headings[i];
                currentActiveId = headings[i].id;
            } else {
                // 由於標題是順序排列的，一旦發現第一個未越過的標題，就可以停止
                break;
            }
        }

        // 2. 處理活躍狀態的切換
        tocLinks.forEach(link => {
            link.classList.remove('active');
            const targetId = link.getAttribute('href').substring(1);
            
            if (currentActiveId && targetId === currentActiveId) {
                link.classList.add('active');
                
                // 優化：滾動 TOC 容器，確保活躍連結可見
                link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
        
        // 3. 處理頁面在極頂部的情況 (高亮第一個連結)
        if (!currentActiveId && window.scrollY < headerHeight * 1.5 && tocLinks.length > 0) {
             tocLinks[0].classList.add('active');
        }

    }, 50), observerOptions); // 增加 debounce 避免頻繁觸發

    // 開始觀察所有標題
    headings.forEach(heading => observer.observe(heading));
}
