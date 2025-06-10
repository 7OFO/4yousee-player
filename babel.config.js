module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          // Suporte para Smart TVs com browsers antigos
          browsers: [
            'Chrome >= 38', // WebOS 3.0+
            'Safari >= 9',  // Tizen 2.4+
            'Android >= 4.4' // Android TV
          ]
        },
        useBuiltIns: 'entry',
        corejs: false, // Não usar core-js para manter compatibilidade
        modules: false, // Manter ES modules para tree shaking
        debug: false
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  env: {
    production: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: [
                'Chrome >= 38',
                'Safari >= 9',
                'Android >= 4.4'
              ]
            },
            useBuiltIns: false,
            modules: false,
            debug: false
          }
        ]
      ]
    },
    development: {
      // Em desenvolvimento, não transpila para manter velocidade
      presets: [],
      plugins: []
    }
  }
};