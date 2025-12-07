/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V14.5 最終質感精修版)
   功能涵蓋：
   1. Header/導航 (Sticky, Scroll Class, RWD Toggle)
   2. 桌面 Dropdown A11Y (focus-within)
   3. 手機手風琴選單 (Mobile Accordion Nav)
   4. 核心組件互動 (通用 Accordion, 圖片 Lazy Load)
   5. SEO/性能 (平滑滾動)
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================

    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    
    // 監聽滾動事件：Header 變化
    function handleScroll() {
        // 使用 window.scrollY > 0 判斷，比 document.documentElement.scrollTop 更可靠
        if (window.scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // 首次執行一次，確保頁面載入時 Header 狀態正確
    handleScroll(); 
    window.addEventListener('scroll', handleScroll, { passive: true }); // 使用 passive: true 優化滾動性能

    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================

    menuToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
        
        // 菜單開關邏輯
        this.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
        body.classList.toggle('no-scroll');
        
        // 如果菜單被關閉，確保所有手機子菜單也關閉
        if (!isExpanded) {
            closeAllMobileSubmenus(); 
        } else {
             // 關閉時清空所有 active 狀態，確保下次展開是乾淨的
             document.querySelectorAll('.dropdown.active').forEach(dd => dd.classList.remove('active'));
        }
    });
    
    // ====================================================
    // 3. 桌面 Dropdown A11Y (Focus-Within 模擬 Hover)
    // 確保鍵盤使用者也能正確使用下拉選單
    // ====================================================
    
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        // 鍵盤 Tab 進入 Dropdown 範圍時，添加 focus-within 類
        dropdown.addEventListener('focusin', function() {
            if (window.innerWidth > 900) {
                 this.classList.add('focus-within');
            }
        });
        
        // 鍵盤 Tab 離開 Dropdown 範圍時，移除 focus-within 類
        dropdown.addEventListener('focusout', function(e) {
            // 使用 setTimeout 確保在新的 focusin 事件發生後再執行移除，避免閃爍
            setTimeout(() => {
                if (window.innerWidth > 900 && !this.contains(document.activeElement)) {
                    this.classList.remove('focus-within');
                }
            }, 10);
        });
    });


    // ====================================================
    // 4. 手機導航手風琴選單 (Mobile Navigation Accordion)
    // 使用事件委託來監聽點擊，提高性能
    // ====================================================

    function closeAllMobileSubmenus() {
        document.querySelectorAll('#main-nav ul li.dropdown.active').forEach(li => {
            li.classList.remove('active');
        });
    }

    mainNav.addEventListener('click', function(e) {
        // 僅在手機模式 (CSS media query) 下生效
        if (window.innerWidth <= 900) { 
            let targetLink = e.target.closest('#main-nav ul li.dropdown > a');

            if (targetLink) {
                e.preventDefault(); // 阻止連結跳轉，等待手風琴展開
                
                const parentLi = targetLink.closest('li.dropdown');
                
                if (parentLi.classList.contains('active')) {
                    // 如果已展開，則關閉
                    parentLi.classList.remove('active');
                } else {
                    // 關閉所有其他已展開的子菜單
                    closeAllMobileSubmenus(); 
                    // 展開當前子菜單
                    parentLi.classList.add('active');
                }
            }
        }
    });

    // ====================================================
    // 5. 通用手風琴 (Accordion Component Logic)
    // ====================================================
    
    const accordionContainer = document.querySelector('.accordion-container');
    
    if (accordionContainer) {
        accordionContainer.addEventListener('click', function(e) {
            const header = e.target.closest('.accordion-header');
            
            if (header) {
                const item = header.closest('.accordion-item');
                
                // 關閉所有非當前點擊的項目
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                    }
                });
                
                // 切換當前項目的狀態
                item.classList.toggle('active');
            }
        });
    }


    // ====================================================
    // 6. 圖片延遲載入 (Image Lazy Loading for SEO/Performance)
    // 使用 Intersection Observer 實現原生級別的延遲載入
    // 這是現代且高效能的優化方式
    // ====================================================
    
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const observerOptions = {
            rootMargin: '0px 0px 200px 0px' // 在圖片進入視口前 200px 就開始載入
        };

        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // 從 data-src 替換為 src
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src'); // 清理屬性
                    }
                    
                    // 針對 SEO/A11Y，處理 data-alt
                    if (img.dataset.alt) {
                        img.alt = img.dataset.alt;
                        img.removeAttribute('data-alt');
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, observerOptions);

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // 如果瀏覽器不支援 Intersection Observer，則使用備用方案
        // (例如直接載入所有圖片，或使用簡單的滾動事件監聽器)
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.alt = img.dataset.alt || '';
        });
    }

    
    // ====================================================
    // 7. 平滑滾動至錨點 (Smooth Scrolling for UX)
    // 確保點擊錨點連結時，有平滑的動畫效果
    // ====================================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // 排除單純作為容器的連結，例如手機菜單中的 dropdown 連結
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                 // 關閉手機菜單
                 if (mainNav.classList.contains('active')) {
                     menuToggle.click(); // 模擬點擊漢堡按鈕關閉菜單
                 }
                
                 // 計算滾動位置，減去固定 Header 的高度，防止內容被遮擋
                 const headerHeight = header.offsetHeight;
                 const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                 window.scrollTo({
                     top: targetPosition,
                     behavior: 'smooth'
                 });
            }
        });
    });
    
    
});
