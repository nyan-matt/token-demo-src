const StyleDictionary = require('style-dictionary');

console.log('Build started...');
console.log('\n==============================================');

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

StyleDictionary.registerTransform({
  name: 'size/pxToRem',
  type: 'value',
  matcher: (token) => ['fontSizes'].includes(token.type),
  transformer: (token, options) => fontPxToRem(token, options)
})
StyleDictionary.registerTransformGroup({
  name: 'custom/web',
  transforms: ["attribute/cti", "name/cti/kebab", "size/pxToRem"]            
});


const StyleDictionaryExtended = StyleDictionary.extend(__dirname + '/config.json');

StyleDictionaryExtended.buildAllPlatforms();

console.log('\n==============================================');
console.log('\nBuild completed!');