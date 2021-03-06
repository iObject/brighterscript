#!/usr/bin/env node
import * as yargs from 'yargs';
import { ProgramBuilder } from './ProgramBuilder';
import { DiagnosticSeverity } from 'vscode-languageserver';

let options = yargs
    .usage('$0', 'BrighterScript, a superset of Roku\'s BrightScript language')
    .help('help', 'View help information about this tool.')
    .option('create-package', { type: 'boolean', default: true, description: 'Creates a zip package. This setting is ignored when deploy is enabled.' })
    .option('cwd', { type: 'string', description: 'Override the current working directory.' })
    .option('copy-to-staging', { type: 'boolean', default: true, description: 'Copy project files into the staging folder, ready to be packaged.' })
    .option('diagnostic-level', { type: 'string', default: 'warn', description: 'Specify what diagnostic types should be printed to the console. Value can be "error", "warn", "hint", "info".' })
    .option('deploy', { type: 'boolean', default: false, description: 'Deploy to a Roku device if compilation succeeds. When in watch mode, this will deploy on every change.' })
    .option('emit-full-paths', { type: 'boolean', default: false, description: 'Emit full paths to files when encountering diagnostics.' })
    .option('files', { type: 'array', description: 'The list of files (or globs) to include in your project. Be sure to wrap these in double quotes when using globs.' })
    .option('host', { type: 'string', description: 'The host used when deploying to a Roku.' })
    .option('ignore-error-codes', { type: 'array', description: 'A list of error codes that the compiler should NOT emit, even if encountered.' })
    .option('log-level', { type: 'string', default: 'log', description: 'The log level. Value can be "error", "warn", "log", "info", "debug".' })
    .option('out-file', { type: 'string', description: 'Path to the zip folder containing the bundled project. Defaults to `./out/[YOUR_ROOT_FOLDER_NAME].zip' })
    .option('password', { type: 'string', description: 'The password for deploying to a Roku.' })
    .option('project', { type: 'string', description: 'Path to a bsconfig.json project file.' })
    .option('retain-staging-folder', { type: 'string', default: false, description: 'Prevent the staging folder from being deleted after creating the package.' })
    .option('root-dir', { type: 'string', description: 'Path to the root of your project files (where the manifest lives). Defaults to current directory.' })
    .option('staging-folder-path', { type: 'string', description: 'The path where the files should be staged (right before being zipped up).' })
    .option('username', { type: 'string', default: 'rokudev', description: 'The username for deploying to a Roku.' })
    .option('source-root', { type: 'string', description: 'Override the root directory path where debugger should locate the source files. The location will be embedded in the source map to help debuggers locate the original source files. This only applies to files found within rootDir. This is useful when you want to preprocess files before passing them to BrighterScript, and want a debugger to open the original files.' })
    .option('watch', { type: 'boolean', default: false, description: 'Watch input files.' })
    .strict()
    .check(argv => {
        let d = argv.diagnosticLevel;
        if (d !== 'error' && d !== 'warn' && d !== 'hint' && d !== 'info') {
            throw new Error(`Invalid diagnostic level "${d}". Value can be "error", "warn", "hint", "info".`);
        }
        return true;
    })
    .argv;

let builder = new ProgramBuilder();
builder.run(<any>options).then(() => {
    //if this is a single run (i.e. not watch mode) and there are error diagnostics, return an error code
    const hasError = !!builder.getDiagnostics().find(x => x.severity === DiagnosticSeverity.Error);
    if (builder.options.watch === false && hasError) {
        process.exit(1);
    }
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
