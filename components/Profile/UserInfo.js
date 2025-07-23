"use client"

// React
import React from 'react'

// Utils
import { INPUT_TYPES } from 'utils/form';
import { validateProfileArrays } from 'utils/profileArrayValidation'

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
  CalendarIcon,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User2,
  Shield,
  IdCard,
  Plus,
  Trash2,
  Languages as LanguagesIcon,
  Briefcase as BriefcaseIcon,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle2
} from "lucide-react"

// Components Local
import Publications from 'components/Profile/Publications';

let options = { year: 'numeric', month: 'long', day: 'numeric' };

const DEFAULT_LANGUAGE = { language: '', level: 'medio' }
const DEFAULT_EDUCATION = { career: '', university: '', level: 'Pregrado' }
const DEFAULT_WORK = { company: '', position: '', start_date: '', end_date: '' }

const LEVELS_EDU = [
  'Bachillerato',
  'Pregrado',
  'Técnico',
  'Tecnólogo',
  'Licenciatura',
  'Especialización',
  'Maestría',
  'Doctorado',
  'Postdoctorado',
  'Actualmente',
  'Graduado'
]
const LEVELS_LANG = ['prinicipiante', 'medio', 'avanzado', 'nativo']

const UserInfo = ({
  fullname,
  email,
  phone,
  birthdate,
  residence,
  dim,
  updatedAt,
  gender,
  level,
  experience,
  sharing,
  isCurrentUserProfile,
  avatarView,
  errorState,
  refAvatar,
  items,
  user,
  activeView,
  setActiveView,
  languages,
  education,
  workExperience,
  ...props
}) => {
  const [isClient, setIsClient] = React.useState(false);
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

  // Normalizar arrays para evitar errores de iteración
  const safeLanguages = Array.isArray(languages) ? languages : [];
  const safeEducation = Array.isArray(education) ? education : [];
  const safeWorkExperience = Array.isArray(workExperience) ? workExperience : [];

  // Handlers para idiomas
  const handleAddLanguage = () => {
    props.onChange([...safeLanguages, { ...DEFAULT_LANGUAGE }], INPUT_TYPES.LANGUAGES)
  }
  const handleChangeLanguage = (idx, key, value) => {
    const updated = safeLanguages.map((l, i) => i === idx ? { ...l, [key]: value } : l)
    props.onChange(updated, INPUT_TYPES.LANGUAGES)
  }
  const handleRemoveLanguage = (idx) => {
    const updated = safeLanguages.filter((_, i) => i !== idx)
    props.onChange(updated, INPUT_TYPES.LANGUAGES)
  }

  // Handlers para educación
  const handleAddEducation = () => {
    props.onChange([...safeEducation, { ...DEFAULT_EDUCATION }], INPUT_TYPES.EDUCATION)
  }
  const handleChangeEducation = (idx, key, value) => {
    const updated = safeEducation.map((e, i) => i === idx ? { ...e, [key]: value } : e)
    props.onChange(updated, INPUT_TYPES.EDUCATION)
  }
  const handleRemoveEducation = (idx) => {
    const updated = safeEducation.filter((_, i) => i !== idx)
    props.onChange(updated, INPUT_TYPES.EDUCATION)
  }

  // Handlers para experiencia laboral
  const handleAddWork = () => {
    props.onChange([...safeWorkExperience, { ...DEFAULT_WORK }], INPUT_TYPES.WORK_EXPERIENCE)
  }
  const handleChangeWork = (idx, key, value) => {
    const updated = safeWorkExperience.map((w, i) => i === idx ? { ...w, [key]: value } : w)
    props.onChange(updated, INPUT_TYPES.WORK_EXPERIENCE)
  }
  const handleRemoveWork = (idx) => {
    const updated = safeWorkExperience.filter((_, i) => i !== idx)
    props.onChange(updated, INPUT_TYPES.WORK_EXPERIENCE)
  }

  // Calendario para experiencia laboral
  const [calendarOpenIdx, setCalendarOpenIdx] = React.useState({ start: null, end: null });
  const handleCalendarClick = (idx, type) => setCalendarOpenIdx({ ...calendarOpenIdx, [type]: idx });
  const handleCalendarClose = (type) => setCalendarOpenIdx({ ...calendarOpenIdx, [type]: null });

  // Estado para errores locales de los campos de arrays
  const [arrayErrors, setArrayErrors] = React.useState({});

  // Validación antes de guardar (solo marca error si hay elementos incompletos, pero permite guardar si los arrays están vacíos)
  const validateArrays = () => {
    const errors = {};
    // Idiomas
    safeLanguages.forEach((lang, idx) => {
      if ((!lang.language || !lang.level) && (lang.language || lang.level)) {
        errors[`lang_${idx}`] = true;
      }
    });
    // Educación
    safeEducation.forEach((edu, idx) => {
      if ((!edu.career || !edu.university || !edu.level) && (edu.career || edu.university || edu.level)) {
        errors[`edu_${idx}`] = true;
      }
    });
    // Experiencia laboral
    safeWorkExperience.forEach((work, idx) => {
      if (
        (work.company || work.position || work.start_date || (work.end_date && work.end_date !== "Actualidad")) &&
        (!work.company || !work.position || !work.start_date || (work.end_date !== "Actualidad" && !work.end_date))
      ) {
        errors[`work_${idx}`] = true;
      }
    });
    setArrayErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envolver submitUpdateProfile para validar antes de guardar
  const handleSave = (e) => {
    if (validateArrays()) {
      props.submitUpdateProfile(e);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar: Profile Overview */}
          <div className="w-full lg:w-[370px] flex-shrink-0">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <div className="relative h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg"></div>
              <CardContent className="px-8 pb-8">
                <div className="flex flex-col items-center -mt-12">
                  {/* Avatar Section */}
                  <div className="relative group mb-4">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                      <AvatarImage src={avatarView} alt="Profile picture" className="object-cover" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-semibold">
                        {fullname?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {!activeView && (
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                        <Camera className="h-6 w-6 text-white" />
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
                  {/* Name and Role */}
                  <div className="w-full text-center">
                    {activeView ? (
                      <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{fullname}</h1>
                        <p className="text-gray-600 font-medium">{props?.role?.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Última actualización: {formattedDate}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          disabled={activeView}
                          id="fullname"
                          value={fullname ?? ''}
                          name={INPUT_TYPES.FULLNAME}
                          onChange={(e) => props.onChange(e, INPUT_TYPES.FULLNAME)}
                          className="text-xl font-semibold border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Nombre completo"
                        />
                        <p className="text-gray-600 font-medium">{props?.role?.name}</p>
                      </div>
                    )}
                  </div>
                  {/* Edit Button */}
                  {activeView && (
                    <Button
                      onClick={handlerEdit}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-6 mt-6 w-full"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Editar perfil
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-8 min-w-0" style={{maxWidth: 'calc(100% - 370px)'}}>
            {/* Personal Information */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <User2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Información personal</h2>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Contact Information Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                      <Mail className="mr-2 h-4 w-4 text-gray-500" />
                      Correo electrónico*
                    </Label>
                    <Input
                      disabled={activeView}
                      id="email"
                      value={email ?? ''}
                      name={INPUT_TYPES.EMAIL}
                      onChange={(e) => props.onChange(e, INPUT_TYPES.EMAIL)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="ejemplo@correo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700">
                      <Phone className="mr-2 h-4 w-4 text-gray-500" />
                      Teléfono
                    </Label>
                    <Input
                      disabled={activeView}
                      value={phone ?? ''}
                      id="phone"
                      type='tel'
                      name={INPUT_TYPES.PHONE}
                      maxLength='8'
                      onChange={(e) => props.onChange(e, INPUT_TYPES.PHONE)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="12345678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthdate" className="flex items-center text-sm font-medium text-gray-700">
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      Fecha de nacimiento
                    </Label>
                    <Input
                      disabled={activeView}
                      id="birthdate"
                      value={birthdate}
                      name={INPUT_TYPES.BIRTHDATE}
                      onChange={(e) => props.onChange(e, INPUT_TYPES.BIRTHDATE)}
                      type="date"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="flex items-center text-sm font-medium text-gray-700">
                      <User2 className="mr-2 h-4 w-4 text-gray-500" />
                      Género
                    </Label>
                    <Select
                      disabled={activeView}
                      defaultValue={gender ?? ''}
                      onValueChange={(e) => props.onChange({ target: { value: e } }, INPUT_TYPES.GENDER)}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="residence" className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                      Ubicación
                    </Label>
                    <Input
                      disabled={activeView}
                      value={residence ?? ''}
                      id="residence"
                      placeholder="Ciudad, País"
                      name={INPUT_TYPES.RESIDENCE}
                      onChange={(e) => props.onChange(e, INPUT_TYPES.RESIDENCE)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dim" className="flex items-center text-sm font-medium text-gray-700">
                      <IdCard className="mr-2 h-4 w-4 text-gray-500" />
                      Número DIM
                    </Label>
                    <Input
                      disabled={activeView}
                      value={dim ?? ''}
                      id="dim"
                      placeholder="Ingrese número de DIM"
                      name="dim"
                      onChange={(e) => props.onChange(e, 'dim')}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Privacy Setting */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <Label className="text-sm font-medium text-gray-900">
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
                        id="sharing"
                        name="sharing"
                        checked={sharing ?? false}
                        onChange={(_, value) => props.onChange(value, 'sharing')}
                        onCheckedChange={value => props.onChange(value, 'sharing')}
                        disabled={activeView ? true : false}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
{/* Skills & Experience Section */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-8 space-y-8">
                {/* Languages Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <LanguagesIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Idiomas</h3>
                    </div>
                    {!activeView && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddLanguage}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar idioma
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {safeLanguages && safeLanguages.length > 0 ? (
                      safeLanguages.map((lang, idx) => (
                        <div key={idx} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Idioma</Label>
                            <Input
                              disabled={activeView}
                              value={lang.language}
                              placeholder="Ej: Español, Inglés"
                              onChange={e => handleChangeLanguage(idx, 'language', e.target.value)}
                              className={`${arrayErrors[`lang_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500`}
                              required
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nivel</Label>
                            <select
                              disabled={activeView}
                              value={lang.level}
                              onChange={e => handleChangeLanguage(idx, 'level', e.target.value)}
                              className={`w-full border rounded-md px-3 py-2 text-sm ${arrayErrors[`lang_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500 transition-colors ${activeView ? 'bg-gray-100' : 'bg-white'}`}
                              required
                            >
                              <option value="" disabled>Seleccionar nivel</option>
                              {LEVELS_LANG.map(lvl => <option key={lvl} value={lvl} className="capitalize">{lvl}</option>)}
                            </select>
                          </div>
                          {!activeView && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveLanguage(idx)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 mt-6"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <LanguagesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h4 className="font-medium text-gray-600 mb-2">No hay idiomas agregados</h4>
                        <p className="text-sm">Agrega los idiomas que dominas para destacar tu perfil</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Education Section */}
                <div className="space-y-6 border-t border-gray-100 pt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Educación</h3>
                    </div>
                    {!activeView && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddEducation}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar educación
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {safeEducation && safeEducation.length > 0 ? (
                      safeEducation.map((edu, idx) => (
                        <div key={idx} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Carrera/Programa</Label>
                              <Input
                                disabled={activeView}
                                value={edu.career}
                                placeholder="Ej: Ingeniería de Sistemas"
                                onChange={e => handleChangeEducation(idx, 'career', e.target.value)}
                                className={`${arrayErrors[`edu_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500`}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Institución</Label>
                              <Input
                                disabled={activeView}
                                value={edu.university}
                                placeholder="Ej: Universidad Nacional"
                                onChange={e => handleChangeEducation(idx, 'university', e.target.value)}
                                className={`${arrayErrors[`edu_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500`}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nivel académico</Label>
                              <select
                                disabled={activeView}
                                value={edu.level}
                                onChange={e => handleChangeEducation(idx, 'level', e.target.value)}
                                className={`flex-1 border rounded-md px-3 py-2 text-sm ${arrayErrors[`edu_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500 transition-colors ${activeView ? 'bg-gray-100' : 'bg-white'}`}
                                required
                              >
                                <option value="" disabled>Seleccionar nivel</option>
                                {LEVELS_EDU.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                              </select>
                            </div>
                            {/* Fecha fin solo si es "Graduado" */}
                            <div className="space-y-2">
                              <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Fecha de fin</Label>
                              <Input
                                disabled={activeView || edu.level !== "Graduado"}
                                value={edu.end_date || ""}
                                type="date"
                                onChange={e => handleChangeEducation(idx, 'end_date', e.target.value)}
                                className={`border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${edu.level !== "Graduado" ? 'opacity-50 pointer-events-none' : ''}`}
                                placeholder="Fecha de fin"
                              />
                            </div>
                            {!activeView && (
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRemoveEducation(idx)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h4 className="font-medium text-gray-600 mb-2">No hay educación agregada</h4>
                        <p className="text-sm">Agrega tu formación académica para mostrar tus credenciales</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work Experience Section */}
                <div className="space-y-6 border-t border-gray-100 pt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <BriefcaseIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Experiencia laboral</h3>
                    </div>
                    {!activeView && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddWork}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar experiencia
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {safeWorkExperience && safeWorkExperience.length > 0 ? (
                      safeWorkExperience.map((work, idx) => (
                        <div key={idx} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Empresa</Label>
                                <Input
                                  disabled={activeView}
                                  value={work.company}
                                  placeholder="Ej: Google Inc."
                                  onChange={e => handleChangeWork(idx, 'company', e.target.value)}
                                  className={`${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500`}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cargo</Label>
                                <Input
                                  disabled={activeView}
                                  value={work.position}
                                  placeholder="Ej: Desarrollador Frontend"
                                  onChange={e => handleChangeWork(idx, 'position', e.target.value)}
                                  className={`${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500`}
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  Fecha de inicio
                                </Label>
                                <Input
                                  disabled={activeView}
                                  value={work.start_date}
                                  type="date"
                                  onChange={e => handleChangeWork(idx, 'start_date', e.target.value)}
                                  className={`${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500`}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3" />
                                  Fecha de fin
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    disabled={activeView || work.end_date === "Actualidad"}
                                    value={work.end_date === "Actualidad" ? "" : work.end_date}
                                    type="date"
                                    onChange={e => handleChangeWork(idx, 'end_date', e.target.value)}
                                    className={`flex-1 ${arrayErrors[`work_${idx}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-500 ${work.end_date === "Actualidad" ? 'opacity-50' : ''}`}
                                    required={work.end_date !== "Actualidad"}
                                  />
                                  {!activeView && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={work.end_date === "Actualidad" ? "default" : "outline"}
                                      className={`${work.end_date === "Actualidad" ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} font-medium px-3`}
                                      onClick={() => handleChangeWork(idx, 'end_date', work.end_date === "Actualidad" ? "" : "Actualidad")}
                                    >
                                      Actualidad
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {!activeView && (
                              <div className="flex justify-end border-t border-gray-200 pt-4">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveWork(idx)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 font-medium"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar experiencia
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h4 className="font-medium text-gray-600 mb-2">No hay experiencia laboral agregada</h4>
                        <p className="text-sm">Comparte tu experiencia profesional para destacar tus habilidades</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {!activeView && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={handlerOnClose}
                      variant="outline"
                      className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Publications Section - Only in View Mode */}
            {activeView && isClient && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Publicaciones</h2>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <Publications 
                    itemsPerPage={10} 
                    items={items} 
                    label={"Publicaciones"} 
                    user={user} 
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserInfo;