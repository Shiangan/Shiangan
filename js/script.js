/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V15.0 最終質感精修版)
   優化項目：通用手風琴 (Accordion) A11Y 強化與載入閃爍處理
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // **修正開始：抗閃爍機制**
    // 假設你在 body 或 html 上有設定 .js-loading class
    document.body.classList.remove('js-loading');
    
    // ====================================================
    // 0. 變數與設定 (Variables & Configurations)
    // ====================================================
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    const dropdowns = document.querySelectorAll('.dropdown');
    const mobileBreakpoint = 900; // RWD 斷點，與 CSS 保持一致
    const accordionContainer = document.querySelector('.accordion-container'); // 移至頂層

    // 輔助函數：關閉所有手機子菜單
    function closeAllMobileSubmenus() {
        document.querySelectorAll('#main-nav ul li.dropdown.active').forEach(li => {
            li.classList.remove('active');
        });
    }

    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // (無變動)
    // ====================================================

    function handleScroll() {
        if (window.scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // 確保 header 存在才執行
    if (header) {
        handleScroll(); 
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // (無變動)
    // ====================================================
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
            
            this.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active');
            body.classList.toggle('no-scroll');
            
            if (!isExpanded) {
                closeAllMobileSubmenus(); 
            } 
        });
    }
    
    // ====================================================
    // 3. 桌面 Dropdown A11Y (Focus-Within 模擬 Hover)
    // (無變動)
    // ====================================================
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('focusin', function() {
            if (window.innerWidth > mobileBreakpoint) {
                 this.classList.add('focus-within');
            }
        });
        
        dropdown.addEventListener('focusout', function() {
            setTimeout(() => {
                if (window.innerWidth > mobileBreakpoint && !this.contains(document.activeElement)) {
                    this.classList.remove('focus-within');
                }
            }, 10);
        });
    });


    // ====================================================
    /    // ====================================================
    // 4. 手機導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================
    if (mainNav) {
        mainNav.addEventListener('click', function(e) {
            if (window.innerWidth <= mobileBreakpoint) { // 確保只在手機版執行
                let targetLink = e.target.closest('#main-nav ul li.dropdown > a');

                if (targetLink) {
                    e.preventDefault(); // 阻止跳轉
                    
                    const parentLi = targetLink.closest('li.dropdown');
                    
                    if (parentLi.classList.contains('active')) {
                        parentLi.classList.remove('active');
                    } else {
                        closeAllMobileSubmenus(); // 關閉其他
                        parentLi.classList.add('active'); // 展開當前
                    }
                }
            }
        });
    }

    // ====================================================
    // 5. 通用手風琴 (Accordion Component Logic) - 強化版
    // **核心修正區塊**：確保點擊才有展開，並強化初始化。
    // ====================================================
    
    if (accordionContainer) {
        
        // --- 初始化 A11Y 與狀態 ---
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
             const header = item.querySelector('.accordion-header');
             const content = item.querySelector('.accordion-content');
             
             if (header && content) {
                 const uniqueId = `acc-item-${index}`;
                 
                 // 確保內容 ID 和標頭的控制關聯
                 content.id = `${uniqueId}-content`;
                 header.setAttribute('aria-controls', content.id);

                 // 檢查初始狀態
                 const isActive = item.classList.contains('active');

                 // 確保內容收合 (CSS 配合 transition)
                 content.style.maxHeight = isActive ? content.scrollHeight + 30 + "px" : 0;
                 
                 // 確保 A11Y 屬性正確
                 header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                 header.setAttribute('tabindex', '0'); // 讓標頭可被鍵盤選中
             }
        });


        // --- 點擊事件監聽 ---
        accordionContainer.addEventListener('click', function(e) {
            const header = e.target.closest('.accordion-header');
            
            if (header) {
                const item = header.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isMultiAccordion = accordionContainer.classList.contains('multi-accordion');
                const isCurrentlyActive = item.classList.contains('active');
                
                // 1. 如果不是多開模式，先關閉所有已開啟的項目
                if (!isMultiAccordion) {
                    document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                            const activeContent = activeItem.querySelector('.accordion-content');
                            // 收合內容
                            activeContent.style.maxHeight = 0;
                            activeItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                        }
                    });
                }
                
                // 2. 切換當前項目的狀態
                item.classList.toggle('active');

                // 3. 實作平滑過渡
                if (!isCurrentlyActive) {
                    // 展開時：計算內容實際高度並展開
                    // +30px 是預留給內容的 padding-top/padding-bottom 空間，需與 CSS 設置一致
                    content.style.maxHeight = content.scrollHeight + 30 + "px"; 
                    header.setAttribute('aria-expanded', 'true');
                } else {
                    // 收合時：設定 max-height 為 0
                    content.style.maxHeight = 0;
                    header.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // ====================================================
    // 6. 圖片延遲載入 (Image Lazy Loading for SEO/Performance)
    // (無變動)
    // ====================================================
    
    // ... (Lazy Load 邏輯保持不變) ...
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const observerOptions = {
            rootMargin: '0px 0px 200px 0px' 
        };

        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src'); 
                    }
                    
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
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.alt = img.dataset.alt || '';
        });
    }

    
    // ====================================================
    // 7. 平滑滾動至錨點 (Smooth Scrolling for UX)
    // (無變動)
    // ====================================================
    
    if (header) { // 確保 header 存在
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (this.getAttribute('href') === '#') return;
                
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                     // 關閉手機菜單 (如果已開啟)
                     if (mainNav && mainNav.classList.contains('active')) {
                         menuToggle.click(); 
                     }
                    
                     // 計算滾動位置，減去固定 Header 的高度
                     const headerHeight = header.offsetHeight;
                     const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                     window.scrollTo({
                         top: targetPosition,
                         behavior: 'smooth'
                     });
                }
            });
        });
    }
    
});
