import cors from 'cors';

// 開発環境では、localhostのすべてのポートを許可
const getAllowedOrigins = (): string[] => {
  const corsOrigin = process.env.CORS_ORIGIN;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // デバッグログ（サーバー起動時のみ）
  if (!(globalThis as any).corsInitialized) {
    console.log('CORS Configuration:');
    console.log('  CORS_ORIGIN:', corsOrigin || '(not set)');
    console.log('  NODE_ENV:', nodeEnv);
    (globalThis as any).corsInitialized = true;
  }
  
  // 環境変数が明示的に設定されている場合
  if (corsOrigin) {
    console.log('  Using CORS_ORIGIN from env:', corsOrigin);
    return [corsOrigin];
  }
  
  // 開発環境では、Viteのデフォルトポート範囲（5173-5179）を許可
  if (nodeEnv === 'development') {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:5177',
      'http://localhost:5178',
      'http://localhost:5179',
    ];
    console.log('  Using development origins:', allowedOrigins);
    return allowedOrigins;
  }
  
  // 本番環境では特定のオリジンのみ許可
  console.log('  Using production origin: http://localhost:5173');
  return ['http://localhost:5173'];
};

const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    // オリジンがない場合（同一オリジンリクエストなど）は許可
    if (!origin) {
      return callback(null, true);
    }
    
    // 許可リストに含まれているかチェック
    const isAllowed = allowedOrigins.includes(origin);
    if (isAllowed) {
      console.log(`CORS: Allowing request from ${origin}`);
    } else {
      console.log(`CORS: Blocking request from ${origin} (not in allowed list)`);
    }
    return callback(null, isAllowed);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
};

export const corsMiddleware = cors(corsOptions);

