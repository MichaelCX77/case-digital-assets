module.exports = {
  apps: [
    {
      name: 'clientes-service',
      cwd: './services/clientes',
      script: 'dist/main.js',
      exec_mode: 'fork',
      watch: true,
      env: { NODE_ENV: 'development' },
    },
    {
      name: 'contas-service',
      cwd: './services/contas',
      script: 'dist/main.js',
      exec_mode: 'fork',
      watch: true,
      env: { NODE_ENV: 'development' },
    },
    {
      name: 'transacoes-service',
      cwd: './services/transacoes',
      script: 'dist/main.js',
      exec_mode: 'fork',
      watch: true,
      env: { NODE_ENV: 'development' },
    },
    {
      name: 'gateway-service',
      cwd: './gateway',
      script: 'dist/main.js',
      exec_mode: 'fork',
      watch: true,
      env: { NODE_ENV: 'development' },
    },
    // adicione aqui outros serviços seguindo o mesmo padrão
  ],
};
