import cors from 'cors';

// 開発環境では、すべてのローカルホストのポートを許可
const getAllowedOrigins = (): string | string[] | boolean => {
  const corsOrigin = process.env.CORS_ORIGIN;
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // デバッグログ
  console.log('CORS Configuration:');
  console.log('  CORS_ORIGIN:', corsOrigin || '(not set)');
  console.log('  NODE_ENV:', nodeEnv);
  
  // 環境変数が明示的に設定されている場合はそれを使用
  if (corsOrigin) {
    console.log('  Using CORS_ORIGIN from env:', corsOrigin);
    return corsOrigin;
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
  return 'http://localhost:5173';
};

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    // デバッグログ
    console.log('CORS Request:');
    console.log('  Origin:', origin || '(no origin)');
    console.log('  Allowed origins:', allowedOrigins);
    
    // オリジンがない場合（同一オリジンリクエストなど）は許可
    if (!origin) {
      console.log('  Allowing: no origin');
      return callback(null, true);
    }
    
    // 配列の場合
    if (Array.isArray(allowedOrigins)) {
      const isAllowed = allowedOrigins.includes(origin);
      console.log('  Allowed:', isAllowed);
      return callback(null, isAllowed);
    }
    
    // 文字列の場合
    if (typeof allowedOrigins === 'string') {
      const isAllowed = allowedOrigins === origin;
      console.log('  Allowed:', isAllowed);
      return callback(null, isAllowed);
    }
    
    // booleanの場合
    console.log('  Allowed:', allowedOrigins);
    return callback(null, allowedOrigins);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);

