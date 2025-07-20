import { buildClient } from '@datocms/cma-client-node';
import multer from 'multer';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'adsImages', maxCount: 5 },
]);

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) =>
    fn(req, res, (err) => (err ? reject(err) : resolve()))
  );

export const config = { api: { bodyParser: false } };

const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN });

async function uploadBuffer(buffer, filename) {
  const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${filename}`);
  await promisify(fs.writeFile)(tmpPath, buffer);

  try {
    const uploadRecord = await client.uploads.createFromLocalFile({
      localPath: tmpPath,
      skipCreationIfAlreadyExists: false,
    });
    return uploadRecord.id;
  } finally {
    fs.unlink(tmpPath, () => {});
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    await runMiddleware(req, res, upload);

    let logoUploadId = null;
    if (req.files.logo?.[0]) {
      const { buffer, originalname } = req.files.logo[0];
      logoUploadId = await uploadBuffer(buffer, originalname);
    }

    const adsUploadIds = [];
    for (const file of req.files.adsImages || []) {
      const id = await uploadBuffer(file.buffer, file.originalname);
      adsUploadIds.push(id);
    }

    const baseFields = {
      name:         req.body.name,
      company_type: req.body.company_type,
      description:  req.body.description || '',
    };
    if (logoUploadId) {
      baseFields.logo = { upload_id: logoUploadId };
    }
    if (adsUploadIds.length) {
      baseFields.ads_images = adsUploadIds.map(upload_id => ({ upload_id }));
    }

    console.log('Payload fields:', baseFields);
    let record;
    if (req.body.id) {
      record = await client.items.update(
        req.body.id,
        baseFields
      );
    } else {
      record = await client.items.create({
        item_type: { type: 'item_type', id: 'SuNPGAyCRoqknd8-FINmRw' },
        ...baseFields
      });
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error('Error en /api/company:', error);
    return res.status(500).json({ error: error.message });
  }
}
