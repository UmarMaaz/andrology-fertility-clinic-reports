import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import config from '../config';
import { ExcelStore } from '../lib/ExcelStore';
import { patientColumns } from '../lib/schemas';

interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  dob?: string;
  sex: 'male' | 'female' | 'other';
  phone: string;
  cnic?: string;
  address?: string;
  referringDoctor?: string;
  createdAt: string;
}

const store = new ExcelStore<Patient>(
  path.join(config.DATA_DIR, 'patients.xlsx'),
  patientColumns
);

const router = Router();

// GET /api/patients - list all or search
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    if (search && search.trim()) {
      const results = store.search(search.trim(), ['name', 'mrn', 'phone', 'cnic']);
      return res.json(results);
    }
    const all = store.getAll();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// GET /api/patients/:id - single patient
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient = store.getById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

// POST /api/patients - create or update (upsert)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patient: Patient = req.body;
    if (!patient || !patient.id || !patient.name) {
      return res.status(400).json({ error: 'Missing required patient fields (id, name)' });
    }
    const saved = await store.save(patient);
    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
});

// POST /api/patients/sync - bulk replace all patients
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patients: Patient[] = Array.isArray(req.body) ? req.body : [];
    await store.saveMany(patients);
    res.json({ success: true, count: patients.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/patients/:id - delete patient
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await store.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
export { store as patientStore };

