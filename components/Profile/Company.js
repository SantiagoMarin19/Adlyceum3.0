import React, { useState, useEffect } from 'react';
import { GET_ALL_COMPANIES, CREATE_COMPANY, UPDATE_COMPANY, request } from 'utils/graphqlRequest';

export default function Company() {
  const [companies, setCompanies] = useState([]);
  const [skip, setSkip] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    company_type: '',
    description: '',
    logoId: null,
    adsImageIds: [],
  });

  useEffect(() => {
    fetchCompanies();
  }, [skip]);

  async function fetchCompanies() {
    try {
      const data = await request(GET_ALL_COMPANIES, { skip });
      setCompanies(data.allCompanies);
    } catch (err) {
      console.error('Error al cargar compañías:', err);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', company_type: '', description: '', logoId: null, adsImageIds: [] });
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      name: c.name,
      company_type: c.companyType,
      description: c.description,
      logoId: c.logo?.id,
      adsImageIds: c.adsImages?.map(img => img.id) || [],
    });
    setModalOpen(true);
  }

  // Mock upload function: replace with real file upload logic
  async function uploadFile(file) {
    // Aquí harías fetch a tu endpoint de subida y devolverías el ID
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const json = await res.json();
    return json.id;
  }

  async function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const id = await uploadFile(file);
    setForm(f => ({ ...f, logoId: id }));
  }

  async function handleAdsChange(e) {
    const files = Array.from(e.target.files);
    const ids = [];
    for (let file of files) {
      const id = await uploadFile(file);
      ids.push(id);
    }
    setForm(f => ({ ...f, adsImageIds: ids }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const variables = editing
        ? { id: editing.id, name: form.name, companyType: form.company_type, description: form.description, logoId: form.logoId, adsImageIds: form.adsImageIds }
        : { name: form.name, companyType: form.company_type, description: form.description, logoId: form.logoId, adsImageIds: form.adsImageIds };
      const mutation = editing ? UPDATE_COMPANY : CREATE_COMPANY;
      await request(mutation, variables);
      setModalOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error('Error en mutación:', err);
    }
  }

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-indigo-900">Compañías</h1>
        <button onClick={openCreate} className="bg-indigo-700 hover:bg-indigo-500 text-white px-4 py-2 rounded">
          + Crear compañía
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full">
          <thead className="bg-indigo-700 text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.name}</td>
                <td className="px-4 py-2">{c.companyType}</td>
                <td className="px-4 py-2">{c.description}</td>
                <td className="px-4 py-2">
                  <button onClick={() => openEdit(c)} className="text-indigo-700 hover:underline">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl mb-4 text-indigo-900">
              {editing ? 'Editar compañía' : 'Crear compañía'}
            </h2>

            <label className="block mb-2">
              Nombre
              <input type="text" className="w-full border px-2 py-1 rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </label>

            <label className="block mb-2">
              Tipo
              <input type="text" className="w-full border px-2 py-1 rounded" value={form.company_type} onChange={e => setForm({ ...form, company_type: e.target.value })} required />
            </label>

            <label className="block mb-4">
              Descripción
              <textarea className="w-full border px-2 py-1 rounded" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </label>

            <label className="block mb-4">
              Logo
              <input type="file" accept="image/*" onChange={handleLogoChange} className="mt-1" />
            </label>

            <label className="block mb-4">
              Imágenes de anuncio
              <input type="file" accept="image/*" multiple onChange={handleAdsChange} className="mt-1" />
            </label>

            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded border">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-500">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
