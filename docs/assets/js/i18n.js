// Internationalization (i18n) system for UpFinance website
class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';

        // Initialize with browser language or default
        this.init();
    }

    init() {
        // Check if language is stored in localStorage
        const savedLanguage = localStorage.getItem('upfinance_language');
        if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        } else {
            // Detect browser language
            const browserLang = navigator.language.toLowerCase().split('-')[0];
            if (this.isLanguageSupported(browserLang)) {
                this.currentLanguage = browserLang;
            }
        }

        // Load translations
        this.loadTranslations();
    }

    isLanguageSupported(lang) {
        const supportedLanguages = ['en', 'kr'];
        return supportedLanguages.includes(lang);
    }

    loadTranslations() {
        // Load English translations (always available)
        if (typeof window.i18n_en !== 'undefined') {
            this.translations['en'] = window.i18n_en;
        }

        // Load other language translations if available
        if (this.currentLanguage !== 'en' && typeof window[`i18n_${this.currentLanguage}`] !== 'undefined') {
            this.translations[this.currentLanguage] = window[`i18n_${this.currentLanguage}`];
        }
    }

    // Get translated text by key path (e.g., 'nav.home')
    t(keyPath, params = {}) {
        const keys = keyPath.split('.');
        let value = this.translations[this.currentLanguage];

        // Navigate through the nested object
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                // Fallback to English if translation not found
                value = this.translations[this.fallbackLanguage];
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        value = keyPath; // Return the key path if no translation found
                        break;
                    }
                }
                break;
            }
        }

        // Handle parameter replacement
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            Object.keys(params).forEach(param => {
                value = value.replace(new RegExp(`{${param}}`, 'g'), params[param]);
            });
        }

        return value || keyPath;
    }

    // Set language and reload translations
    setLanguage(lang) {
        if (!this.isLanguageSupported(lang)) {
            console.warn(`Language ${lang} is not supported`);
            return false;
        }

        this.currentLanguage = lang;
        localStorage.setItem('upfinance_language', lang);

        // Reload translations
        this.loadTranslations();

        // Update page content
        this.updatePageContent();

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        return true;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Update all page content with current translations
    updatePageContent() {
        // Update elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else if (element.tagName === 'IMG') {
                element.alt = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update elements with data-i18n-html attribute (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.t(key);
            element.innerHTML = translation;
        });

        // Update title if it has data-i18n-title
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-i18n');
            document.title = this.t(key);
        }

        // Update meta description if it has data-i18n
        const metaDesc = document.querySelector('meta[name="description"][data-i18n]');
        if (metaDesc) {
            const key = metaDesc.getAttribute('data-i18n');
            metaDesc.content = this.t(key);
        }
    }

    // Create language switcher HTML
    createLanguageSwitcher(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const languages = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'kr', name: '한국어', flag: '🇰🇷' }
        ];

        const switcher = document.createElement('div');
        switcher.className = 'language-switcher flex items-center gap-2';

        const currentLang = languages.find(lang => lang.code === this.currentLanguage);

        switcher.innerHTML = `
            <div class="relative">
                <button id="lang-toggle" class="flex items-center gap-2 px-1 py-2 text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <span>${currentLang.flag}</span>
                    <span class="hidden sm:inline">${currentLang.name}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                <div id="lang-menu" style="background-color: #000000;" class="hidden absolute md:right-0 w-30 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 z-50">
                    ${languages.map(lang => `
                        <button class="lang-option w-full text-left px-4 py-2 text-white hover:bg-white/10 flex items-center gap-2 ${lang.code === this.currentLanguage ? 'bg-white/5' : ''}"
                                data-lang="${lang.code}">
                            <span>${lang.flag}</span>
                            <span>${lang.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        container.appendChild(switcher);

        // Add event listeners
        const toggle = switcher.querySelector('#lang-toggle');
        const menu = switcher.querySelector('#lang-menu');
        const options = switcher.querySelectorAll('.lang-option');

        toggle.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!switcher.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                this.setLanguage(lang);
                menu.classList.add('hidden');

                // Update the toggle button
                const newLang = languages.find(l => l.code === lang);
                toggle.innerHTML = `
                    <span>${newLang.flag}</span>
                    <span class="hidden sm:inline">${newLang.name}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                `;

                // Update active state
                options.forEach(opt => opt.classList.remove('bg-white/5'));
                option.classList.add('bg-white/5');
            });
        });
    }
}

// Initialize i18n system
window.i18n = new I18n();

// Auto-update content when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.updatePageContent();
});