lucide.createIcons();

// شاشة البداية وضبط الوضع الليلي التلقائي
window.addEventListener('load', () => {
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
        setTimeout(() => {
            introScreen.classList.add('hidden');
            setTimeout(() => introScreen.style.display = 'none', 800);
        }, 2200);
    }
    
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark' || !savedTheme) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

// إعدادات قاعدة البيانات (Firebase)
const firebaseConfig = {
    apiKey: "AIzaSyBnYczto0EvZU-LowX1Ps3NvYALnmmutr0",
    authDomain: "ljioik.firebaseapp.com",
    projectId: "ljioik",
    storageBucket: "ljioik.firebasestorage.app",
    messagingSenderId: "259534088287",
    appId: "1:259534088287:web:25a5a689146ad7792ad3ea"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentTab = 'home';
let productsData = [];
let adsData = [];

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

// جلب البيانات من فايربيس (قمنا بإزالة جلب البنرات لعدم الحاجة إليها)
function setupSubscriptions() {
    db.collection("products").onSnapshot(snapshot => {
        productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentTab === 'home') renderHome();
    });

    db.collection("ads").onSnapshot(snapshot => {
        adsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (currentTab === 'home') renderHome();
    });
}

// بناء صفحة "الرئيسية"
function renderHome() {
    // عرض الإعلان العلوي إن وجد
    let topAdHtml = '';
    if (adsData.length > 0) {
        topAdHtml = `<div class="top-ad-container"><img src="${adsData[0].imageUrl}" alt="إعلان رئيسي"></div>`;
    }

    // عرض المنتجات مع تعديل الهيكل لدعم الإطار الذهبي المتحرك
    let productsHtml = '<div class="products-wrapper">';
    productsData.forEach(p => {
        productsHtml += `
            <div class="product-card" onclick="openProductPage('${p.id}')">
                <!-- هذا التغليف مهم لكي لا يختفي المحتوى تحت الإطار الذهبي -->
                <div class="product-content-wrapper">
                    <div class="product-image-wrap"><img src="${p.imageUrl}" alt="${p.name}"></div>
                    <h3 class="product-name">${p.name}</h3>
                </div>
            </div>
        `;
    });
    productsHtml += '</div>';

    // دمج الإعلان والمنتجات في الصفحة
    mainContent.innerHTML = topAdHtml + productsHtml;
    lucide.createIcons();
}

// ==========================================
// وظائف صفحة تفاصيل المنتج
// ==========================================
function openProductPage(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    let linkUrl = "#";
    let linkLabel = "دخول";
    if (product.links && product.links.length > 0) {
        linkUrl = product.links[0].url;
        linkLabel = product.links[0].label;
    }

    const contentDiv = document.getElementById('product-page-content');
    contentDiv.innerHTML = `
        <img src="${product.imageUrl}" class="details-image" alt="${product.name}">
        <div class="details-info-container">
            <div class="title-and-btn">
                <h1 class="details-title">${product.name}</h1>
                ${product.links && product.links.length > 0 ? 
                  `<a href="${linkUrl}" target="_blank" class="details-btn">${linkLabel} <i data-lucide="external-link" style="width:16px"></i></a>` 
                  : ''}
            </div>
            <p class="details-desc">${product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
        </div>
    `;
    
    document.getElementById('product-details-page').classList.remove('hidden');
    lucide.createIcons();
}

function closeProductPage() {
    document.getElementById('product-details-page').classList.add('hidden');
}

// ==========================================
// بناء صفحة عن التطبيق
// ==========================================
function renderAbout() {
    mainContent.innerHTML = `
        <h2 style="margin-bottom: 20px; text-align: center;">حول التطبيق</h2>
        <div class="app-list">
            <div class="app-list-item" onclick="this.classList.toggle('open')">
                <div class="app-list-header">
                    <div style="display:flex; align-items:center;">
                        <i data-lucide="info" class="icon-main"></i> من نحن
                    </div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="app-list-body">
                    <p style="margin-bottom:10px;">نحن في <b>فن التكنولوجيا الحديث</b> نسعى دائمًا لتقديم أفضل الحلول البرمجية والتقنية المبتكرة التي تلبي تطلعاتكم وتواكب عصر التطور السريع. نضع بين أيديكم خبراتنا لضمان الجودة والتميز في كل مشروع.</p>
                    <p>يشرفنا انضمامكم لعائلتنا ومتابعة أحدث أعمالنا من خلال منصاتنا.</p>
                    <br>
                    <a href="https://www.facebook.com/share/1RYfQSXgoz/" target="_blank" class="action-btn btn-facebook" style="padding: 10px;">
                        <i data-lucide="facebook"></i> زيارة صفحتنا على فيسبوك
                    </a>
                </div>
            </div>

            <div class="app-list-item" onclick="this.classList.toggle('open')">
                <div class="app-list-header">
                    <div style="display:flex; align-items:center;">
                        <i data-lucide="shield-check" class="icon-main"></i> سياسة الخصوصية
                    </div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="app-list-body">
                    نحن نحترم خصوصيتك ونلتزم بحماية بياناتك. جميع المعلومات التي يتم جمعها تستخدم فقط لتحسين تجربة استخدامك للتطبيق ولن يتم مشاركتها مع أي جهات خارجية دون موافقتك الصريحة.
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

// ==========================================
// بناء صفحة حسابي
// ==========================================
function renderProfile() {
    const isDark = document.body.classList.contains('dark-mode');
    mainContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <i data-lucide="user-circle" style="width: 80px; height: 80px; color: var(--primary-color);"></i>
            <h2>مرحباً بك</h2>
            <p style="color: var(--text-muted); font-size: 14px;">إعدادات الحساب والتواصل</p>
        </div>

        <div class="app-list">
            <button class="action-btn btn-theme" onclick="toggleTheme()">
                <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
                <span>${isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}</span>
            </button>

            <a href="https://www.facebook.com/share/1RYfQSXgoz/" target="_blank" class="action-btn btn-facebook">
                <i data-lucide="facebook"></i> الصفحة الرسمية
            </a>

            <a href="https://wa.me/9647729373260" target="_blank" class="action-btn btn-whatsapp">
                <i data-lucide="message-circle"></i> تواصل عبر واتساب
            </a>
        </div>
    `;
    lucide.createIcons();
}

// تبديل الثيم
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    renderProfile(); 
}

// التنقل بين الصفحات السفلية
function switchTab(tabId) {
    currentTab = tabId;
    navItems.forEach(item => {
        if (item.dataset.tab === tabId) item.classList.add('active');
        else item.classList.remove('active');
    });

    mainContent.innerHTML = `<div class="loader-container"><i data-lucide="loader-2" class="spinner"></i></div>`;
    lucide.createIcons();

    setTimeout(() => {
        if (tabId === 'home') renderHome();
        if (tabId === 'about') renderAbout();
        if (tabId === 'profile') renderProfile();
    }, 100);
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const tabId = item.dataset.tab;
        if (tabId !== currentTab) {
            closeProductPage(); 
            switchTab(tabId);
        }
    });
});

// تشغيل النظام
setupSubscriptions();
