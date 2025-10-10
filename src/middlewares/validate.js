import AppError from '../utils/appError.js';

export default function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) return next(new AppError(error.details.map(d => d.message).join(', '), 400));
        req.body = value;
        next();
    };
}
