import { DatabaseError, ValidationError, AuthError } from '../utils/errors.js';
import fastifyInstance from '../core/fastify.instance.js';

function socketErrorHandler(socket, error) {
    let message = 'Internal server error';
    let status = 500;

    if (error instanceof DatabaseError || error instanceof ValidationError || error instanceof AuthError) {
        message = error.message;
        status = error.statusCode;
    }

    fastifyInstance.server.log.error(error.message);

    socket.emit('error', { status, message });
}

export { socketErrorHandler };
