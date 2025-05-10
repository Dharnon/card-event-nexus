
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'es';
type Translations = Record<string, Record<string, string>>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Translations = {
  // Navigation
  'nav.home': {
    en: 'Home',
    es: 'Inicio'
  },
  'nav.events': {
    en: 'Events',
    es: 'Eventos'
  },
  'nav.calendar': {
    en: 'Calendar',
    es: 'Calendario'
  },
  'nav.profile': {
    en: 'Profile',
    es: 'Perfil'
  },
  'nav.login': {
    en: 'Login',
    es: 'Iniciar sesión'
  },
  'nav.logout': {
    en: 'Logout',
    es: 'Cerrar sesión'
  },
  'nav.store': {
    en: 'Store Dashboard',
    es: 'Panel de tienda'
  },
  'nav.admin': {
    en: 'Admin',
    es: 'Administrador'
  },
  
  // Events
  'event.create': {
    en: 'Create Event',
    es: 'Crear Evento'
  },
  'event.edit': {
    en: 'Edit Event',
    es: 'Editar Evento'
  },
  'event.delete': {
    en: 'Delete Event',
    es: 'Eliminar Evento'
  },
  'event.register': {
    en: 'Register',
    es: 'Registrarse'
  },
  'event.cancelRegistration': {
    en: 'Cancel Registration',
    es: 'Cancelar Registro'
  },
  'event.participants': {
    en: 'Participants',
    es: 'Participantes'
  },
  'event.date': {
    en: 'Date & Time',
    es: 'Fecha y Hora'
  },
  'event.location': {
    en: 'Location',
    es: 'Ubicación'
  },
  'event.price': {
    en: 'Price',
    es: 'Precio'
  },
  'event.free': {
    en: 'Free',
    es: 'Gratis'
  },
  'event.full': {
    en: 'Full',
    es: 'Completo'
  },
  'event.available': {
    en: 'Available',
    es: 'Disponible'
  },
  
  // Forms
  'form.submit': {
    en: 'Submit',
    es: 'Enviar'
  },
  'form.cancel': {
    en: 'Cancel',
    es: 'Cancelar'
  },
  'form.save': {
    en: 'Save',
    es: 'Guardar'
  },
  
  // Generic
  'actions.add': {
    en: 'Add',
    es: 'Añadir'
  },
  'actions.edit': {
    en: 'Edit',
    es: 'Editar'
  },
  'actions.delete': {
    en: 'Delete',
    es: 'Eliminar'
  },
  'actions.back': {
    en: 'Back',
    es: 'Volver'
  },
  
  // Language
  'language.select': {
    en: 'Language',
    es: 'Idioma'
  },
  'language.en': {
    en: 'English',
    es: 'Inglés'
  },
  'language.es': {
    en: 'Spanish',
    es: 'Español'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem('app-language');
    return (savedLanguage === 'en' || savedLanguage === 'es') ? savedLanguage : 'en';
  });

  // Function to translate a key
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    return translations[key][language] || translations[key]['en'] || key;
  };

  // Update language and save to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
