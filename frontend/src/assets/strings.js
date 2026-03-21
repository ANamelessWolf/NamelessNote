const strings = {
  en: {
    common: {
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      cancel: 'Cancel',
      save: 'Save',
      back: 'Back',
      logout: 'Logout'
    },
    login: {
      subtitle: 'Sign in to manage your sections and properties.',
      googleMissingCredential: 'Google did not return a credential. Please try again.',
      googleSessionError: 'We could not start your session. Please try again.',
      googleCancelled: 'Google sign-in was cancelled or failed.',
      googleClientIdMissing: 'Missing VITE_GOOGLE_CLIENT_ID in the frontend environment.'
    },
    footer: {
      name: 'ANamelessWolf',
      email: 'contact_email@gmail.com',
      credit: '© ANamelessWolf',
      url: 'https://github.com/ANamelessWolf/NamelessNote',
      title: 'About',
      description:
        'NamelessNote organizes text properties and sensitive values in a simple, editable, and responsive way.'
    },
    home: {
      title: 'Home',
      noSelectedGroup: 'No section selected'
    },
    config: {
      title: 'Configuration',
      language: 'Language',
      apiUrl: 'API URL',
      description: 'These values are stored in localStorage and override the values defined in .env.',
      saved: 'Configuration saved.'
    },
    groups: {
      title: 'Sections',
      searchPlaceholder: 'Search section...',
      newGroup: 'New Section',
      collapse: 'Collapse',
      expand: 'Expand'
    },
    properties: {
      addColumn: 'Add new column',
      propertyName: 'Property name',
      propertyValue: 'Property value',
      nameLabel: 'Name',
      valueLabel: 'Value',
      invalidName: 'Invalid name. Use A-Z, 0-9, spaces, -, _, [, ] (1..25).',
      copy: 'Copy',
      show: 'View',
      hide: 'Hide',
      showValue: 'Show value',
      hideValue: 'Hide value',
      richText: 'Rich text'
    },
    editor: {
      promptUrl: 'URL',
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      bulletList: 'List',
      numberedList: 'Numbered list',
      link: 'Link'
    },
    modals: {
      deleteGroup: {
        title: 'Delete Section',
        description:
          'Are you sure you want to delete <strong>{{groupName}}</strong>? This action cannot be undone.'
      },
      createGroup: {
        title: 'Create Section',
        instructions:
          'Enter a section name with less than <strong>{{max}}</strong> characters.',
        inputLabel: 'Section name',
        inputPlaceholder: 'Example: Personal',
        requiredError: 'Section name is required.',
        lengthError: 'Section name must be less than {{max}} characters.'
      }
    }
  },
  es: {
    common: {
      yes: 'Si',
      no: 'No',
      ok: 'Aceptar',
      cancel: 'Cancelar',
      save: 'Guardar',
      back: 'Volver',
      logout: 'Salir'
    },
    login: {
      subtitle: 'Inicia sesion para administrar tus secciones y propiedades.',
      googleMissingCredential: 'Google no devolvio una credencial. Intenta de nuevo.',
      googleSessionError: 'No fue posible iniciar tu sesion. Intenta de nuevo.',
      googleCancelled: 'El inicio de sesion con Google fue cancelado o fallo.',
      googleClientIdMissing: 'Falta configurar VITE_GOOGLE_CLIENT_ID en el frontend.'
    },
    footer: {
      name: 'ANamelessWolf',
      email: 'contact_email@gmail.com',
      credit: '© ANamelessWolf',
      url: 'https://github.com/ANamelessWolf/NamelessNote',
      title: 'Acerca de',
      description:
        'NamelessNote organiza propiedades de texto y valores sensibles de forma simple, editable y responsiva.'
    },
    home: {
      title: 'Inicio',
      noSelectedGroup: 'Sin sección seleccionada'
    },
    config: {
      title: 'Configuracion',
      language: 'Idioma',
      apiUrl: 'API URL',
      description: 'Estos valores se guardan en localStorage y sobreescriben los definidos en .env.',
      saved: 'Configuracion guardada.'
    },
    groups: {
      title: 'Secciones',
      searchPlaceholder: 'Buscar sección...',
      newGroup: 'Nueva Sección',
      collapse: 'Colapsar',
      expand: 'Expandir'
    },
    properties: {
      addColumn: 'Agregar nueva columna',
      propertyName: 'Nombre de propiedad',
      propertyValue: 'Valor de propiedad',
      nameLabel: 'Nombre',
      valueLabel: 'Valor',
      invalidName: 'Nombre invalido. Usa A-Z, 0-9, espacios, -, _, [, ] (1..25).',
      copy: 'Copiar',
      show: 'Ver',
      hide: 'Ocultar',
      showValue: 'Mostrar valor',
      hideValue: 'Ocultar valor',
      richText: 'Texto enriquecido'
    },
    editor: {
      promptUrl: 'URL',
      bold: 'Negrita',
      italic: 'Cursiva',
      underline: 'Subrayado',
      bulletList: 'Lista',
      numberedList: 'Lista numerada',
      link: 'Link'
    },
    modals: {
      deleteGroup: {
        title: 'Eliminar sección',
        description:
          'Estas seguro de que deseas eliminar <strong>{{groupName}}</strong>? Esta accion no se puede deshacer.'
      },
      createGroup: {
        title: 'Crear sección',
        instructions:
          'Ingresa un nombre de sección con menos de <strong>{{max}}</strong> caracteres.',
        inputLabel: 'Nombre de la sección',
        inputPlaceholder: 'Ejemplo: Personal',
        requiredError: 'El nombre de la sección es obligatorio.',
        lengthError: 'El nombre de la sección debe tener menos de {{max}} caracteres.'
      }
    }
  }
}

export const supportedLanguages = Object.freeze(['en', 'es'])

export const getStrings = (language = 'es') => strings[language] || strings.es

export const formatRichText = (template, values = {}) => {
  if (!template) return ''

  return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) => {
    const value = values[key]
    return value == null ? '' : String(value)
  })
}

export const MAX_GROUP_NAMES_IN_LIST = 5;

export default strings
