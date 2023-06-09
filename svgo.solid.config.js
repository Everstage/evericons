export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // customize default plugin options
          inlineStyles: {
            onlyMatchedOnce: false,
          },

          // or disable plugins
          removeDoctype: false,
        },
      },
    },
    { name: 'removeDimensions' },
    { name: 'removeAttrs', params: { attrs: ['fill', 'stroke', 'path:stroke-width'] } },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [{ fill: 'currentColor' }, { 'aria-hidden': 'true' }],
      },
    },
  ],
}
