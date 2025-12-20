/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終完美整合版 V4.0
 * 適用：全設備適配、無橫向溢出、父子選單防跳轉、字體自適應。
 * ====================================================================
 */

'use strict';

window.SALife = window.SALife || {};

(function () {
    const MOBILE_BREAKPOINT = 992;
    const body = document.body;
    const html = document.documentElement;

    /**
     * [工具] 高性能節流
     */
    const debounce = (fn, ms = 100) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), ms);
        };
    };

    /**
     * [1. 佈局防護] 絕對防止頁面左右溢出
     */
    const enforceViewportIntegrity = () => {
        html.style.overflowX = 'hidden';
        body.style.overflowX = 'hidden';
        body.style.width = '100%';
        body.style.position = 'relative';
    };

    /**
     * [2. 文字縮放] 完美解決標題跳行 (Fit Text)
     * 會根據父容器寬度自動微調字級大小
     */
    const initFitText = () => {
        const fitElements = document.querySelectorAll('.fit-text-line');
        
        const adjustText = () => {
            fitElements.forEach(el => {
                const container = el.parentElement;
                if (!container) return;

                // 先重置大小以獲取原始比例
                el.style.fontSize = ''; 
                el.style.display = 'inline-block';
                el.style.whiteSpace = 'nowrap';

                const containerWidth = container.clientWidth;
                const textWidth = el.scrollWidth;

                if (textWidth > containerWidth) {
                    const ratio = containerWidth / textWidth;
                    const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
                    el.style.fontSize = Math.floor(currentSize * ratio * 0.95) + 'px';
                }
            });
        };

        adjustText();
        window.addEventListener('resize', debounce(adjustText, 150));
    };

    /**
  /**
 * 祥安生命 - 旗艦版前端互動邏輯
 * 包含：父子選單互斥、標題防斷句、視窗溢出防護
 */
(function() {
    'use strict';

    // 配置參數
    const MOBILE_BREAKPOINT = 991;
    const html = document.documentElement;
    const body = document.body;

    // 工具函式：防抖動
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    /**
     * [1. 視窗完整性偵測] 防止 X 軸溢出
     */
    const enforceViewportIntegrity = () => {
        html.style.overflowX = 'hidden';
        body.style.overflowX = 'hidden';
        body.style.position = 'relative';
    };

    /**
     * [2. 文字縮放] Fit Text - 根據父容器自動微調字級
     */
    const initFitText = () => {
        const fitElements = document.querySelectorAll('.fit-text-line');
        if (fitElements.length === 0) return;

        const adjustText = () => {
            fitElements.forEach(el => {
                const container = el.parentElement;
                if (!container) return;

                el.style.fontSize = ''; 
                el.style.display = 'inline-block';
                el.style.whiteSpace = 'nowrap';

                const containerWidth = container.clientWidth;
                const textWidth = el.scrollWidth;

                if (textWidth > containerWidth) {
                    const ratio = containerWidth / textWidth;
                    const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
                    // 乘以 0.95 作為安全緩衝，避免邊界誤差
                    el.style.fontSize = Math.floor(currentSize * ratio * 0.95) + 'px';
                }
            });
        };

        adjustText();
        window.addEventListener('resize', debounce(adjustText, 150));
    };

    /**
     * [3. 導覽系統] 含父子選單互斥邏輯
     */
    const initNavigation = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('#main-nav');
        const overlay = document.querySelector('.nav-overlay');
        const dropdowns = document.querySelectorAll('.dropdown > a');

        if (!menuToggle || !mainNav) return;

        // 漢堡按鈕開關
        const toggleMenu = (forceState) => {
            const isOpen = typeof forceState === 'boolean' ? !forceState : mainNav.classList.contains('active');
            mainNav.classList.toggle('active', !isOpen);
            menuToggle.classList.toggle('active', !isOpen);
            if (overlay) overlay.classList.toggle('active', !isOpen);
            body.style.overflow = !isOpen ? 'hidden' : ''; // 開啟時鎖定背景滾動
        };

        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
        });

        if (overlay) overlay.addEventListener('click', () => toggleMenu(true));

        // 下拉選單：行動端攔截與互斥邏輯
        dropdowns.forEach(link => {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    const parent = this.parentElement;
                    const submenu = parent.querySelector('.submenu-container');
                    
                    if (submenu) {
                        e.preventDefault();
                        const isActive = parent.classList.contains('active');

                        // 互斥邏輯：同一時間只允許一個子選單開啟
                        const siblingDropdowns = parent.parentElement.querySelectorAll('.dropdown');
                        siblingDropdowns.forEach(other => {
                            if (other !== parent) {
                                other.classList.remove('active');
                                const otherSub = other.querySelector('.submenu-container');
                                if (otherSub) otherSub.style.maxHeight = '0px';
                            }
                        });

                        // 切換當前狀態
                        parent.classList.toggle('active', !isActive);
                        submenu.style.maxHeight = !isActive ? (submenu.scrollHeight + 'px') : '0px';
                    }
                }
            });
        });

        // 視窗切換清理
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                mainNav.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
                body.style.overflow = '';
                document.querySelectorAll('.submenu-container').forEach(sub => sub.style.maxHeight = '');
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
        }, 200));
    };

    /**
     * [4. FAQ 組件] 手風琴高度自動計算
     */
    const initAccordions = () => {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const item = this.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isOpen = item.classList.contains('active');

                // 互斥：關閉其他 FAQ
                document.querySelectorAll('.accordion-item.active').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        other.querySelector('.accordion-content').style.maxHeight = '0px';
                    }
                });

                item.classList.toggle('active', !isOpen);
                content.style.maxHeight = !isOpen ? (content.scrollHeight + 'px') : '0px';
            });
        });
    };

    // 初始化執行
    const init = () => {
        enforceViewportIntegrity();
        initFitText();
        initNavigation();
        initAccordions();
    };

    document.addEventListener('DOMContentLoaded', init);
})();

     * [4. 互動組件] 完美手風琴 (FAQ)
     */
    const initAccordions = () => {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const item = this.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isOpen = item.classList.contains('active');

                // 關閉其他
                document.querySelectorAll('.accordion-item.active').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        other.querySelector('.accordion-content').style.maxHeight = '0px';
                        other.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    }
                });

                item.classList.toggle('active', !isOpen);
                this.setAttribute('aria-expanded', !isOpen);
                content.style.maxHeight = !isOpen ? (content.scrollHeight + 'px') : '0px';
            });
        });
    };

    /**
     * [5. 功能擴充] 補助試算與版權日期
     */
    const initUtilities = () => {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        // 暴露給全域的試算函數
        window.SALife.calculateLabor = () => {
            const salary = Math.min(Math.max(parseFloat(document.getElementById('avgSalary')?.value) || 0, 27470), 45800);
            const months = document.getElementById('hasSurvivor')?.value === 'yes' ? 5 : 10;
            const res = document.getElementById('resultBox');
            if (res) {
                res.innerHTML = `預估給付金額：<strong>NT$ ${Math.round(salary * months).toLocaleString()}</strong>`;
                res.style.display = 'block';
            }
        };
    };

    // 啟動
    const startup = () => {
        enforceViewportIntegrity();
        initFitText();
        initNavigation();
        initAccordions();
        initUtilities();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startup);
    } else {
        startup();
    }
})();
