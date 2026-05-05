lucide.createIcons();

// قائمة الثيمات الـ 10
const themesList = [
    { id: 'theme-dark', name: 'ليلي', bg: '#0f172a' },
    { id: 'theme-light', name: 'نهاري', bg: '#f8fafc', color: '#000' },
    { id: 'theme-blue', name: 'أزرق', bg: '#0a192f' },
    { id: 'theme-purple', name: 'بنفسجي', bg: '#2e0249' },
    { id: 'theme-green', name: 'أخضر', bg: '#0f2027' },
    { id: 'theme-red', name: 'أحمر', bg: '#2b0f0f' },
    { id: 'theme-gold', name: 'ذهبي', bg: '#1a1814' },
    { id: 'theme-neon', name: 'نيون', bg: '#000000' },
    { id: 'theme-ocean', name: 'محيط', bg: '#001f3f' },
    { id: 'theme-animated', name: 'متحرك 🌟', bg: 'linear-gradient(45deg, #ee7752, #e73c7e, #23a6d5)' }
];

// إعداد شاشة البداية والثيم المحفوظ
window.addEventListener('load', () => {
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
        setTimeout(() => {
            introScreen.classList.add('hidden');
            setTimeout(() => introScreen.style.display = 'none', 800);
        }, 2200);
    }
    const savedTheme = localStorage.getItem('appTheme') || 'theme-dark';
    document.body.className = savedTheme;
});

// إعدادات Firebase لربط البيانات
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
let searchQuery = '';

const mainContent = document.getElementById('main-content');
const navItems = document.querySelectorAll('.nav-item');

// جلب البيانات من قاعدة البيانات
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

// دالة البحث الفوري
window.handleSearch = function(value) {
    searchQuery = value.toLowerCase();
    renderHome(false); 
}

// بناء الواجهة الرئيسية وعرض المنتجات
function renderHome(resetSearch = true) {
    if(resetSearch && currentTab !== 'home') searchQuery = ''; 

    let html = '';

    // إضافة حقل البحث
    html += `
        <div class="search-container">
            <div class="search-box">
                <i data-lucide="search"></i>
                <input type="text" id="productSearch" placeholder="ابحث عن منتج..." value="${searchQuery}" onkeyup="handleSearch(this.value)" autofocus>
            </div>
        </div>
    `;

    // عرض الإعلان العلوي
    if (adsData.length > 0 && searchQuery === '') {
        html += `<div class="top-ad-container"><img src="${adsData[0].imageUrl}" alt="إعلان رئيسي"></div>`;
    }

    // فلترة المنتجات حسب البحث
    const filteredProducts = productsData.filter(p => p.name.toLowerCase().includes(searchQuery));

    if(filteredProducts.length === 0) {
        html += `<div style="text-align:center; padding: 50px; color: var(--text-muted);"><i data-lucide="package-x" style="width:50px;height:50px;margin-bottom:10px;"></i><p>لا توجد منتجات مطابقة للبحث</p></div>`;
    } else {
        html += '<div class="products-wrapper">';
        filteredProducts.forEach(p => {
            // الهيكل الجديد: الصورة تغطي البطاقة، والاسم بالخارج أسفلها
            html += `
                <div class="product-item" onclick="openProductPage('${p.id}')">
                    <div class="product-card">
                        <img src="${p.imageUrl}" alt="${p.name}" class="full-product-image">
                    </div>
                    <h3 class="product-name-outside">${p.name}</h3>
                </div>
            `;
        });
        html += '</div>';
    }

    mainContent.innerHTML = html;
    lucide.createIcons();

    // إبقاء التركيز على حقل البحث أثناء الكتابة
    if (!resetSearch) {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }
    }
}

// وظائف فتح وإغلاق صفحة تفاصيل المنتج
function openProductPage(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    let linkUrl = "#"; let linkLabel = "دخول";
    if (product.links && product.links.length > 0) {
        linkUrl = product.links[0].url; linkLabel = product.links[0].label;
    }

    const contentDiv = document.getElementById('product-page-content');
    contentDiv.innerHTML = `
        <img src="${product.imageUrl}" class="details-image" alt="${product.name}">
        <div class="details-info-container">
            <div class="title-and-btn">
                <h1 class="details-title">${product.name}</h1>
                ${product.links && product.links.length > 0 ? 
                  `<a href="${linkUrl}" target="_blank" class="details-btn">${linkLabel} <i data-lucide="external-link" style="width:16px"></i></a>` : ''}
            </div>
            <p class="details-desc">${product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
        </div>
    `;
    
    document.getElementById('product-details-page').classList.remove('hidden');
    lucide.createIcons();
}

window.closeProductPage = function() {
    document.getElementById('product-details-page').classList.add('hidden');
}

// صفحة من نحن والخصوصية
function renderAbout() {
    mainContent.innerHTML = `
        <h2 style="margin-bottom: 20px; text-align: center;">حول التطبيق</h2>
        <div class="app-list">
            <div class="app-list-item" onclick="this.classList.toggle('open')">
                <div class="app-list-header">
                    <div style="display:flex; align-items:center;"><i data-lucide="info" class="icon-main"></i> من نحن</div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="app-list-body">
                    <p style="margin-bottom:10px;">نحن في <b>فن التكنولوجيا الحديث</b> نسعى دائمًا لتقديم أفضل الحلول البرمجية والتقنية المبتكرة التي تلبي تطلعاتكم وتواكب عصر التطور السريع.</p>
                    <a href="https://www.facebook.com/share/1RYfQSXgoz/" target="_blank" class="action-btn btn-facebook" style="padding: 10px; margin-top:10px;">
                        <i data-lucide="facebook"></i> زيارة صفحتنا
                    </a>
                </div>
            </div>
            <div class="app-list-item" onclick="this.classList.toggle('open')">
                <div class="app-list-header">
                    <div style="display:flex; align-items:center;"><i data-lucide="shield-check" class="icon-main"></i> سياسة الخصوصية</div>
                    <i data-lucide="chevron-down"></i>
                </div>
                <div class="app-list-body">
                    نحن نحترم خصوصيتك ونلتزم بحماية بياناتك. التطبيق يستخدم تقنيات آمنة للتصفح ولا نشارك بياناتك مع جهات خارجية.
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

// وظائف تغيير الثيم
window.changeTheme = function(themeId) {
    document.body.className = themeId;
    localStorage.setItem('appTheme', themeId);
    renderProfile();
}

// صفحة حسابي (إعدادات المظهر وروابط التواصل)
function renderProfile() {
    const currentTheme = document.body.className || 'theme-dark';
    
    let themesHtml = '<div class="themes-grid">';
    themesList.forEach(t => {
        const isActive = currentTheme === t.id ? 'active-theme' : '';
        const textColor = t.color || '#fff';
        themesHtml += `
            <button class="theme-btn ${isActive}" style="background: ${t.bg}; color: ${textColor};" onclick="changeTheme('${t.id}')">
                ${isActive ? '<i data-lucide="check-circle" style="width:16px;"></i>' : ''} ${t.name}
            </button>
        `;
    });
    themesHtml += '</div>';

    mainContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px;">
            <i data-lucide="user-circle" style="width: 70px; height: 70px; color: var(--primary-color);"></i>
            <h2>إعدادات الحساب</h2>
        </div>
        <div class="app-list" style="margin-bottom: 25px;">
            <div class="app-list-item" style="cursor: default;">
                <div class="app-list-header" style="justify-content:center;">
                    <i data-lucide="palette" style="margin-left:8px;"></i> اختر مظهر التطبيق
                </div>
                ${themesHtml}
            </div>
        </div>
        <div class="app-list">
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

// التنقل بين القوائم السفلية
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

// تشغيل النظام وجلب البيانات
setupSubscriptions();
