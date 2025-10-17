document.addEventListener('DOMContentLoaded', function() {
    const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/CruxRiajuu/carrd-assets/main/nav-data.json';
    let navData = null;

    function buildMenu(items, isSubmenu = false) {
        const fragment = document.createDocumentFragment();
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'ff7-nav-item';
            
            const a = document.createElement('a');
            a.href = item.url;
            a.className = isSubmenu ? 'ff7-nav-submenu-link' : 'ff7-nav-link';
            a.textContent = item.name;

            const leftMarker = document.createElement('img');
            leftMarker.className = 'nav-marker-icon-left';
            leftMarker.src = 'https://i.imgur.com/ar5wbxj.png';
            leftMarker.alt = 'Left Marker';
            a.appendChild(leftMarker);

            const rightMarker = document.createElement('img');
            rightMarker.className = 'nav-marker-icon-right';
            rightMarker.src = 'https://i.imgur.com/uJguEWG.png';
            rightMarker.alt = 'Right Marker';
            a.appendChild(rightMarker);

            li.appendChild(a);

            if (item.children && item.children.length > 0) {
                const ul = document.createElement('ul');
                ul.className = 'ff7-nav-submenu';
                ul.appendChild(buildMenu(item.children, true));
                li.appendChild(ul);
            }
            fragment.appendChild(li);
        });
        return fragment;
    }
    
    function buildMobileMenu(items, container) {
        items.forEach(item => {
            const a = document.createElement('a');
            a.href = item.url;
            a.className = 'ff7-mobile-link';
            a.textContent = item.name;
            container.appendChild(a);

            if (item.children && item.children.length > 0) {
                item.children.forEach(child => {
                    const sublink = document.createElement('a');
                    sublink.href = child.url;
                    sublink.className = 'ff7-mobile-link ff7-mobile-sublink';
                    sublink.textContent = `- ${child.name}`;
                    container.appendChild(sublink);
                });
            }
        });
    }

    function updateActiveTrail() {
        document.querySelectorAll('.ff7-nav-bar a, .ff7-mobile-overlay a').forEach(link => link.classList.remove('active'));
        
        const currentHash = window.location.hash || '#home';
        
        document.querySelectorAll(`.ff7-nav-bar a[href="${currentHash}"], .ff7-mobile-overlay a[href="${currentHash}"]`).forEach(targetLink => {
            if (targetLink) {
                targetLink.classList.add('active');
                let currentElement = targetLink;
                while (currentElement) {
                    const parentLi = currentElement.closest('li.ff7-nav-item');
                    if (!parentLi) break;
                    const parentUl = parentLi.parentElement;
                    if (!parentUl || !parentUl.classList.contains('ff7-nav-submenu')) break;
                    const grandParentLi = parentUl.closest('li.ff7-nav-item');
                    if (!grandParentLi) break;
                    const parentLink = grandParentLi.querySelector(':scope > a');
                    if (parentLink) {
                        parentLink.classList.add('active');
                        currentElement = parentLink;
                    } else { break; }
                }
            }
        });
    }

    fetch(GITHUB_JSON_URL)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            navData = data;
            const leftNavContainer = document.getElementById('nav-list-left');
            const rightNavContainer = document.getElementById('nav-list-right');
            const mobileNavContainer = document.getElementById('mobile-nav-links');

            if (leftNavContainer && data.leftNav) {
                leftNavContainer.appendChild(buildMenu(data.leftNav));
                buildMobileMenu(data.leftNav, mobileNavContainer);
            }
            if (rightNavContainer && data.rightNav) {
                rightNavContainer.appendChild(buildMenu(data.rightNav));
                buildMobileMenu(data.rightNav, mobileNavContainer);
            }
            
            updateActiveTrail();
            window.addEventListener('hashchange', updateActiveTrail);
            window.dispatchEvent(new Event('fixed_elements_update'));
        })
        .catch(error => {
            console.error('Error fetching or building nav bar:', error);
            const rightNavContainer = document.getElementById('nav-list-right');
            if (rightNavContainer) {
                rightNavContainer.innerHTML = `<li class="ff7-nav-item"><a href="#" class="ff7-nav-link" style="color: #ff6b6b; text-shadow: none;">MENU FAILED TO LOAD</a></li>`;
            }
            window.dispatchEvent(new Event('fixed_elements_update'));
        });

    const hamburger = document.querySelector('.ff7-hamburger-menu');
    const mobileOverlay = document.querySelector('.ff7-mobile-overlay');

    function toggleMenu() {
        hamburger.classList.toggle('open');
        mobileOverlay.classList.toggle('open');
    }

    hamburger.addEventListener('click', toggleMenu);
    
    mobileOverlay.addEventListener('click', function(e) {
        if (e.target.classList.contains('ff7-mobile-link') || e.target === mobileOverlay) {
            toggleMenu();
        }
    });

    const ff7BarToHide = document.querySelector('.ff7-nav-bar');
    if (ff7BarToHide) {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateVisibility = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                if (!ff7BarToHide.classList.contains('hidden')) {
                    ff7BarToHide.classList.add('hidden');
                    window.dispatchEvent(new Event('fixed_elements_update'));
                }
            } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
                if (ff7BarToHide.classList.contains('hidden')) {
                    ff7BarToHide.classList.remove('hidden');
                    window.dispatchEvent(new Event('fixed_elements_update'));
                }
            }
            lastScrollY = currentScrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateVisibility);
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }
});
