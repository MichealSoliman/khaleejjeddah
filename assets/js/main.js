/**
 * Khaleej Jeddah - Unified Core Scripts (Phase 6)
 */
document.addEventListener('DOMContentLoaded', function () {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('md:top-0');
                navbar.classList.remove('md:top-auto');
            } else {
                navbar.classList.remove('md:top-0');
                navbar.classList.add('md:top-auto');
            }
        }, { passive: true });
    }

    // 2. Accessible Mobile Menu Controller
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    function toggleMobileMenu(show) {
        if (!mobileMenu || !menuBtn) return;
        const isHidden = typeof show === 'boolean' ? !show : !mobileMenu.classList.contains('hidden');
        if (isHidden) {
            mobileMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.setAttribute('aria-label', 'فتح القائمة الرئيسية');
            const icon = menuBtn.querySelector('i');
            if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
        } else {
            mobileMenu.classList.remove('hidden');
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.setAttribute('aria-label', 'إغلاق القائمة الرئيسية');
            const icon = menuBtn.querySelector('i');
            if (icon) { icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); }
        }
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', () => toggleMobileMenu());
    }

    // 3. Mobile Services Dropdown Toggle
    const mobileServicesBtn = document.getElementById('mobile-services-btn');
    const mobileServicesDropdown = document.getElementById('mobile-services-dropdown');
    const mobileServicesIcon = document.getElementById('mobile-services-icon');

    if (mobileServicesBtn && mobileServicesDropdown) {
        mobileServicesBtn.addEventListener('click', () => {
            const isOpen = !mobileServicesDropdown.classList.contains('hidden');
            if (isOpen) {
                mobileServicesDropdown.classList.add('hidden');
                mobileServicesBtn.setAttribute('aria-expanded', 'false');
                if (mobileServicesIcon) mobileServicesIcon.classList.remove('rotate-180');
            } else {
                mobileServicesDropdown.classList.remove('hidden');
                mobileServicesBtn.setAttribute('aria-expanded', 'true');
                if (mobileServicesIcon) mobileServicesIcon.classList.add('rotate-180');
            }
        });
    }

    // 4. Desktop Services Dropdown Accessibility
    const desktopServicesBtn = document.getElementById('desktop-services-btn');
    const desktopServicesDropdown = document.getElementById('desktop-services-dropdown');

    if (desktopServicesBtn && desktopServicesDropdown) {
        desktopServicesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = desktopServicesBtn.getAttribute('aria-expanded') === 'true';
            desktopServicesBtn.setAttribute('aria-expanded', (!isExpanded).toString());
        });
    }

    // 5. Close Mobile Menu on Link Click
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMobileMenu(false));
        });
    }

    // 6. Keyboard & Escape Key Handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu(false);
                if (menuBtn) menuBtn.focus();
            }
            if (mobileServicesDropdown && !mobileServicesDropdown.classList.contains('hidden')) {
                mobileServicesDropdown.classList.add('hidden');
                if (mobileServicesBtn) {
                    mobileServicesBtn.setAttribute('aria-expanded', 'false');
                    mobileServicesBtn.focus();
                }
                if (mobileServicesIcon) mobileServicesIcon.classList.remove('rotate-180');
            }
            if (desktopServicesBtn && desktopServicesBtn.getAttribute('aria-expanded') === 'true') {
                desktopServicesBtn.setAttribute('aria-expanded', 'false');
                desktopServicesBtn.focus();
            }
        }
    });

    // 7. Scroll To Top Button
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.remove('opacity-0', 'invisible');
                scrollTopBtn.classList.add('opacity-100', 'visible');
            } else {
                scrollTopBtn.classList.add('opacity-0', 'invisible');
                scrollTopBtn.classList.remove('opacity-100', 'visible');
            }
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'auto' });
        });
    }

    // 8. FAQ Accordion Controller
    const faqAccordion = document.getElementById('faq-accordion');
    if (faqAccordion) {
        const faqItems = faqAccordion.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const button = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const icon = button ? button.querySelector('.faq-icon') : null;

            if (button && answer) {
                button.addEventListener('click', function () {
                    const isExpanded = button.getAttribute('aria-expanded') === 'true';

                    // Close all other accordion items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherButton = otherItem.querySelector('.faq-question');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherIcon = otherButton ? otherButton.querySelector('.faq-icon') : null;

                            if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
                            if (otherAnswer) otherAnswer.style.maxHeight = null;
                            if (otherIcon) otherIcon.classList.remove('rotate-180');
                        }
                    });

                    // Toggle current item
                    if (isExpanded) {
                        button.setAttribute('aria-expanded', 'false');
                        answer.style.maxHeight = null;
                        if (icon) icon.classList.remove('rotate-180');
                    } else {
                        button.setAttribute('aria-expanded', 'true');
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                        if (icon) icon.classList.add('rotate-180');
                    }
                });
            }
        });
    }
});
