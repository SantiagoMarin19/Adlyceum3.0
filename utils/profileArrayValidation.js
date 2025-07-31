export function validateProfileArrays({ languages, education, workExperience }) {
  const errors = {};

  // Idiomas: si hay al menos uno, todos completos
  (languages || []).forEach((lang, idx) => {
    if (!lang.language || !lang.level) {
      errors[`lang_${idx}`] = true;
    }
  });

  // Educación: si hay al menos uno, todos completos
  (education || []).forEach((edu, idx) => {
    if (!edu.career || !edu.university || !edu.level || !edu.etapa) {
      errors[`edu_${idx}`] = true;
    }
    if (edu.etapa === "Graduado" && !edu.end_year) {
      errors[`edu_${idx}_end_year`] = true;
    }
  });

  // Experiencia laboral: si hay al menos uno, todos completos
  (workExperience || []).forEach((work, idx) => {
    if (
      !work.company ||
      !work.position ||
      !work.start_date ||
      (work.end_date !== "Actualidad" && !work.end_date)
    ) {
      errors[`work_${idx}`] = true;
    }
  });

  return errors;
}
