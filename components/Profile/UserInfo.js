"use client"

// React
import React from 'react'

// Utils
import { INPUT_TYPES } from 'utils/form';
import {
  DEFAULT_LANGUAGE, DEFAULT_EDUCATION, DEFAULT_WORK,
  LEVELS_EDU, LEVELS_LANG, ETAPAS_EDU,
  handleAddItem, handleChangeItem, handleRemoveItem,
  validateProfileArrays, scrollToBottom
} from 'utils/profileUtils'
// Shadcn IU
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
// Iconos minimalistas
import {
  CalendarIcon, GraduationCap, Mail, MapPin, Phone, User2, Shield, IdCard,
  Plus, Trash2, Languages as LanguagesIcon, Briefcase as BriefcaseIcon,
  Edit3, Save, X, Camera, CheckCircle2, UserCheck
} from "lucide-react"

// Components Local
import Publications from 'components/Profile/Publications';


let options = { year: 'numeric', month: 'long', day: 'numeric' };

const UserInfo = ({
  fullname, email, phone, birthdate, residence, dim, updatedAt, gender,
  level, experience, sharing, isCurrentUserProfile, avatarView, errorState,
  refAvatar, items, user, activeView, setActiveView, languages, education, workExperience,
  ...props
}) => {
  const [isClient, setIsClient] = React.useState(false);
  const [addingAnimation, setAddingAnimation] = React.useState('');
  const [removingAnimation, setRemovingAnimation] = React.useState('');

  let formattedDate = new Date(updatedAt).toLocaleDateString('es-ES', options);
  console.log(updatedAt, "updatedAt updatedAt")

  const handlerEdit = () => setActiveView(!activeView)
  const handlerOnClose = () => {
    handlerEdit()
    props.doCancel()
  }

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Normalizar arrays
  const safeLanguages = Array.isArray(languages) ? languages : [];
  const safeEducation = Array.isArray(education) ? education : [];
  const safeWorkExperience = Array.isArray(workExperience) ? workExperience : [];

  const WORK_MAX = 20;
  const LANG_MAX = 10;
  const EDU_MAX = 20;
  // Refs para scroll animado
  const langRef = React.useRef(null);
  const eduRef = React.useRef(null);
  const workRef = React.useRef(null);

  // Array Errors state
  const [arrayErrors, setArrayErrors] = React.useState({});

  // Función para animaciones
  const triggerAddAnimation = (type) => {
    setAddingAnimation(type);
    setTimeout(() => setAddingAnimation(''), 600);
  };

  const triggerRemoveAnimation = (type) => {
    setRemovingAnimation(type);
    setTimeout(() => setRemovingAnimation(''), 400);
  };

  // Idiomas
  const handleAddLanguage = () => {
    const errors = validateProfileArrays({ languages: safeLanguages });
    setArrayErrors(errors);
    // Si hay algún registro incompleto, no deja agregar otro
    if (Object.keys(errors).some(key => key.startsWith('lang_'))) return;
    if (safeLanguages.length >= LANG_MAX) return;

    handleAddItem(safeLanguages, DEFAULT_LANGUAGE, props.onChange, INPUT_TYPES.LANGUAGES);
    setTimeout(() => {
      if (langRef.current) {
        langRef.current.scrollTo({ top: langRef.current.scrollHeight, behavior: 'smooth' });
        const inputs = langRef.current.querySelectorAll('input, select');
        if (inputs.length > 0) inputs[inputs.length - 2]?.focus();
      }
    }, 150);
  };

  const handleChangeLanguage = (idx, key, value) =>
    handleChangeItem(safeLanguages, idx, key, value, props.onChange, INPUT_TYPES.LANGUAGES)
  const handleRemoveLanguage = (idx) => {
    triggerRemoveAnimation('language');
    handleRemoveItem(safeLanguages, idx, props.onChange, INPUT_TYPES.LANGUAGES)
  }

  // Educación
  const handleAddEducation = () => {
    const errors = validateProfileArrays({ education: safeEducation });
    setArrayErrors(errors);
    if (Object.keys(errors).some(key => key.startsWith('edu_'))) return;
    if (safeEducation.length >= EDU_MAX) return;

    handleAddItem(safeEducation, DEFAULT_EDUCATION, props.onChange, INPUT_TYPES.EDUCATION);
    setTimeout(() => {
      if (eduRef.current) {
        eduRef.current.scrollTo({ top: eduRef.current.scrollHeight, behavior: 'smooth' });
        const inputs = eduRef.current.querySelectorAll('input, select');
        if (inputs.length > 0) inputs[inputs.length - 6]?.focus();
      }
    }, 150);
  };
  const handleChangeEducation = (idx, key, value) =>
    handleChangeItem(safeEducation, idx, key, value, props.onChange, INPUT_TYPES.EDUCATION)
  const handleRemoveEducation = (idx) => {
    triggerRemoveAnimation('education');
    handleRemoveItem(safeEducation, idx, props.onChange, INPUT_TYPES.EDUCATION)
  }

  // Experiencia laboral
  const handleAddWork = () => {
    const errors = validateProfileArrays({ workExperience: safeWorkExperience });
    setArrayErrors(errors);
    // Si hay algún registro incompleto, no deja agregar otro
    const hasIncompleteWork = safeWorkExperience.some(
      work =>
        !work.company ||
        !work.position ||
        !work.start_date ||
        (work.end_date !== "Actualidad" && !work.end_date)
    );
    if (Object.keys(errors).some(key => key.startsWith('work_')) || hasIncompleteWork) return;
    if (safeWorkExperience.length >= WORK_MAX) return;
    handleAddItem(safeWorkExperience, DEFAULT_WORK, props.onChange, INPUT_TYPES.WORK_EXPERIENCE);
    setTimeout(() => {
      if (workRef.current) {
        workRef.current.scrollTo({ top: workRef.current.scrollHeight, behavior: 'smooth' });
        const inputs = workRef.current.querySelectorAll('input, select');
        if (inputs.length > 0) inputs[inputs.length - 4]?.focus();
      }
    }, 150);
  };
  const handleChangeWork = (idx, key, value) =>
    handleChangeItem(safeWorkExperience, idx, key, value, props.onChange, INPUT_TYPES.WORK_EXPERIENCE)
  const handleRemoveWork = (idx) => {
    triggerRemoveAnimation('work');
    handleRemoveItem(safeWorkExperience, idx, props.onChange, INPUT_TYPES.WORK_EXPERIENCE)
  }

  // Calendario experiencia laboral
  const [calendarOpenIdx, setCalendarOpenIdx] = React.useState({ start: null, end: null });
  const handleCalendarClick = (idx, type) => setCalendarOpenIdx({ ...calendarOpenIdx, [type]: idx });
  const handleCalendarClose = (type) => setCalendarOpenIdx({ ...calendarOpenIdx, [type]: null });

  // Validación antes de guardar
 const handleSave = (e) => {
  // 1. Validamos arrays, solo para resaltar errores en UI
  const errors = validateProfileArrays({
    languages: safeLanguages,
    education: safeEducation,
    workExperience: safeWorkExperience
  });
  setArrayErrors(errors);

  // 2. Validamos los campos simples obligatorios
  const requiredFields = [
    { name: 'phone', value: phone, label: 'Teléfono' },
    { name: 'email', value: email, label: 'Correo electrónico' },
    { name: 'residence', value: residence, label: 'Dirección' },
    // agrega los que quieras obligatorios aquí...
  ];

  // 3. Chequeamos si falta alguno
  const missing = requiredFields.filter(f => !f.value || (typeof f.value === 'string' && f.value.trim() === ''));
  if (missing.length > 0) {
    // Opcional: muestra toast, alert, etc
    alert(`Por favor completa los siguientes campos obligatorios:\n${missing.map(f => f.label).join('\n')}`);
    return;
  }

  // 4. Guardamos siempre aunque los arrays estén incompletos
  props.submitUpdateProfile(e);
};


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Izquierdo - Perfil y Información Personal */}
          <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
            {/* Card Principal del Perfil */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Sección del Avatar */}
              <div className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg ring-2 ring-gray-100">
                    <AvatarImage src={avatarView} alt="Foto de perfil" className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-xl font-medium">
                      {fullname?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!activeView && (
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer group">
                      <Camera className="h-6 w-6 text-white transform group-hover:scale-110 transition-transform" />
                      <input
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        type='file'
                        name='avatar'
                        id='avatar'
                        ref={refAvatar.avatar}
                        onChange={(e) => props.onChange(e, 'avatar')}
                      />
                    </div>
                  )}
                </div>

                {/* Nombre y Información */}
                <div className="mb-6">
                  {activeView ? (
                    <>
                      <h1 className="text-2xl font-semibold text-gray-900 mb-2">{fullname}</h1>
                      <p className="text-slate-600 font-medium mb-1">{props?.role?.name}</p>
                      <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        {residence || 'Sin ubicación'}
                      </div>
                      <p className="text-xs text-gray-400">
                        Última actualización: {formattedDate}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        disabled={activeView}
                        id="fullname"
                        value={fullname ?? ''}
                        name={INPUT_TYPES.FULLNAME}
                        onChange={(e) => props.onChange(e, INPUT_TYPES.FULLNAME)}
                        className="text-center text-xl font-semibold border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                        placeholder="Nombre completo"
                      />
                      <p className="text-slate-600 font-medium">{props?.role?.name}</p>
                    </div>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="space-y-3">
                  {activeView ? (
                    <Button
                      onClick={handlerEdit}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Editar perfil
                    </Button>
                  ) : (
                    <Button
                      onClick={handlerEdit}
                      variant="outline"
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-3 rounded-xl"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar edición
                    </Button>
                  )}


                </div>
              </div>

              {/* Navegación Timeline/Acerca de */}
              <div className="border-t border-gray-100">
                <div className="flex">

                  <button className="flex-1 py-4 px-6 text-sm font-medium text-slate-700 border-b-2 border-slate-700 bg-slate-50">
                    Acerca de
                  </button>
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">INFORMACIÓN DE CONTACTO</h3>
                <p className="text-sm text-gray-500">Formas de contactarte</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Teléfono:</Label>
                  {activeView ? (
                    <p className="text-slate-700 font-medium">{phone || 'Sin especificar'}</p>
                  ) : (
                    <Input
                      disabled={activeView}
                      value={phone ?? ''}
                      type='tel'
                      name={INPUT_TYPES.PHONE}
                      maxLength='8'
                      onChange={(e) => props.onChange(e, INPUT_TYPES.PHONE)}
                      className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                      placeholder="Número de teléfono"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Dirección:</Label>
                  {activeView ? (
                    <p className="text-slate-700">{residence || 'Sin especificar'}</p>
                  ) : (
                    <Input
                      disabled={activeView}
                      value={residence ?? ''}
                      name={INPUT_TYPES.RESIDENCE}
                      onChange={(e) => props.onChange(e, INPUT_TYPES.RESIDENCE)}
                      className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                      placeholder="Ubicación"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Correo electrónico:</Label>
                  {activeView ? (
                    <p className="text-slate-700 font-medium break-all">{email || 'Sin especificar'}</p>
                  ) : (
                    <Input
                      disabled={activeView}
                      value={email ?? ''}
                      name={INPUT_TYPES.EMAIL}
                      onChange={(e) => props.onChange(e, INPUT_TYPES.EMAIL)}
                      className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                      placeholder="Correo electrónico"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Doc. Identidad:</Label>
                  {activeView ? (
                    <p className="text-slate-700">{dim || 'Sin especificar'}</p>
                  ) : (
                    <Input
                      disabled={activeView}
                      value={dim ?? ''}
                      name="dim"
                      onChange={(e) => props.onChange(e, 'dim')}
                      className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                      placeholder="Documento de identidad"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Información Básica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">INFORMACIÓN BÁSICA</h3>
                <p className="text-sm text-gray-500">Detalles personales</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Fecha de nacimiento:</Label>
                  {activeView ? (
                    <p className="text-slate-700">{birthdate ? new Date(birthdate).toLocaleDateString('es-ES') : 'Sin especificar'}</p>
                  ) : (
                    <Input
                      disabled={activeView}
                      value={birthdate}
                      name={INPUT_TYPES.BIRTHDATE}
                      onChange={(e) => props.onChange(e, INPUT_TYPES.BIRTHDATE)}
                      type="date"
                      className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                    />
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">Género:</Label>
                  {activeView ? (
                    <p className="text-slate-700 capitalize">{gender || 'Sin especificar'}</p>
                  ) : (
                    <Select
                      disabled={activeView}
                      defaultValue={gender ?? ''}
                      onValueChange={(e) => props.onChange({ target: { value: e } }, INPUT_TYPES.GENDER)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-slate-500 focus:ring-slate-500">
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* Configuración de Privacidad */}
            {!activeView && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-slate-600" />
                    <div>
                      <Label className="text-sm font-medium text-gray-900 block">
                        Compartir información con empresas
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Permite que las empresas vean tu perfil para oportunidades laborales
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sharing && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    <Switch
                      checked={sharing ?? false}
                      onCheckedChange={value => props.onChange(value, 'sharing')}
                      disabled={activeView}
                      className="data-[state=checked]:bg-slate-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Contenido Principal Derecho */}
          <div className="flex-1 space-y-8 min-w-0">
            {/* Experiencia Laboral */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <BriefcaseIcon className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Experiencia Laboral</h2>
                    <p className="text-sm text-gray-500 mt-1">Experiencia profesional</p>
                  </div>
                </div>
                {!activeView && (
                  <Button
                    onClick={handleAddWork}
                    disabled={
                      safeWorkExperience.length >= WORK_MAX ||
                      Object.keys(arrayErrors).some(key => key.startsWith('work_')) ||
                      safeWorkExperience.some(work =>
                        !work.company || !work.position || !work.start_date || (work.end_date !== "Actualidad" && !work.end_date)
                      )
                    }
                    className={`
    bg-slate-800 hover:bg-slate-900 text-white font-medium px-6 py-3 rounded-xl
    transition-all duration-200 transform hover:scale-105
    ${safeWorkExperience.length >= WORK_MAX ? 'opacity-60 cursor-not-allowed' : ''}
  `}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar experiencia
                  </Button>
                )}
              </div>

              <div ref={workRef} className="space-y-6">
                {safeWorkExperience && safeWorkExperience.length > 0 ? (
                  safeWorkExperience.map((work, idx) => {
                    const isActiveJob = work.end_date === "Actualidad"
                    return (
                      <div
                        key={idx}
                        className={`border-l-4 border-slate-400 pl-6 py-4 transition-all duration-300 ${removingAnimation === 'work' ? 'opacity-50 transform scale-95' : ''}`}
                      >
                        {activeView ? (
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{work.position}</h3>
                              <p className="text-slate-600 font-medium mb-2">{work.company}</p>
                              <p className="text-sm text-gray-500">
                                {work.start_date} - {work.end_date}
                              </p>
                            </div>
                            {isActiveJob && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Actual
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">Empresa</Label>
                                <Input
                                  disabled={activeView}
                                  value={work.company}
                                  placeholder="Ej: Google Inc."
                                  onChange={e => handleChangeWork(idx, 'company', e.target.value)}
                                  className={`${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500`}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block">Cargo</Label>
                                <Input
                                  disabled={activeView}
                                  value={work.position}
                                  placeholder="Ej: Desarrollador Frontend"
                                  onChange={e => handleChangeWork(idx, 'position', e.target.value)}
                                  className={`${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500`}
                                />
                              </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  Fecha de inicio
                                </Label>
                                <Input
                                  disabled={activeView}
                                  value={work.start_date}
                                  type="date"
                                  onChange={e => handleChangeWork(idx, 'start_date', e.target.value)}
                                  className={`${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500`}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-2 block flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  Fecha de fin
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    disabled={activeView || isActiveJob}
                                    value={isActiveJob ? "" : work.end_date}
                                    type="date"
                                    onChange={e => handleChangeWork(idx, 'end_date', e.target.value)}
                                    className={`flex-1 ${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500 ${isActiveJob ? 'opacity-50' : ''}`}
                                  />
                                  <Button
                                    type="button"
                                    variant={isActiveJob ? "default" : "outline"}
                                    className={`${isActiveJob ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} font-medium px-4 rounded-lg`}
                                    onClick={() => handleChangeWork(idx, 'end_date', isActiveJob ? "" : "Actualidad")}
                                  >
                                    Actualidad
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end border-t border-gray-200 pt-4">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveWork(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar experiencia
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="font-medium text-gray-600 mb-2">No hay experiencia laboral agregada</h4>
                    <p className="text-sm text-gray-500">Comparte tu experiencia profesional para destacar tus habilidades</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Idiomas y Educación */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Idiomas */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <LanguagesIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Idiomas</h3>
                      <p className="text-sm text-gray-500">Competencias lingüísticas</p>
                    </div>
                  </div>
                  {!activeView && (
                    <Button
                      onClick={handleAddLanguage}
                      disabled={
                        safeLanguages.length >= LANG_MAX ||
                        Object.keys(arrayErrors).some(key => key.startsWith('lang_')) ||
                        safeLanguages.some(lang =>
                          !lang.language && !lang.level
                        )
                      }
                      className={`
    bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-lg
    transition-all duration-200 transform hover:scale-105
    ${safeLanguages.length >= LANG_MAX ? 'opacity-60 cursor-not-allowed' : ''}
  `}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>

                  )}
                </div>

                <div ref={langRef} className="space-y-3 max-h-80 overflow-y-auto">
                  {safeLanguages && safeLanguages.length > 0 ? (
                    safeLanguages.map((lang, idx) => (
                      <div key={idx} className={`transition-all duration-300 ${removingAnimation === 'language' ? 'opacity-50 transform scale-95' : ''}`}>
                        {activeView ? (
                          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                            <span className="font-medium text-gray-900">{lang.language}</span>
                            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full capitalize">{lang.level}</span>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-1 block">Idioma</Label>
                                <Input
                                  disabled={activeView}
                                  value={lang.language}
                                  placeholder="Ej: Español, Inglés"
                                  onChange={e => handleChangeLanguage(idx, 'language', e.target.value)}
                                  className={`${arrayErrors[`lang_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500`}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-1 block">Nivel</Label>
                                <select
                                  disabled={activeView}
                                  value={lang.level}
                                  onChange={e => handleChangeLanguage(idx, 'level', e.target.value)}
                                  className={`w-full border rounded-lg px-3 py-2 text-sm ${arrayErrors[`lang_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500 transition-colors ${activeView ? 'bg-gray-100' : 'bg-white'}`}
                                >
                                  <option value="" disabled>Seleccionar nivel</option>
                                  {LEVELS_LANG.map(lvl => <option key={lvl} value={lvl} className="capitalize">{lvl}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveLanguage(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 font-medium px-3 py-1 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <LanguagesIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <h4 className="font-medium text-gray-600 mb-2">No hay idiomas agregados</h4>
                      <p className="text-sm text-gray-500">Agrega los idiomas que dominas</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Educación */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Educación</h3>
                      <p className="text-sm text-gray-500">Formación académica</p>
                    </div>
                  </div>
                  {!activeView && (
                    <Button
                      onClick={handleAddEducation}
                      disabled={
                        safeEducation.length >= EDU_MAX ||
                        Object.keys(arrayErrors).some(key => key.startsWith('edu_')) ||
                        safeEducation.some(edu =>
                          !edu.career && !edu.university && !edu.level && !edu.etapa && !edu.end_year
                        )
                      }
                      className={`
    bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-lg
    transition-all duration-200 transform hover:scale-105
    ${safeEducation.length >= EDU_MAX ? 'opacity-60 cursor-not-allowed' : ''}
  `}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>

                  )}
                </div>

                <div ref={eduRef} className="space-y-4 max-h-80 overflow-y-auto">
                  {safeEducation && safeEducation.length > 0 ? (
                    safeEducation.map((edu, idx) => (
                      <div key={idx} className={`transition-all duration-300 ${removingAnimation === 'education' ? 'opacity-50 transform scale-95' : ''}`}>
                        {activeView ? (
                          <div className="py-4 border-b border-gray-100 last:border-b-0">
                            <h4 className="font-semibold text-gray-900 mb-1">{edu.career}</h4>
                            <p className="text-slate-600 font-medium mb-2">{edu.university}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span className="bg-slate-100 px-2 py-1 rounded-full text-xs">{edu.level}</span>
                              <span className="bg-slate-100 px-2 py-1 rounded-full text-xs">{edu.etapa}</span>
                              {edu.etapa === "Graduado" && edu.end_year && <span>{new Date(edu.end_year).toLocaleDateString('es-ES')}</span>}
                              {edu.end_date && <span>{edu.end_date}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-600 mb-1 block">Carrera/Programa</Label>
                              <Input
                                disabled={activeView}
                                value={edu.career}
                                placeholder="Ej: Ingeniería de Sistemas"
                                onChange={e => handleChangeEducation(idx, 'career', e.target.value)}
                                className={`${arrayErrors[`edu_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500`}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-600 mb-1 block">Centro de Estudio</Label>
                              <Input
                                disabled={activeView}
                                value={edu.university}
                                placeholder="Ej: Universidad Nacional"
                                onChange={e => handleChangeEducation(idx, 'university', e.target.value)}
                                className={`${arrayErrors[`edu_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500`}
                              />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-1 block">Nivel académico</Label>
                                <select
                                  disabled={activeView}
                                  value={edu.level}
                                  onChange={e => handleChangeEducation(idx, 'level', e.target.value)}
                                  className={`w-full border rounded-lg px-3 py-2 text-sm ${arrayErrors[`edu_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-slate-500'} focus:ring-slate-500 transition-colors ${activeView ? 'bg-gray-100' : 'bg-white'}`}
                                >
                                  <option value="" disabled>Seleccionar nivel</option>
                                  {LEVELS_EDU.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                                </select>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-600 mb-1 block">Etapa/Estado</Label>
                                <select
                                  disabled={activeView}
                                  value={edu.etapa}
                                  onChange={e => handleChangeEducation(idx, 'etapa', e.target.value)}
                                  className="w-full border rounded-lg px-3 py-2 text-sm border-gray-300 focus:border-slate-500 focus:ring-slate-500 transition-colors"
                                >
                                  <option value="" disabled>Seleccionar etapa</option>
                                  {ETAPAS_EDU.map(etapa => <option key={etapa} value={etapa}>{etapa}</option>)}
                                </select>
                              </div>
                              {edu.etapa === "Graduado" && (
                                <div className="md:col-span-2">
                                  <Label className="text-sm font-medium text-gray-600 mb-1 block">Fecha de graduación</Label>
                                  <Input
                                    disabled={activeView}
                                    value={edu.end_year || ""}
                                    type="date"
                                    onChange={e => handleChangeEducation(idx, 'end_year', e.target.value)}
                                    className="border-gray-300 focus:border-slate-500 focus:ring-slate-500"
                                    placeholder="Selecciona la fecha"
                                  />
                                </div>
                              )}
                            </div>


                            <div className="flex justify-end border-t border-gray-200 pt-3">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveEducation(idx)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 font-medium px-3 py-1 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <h4 className="font-medium text-gray-600 mb-2">No hay educación agregada</h4>
                      <p className="text-sm text-gray-500">Agrega tu formación académica</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            {!activeView && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-end gap-4">
                  <Button
                    onClick={handlerOnClose}
                    variant="outline"
                    className="px-8 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            )}

            {/* Publicaciones - Solo en modo vista */}
            {activeView && isClient && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">PUBLICACIONES</h2>
                    <p className="text-sm text-gray-500 mt-1">Trabajos y artículos publicados</p>
                  </div>
                </div>
                <Publications
                  itemsPerPage={10}
                  items={items}
                  label={"Publicaciones"}
                  user={user}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;