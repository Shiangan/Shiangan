<footer style="background: #020617; color: rgba(255,255,255,0.8); padding: 80px 0 30px; font-family: 'Noto Sans TC', sans-serif;">
    <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; text-align: left; margin-bottom: 50px;">
            
            <div>
                <img src="{{ site.baseurl }}/images/logo.png" alt="祥安生命" style="height: 55px; filter: brightness(0) invert(1); margin-bottom: 20px;">
                <p style="font-size: 0.95rem; line-height: 1.8; color: rgba(255,255,255,0.6);">
                    國家認證禮儀師團隊，提供 24 小時專業生命禮儀服務。我們承諾費用公開透明，以最誠摯的心，陪伴家屬圓滿逝者的最後一程。
                </p>
                <div style="margin-top: 20px; font-size: 1.5rem;">
                    <a href="https://line.me/ti/p/@yourid" style="color:#00c300; margin-right: 15px;"><i class="fab fa-line"></i></a>
                    <a href="#" style="color:#fff; margin-right: 15px;"><i class="fab fa-facebook"></i></a>
                    <a href="#" style="color:#fff;"><i class="fab fa-instagram"></i></a>
                </div>
            </div>

            <div>
                <h4 style="color: var(--accent); margin-bottom: 25px; border-left: 3px solid var(--accent); padding-left: 10px;">快速連結</h4>
                <ul style="list-style: none; padding: 0; line-height: 2.5;">
                    <li><a href="{{ site.baseurl }}/index.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">首頁首頁</a></li>
                    <li><a href="{{ site.baseurl }}/about.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">關於祥安</a></li>
                    <li><a href="{{ site.baseurl }}/plans.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">費用方案</a></li>
                    <li><a href="{{ site.baseurl }}/blog.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">殯葬百科</a></li>
                    <li><a href="{{ site.baseurl }}/ta-wei-he-fa-xing-query-guide.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">塔位合法性查詢</a></li>
                </ul>
            </div>

            <div>
                <h4 style="color: var(--accent); margin-bottom: 25px; border-left: 3px solid var(--accent); padding-left: 10px;">禮儀服務</h4>
                <ul style="list-style: none; padding: 0; line-height: 2.5;">
                    <li><a href="{{ site.baseurl }}/services.html#buddhist" style="color: rgba(255,255,255,0.7); text-decoration: none;">中式佛道教禮儀</a></li>
                    <li><a href="{{ site.baseurl }}/services.html#western" style="color: rgba(255,255,255,0.7); text-decoration: none;">西式追思禮拜</a></li>
                    <li><a href="{{ site.baseurl }}/services.html#japanese" style="color: rgba(255,255,255,0.7); text-decoration: none;">日式禮儀服務</a></li>
                    <li><a href="{{ site.baseurl }}/services.html#eco" style="color: rgba(255,255,255,0.7); text-decoration: none;">環保葬 (樹葬/海葬)</a></li>
                </ul>
            </div>

            <div>
                <h4 style="color: var(--accent); margin-bottom: 25px; border-left: 3px solid var(--accent); padding-left: 10px;">聯絡資訊</h4>
                <p style="margin-bottom: 10px;"><i class="fas fa-phone-alt" style="margin-right: 10px; color: var(--accent);"></i> 24H 服務：<a href="tel:+886978583699" style="color: #fff; text-decoration: none;">0978-583-699</a></p>
                <p style="margin-bottom: 10px;"><i class="fas fa-map-marker-alt" style="margin-right: 10px; color: var(--accent);"></i> 新北市三重區永福街135巷13號</p>
                <p style="margin-bottom: 10px;"><i class="fas fa-envelope" style="margin-right: 10px; color: var(--accent);"></i> {{ site.email }}</p>
                <p style="margin-bottom: 10px;"><i class="fas fa-clock" style="margin-right: 10px; color: var(--accent);"></i> 服務時間：全年無休</p>
            </div>

        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px;">
        
        <div style="text-align: center; font-size: 0.85rem; color: rgba(255,255,255,0.4);">
            <p>祥安生命有限公司 © {{ "now" | date: "%Y" }} 版權所有 | 服務區域：台北、新北、桃園</p>
        </div>
    </div>
</footer>

{% include floating-cta.html %}

<script>
    /**
     * 1. 導覽列滾動優化 (確保 ID 匹配)
     */
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    /**
     * 2. 手機版選單邏輯
     */
    document.addEventListener('DOMContentLoaded', () => {
        const menuBtn = document.querySelector('.menu-toggle') || document.getElementById('menu-btn');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuBtn && navLinks) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');
            });
        }
        
        document.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('active');
        });
    });

    /**
     * 3. 視差進場動畫
     */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    /**
     * 4. 旗艦流星效果
     */
    const initMeteor = () => {
        const hero = document.getElementById('home') || document.getElementById('hero-space');
        if (!hero) return;

        setInterval(() => {
            const m = document.createElement('div');
            m.className = 'meteor';
            m.style.left = Math.random() * 100 + '%';
            m.style.top = Math.random() * 40 + '%';
            hero.appendChild(m);
            
            const animation = m.animate([
                { transform: 'rotate(-35deg) translateX(0)', opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { transform: 'rotate(-35deg) translateX(-1000px)', opacity: 0 }
            ], { duration: 2500, easing: 'linear' });

            animation.onfinish = () => m.remove();
        }, 3000);
    };
    initMeteor();
</script>
