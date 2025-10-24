import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { protect, authorize } from '../middlewares/authorize.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';
import validate from '../middlewares/validate.js';
import { createOrderSchema } from '../validations/joiValidation.js';

const router = Router();

// ----------------------------------------------------------------
// ⚠️ BDDEL HAD L'URL:
// const LABO_SERVICE_URL = 'http://localhost:3001';
// ----------------------------------------------------------------

const rawUrl = 'http://laboratoireService_app:3001/';

const labProxyOptions = {
    target: rawUrl,
    changeOrigin: true,
    logLevel: 'debug',
    timeout: 10000,
    proxyTimeout: 10000,
    pathRewrite: (path, req) => {
        // Example: add /v1 at the beginning
        console.log(path)
        return '/v1' + path;
    },
};

const labProxy = createProxyMiddleware(labProxyOptions);

// Créer un ordre de laboratoire (Médecin)
router.post(
    '/lab-orders',
    protect, 
    authorize('administration'), 
    validate(createOrderSchema), 
    uploadFiles,
    labProxy
);


// 2. Ayi request jat l '/patients' (li katbda b /patients)
// Hada ghadi y proxyi:
//   - GET /patients/{patientId}/lab-results
router.use('/patients', labProxy);


export default router