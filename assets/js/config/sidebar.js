// assets/js/sidebar.js
import { NetworkHelper } from './networkHelper.js';
import { ENDPOINTS } from './endpoint.js';

// Fungsi untuk menambahkan .html jika belum ada di routes_page
function ensureHtmlExtension(route) {
    if (!route.endsWith('.html')) {
        return `${route}.html`;
    }
    return route;
}

// Fungsi untuk membuat elemen menu secara dinamis
function createMenu(menuData) {
    const menuList = document.getElementById('menu-list');

    menuData.forEach(menu => {
        const menuItem = document.createElement('li');
        menuItem.classList.add('menu-item');

        const menuLink = document.createElement('a');
        menuLink.classList.add('menu-link');
        menuLink.href = menu.routes_page ? ensureHtmlExtension(menu.routes_page) : '#'; // Tambahkan .html jika perlu

        const menuIcon = document.createElement('i');
        const iconClass = menu.icon || 'ti ti-id'; // Replace 'ti ti-id' with your default icon class if needed
        menuIcon.className = `menu-icon tf-icons ${iconClass}`;

        const menuName = document.createElement('div');
        menuName.textContent = menu.nama_menu;

        // Menambahkan ikon dan nama menu
        menuLink.appendChild(menuIcon);
        menuLink.appendChild(menuName);
        menuItem.appendChild(menuLink);

        // Jika menu memiliki children, buat submenu
        if (menu.children && menu.children.length > 0) {
            const subMenu = document.createElement('ul');
            subMenu.classList.add('menu-sub');

            menu.children.forEach(subMenuItem => {
                const subMenuItemElement = document.createElement('li');
                subMenuItemElement.classList.add('menu-item');

                const subMenuLink = document.createElement('a');
                subMenuLink.classList.add('menu-link');
                subMenuLink.href = subMenuItem.routes_page
                    ? ensureHtmlExtension(subMenuItem.routes_page)
                    : '#';
                    const subMenuIcon = document.createElement('i');
                    const subMenuIconClass = subMenuItem.icon || 'ti ti-id'; // Default icon for submenus
                    subMenuIcon.className = `menu-icon tf-icons ${subMenuIconClass}`;
    
                const subMenuName = document.createElement('div');
                subMenuName.textContent = subMenuItem.nama_menu;

                subMenuLink.appendChild(subMenuName);
                subMenuItemElement.appendChild(subMenuLink);
                subMenu.appendChild(subMenuItemElement);
            });

            // Tambahkan submenu hanya jika ada children
            menuItem.appendChild(subMenu);
            menuLink.classList.add('menu-toggle'); // Tambahkan kelas untuk toggle jika submenu ada
        }

        menuList.appendChild(menuItem);
    });
}

// Fungsi untuk memuat data menu dari API dan menampilkannya
export async function loadMenus(role_id) {
    try {
        const response = await NetworkHelper.post(ENDPOINTS.MENU.GET_ALL, { role_id: role_id });

        if (response.status === 'success' && response.data) {
            createMenu(response.data); // Pass data menu ke fungsi createMenu
        } else {
        }
    } catch (error) {
    }
}
