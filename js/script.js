/**
 * ====================================================
 * 程式夥伴 - 網站核心互動腳本 (V13.2 最終整合版)
 * 確保所有頁面功能 (導航、手風琴、滾動) 及文章功能 (TOC 高亮) 完整且高效。
 * ====================================================
 */

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // 獲取通用元素
    const header = document.querySelector('header');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const dropdowns = document.querySelectorAll('#main-nav .dropdown');
    
    // ----------------------------------------------------
    // 1. 導航功能 (Header Navigation) 
    // ----------------------------------------------------
    
    // --- 1a. 手機選單開合 (Hamburger Menu) ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    function toggleMobileMenu() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;

        // 導航、按鈕、滾動狀態同步
        mainNav.classList.toggle('active', newState);
        menuToggle.setAttribute('aria-expanded', newState);
        document.body.classList.toggle('no-scroll', newState); 
    }

    // --- 1b. 手機子選單（下拉選單轉為手風琴）---
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        const submenu = dropdown.querySelector('.submenu');

        if (dropdownLink && submenu) {
            
            // 監聽父連結點擊事件
            dropdownLink.addEventListener('click', (e) => {
                // 檢查是否為手機模式 (與 CSS 中的 900px 斷點同步)
                if (window.innerWidth <= 900) {
                    e.preventDefault(); // 阻止連結跳轉
                    
                    const wasActive = dropdown.classList.contains('active');

                    // 關閉所有其他開啟的手機子選單
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                            otherDropdown.classList.remove('active');
                            otherDropdown.querySelector('a').setAttribute('aria-expanded', 'false');
                        }
                    });

                    // 切換當前 dropdown 的 active 狀態
                    dropdown.classList.toggle('active', !wasActive);
                    dropdownLink.setAttribute('aria-expanded', !wasActive);
                }
            });
            
            // --- 1c. 桌面下拉選單的鍵盤 A11Y 處理 ---
            if (window.innerWidth > 900) {
                dropdown.addEventListener('focusin', () => dropdown.classList.add('focus-within'));
                dropdown.addEventListener('focusout', () => {
                    // 使用 setTimeout 確保焦點確實移出了整個 dropdown 容器
                    setTimeout(() => {
                        if (!dropdown.contains(document.activeElement)) {
                            dropdown.classList.remove('focus-within');
                        }
                    }, 0);
                });
            }
        }
    });

    // ----------------------------------------------------
    // 2. 泛用型手風琴功能 (Universal Accordion) 
    // ----------------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        const content = header.nextElementSibling;
        
        // 初始化 ARIA 屬性
        header.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        
        header.addEventListener('click', handleAccordionToggle);
    });

    function handleAccordionToggle(e) {
        const header = e.currentTarget;
        const item = header.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isActive = item.classList.contains('active');
        const newState = !isActive;

        // 關閉所有其他開啟的手風琴
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
    }


    // ----------------------------------------------------
    // 3. 平滑滾動至目標 (Smooth Scroll)
    // ----------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // 排除單純的 #
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // 考慮固定 Header 的高度，並新增 10px 緩衝
                const headerHeight = header ? header.offsetHeight : 70;
                const targetPosition = targetElement.offsetTop - headerHeight - 10;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 滾動完成後，如果手機選單開啟則關閉
                if (mainNav && mainNav.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });


    // ----------------------------------------------------
    // 4. 文章頁面：目錄 (TOC) 自動高亮顯示
    // ----------------------------------------------------
    const articleBody = document.querySelector('.article-body');
    const tocLinks = document.querySelectorAll('.table-of-contents a');

    if (articleBody && tocLinks.length > 0) {
        
        // 收集所有文章內部的 H2 標題元素 (通常是 TOC 目標)
        const headings = articleBody.querySelectorAll('h2');
        
        // 計算 Header 高度，用於設定 Intersection Observer 的觸發位置
        const headerHeight = header ? header.offsetHeight : 70;
        
        // 設定 Observer 選項：觸發點在固定 Header 的下方 (HeaderHeight + 20px)
        const observerOptions = {
            root: null, // 視窗為根元素
            rootMargin: `-${headerHeight + 20}px 0px 0px 0px`, 
            threshold: 0 // 讓標題一進入觸發區即觸發
        };

        const observer = new IntersectionObserver((entries) => {
            let currentActiveId = null;

            // 尋找第一個 "離開" 頂部 (向上滾動越過) 的標題
            // 或第一個 "進入" 頂部邊界 (向下滾動進入) 的標題
            entries.forEach(entry => {
                // 如果元素向上滾動離開頂部 (isIntersecting=false, boundingClientRect.top < 0)
                // 或者元素進入視窗頂部邊界 (isIntersecting=true)
                if (entry.isIntersecting) {
                    currentActiveId = entry.target.id;
                }
            });
            
            // 優化：處理同時多個標題交集或滾動過快的情況
            if (!currentActiveId) {
                // 尋找目前最靠近頂部的元素 (若 Intersection Observer 判斷失效)
                 for (let i = 0; i < headings.length; i++) {
                    const rect = headings[i].getBoundingClientRect();
                    // 只要標題頂部在 Header 下方，就視為當前活動
                    if (rect.top <= headerHeight + 5) {
                        currentActiveId = headings[i].id;
                    }
                }
            }


            // 處理活躍狀態的切換
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (currentActiveId && link.getAttribute('href') === `#${currentActiveId}`) {
                    link.classList.add('active');
                }
            });
            
             // 處理頁面在頂部或沒有任何標題在觀察區的情況
            if (!currentActiveId && window.scrollY < headerHeight * 1.5 && tocLinks.length > 0) {
                 tocLinks[0].classList.add('active');
            }

        }, observerOptions);

        // 開始觀察所有 H2 標題
        headings.forEach(heading => {
            // 確保所有 H2 都有 ID
            if (!heading.id) {
                // 使用 Unicode 數字移除符號 (如 "1. 標題" 中的 "1.")
                heading.id = heading.textContent.replace(/^[\u0030-\u0039\s\.\-—–]+/, '') // 移除前置數字/符號
                                               .trim()
                                               .toLowerCase()
                                               .replace(/\s+/g, '-'); // 用 - 取代空格
            }
            observer.observe(heading);
        });
    }

}
