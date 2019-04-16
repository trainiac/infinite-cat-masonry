module.exports = {
  extends: ['stylelint-config-recommended-scss', 'stylelint-config-prettier'],
  plugins: ['stylelint-no-unsupported-browser-features'],
  quiet: false,
  rules: {
    'no-invalid-double-slash-comments': null,
    'no-empty-source': null,
    'property-no-unknown': true,
    'color-no-invalid-hex': true,
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
    'selector-pseudo-element-colon-notation': 'single',
    'plugin/no-unsupported-browser-features': [
      true,
      {
        ignore: [
          'viewport-units', // only a few browsers dont support vmax
          'flexbox', // flex box is required, ie11 implements most of it
          'calc', // only multiplication and division are not supported in Android Browser >4.4 and we dont use it
          'outline', // this is pretty much fully supported except color and offset which we dont use
          'background-img-opts', // not fully supported by Android Browser 4.2-4.3
          'font-unicode-range', // this is for font-face which dont make special uses of
          'css-gradients', // if these don't work its not a big deal
        ],
      },
    ],
  },
}
