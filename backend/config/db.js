const mongoose = require('mongoose');

const DEFAULT_TIMEOUT_MS = 60_000;

const sanitizeMongoUri = (uri) => uri.replace(/\/\/([^:@]+):[^@]*@/, '//$1:***@');

const buildMongoUri = () => {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const {
    MONGO_PROTOCOL = 'mongodb',
    MONGO_USER,
    MONGO_PASS,
    MONGO_HOST,
    MONGO_DB,
    MONGO_OPTIONS,
  } = process.env;

  if (!MONGO_HOST || !MONGO_DB) {
    throw new Error('Missing MongoDB configuration. Provide MONGO_URI or MONGO_HOST + MONGO_DB.');
  }

  const credentials = MONGO_USER
    ? `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASS || '')}@`
    : '';

  const query = MONGO_OPTIONS ? `?${MONGO_OPTIONS}` : '';

  return `${MONGO_PROTOCOL}://${credentials}${MONGO_HOST}/${MONGO_DB}${query}`;
};

const buildMongoOptions = (uri) => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
    connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };

  const isSrv = uri.startsWith('mongodb+srv://');

  if (!isSrv && process.env.MONGO_AUTH_SOURCE) {
    options.authSource = process.env.MONGO_AUTH_SOURCE;
  }

  if (process.env.MONGO_DB_NAME) {
    options.dbName = process.env.MONGO_DB_NAME;
  }

  return options;
};

const connectDB = async () => {
  const uri = buildMongoUri();
  const options = buildMongoOptions(uri);

  console.log('Connecting to MongoDB using URI:', sanitizeMongoUri(uri));

  await mongoose.connect(uri, options);
  console.log('✅ MongoDB connected successfully');

  return mongoose.connection;
};

module.exports = connectDB;
module.exports.buildMongoUri = buildMongoUri;
