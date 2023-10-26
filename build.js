const StyleDictionaryPackage = require('style-dictionary');
const tinycolor = require('tinycolor2');

// increase the lightness by 10%
// tinycolor represents the percent as a decimal between 0 and 1)
// for example: hsl(262, 100%, 68%) is represented as { h: 262, s: 1, l: .68 }
const OFFSET = 0.1;

// the new color properties to replace the original ones
// recall, the original ones are in `design-tokens.json`
let shades = {};

// round to the highest range
// for example: .62 rounds to .70
function roundUp(num, offset = OFFSET) {
  return Math.ceil(num / offset) / 10;
}

// since tinycolor represents the percent as a decimal, translate the decimal to the percentage
function asPercent(num) {
  return num * 100;
}

// appends the shade percentage to the key
// for example: primary + { h: 262, s: 1, l: .68 } becomes primary-70
function asShadeKey(key, lightness) {
  return `${key}-${asPercent(roundUp(lightness))}`;
}

// convert the object representing the hsl back into a string
// for example: { h: 262, s: 1, l: .68 } becomes hsl(262, 100%, 68%)
function asHslString(ratio) {
  return tinycolor.fromRatio(ratio).toHslString();
}

// add a new color property for the generated shade
function cloneShade({ hsl, key, lightness, prop }) {
  const shadeKey = asShadeKey(key, lightness);
  shades[shadeKey] = {
    ...prop,
    value: asHslString({ ...hsl, l: lightness }),
  };
}

// HAVE THE STYLE DICTIONARY CONFIG DYNAMICALLY GENERATED

StyleDictionaryPackage.registerFormat({
  name: 'css/variables',
  formatter: function (dictionary, config) {
    return `${this.selector} {
        ${dictionary.allProperties
          .map((prop) => `  --${prop.name}: ${prop.value};`)
          .join('\n')}
      }`;
  },
});

//

function kebabIt(str) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .join('-')
    .toLowerCase();
}

function getBasePxFontSize(options) {
  return (options && options.basePxFontSize) || 16;
}

function fontPxToRem(token, options) {
  const baseFont = getBasePxFontSize(options);
  const floatVal = parseFloat(token.value);
  if (isNaN(floatVal)) {
    console.log('NaN error', token.name, token.value, 'rem');
  }
  if (floatVal === 0) {
    return '0';
  }
  return `${floatVal / baseFont}rem`;
}

StyleDictionaryPackage.registerTransform({
  name: 'size/pxToRem',
  type: 'value',
  matcher: (token) => ['fontSizes'].includes(token.type),
  transformer: (token, options) => fontPxToRem(token, options),
});
//
StyleDictionaryPackage.registerTransform({
  name: 'sizes/px',
  type: 'value',
  matcher: function (prop) {
    // You can be more specific here if you only want 'em' units for font sizes
    return [
      'fontSize',
      'spacing',
      'borderRadius',
      'borderWidth',
      'sizing',
    ].includes(prop.attributes.category);
  },
  transformer: function (prop) {
    // You can also modify the value here if you want to convert pixels to ems
    return parseFloat(prop.original.value) + 'px';
  },
});

function getStyleDictionaryConfig(theme) {
  return {
    source: [`input/${theme}.json`],
    platforms: {
      web: {
        transforms: [
          'attribute/cti',
          'name/cti/kebab',
          'sizes/px',
          'size/pxToRem',
        ],
        buildPath: `output/`,
        files: [
          {
            destination: `${theme}.css`,
            format: 'css/variables',
            selector: `.${theme}-theme`,
          },
        ],
      },
      scss: {
        transformGroup: 'scss',
        buildPath: `output/`,
        files: [
          {
            destination: `${theme}.scss`,
            format: 'scss/variables',
            selector: `.${theme}-theme`,
          },
        ],
      },
    },
  };
}

console.log('Build started...');

// PROCESS THE DESIGN TOKENS FOR THE DIFFEREN BRANDS AND PLATFORMS

['base', 'brand-a', 'brand-b'].map(function (theme) {
  console.log('\n==============================================');
  console.log(`\nProcessing: [${theme}]`);

  const StyleDictionary = StyleDictionaryPackage.extend(
    getStyleDictionaryConfig(theme),
  );

  if (theme === 'base') {
    // the original color properties
    const colorProps = Object.entries(StyleDictionary.properties.brand);

    for (const [key, prop] of colorProps) {
      // convert any color into a hsl object
      const hsl = tinycolor(prop.value).toHsl();

      // extract the original lightness before we manipulate it
      const { l: originalLightness } = hsl;
      let lightness = originalLightness;

      // add a property for the original shade
      cloneShade({ hsl, lightness, key, prop });

      // add a property for a lighter shade (higher lightness percentage)
      // until another lighter shade would go above 99%
      while (lightness + OFFSET < 1) {
        lightness = lightness + OFFSET;
        cloneShade({ hsl, lightness, key, prop });
      }

      // reset lightness to original value
      lightness = originalLightness;

      // add a property for a darker shade (lower lightness percentage)
      // until another darker shade would go below 1%
      while (lightness - OFFSET > 0) {
        lightness = lightness - OFFSET;
        cloneShade({ hsl, lightness, key, prop });
      }
    }

    // replace the original color properties with all the new shade properties
    StyleDictionary.properties.brand = shades;
  }

  StyleDictionary.buildPlatform('web');
  StyleDictionary.buildPlatform('scss');

  console.log('\nEnd processing');
});

console.log('\n==============================================');
console.log('\nBuild completed!');
