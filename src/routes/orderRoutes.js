import { Router } from 'express';

import createProxyMiddleware from 'http-proxy-middleware' ;


const router = Router();


router.post('/lab-orders', createProxyMiddleware({
    target: process.env.LABO_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/labo': '/', // Kay7eyyed /api/labo mn l-path
    },
}))










export default router;