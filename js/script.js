/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V15.0 最終質感精修版)
   優化項目：通用手風琴 (Accordion) A11Y 強化與載入閃爍處理
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // **修正開始：抗閃爍機制**
    // 移除 body 上的 js-loading class，讓 CSS 開始顯示內容
    document.body.classList.remove('js-loading');
    
    // ====================================================
    // 0. 變數與設定 (Variables & Configurations)
    // ====================================================
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    const dropdowns = document.querySelectorAll('.dropdown');
    const mobileBreakpoint = 900; // 統一 RWD 斷點為 900px
    const accordionContainer = document.querySelector('.accordion-container');
    const currentYearSpan = document.getElementById('current-year');


    // 輔助函數：關閉所有手機子菜單
    function closeAllMobileSubmenus() {
        // 移除所有下拉選單上的 active 類別
        document.querySelectorAll('#main-nav ul li.dropdown.active').forEach(li => {
            li.classList.remove('active');
        });
    }
    
    // 輔助函數：處理 RWD 調整時的狀態清理
    function handleResize() {
         if (window.innerWidth > mobileBreakpoint) {
             // 如果回到桌面版，確保菜單和滾動狀態被重置
             if (mainNav.classList.contains('active')) {
                 mainNav.classList.remove('active');
                 menuToggle.setAttribute('aria-expanded', 'false');
                 body.classList.remove('no-scroll');
                 closeAllMobileSubmenus();
             }
         }
    }
    
    window.addEventListener('resize', handleResize);


    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================
    function handleScroll() {
        if (window.scrollY > 0) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    if (header) {
        handleScroll(); // 載入時執行一次
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
            
            this.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active'); // 切換主選單 CSS 類別
            body.classList.toggle('no-scroll'); // 鎖定背景滾動
            
            if (!isExpanded) {
                // 如果是開啟選單，關閉所有子選單
                closeAllMobileSubmenus(); 
            } 
        });
    }

    // ====================================================
    // 3. 桌面 Dropdown A11Y (Focus-Within 模擬 Hover)
    // ====================================================
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('focusin', function() {
            if (window.innerWidth > mobileBreakpoint) {
                 this.classList.add('focus-within');
            }
        });
        
        dropdown.addEventListener('focusout', function() {
            setTimeout(() => {
                // 檢查失去焦點後，焦點是否仍在下拉選單或其子元素內
                if (window.innerWidth > mobileBreakpoint && !this.contains(document.activeElement)) {
                    this.classList.remove('focus-within');
                }
            }, 10);
        });
    });


    // ====================================================
    // 4. 手機導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================
    if (mainNav) {
        mainNav.addEventListener('click', function(e) {
            if (window.innerWidth <= mobileBreakpoint) { 
                // 確保點擊對象是 li.dropdown > a
                let targetLink = e.target.closest('#main-nav ul li.dropdown > a'); 

                if (targetLink) {
                    e.preventDefault(); 
                    
                    const parentLi = targetLink.closest('li.dropdown');
                    
                    if (parentLi.classList.contains('active')) {
                        parentLi.classList.remove('active');
                    } else {
                        closeAllMobileSubmenus(); // 關閉其他已開啟的子選單
                        parentLi.classList.add('active'); // 展開當前子選單
                    }
                }
            }
        });
    }

    // ====================================================
    // 5. 通用手風琴 (Accordion Component Logic) - 強化版
    // ====================================================
    if (accordionContainer) {
        
        // --- 初始化 A11Y 與狀態 ---
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
             const header = item.querySelector('.accordion-header');
             const content = item.querySelector('.accordion-content');
             
             if (header && content) {
                 const uniqueId = `acc-item-${index}`;
                 
                 content.id = `${uniqueId}-content`;
                 header.setAttribute('aria-controls', content.id);

                 const isActive = item.classList.contains('active');

                 // 確保內容收合或展開時 max-height 正確
                 // 這裡需要計算 padding (CSS 設為 15px 上下，共 30px)
                 const contentHeight = content.scrollHeight; 
                 content.style.maxHeight = isActive ? contentHeight + "px" : 0;
                 
                 header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                 header.setAttribute('tabindex', '0'); // 確保可以被鍵盤選中
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
                
                // 1. 非多開模式，先關閉其他項目
                if (!isMultiAccordion) {
                    document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                            const activeContent = activeItem.querySelector('.accordion-content');
                            activeContent.style.maxHeight = 0;
                            activeItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                        }
                    });
                }
                
                // 2. 切換當前項目的狀態
                item.classList.toggle('active');

                // 3. 實作平滑過渡
                if (!isCurrentlyActive) {
                    // 展開時
                    content.style.maxHeight = content.scrollHeight + "px"; 
                    header.setAttribute('aria-expanded', 'true');
                } else {
                    // 收合時
                    content.style.maxHeight = 0;
                    header.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // ====================================================
    // 6. 圖片延遲載入 (Image Lazy Loading) - **注意: HTML 需使用 data-src**
    // ====================================================
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
    // 7. 平滑滾動至錨點 (Smooth Scrolling) - 精確計算 Header 高度
    // ====================================================
    if (header) { 
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (this.getAttribute('href') === '#') return;
                
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                     // 關閉手機菜單
                     if (mainNav && mainNav.classList.contains('active')) {
                         menuToggle.click(); // 模擬點擊關閉菜單
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
    
    // ====================================================
    // 8. 自動更新版權年份
    // ====================================================
    if (currentYearSpan) {
        const currentYear = new Date().getFullYear();
        currentYearSpan.textContent = currentYear;
    }
});
