import AppError from '../utils/appError.js';

export default function validate(schema) {
    return (req, res, next) => {
        if (!req.body || Object.keys(req.body).length === 0) {
            return next(new AppError('Request body is empty', 400));
        }
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) return next(new AppError(error.details.map(d => d.message).join(', '), 400, 'VALIDATION_ERROR'));
        req.body = value;
        next();
    };
}
