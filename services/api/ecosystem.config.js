module.exports = {
  apps: [{
    name: 'mufasal-api',
    script: 'dist/index.js',
    instances: 4,
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4001,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    increment_var: 'PORT',
    instance_var: 'INSTANCE_ID',
  }],
};
