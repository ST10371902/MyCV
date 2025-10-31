document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('no-js');
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primaryNav');
    const navLinks = Array.from(document.querySelectorAll('.primary-nav .nav-link'));
    const progressBar = document.querySelector('.scroll-progress__bar');
    const header = document.querySelector('.site-header');
    const dockMedia = window.matchMedia('(min-width: 1024px)');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeLabel = themeToggle ? themeToggle.querySelector('.theme-toggle__label') : null;
    const themeStorageKey = 'onlinecv-theme';

    const applyTheme = theme => {
        const normalised = theme === 'light' ? 'light' : 'dark';
        document.body.dataset.theme = normalised;
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(normalised === 'light'));
        }
        if (themeLabel) {
            themeLabel.textContent = normalised === 'light' ? 'Dark' : 'Light';
        }
        try {
            localStorage.setItem(themeStorageKey, normalised);
        } catch {
            /* ignore storage issues */
        }
    };

    const storedTheme = (() => {
        try {
            return localStorage.getItem(themeStorageKey);
        } catch {
            return null;
        }
    })();
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)');
    const initialTheme = storedTheme || (systemPrefersLight.matches ? 'light' : 'dark');
    applyTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
            applyTheme(nextTheme);
        });
    }

    const handleSystemThemeChange = event => {
        const stored = (() => {
            try {
                return localStorage.getItem(themeStorageKey);
            } catch {
                return null;
            }
        })();
        if (!stored) {
            applyTheme(event.matches ? 'light' : 'dark');
        }
    };

    if (typeof systemPrefersLight.addEventListener === 'function') {
        systemPrefersLight.addEventListener('change', handleSystemThemeChange);
    } else if (typeof systemPrefersLight.addListener === 'function') {
        systemPrefersLight.addListener(handleSystemThemeChange);
    }

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const evaluateDock = () => {
        if (!header) {
            return;
        }

        if (!dockMedia.matches) {
            header.classList.remove('site-header--docked');
            document.body.classList.remove('nav-docked');
            return;
        }

        const shouldDock = window.scrollY > 120;
        header.classList.toggle('site-header--docked', shouldDock);
        document.body.classList.toggle('nav-docked', shouldDock);

        if (shouldDock && nav) {
            nav.classList.remove('is-open');
        }
        if (shouldDock && navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
        }
    };

    window.addEventListener('scroll', evaluateDock, { passive: true });
    dockMedia.addEventListener('change', evaluateDock);
    evaluateDock();

    const animateElements = document.querySelectorAll('[data-animate]');
    if (animateElements.length) {
        const animateObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        animateObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '0px 0px -5% 0px'
            }
        );

        animateElements.forEach(element => animateObserver.observe(element));
    }

    const sections = document.querySelectorAll('section[id]');
    if (sections.length && navLinks.length) {
        const sectionObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const targetId = entry.target.getAttribute('id');
                        navLinks.forEach(link => {
                            const href = link.getAttribute('href');
                            if (href === `#${targetId}`) {
                                link.classList.add('is-active');
                            } else {
                                link.classList.remove('is-active');
                            }
                        });
                    }
                });
            },
            {
                threshold: 0.45,
                rootMargin: '-10% 0px -40% 0px'
            }
        );

        sections.forEach(section => sectionObserver.observe(section));
    }

    const lazyVideos = document.querySelectorAll('[data-lazy-video]');
    if (lazyVideos.length) {
        const videoObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    const video = entry.target;
                    const sources = video.querySelectorAll('source[data-src]');
                    sources.forEach(source => {
                        if (!source.src) {
                            source.src = source.dataset.src;
                        }
                    });
                    video.load();
                    videoObserver.unobserve(video);
                });
            },
            {
                threshold: 0.2,
                rootMargin: '0px 0px 200px 0px'
            }
        );

        lazyVideos.forEach(video => videoObserver.observe(video));
    }

    const scrollButtons = document.querySelectorAll('.rail-btn[data-scroll-target]');
    scrollButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSelector = button.getAttribute('data-scroll-target');
            if (!targetSelector) {
                return;
            }

            const container = document.querySelector(targetSelector);
            if (!container) {
                return;
            }

            const direction = button.getAttribute('data-scroll-direction') === 'prev' ? -1 : 1;
            const amount = container.clientWidth * 0.85;
            container.scrollBy({ left: direction * amount, behavior: 'smooth' });
        });
    });

    if (progressBar) {
        const updateProgress = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }
});
