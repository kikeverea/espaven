/*
 * `npm run scaffold` -- builds a feature the way features/inventory/inventoryItems is built.
 * The generated files compile and their tests pass as they are: the fields asked for become the
 * type, the form, its schema tests, the factory and the columns of the index.
 */

/* what each field type becomes. `text` is a string shown as a textarea */
const fieldTypes = {
  string: {
    tsType: 'string',
    schema: '.string().min(2, \'Mínimo 2 caracteres\').max(48, \'Máximo 48 caracteres\')',
    optionalSchema:
      '.string().max(48, \'Máximo 48 caracteres\')' +
      '.refine(value => value === \'\' || value.length >= 2, \'Mínimo 2 caracteres\').optional()',
    maxLength: 48,
    sample: name => `'Test ${name}'`,
    column: true,
  },
  text: {
    tsType: 'string',
    schema: '.string().min(2, \'Mínimo 2 caracteres\').max(500, \'Máximo 500 caracteres\')',
    optionalSchema:
      '.string().max(500, \'Máximo 500 caracteres\')' +
      '.refine(value => value === \'\' || value.length >= 2, \'Mínimo 2 caracteres\').optional()',
    variation: 'textarea',
    maxLength: 500,
    sample: name => `'Test ${name}'`,
  },
  number: {
    tsType: 'number',
    schema: '.coerce.number().min(0, \'No puede ser menor de 0\')',
    optionalSchema: '.coerce.number().min(0, \'No puede ser menor de 0\').optional()',
    min: 0,
    sample: () => '1',
    column: true,
  },
  boolean: {
    tsType: 'boolean',
    schema: '.boolean()',
    optionalSchema: '.boolean().optional()',
    default: 'false',
    sample: () => 'false',
  },
}

const fieldPattern = new RegExp(`^([a-z][A-Za-z0-9]*)(\\?)?:(${Object.keys(fieldTypes).join('|')})$`)
const reservedFields = [ 'id', 'createdAt' ]

/* `name:string, notes?:text` -> [{ name: 'name', type: 'string', optional: false }, ...] */
const parseFields = value =>
  value.split(/[\s,]+/).filter(Boolean).map(token => {
    const [ , name, optional, type ] = token.match(fieldPattern) || []
    return { token, name, type, optional: !!optional }
  })

const validateFields = value => {
  const fields = parseFields(value)
  const names = fields.map(field => field.name)

  if (!fields.length) return 'at least one field'

  const malformed = fields.find(field => !field.name)
  if (malformed) return `'${malformed.token}' is not name:type (types: ${Object.keys(fieldTypes).join(', ')})`

  const reserved = names.find(name => reservedFields.includes(name))
  if (reserved) return `'${reserved}' comes with every record`

  const repeated = names.find((name, index) => names.indexOf(name) !== index)
  if (repeated) return `'${repeated}' is repeated`

  return true
}

const defaultLabels = { name: 'Nombre', description: 'Descripción', type: 'Tipo', price: 'Precio' }

/* everything the templates print about a field, so they only ever loop over it */
const describeField = field => {
  const type = fieldTypes[field.type]

  return {
    ...field,
    tsType: type.tsType,
    schema: `z${field.optional ? type.optionalSchema : type.schema}`,
    variation: type.variation,
    sample: type.sample(field.name),
    maxLength: type.maxLength,
    min: type.min,
    default: type.default,
    column: !!type.column,
  }
}

const describeFeature = answers => {
  const fields = answers.fields
  const display = fields.find(field => field.column && field.tsType === 'string') ||
                  fields.find(field => field.column)

  return {
    ...answers,
    requiredFields: fields.filter(field => !field.optional),
    lengthFields: fields.filter(field => field.maxLength),
    minFields: fields.filter(field => field.min != null),
    columns: fields.filter(field => field.column),
    defaults: fields.filter(field => field.default != null),
    display: display && { name: display.name, isString: display.tsType === 'string' },
    factoryFields: fields.map(field => `    ${field.name}: ${field.sample},`).join('\n'),
  }
}

export default function (plop) {

  plop.setHelper('eq', (a, b) => a === b)
  /* src/lib/strings.ts's, which plop cannot import */
  plop.setHelper('capitalize', s => `${s.charAt(0).toUpperCase()}${s.substring(1)}`)

  plop.setGenerator('feature', {
    description: 'A feature: types, api, form, hooks, index page, route, tests and a factory',
    prompts: async inquirer => {
      const answers = await inquirer.prompt([
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
        {
          type: 'input',
          name: 'fields',
          message: 'Fields, name:type with ? if optional (name:string, notes?:text, price:number):',
          default: 'name:string',
          validate: validateFields,
        },
      ])

      /* one label per field, so asked once the fields are known */
      const fields = []
      for (const field of parseFields(answers.fields)) {
        const { label } = await inquirer.prompt({
          type: 'input',
          name: 'label',
          message: `Spanish label of ${field.name}:`,
          default: defaultLabels[field.name],
          validate: value => value.length > 0 || 'required',
        })

        fields.push(describeField({ ...field, label }))
      }

      return describeFeature({ ...answers, fields })
    },

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
          "{{{factoryFields}}}\n" +
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
        `  - review the fields of src/features/${answers.plural}/types.ts and data/${answers.entity}.form.ts`,
        `  - review the columns of src/features/${answers.plural}/${answers.plural[0].toUpperCase()}${answers.plural.slice(1)}Index.tsx`,
        `  - add a link to /${answers.path} in src/routes/__root.tsx`,
        '  - run npm run dev once: the router plugin regenerates routeTree.gen.ts',
        '',
      ].join('\n'),
    ],
  })
}
