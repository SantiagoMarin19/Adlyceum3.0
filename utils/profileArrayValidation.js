export function validateProfileArrays({ languages, education, workExperience }) {
  const errors = {};
  // Idiomas
  (languages || []).forEach((lang, idx) => {
    if (!lang.language || !lang.level) {
      errors[`lang_${idx}`] = true;
    }
  });
  // Educación
  (education || []).forEach((edu, idx) => {
    if (!edu.career || !edu.university || !edu.level) {
      errors[`edu_${idx}`] = true;
    }
  });
  // Experiencia laboral (solo si hay al menos uno)
  (workExperience || []).forEach((work, idx) => {
    if (
      (work.company || work.position || work.start_date || (work.end_date && work.end_date !== "Actualidad")) &&
      (!work.company || !work.position || !work.start_date || (work.end_date !== "Actualidad" && !work.end_date))
    ) {
      errors[`work_${idx}`] = true;
    }
  });
  return errors;
}
