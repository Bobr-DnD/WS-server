import Session from '../schemas/session.schema.js';
import { ValidationError } from '../utils/errors.js';

export const updateSessionMove = async (sessionId, moveValue) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ValidationError('Session not found');
    }
    session.move = session.move + Number(moveValue);

    await session.save();
    return session.move;
};
