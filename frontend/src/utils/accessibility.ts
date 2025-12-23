/**
 * Utilidades y Helpers de Accesibilidad (A11y)
 * Nivel AAA - WCAG 2.1 Compliance
 */

/**
 * Genera un ID único para asociar labels con inputs
 */
export const generateA11yId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Maneja el focus trap en modales y overlays
 */
export class FocusTrap {
  private container: HTMLElement;
  private previousFocus: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  activate() {
    // Guardar el elemento con focus actual
    this.previousFocus = document.activeElement as HTMLElement;

    // Obtener todos los elementos focuseables
    this.focusableElements = this.getFocusableElements();

    // Hacer focus en el primer elemento
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    // Agregar event listener para tab
    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    // Remover event listener
    document.removeEventListener('keydown', this.handleKeyDown);

    // Restaurar focus previo
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(this.container.querySelectorAll<HTMLElement>(selector))
      .filter(el => {
        return (
          !el.hasAttribute('disabled') &&
          !el.getAttribute('aria-hidden') &&
          el.offsetParent !== null
        );
      });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
}

/**
 * Verifica el ratio de contraste entre dos colores
 * Retorna true si cumple con WCAG AAA (7:1 para texto normal)
 */
export const checkColorContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AAA'
): boolean => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  // WCAG AAA requiere 7:1 para texto normal, 4.5:1 para texto grande
  // WCAG AA requiere 4.5:1 para texto normal, 3:1 para texto grande
  const threshold = level === 'AAA' ? 7 : 4.5;

  return ratio >= threshold;
};

/**
 * Anuncia un mensaje a lectores de pantalla
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Clase para screen reader only
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remover después de 1 segundo
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Maneja navegación por teclado en listas
 */
export const handleListNavigation = (
  e: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  onSelect: (index: number) => void
): number => {
  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      newIndex = Math.min(currentIndex + 1, items.length - 1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'Home':
      e.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      e.preventDefault();
      newIndex = items.length - 1;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      onSelect(currentIndex);
      return currentIndex;
    default:
      return currentIndex;
  }

  items[newIndex]?.focus();
  return newIndex;
};

/**
 * Verifica si el usuario prefiere reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Obtiene el tamaño de fuente preferido por el usuario
 */
export const getUserFontSizePreference = (): number => {
  const htmlElement = document.documentElement;
  const fontSize = window.getComputedStyle(htmlElement).fontSize;
  return parseFloat(fontSize);
};

/**
 * Asegura que un elemento sea visible en el viewport
 */
export const ensureElementVisible = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const isVisible = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );

  if (!isVisible) {
    element.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }
};

/**
 * Crea un skip link para saltar al contenido principal
 */
export const createSkipLink = () => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Saltar al contenido principal';
  skipLink.className = 'skip-link';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
};

/**
 * Formatea un error para que sea accesible
 */
export const formatErrorMessage = (
  fieldName: string,
  errorType: string,
  customMessage?: string
): string => {
  if (customMessage) return customMessage;

  const errorMessages: Record<string, string> = {
    required: `${fieldName} es requerido`,
    email: `${fieldName} debe ser un email válido`,
    minLength: `${fieldName} es demasiado corto`,
    maxLength: `${fieldName} es demasiado largo`,
    pattern: `${fieldName} no cumple con el formato requerido`,
    min: `${fieldName} es menor al valor mínimo`,
    max: `${fieldName} es mayor al valor máximo`
  };

  return errorMessages[errorType] || `Error en ${fieldName}`;
};

/**
 * Atributos ARIA para combobox/autocomplete
 */
export const getComboboxA11yProps = (
  isOpen: boolean,
  activeDescendant?: string
) => ({
  role: 'combobox',
  'aria-expanded': isOpen,
  'aria-haspopup': 'listbox' as const,
  'aria-controls': 'combobox-listbox',
  'aria-activedescendant': activeDescendant,
  'aria-autocomplete': 'list' as const
});

/**
 * Atributos ARIA para tabs
 */
export const getTabA11yProps = (
  isSelected: boolean,
  panelId: string,
  index: number
) => ({
  role: 'tab',
  'aria-selected': isSelected,
  'aria-controls': panelId,
  id: `tab-${index}`,
  tabIndex: isSelected ? 0 : -1
});

/**
 * Atributos ARIA para tab panels
 */
export const getTabPanelA11yProps = (tabId: string, index: number) => ({
  role: 'tabpanel',
  'aria-labelledby': tabId,
  id: `panel-${index}`,
  tabIndex: 0
});
