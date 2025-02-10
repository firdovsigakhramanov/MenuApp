// Menü öğelerini localStorage'dan al, yoksa varsayılan listeyi kullan
let menuItems = [
    // Şorbalar
    {
        id: 1,
        name: "Mərci Şorbası",
        description: "Ənənəvi Türk mətbəxinin vazkeçilməzi, xüsusi ədviyyatlarla zənginləşdirilmiş mərci şorbası",
        price: 5.50,
        category: "Şorbalar",
        imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80"
    },
    {
        id: 2,
        name: "Ezogelin Şorbası",
        description: "Qırmızı mərci, bulqur və nanə ilə hazırlanan ənənəvi şorba",
        price: 5.00,
        category: "Şorbalar",
        imageUrl: "https://images.unsplash.com/photo-1578020190125-f4f7c18bc9cb?w=800&q=80"
    },
    // Ana Yemekler
    {
        id: 3,
        name: "Adana Kabab",
        description: "Xüsusi ədviyyatlarla hazırlanmış, kömürdə bişirilmiş ənənəvi Adana kababı",
        price: 15.00,
        category: "Əsas Yeməklər",
        imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80"
    },
    // Tatlılar
    {
        id: 4,
        name: "Künəfə",
        description: "Xüsusi pendiri və şərbəti ilə hazırlanan ənənəvi tel qadayıf şirniyyatı",
        price: 8.00,
        category: "Şirniyyatlar",
        imageUrl: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=800&q=80"
    },
    // İçecekler
    {
        id: 5,
        name: "Türk Qəhvəsi",
        description: "Ənənəvi üsulla hazırlanan Türk qəhvəsi",
        price: 3.00,
        category: "İçkilər",
        imageUrl: "https://doz.coffee/cdn/shop/articles/Untitled_design_Large_c7956b39-2824-42be-8c03-821a963704fd.jpg?v=1696322204"
    },
    {
        id: 6,
        name: "Ice Tea",
        description: "Soyuq Çay",
        price: 5.00,
        category: "İçkilər",
        imageUrl: "https://www.everydaycheapskate.com/wp-content/uploads/20240705-how-to-make-iced-tea-glass-with-ice-cubes-and-sliced-and-whole-lemons.png"
    },
    // Salatlar

    // İçecekler
    {
        id: 7,
        name: "Çoban Salatı",
        description: "Ənənəvi üsulla hazırlanan milli salat",
        price: 3.00,
        category: "Salatlar",
        imageUrl: "https://sabalid.az/uploads/posts/2021-01/1612008164_coban-salat-507x285.jpg"
    },
    {
        id: 8,
        name: "Paytaxt Salatı",
        description: "Ən dadlı təamlarımızdandır.",
        price: 5.00,
        category: "Salatlar",
        imageUrl: "https://e-saglam.az/storage/news/middle/images/2023/12/maxresdefault.jpg"
    }
];

// Menü öğelerini filtreleme ve gösterme
function filterMenuItems(category) {
    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    renderMenuItems(filteredItems);
}

function renderMenuItems(items) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = items.map(item => `
        <div class="menu-item" onclick="showDetails(${item.id})">
            <img src="${item.imageUrl}" class="menu-item__img" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="description">${item.description}</p>
                <div class="price-tag">
                    <span class="price">${item.price.toFixed(2)} AZN</span>
                    <button class="detail-btn">Ətraflı</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Modal işlemleri
function showDetails(id) {
    const item = menuItems.find(item => item.id === id);
    const isFavorite = favorites.some(fav => fav.id === item.id);
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="modal-details">
            <div class="modal-image-container">
                <img src="${item.imageUrl}" alt="${item.name}" class="modal-image">
            </div>
            <div class="modal-info">
                <span class="modal-category">${item.category}</span>
                <h2>${item.name}</h2>
                <p class="modal-description">${item.description}</p>
                <div class="modal-price">${item.price.toFixed(2)} AZN</div>
                <div class="modal-actions">
                    <button class="modal-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite(${item.id})">
                        <i class="fas fa-heart"></i> ${isFavorite ? 'Favorilərdən Çıxar' : 'Favorilərə Əlavə Et'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = "block";
}

// Favorilere ekle/çıkar
function toggleFavorite(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    const index = favorites.findIndex(fav => fav.id === itemId);
    
    if (index === -1) {
        favorites.push(item);
    } else {
        favorites.splice(index, 1);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
    
    // Modal içindeki favori butonunu güncelle
    const favoriteBtn = document.querySelector('.favorite-btn');
    const isFavorite = favorites.some(fav => fav.id === itemId);
    
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active');
        favoriteBtn.innerHTML = `
            <i class="fas fa-heart"></i> ${isFavorite ? 'Favorilərdən Çıxar' : 'Favorilərə Əlavə Et'}
        `;
    }
}

// Favorilerden kaldır
function removeFavorite(id) {
    if (confirm('Bu məhsulu favorilərdən silmək istədiyinizdən əminsiniz?')) {
        favorites = favorites.filter(item => item.id !== id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }
}

// Kategori butonları için event listeners
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        // Aktif buton stilini güncelle
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Menüyü filtrele
        const category = e.target.dataset.category;
        filterMenuItems(category);
    });
});

const modal = document.getElementById('menuModal');
const closeBtn = document.getElementsByClassName('close')[0];

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Sayfa yüklendiğinde menüyü göster
document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems(menuItems);
});

// Favori işlemleri için gerekli değişkenler
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
const favoritesToggle = document.querySelector('.favorites-toggle');
const favoritesSidebar = document.querySelector('.favorites-sidebar');
const closeFavorites = document.querySelector('.close-favorites');
const favoritesList = document.querySelector('.favorites-list');
const favoritesEmpty = document.querySelector('.favorites-empty');

// Favori sayısını güncelle
function updateFavoritesCount() {
    const favCount = document.querySelector('.favorites-count');
    favCount.textContent = favorites.length;
    
    if (favorites.length === 0) {
        favoritesEmpty.style.display = 'flex';
        favoritesList.style.display = 'none';
    } else {
        favoritesEmpty.style.display = 'none';
        favoritesList.style.display = 'block';
    }
}

// Favorileri görüntüle
function renderFavorites() {
    favoritesList.innerHTML = favorites.map(item => `
        <div class="favorite-item">
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="favorite-item-info">
                <h4>${item.name}</h4>
                <p>${item.category}</p>
                <p class="price">${item.price.toFixed(2)} AZN</p>
            </div>
            <button class="remove-favorite" onclick="removeFavorite(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    updateFavoritesCount();
}

// Favori butonuna tıklama
favoritesToggle.addEventListener('click', () => {
    favoritesSidebar.classList.add('active');
});

// Favori menüsünü kapat
closeFavorites.addEventListener('click', () => {
    favoritesSidebar.classList.remove('active');
});

// Sayfa yüklendiğinde favorileri göster
document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems(menuItems);
    renderFavorites();
}); 