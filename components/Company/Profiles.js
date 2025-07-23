"use client"

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, Filter, ChevronUp, ChevronDown, Users, GraduationCap, MapPin, Briefcase } from 'lucide-react'
import { GET_ALL_STUDENTS_FIELDS, request } from 'utils/graphqlRequest'

// Components
import StudentMatcher from './StudentMatcher';

export default function Profiles() {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('fullname')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedStudents, setSelectedStudents] = useState(new Set())
  const [filterUniversity, setFilterUniversity] = useState('')
  const [filterCareer, setFilterCareer] = useState('')
  const [matchOpen, setMatchOpen] = useState(false)
  
  const parseLevel = useCallback((level) => {
    if (!level) return { career: '', university: '', degree: '' }
    const parts = level.split('/')
    if (parts.length >= 2) {
      return {
        career: parts[0].trim() || '',
        university: parts[1].trim() || '',
        degree: parts[2]?.trim() || '',
      }
    }
    const commaparts = level.split(',')
    if (commaparts.length >= 2) {
      return {
        career: commaparts[0].trim() || '',
        university: commaparts[1].trim() || '',
        degree: commaparts[2]?.trim() || '',
      }
    }
    return { career: level, university: '', degree: '' }
  }, [])

  const universities = useMemo(() => {
    const setUnis = new Set()
    students.forEach((s) => {
      const { university } = parseLevel(s.level)
      if (university) setUnis.add(university)
    })
    return Array.from(setUnis).sort()
  }, [students, parseLevel])

  const careers = useMemo(() => {
    const setCareers = new Set()
    students.forEach((s) => {
      const { career } = parseLevel(s.level)
      if (career) setCareers.add(career)
    })
    return Array.from(setCareers).sort()
  }, [students, parseLevel])

  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        student.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      const { university, career } = parseLevel(student.level)
      const matchesUniversity = !filterUniversity || university.includes(filterUniversity)
      const matchesCareer = !filterCareer || career.includes(filterCareer)
      return matchesSearch && matchesUniversity && matchesCareer
    })

    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortField) {
        case 'fullname':
          aValue = a.fullname.toLowerCase()
          bValue = b.fullname.toLowerCase()
          break
        case 'birthdate':
          aValue = a.birthdate ? new Date(a.birthdate) : new Date(0)
          bValue = b.birthdate ? new Date(b.birthdate) : new Date(0)
          break
        case 'university':
          aValue = parseLevel(a.level).university.toLowerCase()
          bValue = parseLevel(b.level).university.toLowerCase()
          break
        case 'level':
          aValue = parseLevel(a.level).career.toLowerCase()
          bValue = parseLevel(b.level).career.toLowerCase()
          break
        case 'residence':
          aValue = a.residence.toLowerCase()
          bValue = b.residence.toLowerCase()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          return 0
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [students, searchTerm, sortField, sortOrder, filterUniversity, filterCareer, parseLevel])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleSelectStudent = (id) => {
    const newSet = new Set(selectedStudents)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedStudents(newSet)
  }

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredAndSortedStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(filteredAndSortedStudents.map((s) => s.id)))
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No especificado'
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const SortButton = ({ field, children }) => (
    <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
      {children}
      {sortField === field && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
    </button>
  )

  const initStudents = useCallback(
        async () => {
            try {
                const { allUsers } = await request([
                    GET_ALL_STUDENTS_FIELDS,
                ]);
                
                if (allUsers?.length > 0)
                 setStudents(allUsers)  
            } catch (error) {
            console.log(error)
            }
        },
        []
  )
  
  useMemo(initStudents,[])
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfiles de Estudiantes</h1>
          <p className="text-gray-600">Gestiona y explora los perfiles de la comunidad académica</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button onClick={() => setMatchOpen(true)}>
              Match Students
            </button>
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por Universidad */}
            <select
              value={filterUniversity}
              onChange={(e) => setFilterUniversity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las universidades</option>
              {universities.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>

            {/* Filtro por Carrera */}
            <select
              value={filterCareer}
              onChange={(e) => setFilterCareer(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las carreras</option>
              {careers.map((career) => (
                <option key={career} value={career}>
                  {career}
                </option>
              ))}
            </select>

            {/* Contador de seleccionados */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{selectedStudents.size} seleccionados</span>
              {selectedStudents.size > 0 && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Crear Lista
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Perfiles</p>
                <p className="text-2xl font-bold text-gray-900">{filteredAndSortedStudents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Universidades</p>
                <p className="text-2xl font-bold text-gray-900">{universities.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Carreras</p>
                <p className="text-2xl font-bold text-gray-900">{careers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <Filter className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Seleccionados</p>
                <p className="text-2xl font-bold text-gray-900">{selectedStudents.size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.size === filteredAndSortedStudents.length &&
                        filteredAndSortedStudents.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="fullname">Nombre</SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="level">Carrera</SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="university">Universidad</SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="birthdate">Fecha Nacimiento</SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <SortButton field="residence">Residencia</SortButton>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experiencia
                  </th>
                </tr>
              </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedStudents.map((student) => {
                  const { career, university, degree } = parseLevel(student.level)
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.avatar?.url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={student.avatar.url || "/placeholder.svg"}
                                alt={student.fullname}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {student.fullname
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.fullname}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{career || "No especificado"}</div>
                        {degree && <div className="text-sm text-gray-500">{degree}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{university || "No especificado"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(student.birthdate)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          {student.residence && <MapPin className="w-4 h-4 mr-1 text-gray-400" />}
                          {student.residence || "No especificado"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {student.experience ? (
                            <div className="max-w-xs truncate" title={student.experience}>
                              {student.experience}
                            </div>
                          ) : (
                            "Sin experiencia registrada"
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer de la tabla */}
        <div className="bg-white px-6 py-3 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {filteredAndSortedStudents.length} de {students.length} perfiles
            </div>
            {selectedStudents.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudents(new Set())}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar selección
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Exportar seleccionados ({selectedStudents.size})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {matchOpen && (
        <StudentMatcher
          students={filteredAndSortedStudents}
          parseLevel={parseLevel}
          onClose={() => setMatchOpen(false)}
        />
      )}
    </div>
  )
}