import jwt from 'jsonwebtoken';
import { AuthError } from './errors.js';

export function verifySessionToken(token, expectedSessionId) {
    if (!token) {
        throw new AuthError('Missing session token');
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        throw new AuthError('Invalid or expired session token');
    }

    if (payload.sessionId !== expectedSessionId) {
        throw new AuthError('Token does not match this session');
    }

    return payload;
}
