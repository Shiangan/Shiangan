/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V14.5 最終質感精修版)
   優化項目：通用手風琴 (Accordion) 加入平滑過渡與 A11Y 強化
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================================
    // 0. 變數與設定 (Variables & Configurations)
    // ====================================================
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    const dropdowns = document.querySelectorAll('.dropdown');
    const mobileBreakpoint = 900; // RWD 斷點，與 CSS 保持一致

    // 輔助函數：關閉所有手機子菜單
    function closeAllMobileSubmenus() {
        document.querySelectorAll('#main-nav ul li.dropdown.active').forEach(li => {
            li.classList.remove('active');
        });
    }

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
    
    handleScroll(); 
    window.addEventListener('scroll', handleScroll, { passive: true });

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
        } 
        // 註：不需要 else 區塊來清空狀態，因為 closeAllMobileSubmenus 已經處理了
    });
    
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
                if (window.innerWidth > mobileBreakpoint && !this.contains(document.activeElement)) {
                    this.classList.remove('focus-within');
                }
            }, 10);
        });
    });


    // ====================================================
    // 4. 手機導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================

    mainNav.addEventListener('click', function(e) {
        if (window.innerWidth <= mobileBreakpoint) { 
            let targetLink = e.target.closest('#main-nav ul li.dropdown > a');

            if (targetLink) {
                e.preventDefault(); 
                
                const parentLi = targetLink.closest('li.dropdown');
                
                if (parentLi.classList.contains('active')) {
                    // 如果已展開，則關閉
                    parentLi.classList.remove('active');
                } else {
                    // 關閉所有其他已展開的子菜單並展開當前
                    closeAllMobileSubmenus(); 
                    parentLi.classList.add('active');
                }
            }
        }
    });

    // ====================================================
    // 5. 通用手風琴 (Accordion Component Logic) - 強化版
    // ====================================================
    
    const accordionContainer = document.querySelector('.accordion-container');
    
    if (accordionContainer) {
        accordionContainer.addEventListener('click', function(e) {
            const header = e.target.closest('.accordion-header');
            
            if (header) {
                const item = header.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isMultiAccordion = accordionContainer.classList.contains('multi-accordion'); // 檢查是否為多開模式
                const isCurrentlyActive = item.classList.contains('active');
                
                // 如果不是多開模式 (單一開合)，則關閉所有非當前點擊的項目
                if (!isMultiAccordion) {
                    document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                        if (activeItem !== item) {
                            activeItem.classList.remove('active');
                            // 確保內容收合
                            activeItem.querySelector('.accordion-content').style.maxHeight = 0;
                            // A11Y 確保
                            activeItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                        }
                    });
                }
                
                // 切換當前項目的狀態
                item.classList.toggle('active');

                // 實作平滑過渡 (需 CSS 配合 transition: max-height)
                if (!isCurrentlyActive) {
                    // 展開時：設定 max-height 為內容的實際高度 + 確保足夠的空間
                    content.style.maxHeight = content.scrollHeight + 30 + "px"; 
                    header.setAttribute('aria-expanded', 'true');
                } else {
                    // 收合時：設定 max-height 為 0
                    content.style.maxHeight = 0;
                    header.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // 初始化 A11Y 屬性：確保所有手風琴標頭都有 aria-expanded 屬性
        document.querySelectorAll('.accordion-header').forEach((header, index) => {
             header.setAttribute('aria-expanded', 'false');
             
             const item = header.closest('.accordion-item');
             const content = item.querySelector('.accordion-content');
             // 確保內容與標頭的 ID/Controls 關聯
             const uniqueId = `acc-item-${index}`;
             item.id = uniqueId;
             content.id = `${uniqueId}-content`;
             header.setAttribute('aria-controls', `${uniqueId}-content`);

             // 初始化時確保內容是收合的 (max-height: 0)
             content.style.maxHeight = 0;
        });
    }

    // ====================================================
    // 6. 圖片延遲載入 (Image Lazy Loading for SEO/Performance)
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
    // 7. 平滑滾動至錨點 (Smooth Scrolling for UX)
    // ====================================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                 // 關閉手機菜單
                 if (mainNav.classList.contains('active')) {
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
    
});
