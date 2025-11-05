import { PlopTypes } from "@turbo/gen";

// This is a "plopfile" for the `turbo gen` command
// It defines a "generator" called "package"
// See https://plopjs.com/documentation/ for more info

export default function (plop: PlopTypes) {
  plop.setGenerator('package', {
    description: 'Create a new shared package in the /packages directory',
    // Ask the user one question: the name of the new package
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of the new package? (e.g., "db", "ui", "shared-types")',
      },
    ],
    // After getting the name, run these actions:
    actions: [
      {
        type: 'add',
        // Create the package.json from a template
        path: 'packages/{{name}}/package.json',
        templateFile: 'templates/package.json.hbs',
      },
      {
        type: 'add',
        // Create the tsconfig.json from a template
        path: 'packages/{{name}}/tsconfig.json',
        templateFile: 'templates/tsconfig.json.hbs',
      },
      {
        type: 'add',
        // Create a starting index.ts file
        path: 'packages/{{name}}/src/index.ts',
        templateFile: 'templates/index.ts.hbs',
      },
      {
        // A little message to tell the user what to do next
        type: 'add',
        path: 'packages/{{name}}/README.md',
        template: '# @scrutis/{{name}}\n\nShared package for `{{name}}`.\n',
      },
    ],
  });
}
