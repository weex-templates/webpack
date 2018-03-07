const path = require('path')
const fs = require('fs')

const {
  sortDependencies,
  installDependencies,
  runLintFix,
  printMessage,
} = require('./utils')
const pkg = require('./package.json')

const templateVersion = pkg.version

const { addTestAnswers } = require('./scenarios')

module.exports = {
  metalsmith: {
    // When running tests for the template, this adds answers for the selected scenario
    before: addTestAnswers
  },
  helpers: {
    if_or(v1, v2, options) {

      if (v1 || v2) {
        return options.fn(this)
      }
      console.log(Object.keys(options))
      return options.inverse(this)
    },
    template_version() {
      return templateVersion
    },
  },
  
  prompts: {
    name: {
      when: 'isNotTest',
      type: 'string',
      required: true,
      message: 'Project name',
    },
    description: {
      when: 'isNotTest',
      type: 'string',
      required: false,
      message: 'Project description',
      default: 'A weex project',
    },
    author: {
      when: 'isNotTest',
      type: 'string',
      message: 'Author',
    },
    weex: {
      when: 'isNotTest',
      type: 'list',
      message: 'Select weex web render',
      choices: [
        {
          name:
            '1.0.17 Current: latest features',
          value: 'latest',
          short: 'latest',
        },
        {
          name: '0.12.17 LTS: recommended for most users',
          value: 'lts',
          short: 'lts',
        }
      ],
    },
    babel: {
      when: 'isNotTest',
      type: 'list',
      message: 'Babel compiler (https://babeljs.io/docs/plugins/#stage-x-experimental-presets)',
      choices: [
        {
          name: 'stage-0: recommended for most users, support you to use all es6 syntax',
          value: 'stage-0',
          short: 'stage-0',
        },
        {
          name: 'stage-1',
          value: 'stage-1',
          short: 'stage-1',
        },
        {
          name: 'stage-2',
          value: 'stage-2',
          short: 'stage-2',
        },
        {
          name: 'stage-3',
          value: 'stage-3',
          short: 'stage-3',
        },
      ],
    },
    router: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Use vue-router to manage your view router? (not recommended)',
      default: false
    },
    lint: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Use ESLint to lint your code?',
    },
    lintConfig: {
      when: 'isNotTest && lint',
      type: 'list',
      message: 'Pick an ESLint preset',
      choices: [
        {
          name: 'Standard (https://github.com/standard/standard)',
          value: 'standard',
          short: 'Standard',
        },
        {
          name: 'Airbnb (https://github.com/airbnb/javascript)',
          value: 'airbnb',
          short: 'Airbnb',
        },
        {
          name: 'none (configure it yourself)',
          value: 'none',
          short: 'none',
        },
      ],
    },
    unit: {
      when: 'isNotTest',
      type: 'confirm',
      message: 'Set up unit tests',
    },
    autoInstall: {
      when: 'isNotTest',
      type: 'list',
      message:
        'Should we run `npm install` for you after the project has been created? (recommended)',
      choices: [
        {
          name: 'Yes, use NPM',
          value: 'npm',
          short: 'npm',
        },
        {
          name: 'Yes, use Yarn',
          value: 'yarn',
          short: 'yarn',
        },
        {
          name: 'No, I will handle that myself',
          value: false,
          short: 'no',
        },
      ],
    },
  },
  filters: {
    '.eslintrc.js': 'lint',
    '.eslintignore': 'lint',
    'configs/webpack.test.conf.js': 'unit',
    'build/webpack.test.conf.js': "unit && runner === 'karma'",
    'test/**/*': 'unit',
    'src/router.js': 'router'
  },
  complete: function(data, { chalk }) {
    const green = chalk.green

    sortDependencies(data, green)

    const cwd = data.dest ? data.dest : path.join(process.cwd(), data.inPlace ? '' : data.destDirName)

    if (data.autoInstall) {
      installDependencies(cwd, data.autoInstall, green)
        .then(() => {
          return runLintFix(cwd, data, green)
        })
        .then(() => {
          printMessage(data, green)
        })
        .catch(e => {
          console.log(chalk.red('Error:'), e)
        })
    } else {
      printMessage(data, chalk)
    }
  },
}
