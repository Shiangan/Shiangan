/**
 * ====================================================
 * 程式夥伴 - 網站核心互動腳本 (V13.2 最終整合版)
 * 適用於所有頁面：導航、手風琴、平滑滾動
 * 適用於文章頁：TOC 自動高亮
 * ====================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. 導航功能 (Header Navigation) 
    // 處理手機選單開合與桌面下拉選單的 A11Y 強化
    // ----------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const dropdowns = document.querySelectorAll('#main-nav .dropdown');

    // --- 1a. 手機選單開合 (Hamburger Menu) ---
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            
            // 切換選單狀態
            mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            
            // 切換 body 滾動鎖定，防止手機背景滾動
            document.body.classList.toggle('no-scroll', !isExpanded);
        });
    }

    // --- 1b. 手機子選單（下拉選單轉為手風琴）---
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        const submenu = dropdown.querySelector('.submenu');

        if (dropdownLink && submenu) {
            
            // 在手機模式下，點擊父連結時展開子選單
            dropdownLink.addEventListener('click', (e) => {
                // 檢查是否為手機模式（假設 max-width: 900px）
                if (window.innerWidth <= 900) {
                    e.preventDefault(); // 阻止連結跳轉
                    
                    // 點擊時，切換當前 dropdown 的 active 狀態
                    dropdown.classList.toggle('active');
                    
                    // 根據 active 狀態設定 ARIA 屬性
                    const isActive = dropdown.classList.contains('active');
                    dropdownLink.setAttribute('aria-expanded', isActive);

                    // 確保點擊一個 dropdown 時，其他所有同層的 dropdown 都被收合
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                            otherDropdown.classList.remove('active');
                            otherDropdown.querySelector('a').setAttribute('aria-expanded', 'false');
                        }
                    });
                }
            });
            
            // --- 1c. 桌面下拉選單的鍵盤 A11Y 處理 ---
            // 處理 Tab 鍵導航時，submenu 保持可見
            if (window.innerWidth > 900) {
                dropdown.addEventListener('focusin', () => {
                    dropdown.classList.add('focus-within');
                });
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
    // 適用於 FAQ 頁面和服務頁面
    // ----------------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.accordion-item');
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');

            // 關閉所有其他開啟的手風琴
            document.querySelectorAll('.accordion-item.active').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('active');
                    openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    openItem.querySelector('.accordion-content').setAttribute('aria-hidden', 'true');
                }
            });

            // 切換當前手風琴的狀態
            item.classList.toggle('active', !isActive);
            header.setAttribute('aria-expanded', !isActive);
            content.setAttribute('aria-hidden', isActive);
        });
    });

    // ----------------------------------------------------
    // 3. 平滑滾動至目標 (Smooth Scroll)
    // 確保點擊錨點連結 (如導航、快速連結) 時，頁面平穩過渡
    // ----------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // 如果只是 #，則忽略 (例如點擊 logo 回頂部)
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // 確保平滑滾動並考慮固定 Header 的高度
                const headerHeight = document.querySelector('header').offsetHeight || 70;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 如果是手機選單中的點擊，滾動後關閉選單
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('no-scroll');
                }
            }
        });
    });

    // ----------------------------------------------------
    // 4. 文章頁面：目錄 (TOC) 自動高亮顯示
    // 僅在文章單頁 (假設有 .article-body) 執行
    // ----------------------------------------------------
    const articleBody = document.querySelector('.article-body');
    const tocLinks = document.querySelectorAll('.table-of-contents a');

    if (articleBody && tocLinks.length > 0) {
        
        // 收集所有文章內部的 H2 標題元素
        const headings = articleBody.querySelectorAll('h2');
        
        // 使用 Intersection Observer API 監聽標題進入/離開視窗
        const observerOptions = {
            root: null, // 視窗為根元素
            rootMargin: `-${document.querySelector('header').offsetHeight + 20}px 0px -50% 0px`, // 讓 Header 下方 20px 成為觸發點
            threshold: 0 // 一旦進入視窗即可觸發
        };

        const observer = new IntersectionObserver((entries) => {
            let currentActive = null;

            // 檢查所有進入或正在視窗內的標題
            entries.forEach(entry => {
                const targetId = entry.target.id;
                
                // 找到第一個進入視窗的標題作為當前活躍項目
                if (entry.isIntersecting && entry.boundingClientRect.top <= (document.querySelector('header').offsetHeight + 20)) {
                    // 優先選擇最靠近頂部的元素
                    if (!currentActive || entry.boundingClientRect.top < currentActive.boundingClientRect.top) {
                         currentActive = entry;
                    }
                }
            });

            // 處理活躍狀態的切換
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (currentActive && link.getAttribute('href') === `#${currentActive.target.id}`) {
                    link.classList.add('active');
                }
            });
            
             // 如果沒有標題進入頂部閾值，預設高亮第一個連結
            if (!currentActive) {
                // 檢查頁面滾動位置，若在頂部，則高亮第一個
                if (window.scrollY < 100 && tocLinks.length > 0) {
                     tocLinks[0].classList.add('active');
                }
            }

        }, observerOptions);

        // 開始觀察所有 H2 標題
        headings.forEach(heading => {
            // 確保所有 H2 都有 ID，如果沒有則用標題文字生成
            if (!heading.id) {
                heading.id = heading.textContent.trim().replace(/\s+/g, '-');
            }
            observer.observe(heading);
        });
    }

});

