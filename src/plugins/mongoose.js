import fp from 'fastify-plugin';
import mongoose from 'mongoose';

async function dbConnector(fastify, opts) {
    const mongoUrl = opts.use_local ? process.env.MONGO_URL_LOCAL : process.env.MONGO_URL_WEB;
    try {
        await mongoose.connect(mongoUrl);
        fastify.log.info(`MongoDB mongoose connected using ${opts.use_local ? 'LOCAL' : 'WEB'} URL`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }

    fastify.decorate('mongoose', mongoose);
}

export default fp(dbConnector);
