/*
 * `npm run scaffold` -- builds a feature the way features/inventoryItems is built.
 * The generated files compile and their tests pass as they are: fill in the fields of
 * types.ts and <entity>.form.ts, and the columns of the index, and the feature is done.
 */
export default function (plop) {

  plop.setHelper('eq', (a, b) => a === b)

  plop.setGenerator('feature', {
    description: 'A feature: types, api, form, hooks, index page, route, tests and a factory',
    prompts: [
      {
        type: 'input',
        name: 'entity',
        message: 'Entity, singular camelCase (genericPart):',
        validate: value => /^[a-z][A-Za-z0-9]*$/.test(value) || 'camelCase, starting lower case',
      },
      {
        /* asked, never derived: unitOfMeasure pluralises to unitsOfMeasure */
        type: 'input',
        name: 'plural',
        message: 'Plural, camelCase (inventoryItems):',
        validate: value => /^[a-z][A-Za-z0-9]*$/.test(value) || 'camelCase, starting lower case',
      },
      {
        type: 'input',
        name: 'path',
        message: 'Api path and route, snake_case plural (inventory_items):',
        validate: value => /^[a-z][a-z0-9_]*$/.test(value) || 'snake_case, starting lower case',
      },
      {
        type: 'input',
        name: 'label',
        message: 'Spanish name, singular (Parte):',
        validate: value => value.length > 0 || 'required',
      },
      {
        type: 'input',
        name: 'labelPlural',
        message: 'Spanish name, plural (Partes):',
        validate: value => value.length > 0 || 'required',
      },
      {
        type: 'list',
        name: 'gender',
        message: 'Its gender, for guardado / guardada:',
        choices: [
          { name: 'masculino (el)', value: 'm' },
          { name: 'femenino (la)', value: 'f' },
        ],
      },
    ],

    actions: [
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/types.ts',
        templateFile: 'plop-templates/types.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/data/{{camelCase entity}}.api.ts',
        templateFile: 'plop-templates/api.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/data/{{camelCase entity}}.form.ts',
        templateFile: 'plop-templates/form.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/data/schema.test.ts',
        templateFile: 'plop-templates/schema.test.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/use{{pascalCase plural}}.tsx',
        templateFile: 'plop-templates/hook.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/{{pascalCase entity}}Form.tsx',
        templateFile: 'plop-templates/Form.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/{{pascalCase plural}}Index.tsx',
        templateFile: 'plop-templates/Index.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{camelCase plural}}/{{pascalCase plural}}Index.test.tsx',
        templateFile: 'plop-templates/Index.test.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/routes/{{path}}/index.lazy.tsx',
        templateFile: 'plop-templates/route.tsx.hbs',
      },

      /* the factories are one shared file, so the entity is appended to each of its three lists */
      {
        type: 'append',
        path: 'src/test/factories.ts',
        unique: false,   /* plop builds a RegExp out of the template to dedupe, and ours is not one */
        pattern: /\/\* plop:ids \*\//,
        template: '    {{camelCase entity}}: 1,',
      },
      {
        type: 'append',
        path: 'src/test/factories.ts',
        unique: false,   /* plop builds a RegExp out of the template to dedupe, and ours is not one */
        pattern: /\/\* plop:factories \*\//,
        template:
          "\n  const {{camelCase entity}} = (args: Partial<{{pascalCase entity}}> = {}): {{pascalCase entity}} => ({\n" +
          "    id: ids.{{camelCase entity}}++,\n" +
          "    name: 'Test {{label}}',\n" +
          "    createdAt: now(),\n" +
          "    ...args,\n" +
          "  })",
      },
      {
        type: 'append',
        path: 'src/test/factories.ts',
        unique: false,   /* plop builds a RegExp out of the template to dedupe, and ours is not one */
        pattern: /\/\* plop:exports \*\//,
        template: '    {{camelCase entity}},',
      },
      {
        type: 'append',
        path: 'src/test/factories.ts',
        unique: false,   /* plop builds a RegExp out of the template to dedupe, and ours is not one */
        pattern: /\/\* plop:imports \*\//,
        template: "import type { {{pascalCase entity}} } from '@/features/{{camelCase plural}}/types'",
      },

      /* a plain string action is printed as is, so the summary is built here instead */
      answers => [
        '',
        'Done. Now:',
        `  - fill in the fields of src/features/${answers.plural}/types.ts`,
        `  - fill in the form fields of src/features/${answers.plural}/data/${answers.entity}.form.ts`,
        `  - fill in the columns of src/features/${answers.plural}/${answers.plural[0].toUpperCase()}${answers.plural.slice(1)}Index.tsx`,
        `  - add a link to /${answers.path} in src/routes/__root.tsx`,
        '  - run npm run dev once: the router plugin regenerates routeTree.gen.ts',
        '',
      ].join('\n'),
    ],
  })
}
