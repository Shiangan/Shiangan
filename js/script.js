/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V20.1 最終優化版 - 流星速度修正)
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================
    
    // **抗閃爍機制 (SEO/UX 優化)**
    document.body.classList.remove('js-loading');
    
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    // 根據您的 CSS 設定，使用 900px 作為手機/桌面切換點
    const mobileBreakpoint = 900; 
    const currentYearSpan = document.getElementById('current-year');
    
    // 輔助函數： Debounce (去抖動) - 優化性能
    function debounce(func, delay = 150) { 
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // 輔助函數：關閉所有手機子菜單 (清除 .active 類別)
    function closeAllMobileSubmenus() {
        document.querySelectorAll('#main-nav ul li.dropdown.active').forEach(li => {
            li.classList.remove('active');
        });
    }
    
    // 輔助函數：處理 RWD 調整時的狀態清理
    function handleResizeCleanup() {
         if (window.innerWidth > mobileBreakpoint) {
             // 確保在切換到桌面模式時，手機菜單被關閉，並移除 no-scroll
             if (mainNav && mainNav.classList.contains('active')) {
                 
                 mainNav.classList.remove('active');
                 body.classList.remove('no-scroll');
                 
                 if (menuToggle) {
                     menuToggle.setAttribute('aria-expanded', 'false');
                     
                     const menuIcon = menuToggle.querySelector('i');
                     if (menuIcon && menuIcon.classList.contains('fa-times')) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
                 closeAllMobileSubmenus(); 
             }
         }
    }
    
    // 註冊 Debounce 過後的 RWD 狀態清理事件
    window.addEventListener('resize', debounce(handleResizeCleanup, 150));


    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================
    function handleScroll() {
        // 在滾動時為 Header 增加或移除 'scrolled' 類別
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 0);
        }
    }
    
    if (header) {
        handleScroll(); // 首次載入檢查
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================
    if (menuToggle && mainNav) {
        const menuIcon = menuToggle.querySelector('i'); 

        menuToggle.addEventListener('click', function() {
            const isExpanded = mainNav.classList.toggle('active'); 
            body.classList.toggle('no-scroll'); // 鎖定背景滾動
            
            this.setAttribute('aria-expanded', isExpanded);
            
            if (menuIcon) {
                if (isExpanded) {
                    menuIcon.classList.replace('fa-bars', 'fa-times');
                    closeAllMobileSubmenus(); // 展開菜單時，先關閉所有子菜單
                } else {
                    menuIcon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }

    // ====================================================
    // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================
    if (mainNav) {
        mainNav.addEventListener('click', function(e) {
            // 僅在手機模式下觸發
            if (window.innerWidth <= mobileBreakpoint) { 
                let targetLink = e.target.closest('#main-nav ul li.dropdown > a'); 

                if (targetLink) {
                    e.preventDefault(); 
                    
                    const parentLi = targetLink.closest('li.dropdown');
                    
                    if (parentLi.classList.contains('active')) {
                        parentLi.classList.remove('active');
                    } else {
                        closeAllMobileSubmenus(); // 關閉其他已展開的子菜單
                        parentLi.classList.add('active'); 
                    }
                }
            }
        });
    }

    // ====================================================
    // 4. 通用手風琴 (FAQ Accordion Component Logic) - 核心優化
    // ====================================================
    document.querySelectorAll('.accordion-item').forEach((item, index) => {
         const header = item.querySelector('.accordion-header');
         const content = item.querySelector('.accordion-content');
         
         if (header && content) {
             // 輔助無障礙設計 (A11y)
             const uniqueId = `acc-item-${index}`;
             content.id = `${uniqueId}-content`;
             header.setAttribute('aria-controls', content.id);

             const isActive = item.classList.contains('active');
             
             // 初始狀態設置 max-height
             requestAnimationFrame(() => {
                 content.style.maxHeight = isActive ? content.scrollHeight + "px" : '0px'; 
             });

             header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
             header.setAttribute('role', 'button'); 
             header.setAttribute('tabindex', '0'); // 允許鍵盤導航
             
             // 點擊事件
             header.addEventListener('click', function(e) {
                
                const item = this.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isCurrentlyActive = item.classList.contains('active');
                
                // 1. 關閉其他項目 (單開模式)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        const otherContent = activeItem.querySelector('.accordion-content');
                        const otherHeader = activeItem.querySelector('.accordion-header');
                        
                        activeItem.classList.remove('active');
                        otherContent.style.maxHeight = '0px';
                        otherHeader.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // 2. 切換當前項目的狀態
                item.classList.toggle('active');

                // 3. 實作平滑過渡 (關鍵：確保 max-height 觸發 CSS transition)
                if (!isCurrentlyActive) {
                    // 展開時
                    this.setAttribute('aria-expanded', 'true');
                    requestAnimationFrame(() => {
                        // 設置為實際高度，觸發展開動畫
                        content.style.maxHeight = content.scrollHeight + "px"; 
                    });
                } else {
                    // 收合時
                    this.setAttribute('aria-expanded', 'false');
                    // 核心強化: 必須先設定一個精確的高度值，然後在下一個 tick 設為 0
                    content.style.maxHeight = content.scrollHeight + "px";
                    setTimeout(() => {
                        content.style.maxHeight = '0px'; // 設為 0px 觸發 CSS 收合過渡
                    }, 10); 
                }
             });
             
             // 處理鍵盤 Enter/Space 鍵觸發
             header.addEventListener('keydown', function(e) {
                 if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     this.click(); 
                 }
             });
         }
    });

    // ====================================================
    // 5. 圖片延遲載入 (Image Lazy Loading)
    // ====================================================
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const observerOptions = {
            rootMargin: '0px 0px 200px 0px' // 提前 200px 載入
        };

        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.alt = img.dataset.alt || img.alt || ''; 
                        img.removeAttribute('data-src'); 
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
        // Fallback for 舊版瀏覽器
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.alt = img.dataset.alt || img.alt || '';
        });
    }

    
    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling) - 完整性強化
    // ====================================================
    if (header) { 
        // 排除單獨的 href="#" 連結
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                     // 點擊錨點連結後，關閉手機菜單 (優化用戶體驗)
                     if (mainNav && menuToggle && mainNav.classList.contains('active')) {
                         menuToggle.click(); // 模擬點擊漢堡圖標，觸發關閉邏輯
                     }
                    
                     // 使用現代 API 進行平滑滾動，並考慮 Header 高度
                     if (typeof window.scrollTo === 'function' && targetElement.getBoundingClientRect) {
                         
                         const headerHeight = header.offsetHeight;
                         const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                         // 減去 Header 高度以避免內容被遮擋
                         const targetPosition = targetTop - headerHeight;
                         
                         window.scrollTo({
                             top: Math.max(0, targetPosition),
                             behavior: 'smooth'
                         });
                         
                     } else {
                         // Fallback: 使用原生滾動（無平滑效果）
                         targetElement.scrollIntoView({
                             block: 'start',
                             inline: 'nearest',
                             behavior: 'instant' 
                         });
                         
                         // 由於原生滾動無法考慮 Sticky Header，這裡嘗試調整滾動位置
                         window.scrollBy(0, -header.offsetHeight);
                     }
                }
            });
        });
    }

    
    // ====================================================
  // ====================================================
// 7. 動態生成不規則流星 (Meteor Generation Logic) - 確保持續動畫與隨機性
// ====================================================
const heroSection = document.querySelector('.hero-section');

if (heroSection) { 
    const numMeteors = 25; 

    function createMeteor() {
        const meteor = document.createElement('div');
        meteor.classList.add('meteor');
        
        // 速度範圍 (10.0s 到 20.0s，慢速自然)
        const duration = Math.random() * 10 + 10; 
        const delay = Math.random() * 8; 
        
        // ⭐️ 【核心修正 1：起始點從畫面上緣/右緣開始 (夜空頂部感) 】
        
        // 1. 隨機決定從左上、頂上或右上邊緣開始
        const edgeStart = Math.random(); 
        let initialLeft, initialTop;
        
        if (edgeStart < 0.3) {
             // 30% 機率從頂部邊緣開始 (x 軸隨機)
             initialTop = -5; // 視圖外一點
             initialLeft = Math.random() * 100; // 0vw 到 100vw
        } else {
             // 70% 機率從右側邊緣開始 (y 軸隨機)
             initialLeft = 105; // 視圖外一點
             initialTop = Math.random() * 80 - 20; // -20vh 到 60vh
        }

        meteor.style.left = `${initialLeft}vw`;
        meteor.style.top = `${initialTop}vh`;
        
        // ⭐️ 【核心修正 2：設定向左下方的移動參數】
        
        // 1. 隨機旋轉角度 (-100deg 到 -140deg，模擬從上向下/斜向劃落)
        const rotation = Math.random() * 40 - 140; 
        
        // 2. 隨機位移距離 (確保劃過大半個螢幕，向左下角移動)
        // 位移X：從 -100vw 到 -180vw (向左移動，所以是負值)
        const travelX = -(100 + Math.random() * 80); 
        // 位移Y：從 80vh 到 160vh (向下移動，所以是正值)
        const travelY = 80 + Math.random() * 80; 

        // 將隨機參數設定為 CSS 變數 (供 CSS @keyframes 使用)
        meteor.style.setProperty('--rotation', `${rotation}deg`);
        meteor.style.setProperty('--travel-x', `${travelX}vw`);
        meteor.style.setProperty('--travel-y', `${travelY}vh`);
        
        // **核心優化：循環生成**
        meteor.addEventListener('animationend', () => {
             meteor.remove();
             // 重新生成時加入隨機間隔，讓出現時機更自然 (0.5s 到 3.5s 後再生)
             setTimeout(createMeteor, Math.random() * 3000 + 500); 
        });

        // ⭐️ 【核心修正：套用正確的動畫名稱】
        meteor.style.animationName = 'shooting-star-random';
        meteor.style.animationDuration = `${duration}s`;
        meteor.style.animationDelay = `${delay}s`;
        meteor.style.animationTimingFunction = 'linear'; // 線性移動，保持速度一致

        heroSection.appendChild(meteor);
    }

    // 動態生成指定數量的流星
    for (let i = 0; i < numMeteors; i++) {
        // 使用 setTimeout 確保初始流星不會同時出現
        setTimeout(createMeteor, Math.random() * 5000); 
    }
}


    // ====================================================
    // 8. 自動更新版權年份 (Footer Copyright Year)
    // ====================================================
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
