import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { protect, authorize } from '../middlewares/authorize.js';
import { uploadFiles } from '../middlewares/uploadFiles.js';
import validate from '../middlewares/validate.js';
import { createPharmacySchema, createPrescriptionSchema } from '../validations/joiValidation.js';

const router = Router();

// ----------------------------------------------------------------
// const LABO_SERVICE_URL = 'http://localhost:3002';
// ----------------------------------------------------------------

const rawUrl = 'http://pharmacyService_app:3002';

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

router.get("/", labProxy);

// Créer un pharmacy (admine)
router.post(
    '/pharmacy',
    protect,
    authorize('pharmacy_manage_partners'),
    validate(createPharmacySchema),
    labProxy
);

// Créer un createPrescriptionSchema (Médecin)
router.post(
    '/prescription',
    protect,
    authorize('prescription_create'),
    validate(createPrescriptionSchema),
    labProxy
);

// { "method": "PUT", "route": "/prescriptions/{id}/sign", "description": "Signer une prescription (Médecin)" },
router.put(
    '/prescriptions/:id/sign',
    protect,
    authorize('prescription_sign'),
    labProxy
)

// { "method": "PUT", "route": "/prescriptions/{id}/assign", "description": "Assigner une prescription à une pharmacie (Médecin/Patient)" },
router.put(
    '/prescriptions/:id/assign',
    protect,
    authorize('prescription_assign_pharmacy'),
    labProxy
);

// { "method": "GET", "route": "/pharmacies", "description": "Lister les pharmacies partenaires" },
router.get(
    '/pharmacies',
    protect,
    authorize('pharmacy_view_assigned'),
    labProxy
)


export default router