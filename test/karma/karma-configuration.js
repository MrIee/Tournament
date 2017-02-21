module.exports = function (configuration) {
  configuration.set({
    autoWatch: true,
    basePath: '',
    browsers: ['Chrome'],
    colors: true,
    exclude: [
    ],
    files: [
      '../../client/**/*.js',
      '../../test/karma/**/*_test.js'
    ],
    frameworks: [
      'mocha',
      'sinon-chai'
    ],
    reporters: ['progress'],
    port: 9876,
    singleRun: false
  })
}
