# easytemplate

easytemplate is a simple system for initializing new projects. It only requires
the template and a short configuration file.

## Example

[Deno](https://deno.land) must be installed to run easytemplate.

```
git clone https://github.com/Jamalam360/easytemplate
cd easytemplate/example
deno run --allow-read --allow-write https://raw.githubusercontent.com/Jamalam360/easytemplate/main/easytemplate.ts
```

**A more complex example can be found
[here](https://github.com/JamCoreModding/multi-loader-template-mod)**

easytemplate can also be run with the `--debug` flag to debug your templates (or
more likely easytemplate itself).

## Documentation

### Structure

An easytemplate template is simply composed of the relevant files along with an
`easytemplate.json` file, which is automatically removed at the end of
templating.

### `easytemplate.json`

The configuration file is composed of the following fields:

```json
{
  "inputs": "Input[]",
  "move": "Move[]",
  "exclude": "string[]"
}
```

#### `Input`

Inputs are the questions which are asked to the user before filling in the
template. All inputs share 4 common fields:

- `id: string`; this is the name of the variable that will be passed to
  Handlebars.
- `label: string`; this is the prompt shown to the user.
- `default?: T`; this is the default response.
- `only_if?: string`; this is a JavaScript expression which determines whether
  the user should be prompted about this input. All previously evaluated inputs
  are available (e.g. `some_previous_input.includes("jeff")`).

##### `options`

```json
{
  "type": "options",
  "id": "some_id",
  "label": "Enter ...:",
  "options": [
    {
      "value": "john",
      "label": "John"
    },
    {
      "value": "bill",
      "label": "Bill"
    }
  ]
}
```

##### `string`

```json
{
  "type": "string",
  "id": "some_id",
  "label": "Enter ...:",
  "regex": "optionally add a validating regex"
}
```

##### `boolean`

```json
{
  "type": "boolean",
  "id": "some_id",
  "label": "Enter ...:"
}
```

#### `Move`

Move operations are used to rename/move files after the template has been filled
out (all Handlebars expressions have been expanded).

```json
{
  "from": "from_path",
  "to": "to_path"
}
```

#### Exclude

Excludes are used to exclude some files from being processed. Exclude paths are
extended, globstar-enabled globs.

easytemplate makes a best guess at automatically excluding non-text files from
processing.

### Templating

easytemplate uses [Handlebars](https://handlebarsjs.com) as it's templating
engine. Handlebars is useable in any file, as well as in directory paths/file
names themselves.

#### Using Handlebars in File Paths

Since file paths cannot contain `/`, which is used by Handlebars, easytemplate
will replace all occurrences of `%%` in a path with `/`. Other than this,
Handlebars can be used as normal in path names - here is a complex example,
along with an example output:

```
./my_template/{{ variable1 }}/{{ #replace "b" "a" }}{{ variable2 }}{{ %%replace  }}/{{ variable3}}.txt

###

variable1 = james
variable2 = bob
variable3 = dave

./my_template/james/aoa/dave.txt
```

#### Handlebars Helpers

easytemplate includes a few default Handlebars helpers.

##### `replace`

Replaces all occurrences of `find` in the block with `replace`

```
{{ #replace 'find' 'replace' }}
I am finding this repository very cool!
{{ /replace }}

###

I am replaceing this repository very cool!
```

##### `ifCond`

Implements the following binary operators between variables:

- `==`
- `===`
- `!=`
- `!==`
- `<`
- `<=`
- `>`
- `>=`
- `&&`
- `||`

```
{{ #ifCond string1 '===' string2 }}
string one was equal to string two!
{{ /ifCond }}

###

string1 = test
string2 = test

string one was equal to string two!
```

### `.easytemplate`

When using easytemplate myself, I found some IDEs that I had configured to
format code automatically would create horrible formatting due to the random
Handlebars syntax in what the IDE thought was a normal code file.

Due to this issue, I made easytemplate remove the `.easytemplate` suffix from
any files that have it. Other than that, no other changes are made to these
files outside of the usual processing.
