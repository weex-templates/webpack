const path = require('path')
const fs = require('fs')
const spawn = require('child_process').spawn

const lintStyles = ['standard', 'airbnb']

/**
 * Sorts dependencies in package.json alphabetically.
 * They are unsorted because they were grouped for the handlebars helpers
 * @param {object} data Data from questionnaire
 */
exports.sortDependencies = function sortDependencies(data) {
  let packageJsonFile;
  if (data.dest) {
    packageJsonFile = path.join(data.dest, 'package.json')
  } else {
    packageJsonFile = path.join(data.inPlace ? '' : data.destDirName,'package.json')
  }
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFile))
  packageJson.devDependencies = sortObject(packageJson.devDependencies)
  packageJson.dependencies = sortObject(packageJson.dependencies)
  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n')
}

/**
 * Runs `npm install` in the project directory
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.installDependencies = function installDependencies(
  cwd,
  executable = 'npm',
  color
) {
  console.log(`\n\n# ${color('Installing project dependencies ...')}`)
  console.log('# ========================\n')
  return runCommand(executable, ['install'], {
    cwd,
  })
}

/**
 * Runs `npm run lint -- --fix` in the project directory
 * @param {string} cwd Path of the created project directory
 * @param {object} data Data from questionnaire
 */
exports.runLintFix = function runLintFix(cwd, data, color) {
  if (data.lint && lintStyles.indexOf(data.lintConfig) !== -1) {
    console.log(
      `\n\n${color(
        'Running eslint --fix to comply with chosen preset rules...'
      )}`
    )
    console.log('# ========================\n')
    const args = ['run', 'lint'];
    return runCommand(data.autoInstall, args, {
      cwd,
    })
  }
  return Promise.resolve()
}

/**
 * Prints the final message with instructions of necessary next steps.
 * @param {Object} data Data from questionnaire.
 */
exports.printMessage = function printMessage(data, { green, yellow }) {
  const commandsWithDesc = [
    {
      name: 'npm start',
      desc: [
        'Starts the development server for you to preview your weex page on browser',
        'You can also scan the QR code using weex playground to preview weex page on native'
      ]
    },
    {
      name: 'npm run dev',
      desc: [
        'Open the code compilation task in watch mode'
      ]
    },
    {
      name: 'npm run ios',
      desc: [
        '(Mac only, requires Xcode)',
        'Starts the development server and loads your app in an iOS simulator'
      ]
    },
    {
      name: 'npm run android',
      desc: [
        '(Requires Android build tools)',
        'Starts the development server and loads your app on a connected Android device or emulator'
      ]
    },
    {
      name: 'npm run pack:ios',
      desc: [
        '(Mac only, requires Xcode)',
        'Packaging ios project into ipa package'
      ]
    },
    {
      name: 'npm run pack:android',
      desc: [
        '(Requires Android build tools)',
        'Packaging android project into apk package'
      ]
    },
    {
      name: 'npm run pack:web',
      desc: [
        'Packaging html5 project into `web/build` folder'
      ]
    },
    {
      name: 'npm run test',
      desc: [
        'Starts the test runner'
      ]
    }
  ];
  console.log(`\n${green(`Success! Created ${data.destDirName} at ${path.resolve(data.destDirName)}`)}`)
  console.log(`\nInside that directory, you can run several commands:\n`)
  commandsWithDesc.forEach(c => {
    console.log(`\n  ${yellow(c.name)}`)
    c.desc.forEach(d => {
      console.log(`  ${d}`)
    });
  });
  console.log(`\nTo get started:\n`);
  console.log(yellow(`  cd ${data.destDirName}`));
  console.log(yellow(`  ${data.autoInstall ? '' : 'npm install && '}npm start`));
  console.log(`\nEnjoy your hacking time!`);
}

/**
 * If the user will have to run lint --fix themselves, it returns a string
 * containing the instruction for this step.
 * @param {Object} data Data from questionnaire.
 */
function lintMsg(data) {
  return !data.autoInstall &&
    data.lint &&
    lintStyles.indexOf(data.lintConfig) !== -1
    ? 'npm run lint -- --fix (or for yarn: yarn run lint --fix)\n  '
    : ''
}

/**
 * If the user will have to run `npm install` or `yarn` themselves, it returns a string
 * containing the instruction for this step.
 * @param {Object} data Data from the questionnaire
 */
function installMsg(data) {
  return !data.autoInstall ? 'npm install (or if using yarn: yarn)\n  ' : ''
}

/**
 * Spawns a child process and runs the specified command
 * By default, runs in the CWD and inherits stdio
 * Options are the same as node's child_process.spawn
 * @param {string} cmd
 * @param {array<string>} args
 * @param {object} options
 */
function runCommand(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const spwan = spawn(
      cmd,
      args,
      Object.assign(
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
        options
      )
    )

    spwan.on('exit', () => {
      resolve()
    })
  })
}

function sortObject(object) {
  // Based on https://github.com/yarnpkg/yarn/blob/v1.3.2/src/config.js#L79-L85
  const sortedObject = {}
  Object.keys(object)
    .sort()
    .forEach(item => {
      sortedObject[item] = object[item]
    })
  return sortedObject
}
