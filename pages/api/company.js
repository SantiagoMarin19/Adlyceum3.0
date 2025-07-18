// pages/api/company.js
import { buildClient } from '@datocms/cma-client-node';
import multer from 'multer';
import { promisify } from 'util';
import FormData from 'form-data';
import { Readable } from 'stream';

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'adsImages', maxCount: 5 },
]);

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) =>
    fn(req, res, (err) => (err ? reject(err) : resolve()))
  );

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    await runMiddleware(req, res, upload);

    const dato = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN });

    let logoId = null;
    if (req.files.logo?.[0]) {
      const { buffer, originalname, mimetype } = req.files.logo[0];
        const form = new FormData();
        form.append('file', buffer, { filename: originalname, contentType: mimetype});

        const uploadRes = await fetch('https://site-api.datocms.com/uploads', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.DATOCMS_API_TOKEN}`,
            Accept: 'application/json',
            ...form.getHeaders()
        },
        body: form
        });

        const data = await uploadRes.json();
        console.log(data)
        // logoId = uploadId;
    }

    const adsImageIds = [];
    for (const file of req.files.adsImages || []) {
      const form = new FormData();
      form.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      const uploadRes = await fetch('https://site-api.datocms.com/uploads', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.DATOCMS_API_TOKEN}`,
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Upload failed: ${uploadRes.status} ${text}`);
      }

      const { data: { id: uploadId } } = await uploadRes.json();
      const asset = await dato.assets.create({ uploadId });
      adsImageIds.push(asset.id);
    }

    const payload = {
      data: {
        type: 'item',
        relationships: {
          item_type: {
            data: { type: 'item_type', id: 'SuNPGAyCRoqknd8-FINmRw' }
          },
          ...(logoId && {
            logo: { data: { type: 'upload', id: logoId } }
          }),
          ...(adsImageIds.length > 0 && {
            ads_images: {
                data: adsImageIds.map(id => ({
                    type: 'upload',
                    id
                }))
            }
          }),
        },
        attributes: {
          name:        req.body.name,
          company_type: req.body.company_type,
          description: req.body.description || '',
        }
      }
    };

    const { data } = await dato.items.rawCreate(payload);
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error en /api/company:', error);
    return res.status(500).json({ error: error.message });
  }
}
