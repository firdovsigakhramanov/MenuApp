// Admin girişi kontrolü
function loginAdmin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Kayıtlı kullanıcıları al
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Admin için sabit giriş bilgileri
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({
                id: 0,
                username: 'admin',
                fullName: 'Admin',
                role: 'admin'
            }));
            window.location.href = 'panel.html';
            return;
        }

        // Diğer kullanıcılar için kontrol
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }));
            window.location.href = 'panel.html';
        } else {
            alert('Yanlış istifadəçi adı və ya şifrə!');
        }
    } catch (error) {
        console.error('Giriş xətası:', error);
        alert('Giriş zamanı xəta baş verdi!');
    }
}

// Oturum kontrolü ve yetkilendirme
function checkAuth() {
    try {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('login.html');
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!isLoggedIn && !isLoginPage) {
            window.location.href = 'login.html';
            return;
        }

        if (isLoggedIn && isLoginPage) {
            window.location.href = 'panel.html';
            return;
        }

        // Kullanıcı adını göster
        const userNameElement = document.getElementById('currentUserName');
        if (userNameElement && currentUser) {
            userNameElement.textContent = currentUser.fullName;
        }

        // Kullanıcı rolüne göre menü öğelerini göster/gizle
        if (currentUser && currentUser.role !== 'admin') {
            // Admin olmayan kullanıcılar için bazı sekmeleri gizle
            document.querySelectorAll('.admin-tab').forEach(tab => {
                if (tab.textContent.includes('İstifadəçilər') || 
                    tab.textContent.includes('Kateqoriyalar')) {
                    tab.style.display = 'none';
                }
            });
        }

    } catch (error) {
        console.error('Oturum yoxlama xətası:', error);
    }
}

// Çıkış işlemi
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Tab değiştirme
function showTab(tabName) {
    // Tüm tabları gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Seçilen tabı göster
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Tab butonlarının aktifliğini güncelle
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Menü öğelerini kategorilere göre yükle
function loadMenuItems() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || getDefaultCategories();
    const container = document.querySelector('.menu-items-container');
    
    // Menü öğelerini kategorilere göre grupla
    const groupedItems = categories.map(category => {
        const items = menuItems.filter(item => item.category === category.name);
        return {
            category: category,
            items: items
        };
    }).filter(group => group.items.length > 0); // Boş kategorileri gösterme

    container.innerHTML = groupedItems.map(group => `
        <div class="category-section">
            <div class="category-header">
                <i class="${group.category.icon}"></i>
                <h2>${group.category.name}</h2>
                <span class="item-count">${group.items.length} məhsul</span>
            </div>
            <div class="category-items">
                ${group.items.map(item => `
                    <div class="admin-menu-item">
                        <img src="${item.imageUrl}" alt="${item.name}">
                        <div class="admin-menu-item-content">
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            <p><strong>Qiymət:</strong> ${item.price.toFixed(2)} AZN</p>
                            <div class="admin-menu-item-actions">
                                <button class="edit-btn" onclick="editMenuItem(${item.id})">
                                    <i class="fas fa-edit"></i> Düzənlə
                                </button>
                                <button class="delete-btn" onclick="deleteMenuItem(${item.id})">
                                    <i class="fas fa-trash"></i> Sil
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Yeni menü öğesi ekle
function addMenuItem(event) {
    event.preventDefault();
    const form = event.target;
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || getDefaultCategories();
    
    // Kategori kontrolü
    const selectedCategory = form.category.value;
    if (!categories.some(cat => cat.name === selectedCategory)) {
        alert('Seçilən kateqoriya mövcud deyil!');
        return false;
    }
    
    const newItem = {
        id: Date.now(),
        name: form.name.value,
        category: selectedCategory,
        price: parseFloat(form.price.value),
        description: form.description.value,
        imageUrl: form.imageUrl.value
    };
    
    menuItems.push(newItem);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    
    form.reset();
    alert('Məhsul uğurla əlavə edildi!');
    
    // Menü yönetimi tabına geç ve yenile
    showTab('menu');
    loadMenuItems();
    loadCategories(); // Kategori istatistiklerini güncelle
}

// Menü öğesi sil
function deleteMenuItem(id) {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        menuItems = menuItems.filter(item => item.id !== id);
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        loadMenuItems();
    }
}

// Kullanıcıları yükle
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const container = document.querySelector('.users-list');
    
    container.innerHTML = users.map(user => `
        <div class="user-card">
            <span class="role-badge ${user.role}">${user.role}</span>
            <div class="user-info">
                <h3>${user.fullName}</h3>
                <p>${user.username}</p>
            </div>
            <div class="user-actions">
                <button class="edit-btn" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> Düzənlə
                </button>
                <button class="delete-btn" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i> Sil
                </button>
            </div>
        </div>
    `).join('');
}

// Yeni kullanıcı modal
function showAddUserForm() {
    document.getElementById('addUserModal').style.display = 'block';
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

// Yeni kullanıcı ekle
function addUser(event) {
    event.preventDefault();
    const form = event.target;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const newUser = {
        id: Date.now(),
        fullName: form.fullName.value,
        username: form.username.value,
        password: form.password.value, // Gerçek uygulamada şifre hashlenmelidir
        role: form.role.value
    };
    
    // Kullanıcı adı kontrolü
    if (users.some(user => user.username === newUser.username)) {
        alert('Bu istifadəçi adı artıq mövcuddur!');
        return false;
    }
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    form.reset();
    closeAddUserModal();
    loadUsers();
    alert('İstifadəçi uğurla əlavə edildi!');
    return false;
}

// Kullanıcı sil
function deleteUser(id) {
    if (confirm('Bu istifadəçini silmək istədiyinizdən əminsiniz?')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(user => user.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        loadUsers();
    }
}

// Kategorileri yükle
function loadCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || getDefaultCategories();
    const container = document.querySelector('.categories-grid');
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    
    container.innerHTML = categories.map(category => {
        const itemCount = menuItems.filter(item => item.category === category.name).length;
        return `
            <div class="category-card">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <h3 class="category-name">${category.name}</h3>
                <p class="category-stats">
                    <i class="fas fa-list"></i> ${itemCount} məhsul
                </p>
                <div class="category-actions">
                    <button class="edit-btn" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i> Düzənlə
                    </button>
                    <button class="delete-btn" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Varsayılan kategorileri al
function getDefaultCategories() {
    const defaultCategories = [
        { id: 1, name: 'Şorbalar', icon: 'fas fa-utensils' },
        { id: 2, name: 'Salatlar', icon: 'fas fa-leaf' },
        { id: 3, name: 'Əsas Yeməklər', icon: 'fas fa-drumstick-bite' },
        { id: 4, name: 'Şirniyyatlar', icon: 'fas fa-cookie' },
        { id: 5, name: 'İçkilər', icon: 'fas fa-glass-martini-alt' }
    ];
    localStorage.setItem('categories', JSON.stringify(defaultCategories));
    return defaultCategories;
}

// Kategori modal
function showAddCategoryForm() {
    document.getElementById('addCategoryModal').style.display = 'block';
}

function closeAddCategoryModal() {
    document.getElementById('addCategoryModal').style.display = 'none';
}

// Yeni kategori ekle
function addCategory(event) {
    event.preventDefault();
    const form = event.target;
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    const newCategory = {
        id: Date.now(),
        name: form.name.value,
        icon: form.icon.value
    };
    
    // Kategori adı kontrolü
    if (categories.some(cat => cat.name === newCategory.name)) {
        alert('Bu kateqoriya artıq mövcuddur!');
        return false;
    }
    
    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));
    
    form.reset();
    closeAddCategoryModal();
    loadCategories();
    
    // Kategori seçim listesini güncelle
    updateCategorySelects();
    
    alert('Kateqoriya uğurla əlavə edildi!');
    return false;
}

// Kategori sil
function deleteCategory(id) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const category = categories.find(cat => cat.id === id);
    
    if (!category) return;
    
    const itemsInCategory = menuItems.filter(item => item.category === category.name);
    
    if (itemsInCategory.length > 0) {
        alert(`Bu kateqoriyada ${itemsInCategory.length} məhsul var. Əvvəlcə məhsulları silin və ya başqa kateqoriyaya köçürün.`);
        return;
    }
    
    if (confirm('Bu kateqoriyanı silmək istədiyinizdən əminsiniz?')) {
        const newCategories = categories.filter(cat => cat.id !== id);
        localStorage.setItem('categories', JSON.stringify(newCategories));
        loadCategories();
        updateCategorySelects();
    }
}

// Kategori seçim listelerini güncelle
function updateCategorySelects() {
    const categories = JSON.parse(localStorage.getItem('categories')) || getDefaultCategories();
    const selects = document.querySelectorAll('select[name="category"]');
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `
            <option value="">Kateqoriya Seçin</option>
            ${categories.map(cat => `
                <option value="${cat.name}" ${currentValue === cat.name ? 'selected' : ''}>
                    ${cat.name}
                </option>
            `).join('')}
        `;
    });
}

// Düzenleme modalını aç
function editMenuItem(id) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const item = menuItems.find(item => item.id === id);
    
    if (!item) return;
    
    const form = document.getElementById('editItemForm');
    form.itemId.value = item.id;
    form.name.value = item.name;
    form.category.value = item.category;
    form.price.value = item.price;
    form.description.value = item.description;
    form.imageUrl.value = item.imageUrl;
    
    document.getElementById('editItemModal').style.display = 'block';
}

// Düzenleme modalını kapat
function closeEditItemModal() {
    document.getElementById('editItemModal').style.display = 'none';
}

// Menü öğesini güncelle
function updateMenuItem(event) {
    event.preventDefault();
    const form = event.target;
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const itemId = parseInt(form.itemId.value);
    
    // Güncellenecek öğeyi bul
    const itemIndex = menuItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;
    
    // Öğeyi güncelle
    menuItems[itemIndex] = {
        id: itemId,
        name: form.name.value,
        category: form.category.value,
        price: parseFloat(form.price.value),
        description: form.description.value,
        imageUrl: form.imageUrl.value
    };
    
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    
    closeEditItemModal();
    loadMenuItems();
    loadCategories(); // Kategori istatistiklerini güncelle
    
    alert('Məhsul uğurla yeniləndi!');
    return false;
}

// Kategori düzenleme modalını aç
function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const category = categories.find(cat => cat.id === id);
    
    if (!category) return;
    
    const form = document.getElementById('editCategoryForm');
    form.categoryId.value = category.id;
    form.name.value = category.name;
    form.icon.value = category.icon;
    
    document.getElementById('editCategoryModal').style.display = 'block';
}

// Kategori düzenleme modalını kapat
function closeEditCategoryModal() {
    document.getElementById('editCategoryModal').style.display = 'none';
}

// Kategoriyi güncelle
function updateCategory(event) {
    event.preventDefault();
    const form = event.target;
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const categoryId = parseInt(form.categoryId.value);
    
    // Güncellenecek kategoriyi bul
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) return false;
    
    const oldName = categories[categoryIndex].name;
    const newName = form.name.value;
    
    // Kategori adı kontrolü (eğer değiştiyse)
    if (oldName !== newName && categories.some(cat => cat.name === newName)) {
        alert('Bu kateqoriya adı artıq mövcuddur!');
        return false;
    }
    
    // Kategoriyi güncelle
    categories[categoryIndex] = {
        id: categoryId,
        name: newName,
        icon: form.icon.value
    };
    
    // İlgili menü öğelerini güncelle
    if (oldName !== newName) {
        menuItems.forEach(item => {
            if (item.category === oldName) {
                item.category = newName;
            }
        });
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }
    
    localStorage.setItem('categories', JSON.stringify(categories));
    
    closeEditCategoryModal();
    loadCategories();
    loadMenuItems();
    updateCategorySelects();
    
    alert('Kateqoriya uğurla yeniləndi!');
    return false;
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Önce kategorileri yükle
    if (!localStorage.getItem('categories')) {
        getDefaultCategories();
    }
    
    // Sonra diğer bileşenleri yükle
    if (document.querySelector('.menu-items-container')) {
        loadMenuItems();
    }
    if (document.querySelector('.users-list')) {
        loadUsers();
    }
    if (document.querySelector('.categories-grid')) {
        loadCategories();
    }
    updateCategorySelects();
});

// Modal dışına tıklandığında kapat (güncelleme)
window.onclick = function(event) {
    const userModal = document.getElementById('addUserModal');
    const categoryModal = document.getElementById('addCategoryModal');
    const editItemModal = document.getElementById('editItemModal');
    const editCategoryModal = document.getElementById('editCategoryModal');
    
    if (event.target === userModal) {
        closeAddUserModal();
    }
    if (event.target === categoryModal) {
        closeAddCategoryModal();
    }
    if (event.target === editItemModal) {
        closeEditItemModal();
    }
    if (event.target === editCategoryModal) {
        closeEditCategoryModal();
    }
} 