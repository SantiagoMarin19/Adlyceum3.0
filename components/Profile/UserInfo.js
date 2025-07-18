"use client"

// React
import React from 'react'

// Utils
import {INPUT_TYPES} from 'utils/form';

// Shadcn IU
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
// 1. Importar el nuevo ícono IdCard
import {
  CalendarIcon,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User2,
  LockIcon,
  IdCard,
  Plus,
  Trash2,
  Languages as LanguagesIcon,
  Briefcase as BriefcaseIcon
} from "lucide-react"

// Components Local
import Publications from 'components/Profile/Publications';

// Styles
import {Switch} from "@mui/material";

let options = {year: 'numeric', month: 'long', day: 'numeric'};

const DEFAULT_LANGUAGE = { language: '', level: 'medio' }
const DEFAULT_EDUCATION = { career: '', university: '', level: 'Pregrado' }
const DEFAULT_WORK = { company: '', position: '', start_date: '', end_date: '' }

const LEVELS_EDU = [
  'Pregrado',
  'Técnico',
  'Tecnólogo',
  'Licenciatura',
  'Especialización',
  'Maestría',
  'Doctorado',
  'Postdoctorado'
]
const LEVELS_LANG = ['medio', 'avanzado', 'nativo']

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
    props.onChange([...safeLanguages, {...DEFAULT_LANGUAGE}], INPUT_TYPES.LANGUAGES)
  }
  const handleChangeLanguage = (idx, key, value) => {
    const updated = safeLanguages.map((l, i) => i === idx ? {...l, [key]: value} : l)
    props.onChange(updated, INPUT_TYPES.LANGUAGES)
  }
  const handleRemoveLanguage = (idx) => {
    const updated = safeLanguages.filter((_, i) => i !== idx)
    props.onChange(updated, INPUT_TYPES.LANGUAGES)
  }

  // Handlers para educación
  const handleAddEducation = () => {
    props.onChange([...safeEducation, {...DEFAULT_EDUCATION}], INPUT_TYPES.EDUCATION)
  }
  const handleChangeEducation = (idx, key, value) => {
    const updated = safeEducation.map((e, i) => i === idx ? {...e, [key]: value} : e)
    props.onChange(updated, INPUT_TYPES.EDUCATION)
  }
  const handleRemoveEducation = (idx) => {
    const updated = safeEducation.filter((_, i) => i !== idx)
    props.onChange(updated, INPUT_TYPES.EDUCATION)
  }

  // Handlers para experiencia laboral
  const handleAddWork = () => {
    props.onChange([...safeWorkExperience, {...DEFAULT_WORK}], INPUT_TYPES.WORK_EXPERIENCE)
  }
  const handleChangeWork = (idx, key, value) => {
    const updated = safeWorkExperience.map((w, i) => i === idx ? {...w, [key]: value} : w)
    props.onChange(updated, INPUT_TYPES.WORK_EXPERIENCE)
  }
  const handleRemoveWork = (idx) => {
    const updated = safeWorkExperience.filter((_, i) => i !== idx)
    props.onChange(updated, INPUT_TYPES.WORK_EXPERIENCE)
  }

  // Calendario para experiencia laboral
  const [calendarOpenIdx, setCalendarOpenIdx] = React.useState({start: null, end: null});
  const handleCalendarClick = (idx, type) => setCalendarOpenIdx({ ...calendarOpenIdx, [type]: idx });
  const handleCalendarClose = (type) => setCalendarOpenIdx({ ...calendarOpenIdx, [type]: null });

  // Estado para errores locales de los campos de arrays
  const [arrayErrors, setArrayErrors] = React.useState({});

  // Validación antes de guardar
  const validateArrays = () => {
    const errors = {};
    // Idiomas
    safeLanguages.forEach((lang, idx) => {
      if (!lang.language || !lang.level) {
        errors[`lang_${idx}`] = true;
      }
    });
    // Educación
    safeEducation.forEach((edu, idx) => {
      if (!edu.career || !edu.university || !edu.level) {
        errors[`edu_${idx}`] = true;
      }
    });
    // Experiencia laboral (solo si hay al menos uno)
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
    <main className="container mx-auto px-4 py-1">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarView} alt="Profile picture"/>
                  <AvatarFallback>Loading</AvatarFallback>
                </Avatar>
                {
                    !activeView && <input
                        className="h-32 w-32 absolute top-0 left-0 m-[auto] opacity-[0]"
                        type='file'
                        name='avatar'
                        id='avatar'
                        ref={refAvatar.avatar}
                        onChange={(e) => props.onChange(e, 'avatar')}/>
                }
              </div>
              <div className="text-center">
                {
                  activeView ?
                      <h2 className="text-2xl font-semibold">{fullname}</h2>
                      :
                      <div className="space-y-2 mb-[20px]">
                        <Input
                            disabled={activeView}
                            id="email"
                            value={fullname ?? ''}
                            name={INPUT_TYPES.FULLNAME}
                            onChange={(e) => props.onChange(e, INPUT_TYPES.FULLNAME)}
                        />
                      </div>
                }
                <p className="text-sm text-muted-foreground">{props?.role?.name}</p>
              </div>
              {
                  activeView && <Button onClick={handlerEdit} className="w-full">Editar Perfil</Button>
              } <i className={"text-base"}>Última actualización: <br/> {formattedDate}</i>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Información Personal</h3>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mr-2 inline-block h-4 w-4"/>
                  Correo
                </Label>
                <Input
                    disabled={activeView}
                    id="email"
                    value={email ?? ''}
                    name={INPUT_TYPES.EMAIL}
                    onChange={(e) => props.onChange(e, INPUT_TYPES.EMAIL)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mr-2 inline-block h-4 w-4"/>
                  Número Telefónico
                </Label>
                <Input
                    disabled={activeView}
                    value={phone ?? ''}
                    id="phone"
                    type='tel'
                    name={INPUT_TYPES.PHONE}
                    maxLength='8'
                    onChange={(e) => props.onChange(e, INPUT_TYPES.PHONE)}
                    placeholder="Número Telefónico"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">
                  <CalendarIcon className="mr-2 inline-block h-4 w-4"/>
                  Fecha De Nacimiento
                </Label>
                <Input
                    disabled={activeView}
                    id="birthdate"
                    value={birthdate}
                    name={INPUT_TYPES.BIRTHDATE}
                    onChange={(e) => props.onChange(e, INPUT_TYPES.BIRTHDATE)}
                    type="date"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">
                  <User2 className="mr-2 inline-block h-4 w-4"/>
                  Género
                </Label>
                <Select
                    disabled={activeView}
                    defaultValue={gender ?? ''}
                    onValuechange={(e) => props.onChange({target: {value: e}}, INPUT_TYPES.GENDER)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione género"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="residence">
                  <MapPin className="mr-2 inline-block h-4 w-4"/>
                  Residencia
                </Label>
                <Input
                    disabled={activeView}
                    value={residence ?? ''}
                    id="residence"
                    placeholder="Ingrese su residencia"
                    name={INPUT_TYPES.RESIDENCE}
                    onChange={(e) => props.onChange(e, INPUT_TYPES.RESIDENCE)}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dim">
                  <IdCard className="mr-2 inline-block h-4 w-4"/>
                  DIM
                </Label>
                <Input
                    disabled={activeView}
                    value={dim ?? ''}
                    id="dim"
                    placeholder="Ingrese su DIM"
                    name="dim"
                    onChange={(e) => props.onChange(e, 'dim')}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sharing" className="flex items-center">
                  <LockIcon className="mr-2 h-4 w-4"/>
                  Compartir Información con Empresas
                </Label>
                <Switch
                    id="sharing"
                    name="sharing"
                    checked={sharing ?? false}
                    onChange={(_, value) => props.onChange(value, 'sharing')}
                    disabled={activeView}
                />
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-1">
              {/* Idiomas */}
              <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <LanguagesIcon className="w-5 h-5 text-black" />
                    <h4 className="font-semibold text-black">Idiomas</h4>
                  </div>
                  {!activeView && <Button type="button" size="sm" onClick={handleAddLanguage}><Plus className="w-4 h-4" /> Agregar</Button>}
                </div>
                <div className="w-full flex flex-col items-center">
                  {safeLanguages && safeLanguages.length > 0 ? (
                    safeLanguages.map((lang, idx) => (
                      <div key={idx} className="flex gap-2 items-center mb-2">
                        <Input
                          disabled={activeView}
                          value={lang.language}
                          placeholder="Idioma"
                          onChange={e => handleChangeLanguage(idx, 'language', e.target.value)}
                          className={`font-normal text-base ${arrayErrors[`lang_${idx}`] ? 'border-red-500' : ''}`}
                          required
                        />
                        <select
                          disabled={activeView}
                          value={lang.level}
                          onChange={e => handleChangeLanguage(idx, 'level', e.target.value)}
                          className={`border rounded px-2 py-1 font-normal text-base ${arrayErrors[`lang_${idx}`] ? 'border-red-500' : ''} ${activeView ? 'appearance-none' : ''}`}
                          style={activeView ? {pointerEvents: 'none', backgroundColor: '#f3f4f6'} : {}}
                          required
                        >
                          <option value="" disabled>Seleccione nivel</option>
                          {LEVELS_LANG.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                        {!activeView && <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveLanguage(idx)}><Trash2 className="w-4 h-4" /></Button>}
                      </div>
                    ))
                  ) : <div className="text-muted-foreground text-sm">No hay idiomas agregados.</div>}
                </div>
              </div>
              {/* Educación */}
              <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-black" />
                    <h4 className="font-semibold text-black">Educación</h4>
                  </div>
                  {!activeView && <Button type="button" size="sm" onClick={handleAddEducation}><Plus className="w-4 h-4" /> Agregar</Button>}
                </div>
                <div className="w-full flex flex-col items-center">
                  {safeEducation && safeEducation.length > 0 ? (
                    safeEducation.map((edu, idx) => (
                      <div key={idx} className="flex gap-2 items-center mb-2">
                        <Input
                          disabled={activeView}
                          value={edu.career}
                          placeholder="Carrera"
                          onChange={e => handleChangeEducation(idx, 'career', e.target.value)}
                          className={`font-normal text-base ${arrayErrors[`edu_${idx}`] ? 'border-red-500' : ''}`}
                          required
                        />
                        <Input
                          disabled={activeView}
                          value={edu.university}
                          placeholder="Universidad"
                          onChange={e => handleChangeEducation(idx, 'university', e.target.value)}
                          className={`font-normal text-base ${arrayErrors[`edu_${idx}`] ? 'border-red-500' : ''}`}
                          required
                        />
                        <select
                          disabled={activeView}
                          value={edu.level}
                          onChange={e => handleChangeEducation(idx, 'level', e.target.value)}
                          className={`border rounded px-2 py-1 font-normal text-base ${arrayErrors[`edu_${idx}`] ? 'border-red-500' : ''} ${activeView ? 'appearance-none' : ''}`}
                          style={activeView ? {pointerEvents: 'none', backgroundColor: '#f3f4f6'} : {}}
                          required
                        >
                          <option value="" disabled>Seleccione nivel</option>
                          {LEVELS_EDU.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                        </select>
                        {!activeView && <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveEducation(idx)}><Trash2 className="w-4 h-4" /></Button>}
                      </div>
                    ))
                  ) : <div className="text-muted-foreground text-sm">No hay educación agregada.</div>}
                </div>
              </div>
              {/* Experiencia Laboral */}
              <div className="mb-8 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center gap-2">
                    <BriefcaseIcon className="w-5 h-5 text-black" />
                    <h4 className="font-semibold text-black">Experiencia Laboral</h4>
                  </div>
                  {!activeView && <Button type="button" size="sm" onClick={handleAddWork}><Plus className="w-4 h-4" /> Agregar</Button>}
                </div>
                <div className="w-full flex flex-col items-center">
                  {safeWorkExperience && safeWorkExperience.length > 0 ? (
                    safeWorkExperience.map((work, idx) => (
                      <div key={idx} className="flex gap-2 items-center mb-2">
                        <Input
                          disabled={activeView}
                          value={work.company}
                          placeholder="Empresa"
                          onChange={e => handleChangeWork(idx, 'company', e.target.value)}
                          className={`font-normal text-base ${arrayErrors[`work_${idx}`] ? 'border-red-500' : ''}`}
                          required
                        />
                        <Input
                          disabled={activeView}
                          value={work.position}
                          placeholder="Puesto"
                          onChange={e => handleChangeWork(idx, 'position', e.target.value)}
                          className={`font-normal text-base ${arrayErrors[`work_${idx}`] ? 'border-red-500' : ''}`}
                          required
                        />
                        {/* Fecha inicio */}
                        <Input
                          disabled={activeView}
                          value={work.start_date}
                          type="date"
                          placeholder="Fecha Inicio"
                          onChange={e => handleChangeWork(idx, 'start_date', e.target.value)}
                          className={`font-normal text-base ${arrayErrors[`work_${idx}`] ? 'border-red-500' : ''}`}
                          required
                        />
                        {/* Fecha fin y actualidad */}
                        <div className="flex items-center gap-1">
                          <Input
                            disabled={activeView || work.end_date === "Actualidad"}
                            value={work.end_date === "Actualidad" ? "" : work.end_date}
                            type="date"
                            placeholder="Fecha Fin"
                            onChange={e => handleChangeWork(idx, 'end_date', e.target.value)}
                            className={`font-normal text-base ${arrayErrors[`work_${idx}`] ? 'border-red-500' : ''}`}
                            style={work.end_date === "Actualidad" ? {opacity: 0.5, pointerEvents: 'none'} : {}}
                            required={work.end_date !== "Actualidad"}
                          />
                          {!activeView && (
                            <Button
                              type="button"
                              size="sm"
                              variant={work.end_date === "Actualidad" ? "default" : "outline"}
                              className="ml-1"
                              onClick={() => handleChangeWork(idx, 'end_date', work.end_date === "Actualidad" ? "" : "Actualidad")}
                            >
                              Actualidad
                            </Button>
                          )}
                        </div>
                        {!activeView && <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveWork(idx)}><Trash2 className="w-4 h-4" /></Button>}
                      </div>
                    ))
                  ) : <div className="text-muted-foreground text-sm">No hay experiencia laboral agregada.</div>}
                </div>
              </div>
            </div>
            {
                !activeView &&
                <div className="flex justify-end space-x-4">
                  <Button onClick={handlerOnClose} variant="outline">Cancelar</Button>
                  <Button onClick={handleSave}>Guardar Cambios</Button>
                </div>
            }

            {
                activeView && isClient &&
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Publicaciones</h3>
                  <Publications itemsPerPage={10} items={items} label={"Publicaciones"} user={user}/>
                </div>
            }
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default UserInfo;