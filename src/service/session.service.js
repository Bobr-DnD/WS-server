import Session from '../schemas/session.schema.js';
import { DatabaseError } from '../utils/errors.js';

export const getSessionMove = async (sessionId) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new DatabaseError('Session not found');
    }
    return session.move;
};

export const updateSessionMove = async (sessionId, moveValue) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new DatabaseError('Session not found');
    }
    session.move = session.move + Number(moveValue);

    await session.save();
    return session.move;
};

export const getSessionCharacters = async (sessionId) => {
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new DatabaseError('Session not found');
    }
    return session.characters;
};

export const getSessionName = async (sessionId) => {
    const sessionName = await Session.findById(sessionId).select('name');
    if (!sessionName) {
        throw new DatabaseError('Session not found');
    }
    return sessionName.name;
};
