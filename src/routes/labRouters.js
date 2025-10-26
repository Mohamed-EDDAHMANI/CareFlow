import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { protect, authorize } from '../middlewares/authorize.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';
import validate from '../middlewares/validate.js';
import { createOrderSchema, createLabResultSchema } from '../validations/joiValidation.js';

const router = Router();

// ----------------------------------------------------------------
// ⚠️ BDDEL HAD L'URL:
// const LABO_SERVICE_URL = 'http://localhost:3001';
// ----------------------------------------------------------------

const rawUrl = 'http://laboratoireService_app:3001';

const labProxyOptions = {
    target: rawUrl,
    changeOrigin: true,
    logLevel: 'debug',
    timeout: 10000,
    proxyTimeout: 10000,
    pathRewrite: (path, req) => '/v1' + path,
    on: {
        proxyReq: (proxyReq, req, res) => {
            const fullUrl = rawUrl + req.url;
            console.log(`🔁 [${req.method}] ${fullUrl}`);
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                if (req.body && Object.keys(req.body).length > 0) {
                    const bodyWithFiles = {
                        ...req.body,
                        uploadedFiles: req.uploadedFiles || [],
                    };
                    const bodyData = JSON.stringify(bodyWithFiles);
                    proxyReq.setHeader('Content-Type', 'application/json');
                    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                    proxyReq.write(bodyData);
                }
            }
        },
        proxyRes: (proxyRes, req, res) => {
            /* handle proxyRes */
        },
        error: (err, req, res) => {
            /* handle error */
        },
    },
};

const labProxy = createProxyMiddleware(labProxyOptions);

// Créer un ordre de laboratoire (Médecin)
router.post(
    '/lab-orders',
    protect,
    authorize('lab_order_create'),
    validate(createOrderSchema),
    labProxy
);

//  { "method": "GET", "route": "/lab-orders/{id}", "description": "Consulter un ordre de laboratoire (Labo, Médecin)" },
router.get(
    '/lab-orders/:id',
    protect,
    authorize('lab_order_view'),
    labProxy
)

// Créer un ordre de laboratoire (Médecin)

router.post(
    '/lab-orders/:orderId/results',
    protect,
    authorize('lab_result_upload'),
    uploadFiles,
    validate(createLabResultSchema),
    labProxy
);

router.get(
    '/patients/:patientId/lab-results',
    protect,
    authorize('lab_result_view'),
    labProxy
)



// 2. Ayi request jat l '/patients' (li katbda b /patients)
// Hada ghadi y proxyi:
//   - GET /patients/{patientId}/lab-results
router.use('/patients', labProxy);


export default router