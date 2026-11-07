const fs = require('fs');
const http = require('http');
const path = require('path');
const { applicationDefault, getApps, initializeApp } = require('firebase-admin/app');

const ENV_FILE_PATH = path.join(__dirname, '.env');
const SERVICE_NAME = 'vanir-api-future';
const DEFAULT_PORT = 3000;
const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'API_BASE_URL',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'GOOGLE_APPLICATION_CREDENTIALS',
];

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE_PATH)) {
    return;
  }

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(ENV_FILE_PATH);
    return;
  }

  const envFileContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
  const lines = envFileContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const port = Number(process.env.PORT || DEFAULT_PORT);
const startupTime = new Date();
const credentialsPathFromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentialsPath = credentialsPathFromEnv
  ? path.resolve(__dirname, credentialsPathFromEnv)
  : '';

if (credentialsPathFromEnv && fs.existsSync(credentialsPath)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

function initializeFirebaseAdminSdk() {
  if (getApps().length > 0) {
    return true;
  }

  try {
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin SDK initialized successfully.');
    return true;
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
    return false;
  }
}

const firebaseAdminInitialized = initializeFirebaseAdminSdk();

function getMissingEnvVars() {
  return REQUIRED_ENV_VARS.filter(envVar => {
    const value = process.env[envVar];
    return typeof value !== 'string' || value.trim().length === 0;
  });
}

function getHealthPayload() {
  const missingEnvVars = getMissingEnvVars();
  const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const googleCredentialsExists = Boolean(
    googleCredentialsPath &&
      (fs.existsSync(googleCredentialsPath) ||
        fs.existsSync(path.resolve(__dirname, googleCredentialsPath))),
  );
  const hasMissingCredentialsFile = Boolean(googleCredentialsPath && !googleCredentialsExists);
  const status = missingEnvVars.length === 0 && !hasMissingCredentialsFile ? 'ok' : 'degraded';

  return {
    service: SERVICE_NAME,
    status,
    checkedAt: new Date().toISOString(),
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    runtime: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      startedAt: startupTime.toISOString(),
      pid: process.pid,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    infrastructure: {
      provider: 'Firebase / Google Cloud',
      apiBaseUrlConfigured: Boolean(process.env.API_BASE_URL),
      firebaseConfigured: {
        apiKey: Boolean(process.env.FIREBASE_API_KEY),
        authDomain: Boolean(process.env.FIREBASE_AUTH_DOMAIN),
        projectId: Boolean(process.env.FIREBASE_PROJECT_ID),
        storageBucket: Boolean(process.env.FIREBASE_STORAGE_BUCKET),
        messagingSenderId: Boolean(process.env.FIREBASE_MESSAGING_SENDER_ID),
        appId: Boolean(process.env.FIREBASE_APP_ID),
      },
      googleCredentialsConfigured: Boolean(googleCredentialsPath),
      googleCredentialsFileExists: googleCredentialsExists,
      firebaseAdminInitialized,
    },
    configuration: {
      requiredEnvVars: REQUIRED_ENV_VARS,
      missingEnvVars,
      hasMissingCredentialsFile,
    },
  };
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/health') {
    const healthPayload = getHealthPayload();
    const statusCode = healthPayload.status === 'ok' ? 200 : 503;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthPayload));
    return;
  }

  if (requestUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        service: SERVICE_NAME,
        status: 'ok',
        message: `${SERVICE_NAME} is running.`,
        healthEndpoint: '/health',
      }),
    );
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      service: SERVICE_NAME,
      status: 'not_found',
      message: 'Route not found.',
    }),
  );
});

server.listen(port, () => {
  console.log(`${SERVICE_NAME} listening on port ${port}`);
});

server.on('error', error => {
  console.error(`${SERVICE_NAME} failed to start:`, error);
  process.exit(1);
});
