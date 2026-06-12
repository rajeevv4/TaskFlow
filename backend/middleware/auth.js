import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ error: true, message: 'Authentication required. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'super_secret_taskflow_key_9988';
        
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // { userId: "...", name: "...", email: "..." }
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).send({ error: true, message: 'Invalid or expired token. Please log in again.' });
    }
};

export default auth;
