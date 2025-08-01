// utils/profileUtils.js

export const DEFAULT_LANGUAGE = { language: '', level: 'medio' }
export const DEFAULT_EDUCATION = { career: '', university: '', level: 'Pregrado', etapa: '', end_year: '' }
export const DEFAULT_WORK = { company: '', position: '', start_date: '', end_date: '' }

export const LEVELS_EDU = [
  'Bachillerato', 'Pregrado', 'Técnico', 'Tecnólogo', 'Licenciatura',
  'Especialización', 'Maestría', 'Doctorado', 'Postdoctorado', 
];




export const ETAPAS_EDU = [
  'Inicio', 'Medio', 'Superior', 'Graduado'
];

export const LEVELS_LANG = ['prinicipiante', 'medio', 'avanzado', 'nativo']

// Generic handlers for dynamic arrays (idiomas, educacion, experiencia)
export function handleAddItem(arr, defaultObj, onChange, type) {
  onChange([...arr, { ...defaultObj }], type)
}
export function handleChangeItem(arr, idx, key, value, onChange, type) {
  const updated = arr.map((item, i) => i === idx ? { ...item, [key]: value } : item)
  onChange(updated, type)
}
export function handleRemoveItem(arr, idx, onChange, type) {
  const updated = arr.filter((_, i) => i !== idx)
  onChange(updated, type)
}

// Validación arrays: modulariza para que sea reusable (puedes importar así)
export function validateProfileArrays({ languages = [], education = [], workExperience = [] }) {
  const errors = {}

  const normalize = (val) => (val || '').toString().trim()
  const hasNumber = (val) => /\d/.test(normalize(val))

  languages.forEach((lang, idx) => {
    if (
      (!lang.language || !lang.level) ||
      hasNumber(lang.language)
    ) {
      errors[`lang_${idx}`] = true
    }
  })

  education.forEach((edu, idx) => {
    if (
      (!edu.career || !edu.university || !edu.level) ||
      hasNumber(edu.career) ||
      hasNumber(edu.university)
    ) {
      errors[`edu_${idx}`] = true
    }
    if (edu.etapa === "Graduado" && !edu.end_year) {
      errors[`edu_${idx}_end_year`] = true
    }
  })

  workExperience.forEach((work, idx) => {
    const isEmpty =
      !work.company &&
      !work.position &&
      !work.start_date &&
      !work.end_date

    const isIncomplete =
      !work.company ||
      !work.position ||
      !work.start_date ||
      (work.end_date !== "Actualidad" && !work.end_date)

    if (isEmpty || isIncomplete || hasNumber(work.position) || hasNumber(work.company)) {
      errors[`work_${idx}`] = true
    }
  })

  return errors
}

// Scroll animado (reusable en cualquier lista)
export function scrollToBottom(ref) {
  if (ref?.current) {
    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior: 'smooth'
    });
  }
}
