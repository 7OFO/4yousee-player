module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 1, // Usar features mais estáveis
      browsers: [
        'Chrome >= 38', // WebOS 3.0+
        'Safari >= 9',  // Tizen 2.4+
        'Android >= 4.4' // Android TV
      ],
      autoprefixer: {
        grid: true, // Suporte para CSS Grid
        flexbox: 'no-2009' // Flexbox moderno
      },
      features: {
        'custom-properties': false, // CSS variables podem não funcionar em TVs antigas
        'nesting-rules': true,
        'custom-media-queries': true,
        'media-query-ranges': false // Não suportado em browsers antigos
      }
    }),
    require('autoprefixer')({
      overrideBrowserslist: [
        'Chrome >= 38',
        'Safari >= 9',
        'Android >= 4.4'
      ],
      grid: 'autoplace',
      flexbox: 'no-2009'
    }),
    // Apenas em produção
    ...(process.env.NODE_ENV === 'production' ? [
      require('cssnano')({
        preset: ['default', {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true,
          minifySelectors: true,
          minifyFontValues: true,
          // Manter compatibilidade com Smart TVs
          autoprefixer: false, // Já aplicado acima
          calc: false, // Pode quebrar em alguns browsers
          colormin: false, // Manter cores originais
          convertValues: false, // Não converter unidades
          discardDuplicates: true,
          discardEmpty: true,
          discardOverridden: true,
          discardUnused: false, // Manter para compatibilidade
          mergeIdents: false,
          mergeLonghand: false, // Pode quebrar em browsers antigos
          mergeRules: true,
          minifyGradients: false, // Gradientes podem quebrar
          normalizeCharset: true,
          normalizeDisplayValues: false,
          normalizePositions: false,
          normalizeRepeatStyle: false,
          normalizeString: true,
          normalizeTimingFunctions: false,
          normalizeUnicode: true,
          normalizeUrl: true,
          orderedValues: false,
          reduceIdents: false,
          reduceInitial: false,
          reduceTransforms: false,
          svgo: false,
          uniqueSelectors: true,
          zindex: false // Não otimizar z-index
        }]
      })
    ] : [])
  ]
};