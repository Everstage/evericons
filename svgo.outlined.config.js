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
    { name: 'removeAttrs', params: { attrs: ['path:stroke-width'] } },
    { name: 'convertColors', params: { currentColor: true } },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [{ 'stroke-width': '1.5' }, { 'aria-hidden': 'true' }],
      },
    },
  ],
}
