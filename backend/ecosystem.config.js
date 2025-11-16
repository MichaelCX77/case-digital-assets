module.exports = {
  apps: [
    {
      name: 'clientes-service',
      cwd: './services/clientes',
      script: 'node_modules/ts-node/dist/bin.js',
      args: 'src/main.ts',
      exec_mode: 'fork',
      watch: ['src'],
      env: { NODE_ENV: 'development' },
      autorestart: true
    },
    {
      name: 'contas-service',
      cwd: './services/contas',
      script: 'node_modules/ts-node/dist/bin.js',
      args: 'src/main.ts',
      exec_mode: 'fork',
      watch: ['src'],
      env: { NODE_ENV: 'development' },
      autorestart: true
    },
    {
      name: 'transacoes-service',
      cwd: './services/transacoes',
      script: 'node_modules/ts-node/dist/bin.js',
      args: 'src/main.ts',
      exec_mode: 'fork',
      watch: ['src'],
      env: { NODE_ENV: 'development' },
      autorestart: true
    },
    {
      name: 'gateway-service',
      cwd: './gateway',
      script: 'node_modules/ts-node/dist/bin.js',
      args: 'src/main.ts',
      exec_mode: 'fork',
      watch: ['src'],
      env: { NODE_ENV: 'development' },
      autorestart: true
    },
  ],
};
