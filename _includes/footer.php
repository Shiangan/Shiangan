<style>
    /* --- 墨綠金箔 Footer 專屬樣式 --- */
    .site-footer {
        background: #1a241a; /* 墨綠背景 */
        color: #ffffff;
        padding: 100px 0 40px;
        position: relative;
        overflow: hidden;
        font-family: 'Noto Sans TC', sans-serif;
    }

    /* 背景裝飾大字 */
    .footer-floating-text {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12vw;
        font-weight: 900;
        color: rgba(197, 160, 89, 0.04); /* 極淡金箔色 */
        white-space: nowrap;
        pointer-events: none;
        letter-spacing: 25px;
        z-index: 0;
    }

    .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 25px;
        position: relative;
        z-index: 1;
    }

    .footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1.5fr;
        gap: 50px;
    }

    .footer-col h4 {
        color: #c5a059; /* 金箔色 */
        font-size: 1.1rem;
        margin-bottom: 25px;
        font-weight: 700;
        letter-spacing: 1px;
    }

    .footer-col a {
        color: rgba(255,255,255,0.6);
        text-decoration: none;
        transition: all 0.3s ease;
        display: inline-block;
        margin-bottom: 12px;
        font-size: 0.95rem;
    }

    .footer-col a:hover {
        color: #c5a059;
        transform: translateX(5px);
    }

    .footer-tel {
        font-size: 1.8rem !important;
        font-weight: 700;
        color: #c5a059 !important;
        display: block;
        margin-bottom: 10px !important;
    }

    /* 版權宣告區 */
    .footer-bottom {
        text-align: center;
        margin-top: 80px;
        opacity: 0.3;
        font-size: 0.8rem;
        border-top: 1px solid rgba(255,255,255,0.05);
        padding-top: 30px;
        letter-spacing: 2px;
    }

    /* 手機版 RWD 修正 */
    @media (max-width: 992px) {
        .footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
        .site-footer { padding: 80px 0 30px; }
        .footer-grid { grid-template-columns: 1fr; text-align: center; }
        .footer-col { text-align: center !important; }
        .footer-floating-text { font-size: 20vw; top: 20px; }
        .footer-tel { font-size: 1.5rem !important; }
    }
</style>

<footer class="site-footer">
    <div class="footer-floating-text">SHIANGAN</div> 

    <div class="footer-content">
        <div class="footer-grid">
            <div class="footer-col">
                <img src="{{ site.baseurl }}/images/logo.png" style="height: 55px; filter: brightness(0) invert(1); margin-bottom: 25px;" alt="祥安生命 logo">
                <p style="opacity: 0.5; font-size: 0.9rem; line-height: 1.8;">
                    國家證照團隊，承諾費用透明。提供台北、新北、桃園專業禮儀規劃，圓滿生命的每一場謝幕。
                </p>
            </div>

            <div class="footer-col">
                <h4>服務內容</h4>
                <a href="{{ site.baseurl }}/services.html#traditional">中式佛道教</a><br>
                <a href="{{ site.baseurl }}/services.html#western">西式追思禮</a><br>
                <a href="{{ site.baseurl }}/services.html#eco">現代環保葬</a>
            </div>

            <div class="footer-col">
                <h4>快速連結</h4>
                <a href="{{ site.baseurl }}/about.html">關於我們</a><br>
                <a href="{{ site.baseurl }}/plans.html">費用方案</a><br>
                <a href="{{ site.baseurl }}/blog.html">治喪百科</a>
            </div>

            <div class="footer-col" style="text-align: right;">
                <h4>24H 服務專線</h4>
                <a href="tel:0978583699" class="footer-tel">0978-583-699</a>
                <p style="opacity: 0.5; font-size: 0.9rem;">新北市三重區永福街135巷13號</p>
            </div>
        </div>

        <div class="footer-bottom">
            © {{ "now" | date: "%Y" }} SHIANGAN LIFE ALL RIGHTS RESERVED.
        </div>
    </div>
</footer>

{% include floating-cta.html %}

<script>
    // 統一在此放置 FAQ、滾動與動畫腳本，確保全站生效
    document.addEventListener('DOMContentLoaded', () => {
        // FAQ 手風琴
        document.querySelectorAll('.faq-item').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('active');
                const icon = item.querySelector('i');
                if (icon) icon.classList.toggle('fa-plus'), icon.classList.toggle('fa-minus');
            });
        });

        // 進場動畫 Observer
        const obs = new IntersectionObserver(entries => {
            entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('revealed'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    });
</script>
