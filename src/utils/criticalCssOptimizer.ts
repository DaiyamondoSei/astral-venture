
/**
 * Critical CSS Optimizer
 * Improves first contentful paint by inlining critical CSS
 */

const CRITICAL_CSS_CACHE_KEY = 'critical-css-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedCSS {
  content: string;
  timestamp: number;
}

/**
 * Extracts critical CSS rules for above-the-fold content
 */
export const extractCriticalCSS = (): string => {
  if (typeof document === 'undefined') return '';
  
  const criticalSelectors = new Set<string>();
  const criticalCSSRules: string[] = [];
  
  // Find all elements in the viewport
  const viewportHeight = window.innerHeight;
  const allElements = document.querySelectorAll('*');
  
  // Collect selectors for elements that are above the fold
  allElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < viewportHeight) {
      // This element is above the fold
      const classes = element.classList;
      const id = element.id;
      
      // Add id selector if present
      if (id) criticalSelectors.add(`#${id}`);
      
      // Add class selectors
      for (let i = 0; i < classes.length; i++) {
        criticalSelectors.add(`.${classes[i]}`);
      }
      
      // Add element tag selector
      criticalSelectors.add(element.tagName.toLowerCase());
    }
  });
  
  // Extract matching CSS rules from all stylesheets
  try {
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          
          // Process standard CSS rules
          if (rule.type === 1) { // CSSStyleRule
            const cssRule = rule as CSSStyleRule;
            const selectors = cssRule.selectorText.split(',').map(s => s.trim());
            
            // Check if any selector matches our critical set
            const isMatching = selectors.some(selector => {
              return Array.from(criticalSelectors).some(criticalSelector => 
                selector.includes(criticalSelector));
            });
            
            if (isMatching) {
              criticalCSSRules.push(cssRule.cssText);
            }
          } 
          // Include @media rules that might contain critical CSS
          else if (rule.type === 4) { // CSSMediaRule
            const mediaRule = rule as CSSMediaRule;
            const mediaRules: string[] = [];
            
            for (let k = 0; k < mediaRule.cssRules.length; k++) {
              const nestedRule = mediaRule.cssRules[k] as CSSStyleRule;
              const selectors = nestedRule.selectorText.split(',').map(s => s.trim());
              
              const isMatching = selectors.some(selector => {
                return Array.from(criticalSelectors).some(criticalSelector => 
                  selector.includes(criticalSelector));
              });
              
              if (isMatching) {
                mediaRules.push(nestedRule.cssText);
              }
            }
            
            if (mediaRules.length > 0) {
              criticalCSSRules.push(
                `@media ${mediaRule.conditionText} {
                  ${mediaRules.join('\n')}
                }`
              );
            }
          }
        }
      } catch (e) {
        // Skip cross-origin sheets that can't be accessed
        console.debug('Could not access stylesheet (likely cross-origin):', e);
      }
    }
  } catch (e) {
    console.error('Error extracting critical CSS:', e);
  }
  
  return criticalCSSRules.join('\n');
};

/**
 * Saves critical CSS to local storage for faster loading on subsequent visits
 */
export const saveCriticalCSS = (css: string): void => {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const data: CachedCSS = {
      content: css,
      timestamp: Date.now()
    };
    
    localStorage.setItem(CRITICAL_CSS_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving critical CSS to cache:', e);
  }
};

/**
 * Retrieves cached critical CSS if available and not expired
 */
export const getCachedCriticalCSS = (): string | null => {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CRITICAL_CSS_CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedCSS = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp < CACHE_TTL) {
      return data.content;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(CRITICAL_CSS_CACHE_KEY);
    return null;
  } catch (e) {
    console.error('Error reading critical CSS from cache:', e);
    return null;
  }
};

/**
 * Injects critical CSS inline for fast rendering
 */
export const injectCriticalCSS = (css: string): void => {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.setAttribute('data-critical', 'true');
  style.textContent = css;
  
  // Insert at the beginning of head for highest priority
  const head = document.head;
  if (head.firstChild) {
    head.insertBefore(style, head.firstChild);
  } else {
    head.appendChild(style);
  }
};

/**
 * Extracts and injects critical CSS on first visit,
 * uses cached version on subsequent visits
 */
export const optimizeCriticalRendering = (): void => {
  if (typeof window === 'undefined') return;
  
  // Try to get cached CSS first
  const cachedCSS = getCachedCriticalCSS();
  
  if (cachedCSS) {
    // We have cached CSS, inject it immediately
    injectCriticalCSS(cachedCSS);
  } else {
    // First visit or expired cache, extract critical CSS after first paint
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        const criticalCSS = extractCriticalCSS();
        saveCriticalCSS(criticalCSS);
      });
    } else {
      setTimeout(() => {
        const criticalCSS = extractCriticalCSS();
        saveCriticalCSS(criticalCSS);
      }, 1000);
    }
  }
};
