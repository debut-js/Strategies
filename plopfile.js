const strategies = './src/strategies';
const templates = './plop-templates';

module.exports = function (plop) {
    plop.setGenerator('strategy', {
        description: 'Create new strategy',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'Enter name:',
            },
        ],
        actions: [
            {
                type: 'addMany',
                base: `${templates}/strategy`,
                templateFiles: `${templates}/strategy/**/*`,
                destination: `${strategies}/{{path}}/`,
            },
            {
                type: 'modify',
                path: `./schema.json`,
                pattern: /]/g,
                templateFile: `${templates}/schemaOption.hbs`,
            },
        ],
    });
};
