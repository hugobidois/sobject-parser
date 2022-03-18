#!/usr/bin/env node
const JSON_INDENT = 2;
const fs = require('fs');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).command(
  '$0 <source file> [destination file]',
  'the default command',
  () => {},
  ({destinationfile, sourcefile}) => {
    fs.readFile(sourcefile, 'utf8', (readError, data) => {
      if (readError) {
        throw readError;
      }
      data = JSON.parse(data);
      const schema = {
        additionalProperties: false,
        properties: {},
        required: [],
        type: 'object',
      };
      if (data.fields) {
        for (const field of data.fields) {
          if (field.createable && field.updateable) {
            const fieldSchema = {};
            if (field.nillable === false) {
              schema.required.push(field.name);
            }
            fieldSchema.type = field.type;
            if (field.type === 'string') {
              fieldSchema.maxLength = field.length;
            }
            if (field.type === 'picklist') {
              fieldSchema.enum = field.picklistValues.map(
                picklistValue => picklistValue.value,
              );
              if (field.restrictedPicklist === false) {
                fieldSchema.enum.push('anyValue');
              }
            }
            schema.properties[field.name] = fieldSchema;
          }
        }
      }
      const writeData = JSON.stringify(schema, null, JSON_INDENT);
      if (destinationfile) {
        fs.writeFile(destinationfile, writeData, writeError => {
          if (writeError) {
            throw writeError;
          }
          console.log('File saved!');
        });
      }
    });
  },
).argv;

if (!argv) {
  throw 'No arguments provided';
}
