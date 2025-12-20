/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 旗艦完美版 V3.8
 * 修正重點：
 * 1. 解決 iOS/Safari 彈性捲動導致的選單定位偏移。
 * 2. 修正 Android 軟鍵盤彈出時導致的佈局擠壓。
 * 3. 強化高度計算邏輯：解決內容動態增加導致的跳行或截斷。
 * 4. 視窗防護：絕對防止橫向捲軸產生。
 * ====================================================================
 */

'use strict';

window.SALife = window.SALife || {};

(function () {
    const MOBILE_BREAKPOINT = 992;
    const SCROLL_THRESHOLD = 20;
    const body = document.body;
    const docEl = document.documentElement;

    /**
     * [工具] 防抖動處理 (提升 Scroll/Resize 效能)
     */
    const debounce = (fn, ms = 60) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), ms);
        };
    };

    /**
     * [核心] 視窗完整性防護：防止任何設備出現兩邊溢出
     */
    const preventHorizontalOverflow = () => {
        // 設定強制樣式防止橫向溢出
        docEl.style.overflowX = 'hidden';
        body.style.overflowX = 'hidden';
        body.style.position = 'relative';
        body.style.width = '100%';
    };

    /**
     * [核心] 動態高度清理邏輯：解決展開後內容「不亂跳行」
     */
    const setDynamicHeight = (el, isOpen) => {
        if (isOpen) {
            el.style.maxHeight = el.scrollHeight + "px";
            // 動畫結束後轉為 none，確保內部內容(如圖片載入)增加時不會被截斷
            const onEnd = (e) => {
                if (e.propertyName === 'max-height') {
                    el.style.maxHeight = 'none';
                    el.removeEventListener('transitionend', onEnd);
                }
            };
            el.addEventListener('transitionend', onEnd);
        } else {
            // 收合前先從 none 轉回確切數值，確保動畫流暢
            el.style.maxHeight = el.scrollHeight + "px";
            requestAnimationFrame(() => {
                el.style.maxHeight = "0px";
            });
        }
    };

    /**
     * [導覽] 全設備相容選單系統
     */
    const initNavigation = () => {
        const header = document.querySelector('.site-header, .main-header');
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('#main-nav');
        
        if (!menuToggle || !mainNav) return;

        // 1. 漢堡選單：支援行動端防滑動穿透
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = mainNav.classList.contains('active');
            
            mainNav.classList.toggle('active', !isActive);
            menuToggle.classList.toggle('active', !isActive);
            
            // 防止行動端選單開啟時底層背景捲動
            body.style.overflow = !isActive ? 'hidden' : '';
        });

        // 2. 父子選單：行動端攔截、桌機端導向
        mainNav.querySelectorAll('li.dropdown > a').forEach(link => {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    const parent = this.parentElement;
                    const submenu = parent.querySelector('.submenu-container, .submenu');
                    
                    if (submenu) {
                        e.preventDefault();
                        const isAlreadyOpen = parent.classList.contains('active');

                        // 關閉其他同層級選單 (手風琴邏輯)
                        parent.parentElement.querySelectorAll('.dropdown.active').forEach(other => {
                            if (other !== parent) {
                                other.classList.remove('active');
                                const otherSub = other.querySelector('.submenu-container, .submenu');
                                if (otherSub) setDynamicHeight(otherSub, false);
                            }
                        });

                        // 切換當前選單
                        parent.classList.toggle('active', !isAlreadyOpen);
                        setDynamicHeight(submenu, !isAlreadyOpen);
                    }
                }
            });
        });

        // 3. Header 捲動效果
        const handleScroll = debounce(() => {
            const isScrolled = window.scrollY > SCROLL_THRESHOLD;
            header?.classList.toggle('scrolled', isScrolled);
        }, 15);

        window.addEventListener('scroll', handleScroll, { passive: true });
    };

    /**
     * [功能] 試算機與 Tab 切換系統
     */
    const initCalculators = () => {
        // 勞保計算
        window.SALife.calculateLabor = function() {
            const input = document.getElementById('avgSalary');
            const res = document.getElementById('resultBox');
            if (!input || !res) return;

            const salary = Math.min(Math.max(parseFloat(input.value) || 0, 27470), 45800);
            const months = document.getElementById('hasSurvivor').value === 'yes' ? 5 : 10;
            
            res.innerHTML = `<div class="res-tag">預估給付：NT$ ${Math.round(salary * months).toLocaleString()}</div>`;
            res.style.display = 'block';
        };

        // 對年計算 (完美日期處理)
        window.SALife.setupDuinian = function() {
            const btn = document.getElementById('calculateDuinian');
            if (!btn) return;

            btn.addEventListener('click', () => {
                const val = document.getElementById('dateOfDeath').value;
                if (!val) return;
                const d = new Date(val);
                d.setFullYear(d.getFullYear() + 1);
                
                const out = document.getElementById('resultOutput');
                document.getElementById('duinianDate').innerText = d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
                out.classList.remove('hidden');
            });
        };
    };

    /**
     * [生命週期] 啟動
     */
    const init = () => {
        preventHorizontalOverflow();
        initNavigation();
        initCalculators();
        window.SALife.setupDuinian();

        // 監聽 Resize 清理狀態，防止從行動版轉桌機版時佈局出錯
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                body.style.overflow = '';
                document.querySelectorAll('.submenu-container, .submenu').forEach(el => {
                    el.style.maxHeight = '';
                });
            }
        }, 100));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
