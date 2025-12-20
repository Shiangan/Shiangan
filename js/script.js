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
     * [3. 導覽系統] 全設備選單邏輯
     */
    const initNavigation = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('#main-nav');
        const dropdowns = document.querySelectorAll('.dropdown > a');

        if (!menuToggle || !mainNav) return;

        // 漢堡按鈕：開啟/關閉
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = mainNav.classList.contains('active');
            mainNav.classList.toggle('active', !isOpen);
            menuToggle.classList.toggle('active', !isOpen);
            menuToggle.setAttribute('aria-expanded', !isOpen);
            body.style.overflow = !isOpen ? 'hidden' : ''; // 選單開啟時鎖定背景
        });

        // 下拉選單：行動端攔截跳轉
        dropdowns.forEach(link => {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    const parent = this.parentElement;
                    const submenu = parent.querySelector('.submenu-container');
                    
                    if (submenu) {
                        e.preventDefault();
                        const isActive = parent.classList.contains('active');

                        // 互斥邏輯：一次只開一個子選單
                        parent.parentElement.querySelectorAll('.dropdown.active').forEach(other => {
                            if (other !== parent) {
                                other.classList.remove('active');
                                const otherSub = other.querySelector('.submenu-container');
                                if (otherSub) otherSub.style.maxHeight = '0px';
                            }
                        });

                        parent.classList.toggle('active', !isActive);
                        submenu.style.maxHeight = !isActive ? (submenu.scrollHeight + 'px') : '0px';
                    }
                }
            });
        });

        // 視窗縮放清理
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('active');
                body.style.overflow = '';
                document.querySelectorAll('.submenu-container').forEach(sub => sub.style.maxHeight = '');
            }
        }, 200));
    };

    /**
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
