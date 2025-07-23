import React, { useState, useEffect } from 'react';
import { GET_ALL_COMPANIES, CREATE_COMPANY, UPDATE_COMPANY, request } from 'utils/graphqlRequest';
import {useRouter} from 'next/router';

export default function Company() {
  // Router
  const router = useRouter();

  // States
  const [companies, setCompanies] = useState([]);
  const [skip, setSkip] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] =useState(null)
  const [form, setForm] = useState({
    name: '',
    company_type: '',
    description: '',
    logoFile: null,
    logoPreview: null,
    adsFiles: [],
    adsPreviews: [],
  });

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
    setForm({
      name: '',
      company_type: '',
      description: '',
      logoFile: null,
      logoPreview: null,
      adsFiles: [],
      adsPreviews: [],
    });
    setModalOpen(true);
  }

  function openEdit(c) {
    console.log("Here")
    setEditing(c);
    setForm({
      name: c.name,
      company_type: c.companyType,
      description: c.description,
      logoId: c.logo?.id,
      adsImageIds: c.adsImages?.map(img => img.id) || [],
      logoPreview: c.logo?.url || null,
      adsPreviews: c.adsImages?.map(img => img.url) || [], 
    });
    setModalOpen(true);
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('logo', file);
    const res = await fetch('/api/company', {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    return json.id; 
  }

  async function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (form.logoPreview && form.logoFile) {
      URL.revokeObjectURL(form.logoPreview);
    }
    const preview = URL.createObjectURL(file);
    setForm(f => ({
      ...f,
      logoFile: file,
      logoPreview: preview,
    }));
  }

  async function handleAdsChange(e) {
    const files = Array.from(e.target.files);
    form.adsPreviews.forEach(url => URL.revokeObjectURL(url));

    const previews = files.map(file => URL.createObjectURL(file));
    setForm(f => ({
      ...f,
      adsFiles: files,
      adsPreviews: previews,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append('name',        form.name);
      body.append('company_type', form.company_type);
      body.append('description', form.description);


      if (editing) {
        body.append('id', editing.id);
      }

      // ficheros
      if (form.logoFile) {
        body.append('logo', form.logoFile);
      }
      form?.adsFiles?.forEach(file => {
        body.append('adsImages', file);
      });

      const res = await fetch('/api/company', {
        method: 'POST',
        body,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const company = await res.json();
      console.log(company)
      setModalOpen(false);
      const companyWithPreviews = {
        ...company,
        logo: company.logo
          ? { 
              ...company.logo, 
              url: form.logoPreview || company.logo.url 
            }
          : null,
        ads_images: form.adsPreviews.length
          ? form.adsPreviews.map((url, i) => ({
              id: company.ads_images[i]?.id || `preview-${i}`,
              url
            }))
          : company.ads_images || []
      };

      if (editing) {
        setCompanies(cs =>
          cs.map(c => c.id === company.id ? companyWithPreviews : c)
        );
      } else {
        setCompanies(cs => [companyWithPreviews, ...cs]);
      }
    } catch (err) {
      console.error('Error al guardar compañía:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Spinner = () => (
      <svg
        className="animate-spin h-5 w-5 mr-2 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    );

  useEffect(() => {
    fetchCompanies();
  }, [skip]);

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-indigo-900">Compañías</h1>
        <button onClick={openCreate} className="bg-indigo-700 hover:bg-indigo-500 text-white px-4 py-2 rounded">
          + Crear compañía
        </button>
      </div>

      <div className="w-full bg-white shadow rounded-lg">
        <table className="w-full min-w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-indigo-700 text-white text-left">
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-sm">ID</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-sm">Nombre</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-sm">Tipo</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-sm">Descripción</th>
              <th className="px-6 py-3 font-semibold uppercase tracking-wider text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((c, idx) => (
              <tr
                onClick={() => router.push(`/company/${c.id}`)}
                key={c.id}
                className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c?.company_type || c?.companyType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(c);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
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
              <select
                className="w-full border px-2 py-1 rounded"
                value={form.company_type}
                onChange={e => setForm({ ...form, company_type: e.target.value })}
                required
              >
                <option value="">-- Selecciona un tipo --</option>
                <option value="S.A.">Sociedad Anónima (S.A.)</option>
                <option value="LTDA.">Sociedad Limitada (LTDA.)</option>
                <option value="SAS">Sociedad por Acciones Simplificada (SAS)</option>
                <option value="E.I.R.L.">Empresa Individual de Responsabilidad Limitada (E.I.R.L.)</option>
                <option value="Cooperativa">Cooperativa</option>
                <option value="Otra">Otra</option>
              </select>
            </label>

            <label className="block mb-4">
              Descripción
              <textarea className="w-full border px-2 py-1 rounded" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </label>

            {/* Logo */}
            <label className="block mb-2">
              Logo
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </label>
            {form.logoPreview && (
              <img
                src={form.logoPreview}
                alt="Preview logo"
                className="mb-4 w-32 h-32 object-cover rounded"
              />
            )}

            {/* Ads Images */}
            <label className="block mb-2">
              Imágenes de anuncio
              <input type="file" accept="image/*" multiple onChange={handleAdsChange} />
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.adsPreviews.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preview ad ${i + 1}`}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded border hover:bg-gray-100"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex items-center px-4 py-2 rounded text-white ${
                  loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-500'
                }`}
                disabled={loading}
              >
                {loading && <Spinner />}
                {loading ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
