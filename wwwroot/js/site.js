document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('no-js');

    const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduceMotion = prefersReducedMotionQuery.matches;
    const scrollBehavior = reduceMotion ? 'auto' : 'smooth';
    const hasThree = typeof window.THREE !== 'undefined';
    const hasGLTFLoader = hasThree && typeof THREE.GLTFLoader !== 'undefined';

    if (reduceMotion) {
        document.body.classList.add('reduce-motion');
    }

    // ========== Ambient Particle System ==========
    const initParticles = () => {
        if (reduceMotion) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'ambientParticles';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particleCount = Math.min(60, Math.floor((width * height) / 25000));
        const particles = [];

        const getAccentColor = () => {
            const isDark = document.body.dataset.theme !== 'light';
            // Higher opacity for better visibility
            return isDark ? 'rgba(249, 115, 22, 0.8)' : 'rgba(234, 88, 12, 1)';
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 4 + 2; // Larger particles
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.4 + 0.5; // Higher base opacity
                this.fadeSpeed = Math.random() * 0.008 + 0.003;
                this.growing = Math.random() > 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Gentle floating effect
                this.speedX += (Math.random() - 0.5) * 0.02;
                this.speedY += (Math.random() - 0.5) * 0.02;
                this.speedX = Math.max(-0.8, Math.min(0.8, this.speedX));
                this.speedY = Math.max(-0.8, Math.min(0.8, this.speedY));

                // Fade in/out (keep visible range higher)
                if (this.growing) {
                    this.opacity += this.fadeSpeed;
                    if (this.opacity >= 0.9) this.growing = false;
                } else {
                    this.opacity -= this.fadeSpeed;
                    if (this.opacity <= 0.4) this.growing = true;
                }

                // Wrap around screen
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
                if (this.y < -10) this.y = height + 10;
                if (this.y > height + 10) this.y = -10;
            }

            draw() {
                const color = getAccentColor().replace(/[\d.]+\)$/, `${this.opacity})`);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            canvas.remove();
        };
    };

    initParticles();
    // ========== End Particle System ==========

    const animatedNodes = Array.from(document.querySelectorAll('[data-animate]'));
    const revealAll = () => animatedNodes.forEach(node => node.classList.add('is-visible'));

    if (animatedNodes.length) {
        if (!reduceMotion && 'IntersectionObserver' in window) {
            animatedNodes.forEach(node => node.classList.add('animate-target'));
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
            );
            animatedNodes.forEach(node => observer.observe(node));
            setTimeout(revealAll, 1200);
        } else {
            revealAll();
        }
    }

    // Theme handling
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
            /* ignore storage errors */
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
        const saved = (() => {
            try {
                return localStorage.getItem(themeStorageKey);
            } catch {
                return null;
            }
        })();
        if (!saved) {
            applyTheme(event.matches ? 'light' : 'dark');
        }
    };

    if (typeof systemPrefersLight.addEventListener === 'function') {
        systemPrefersLight.addEventListener('change', handleSystemThemeChange);
    } else if (typeof systemPrefersLight.addListener === 'function') {
        systemPrefersLight.addListener(handleSystemThemeChange);
    }

    // Navigation
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primaryNav');
    const navLinks = Array.from(document.querySelectorAll('.primary-nav .nav-link'));

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                nav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');

                const target = targetId ? document.querySelector(targetId) : null;
                if (target) {
                    target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
                } else if (targetId) {
                    window.location.hash = targetId;
                }
            });
        });
    }

    const header = document.querySelector('.site-header');
    const dockMedia = window.matchMedia('(min-width: 1024px)');

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

        if (!nav) {
            return;
        }

        nav.classList.remove('is-open');
        if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
        }
    };

    window.addEventListener('scroll', evaluateDock, { passive: true });
    dockMedia.addEventListener('change', evaluateDock);
    evaluateDock();

    // Scroll progress bar
    const progressBar = document.querySelector('.scroll-progress__bar');
    if (progressBar) {
        const updateProgress = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);
        updateProgress();
    }

    // Scroll buttons for project galleries
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

            container.scrollTo({
                left: container.scrollLeft + direction * amount,
                behavior: scrollBehavior
            });
        });
    });

    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id]');
    if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
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
            { threshold: 0.45, rootMargin: '-10% 0px -40% 0px' }
        );

        sections.forEach(section => sectionObserver.observe(section));
    }

    // Hero 3D logo (Three.js) with tilt fallback
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero__visual');
    let destroyHero3d = null;

    const getCssColor = (varName, fallback) => {
        const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
        return (value && value.trim()) || fallback;
    };

    const initHeroLogo3D = () => {
        const container = document.getElementById('heroLogo3d');
        if (!container || !heroVisual || !hasThree || !hasGLTFLoader) {
            return null;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        let controls = null;
        if (typeof THREE.OrbitControls === 'function') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.enablePan = false;
            controls.enableZoom = false;
            controls.rotateSpeed = 0.6;
        }

        // Orange-tinted ambient to preserve true orange color
        const ambient = new THREE.AmbientLight(new THREE.Color('#f97316'), 1.2);
        scene.add(ambient);

        // Soft white fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(0, 2, 10);
        scene.add(fillLight);

        const loader = new THREE.GLTFLoader();
        let model = null;
        const baseRotX = THREE.MathUtils.degToRad(8);
        const baseRotY = THREE.MathUtils.degToRad(-18);
        let targetRotX = 0;
        let targetRotY = 0;
        let targetPosX = 0;
        let targetPosY = 0;
        let frameId = null;

        const updatePointerTarget = event => {
            const rect = container.getBoundingClientRect();
            const xPercent = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
            const yPercent = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
            targetRotY = THREE.MathUtils.degToRad(Math.min(Math.max(xPercent * 14, -15), 15));
            targetRotX = THREE.MathUtils.degToRad(Math.min(Math.max(-yPercent * 12, -12), 12));
            targetPosX = Math.min(Math.max(xPercent * 0.25, -0.35), 0.35);
            targetPosY = Math.min(Math.max(-yPercent * 0.25, -0.35), 0.35);
        };

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            if (controls) {
                controls.update();
            }
            if (model) {
                const desiredY = baseRotY + targetRotY;
                const desiredX = baseRotX + targetRotX;
                model.rotation.y = THREE.MathUtils.lerp(model.rotation.y, desiredY, 0.08);
                model.rotation.x = THREE.MathUtils.lerp(model.rotation.x, desiredX, 0.08);
                model.position.x = THREE.MathUtils.lerp(model.position.x, targetPosX, 0.08);
                model.position.y = THREE.MathUtils.lerp(model.position.y, targetPosY, 0.08);
            }
            renderer.render(scene, camera);
        };

        const resize = () => {
            const { clientWidth, clientHeight } = container;
            if (!clientWidth || !clientHeight) {
                return;
            }
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(clientWidth, clientHeight);
        };

        const modelUrl = new URL('/3D/mangamtech_logo.glb', window.location.origin).href;

        loader.load(
            modelUrl,
            gltf => {
                model = gltf.scene;

                // Apply exact orange color (#f97316) to match "Hey there" text
                const orange = new THREE.Color('#f97316');
                model.traverse(node => {
                    if (!node.isMesh) return;
                    const mats = Array.isArray(node.material) ? node.material : [node.material];
                    mats.forEach(mat => {
                        if (!mat) return;
                        // Remove textures so color shows through
                        if (mat.map) { mat.map.dispose?.(); mat.map = null; }
                        // Set true orange color with higher emission
                        if (mat.color) mat.color.copy(orange);
                        if (mat.emissive) mat.emissive.copy(orange);
                        if (typeof mat.emissiveIntensity === 'number') mat.emissiveIntensity = 0.4;
                        if (typeof mat.metalness === 'number') mat.metalness = 0;
                        if (typeof mat.roughness === 'number') mat.roughness = 0.7;
                        mat.needsUpdate = true;
                    });
                });

                const box = new THREE.Box3().setFromObject(model);
                const size = new THREE.Vector3();
                box.getSize(size);
                const center = new THREE.Vector3();
                box.getCenter(center);

                // Larger model size to fill the space
                const maxDim = Math.max(size.x, size.y, size.z) || 1;
                const targetSize = 4.8;
                const scale = targetSize / maxDim;
                model.scale.setScalar(scale);
                model.position.sub(center.multiplyScalar(scale));

                // Camera closer to make model appear larger
                const fov = camera.fov * (Math.PI / 180);
                const dist = (targetSize * 0.9) / Math.sin(fov / 2);
                camera.position.set(0, 0, dist);
                camera.lookAt(0, 0, 0);

                model.rotation.x = baseRotX;
                model.rotation.y = baseRotY;

                scene.add(model);
                heroVisual.classList.add('has-3d');
                animate();
            },
            xhr => {
                // progress noop
            },
            error => {
                console.error('GLB load failed', error);
                heroVisual.classList.remove('has-3d');
            }
        );

        const onMouseMove = event => updatePointerTarget(event);
        const onMouseLeave = () => {
            targetRotX = 0;
            targetRotY = 0;
            targetPosX = 0;
            targetPosY = 0;
        };

        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('resize', resize);

        resize();

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('resize', resize);
            if (renderer) {
                renderer.dispose();
            }
            if (model) {
                model.traverse(node => {
                    if (node.isMesh) {
                        if (node.geometry) {
                            node.geometry.dispose();
                        }
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach(mat => {
                            if (mat && typeof mat.dispose === 'function') {
                                mat.dispose();
                            }
                            if (mat && mat.map && typeof mat.map.dispose === 'function') {
                                mat.map.dispose();
                            }
                        });
                    }
                });
            }
            if (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            heroVisual.classList.remove('has-3d');
        };
    };

    const teardownHeroVisual = () => {
        if (destroyHero3d) {
            destroyHero3d();
            destroyHero3d = null;
        }
        heroVisual?.classList.remove('has-3d');
    };

    const setupHeroVisual = () => {
        teardownHeroVisual();

        if (hasThree) {
            destroyHero3d = initHeroLogo3D();
        }
    };

    setupHeroVisual();

    const handleMotionChange = event => {
        reduceMotion = event.matches;
        document.body.classList.toggle('reduce-motion', reduceMotion);
        if (reduceMotion) {
            revealAll();
        }
        setupHeroVisual();
    };

    if (typeof prefersReducedMotionQuery.addEventListener === 'function') {
        prefersReducedMotionQuery.addEventListener('change', handleMotionChange);
    } else if (typeof prefersReducedMotionQuery.addListener === 'function') {
        prefersReducedMotionQuery.addListener(handleMotionChange);
    }
});
