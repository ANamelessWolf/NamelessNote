const strings = {
  en: {
    common: {
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      cancel: 'Cancel'
    },
    modals: {
      deleteGroup: {
        title: 'Delete Group',
        description:
          'Are you sure you want to delete <strong>{{groupName}}</strong>? This action cannot be undone.'
      },
      createGroup: {
        title: 'Create Group',
        instructions:
          'Enter a group name with less than <strong>{{max}}</strong> characters.',
        inputLabel: 'Group name',
        inputPlaceholder: 'Example: Personal',
        requiredError: 'Group name is required.',
        lengthError: 'Group name must be less than {{max}} characters.'
      }
    }
  },
  es: {
    common: {
      yes: 'Si',
      no: 'No',
      ok: 'Aceptar',
      cancel: 'Cancelar'
    },
    modals: {
      deleteGroup: {
        title: 'Eliminar grupo',
        description:
          'Estas seguro de que deseas eliminar <strong>{{groupName}}</strong>? Esta accion no se puede deshacer.'
      },
      createGroup: {
        title: 'Crear grupo',
        instructions:
          'Ingresa un nombre de grupo con menos de <strong>{{max}}</strong> caracteres.',
        inputLabel: 'Nombre del grupo',
        inputPlaceholder: 'Ejemplo: Personal',
        requiredError: 'El nombre del grupo es obligatorio.',
        lengthError: 'El nombre del grupo debe tener menos de {{max}} caracteres.'
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
