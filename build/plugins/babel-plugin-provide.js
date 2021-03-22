const { declare } = require('@babel/helper-plugin-utils');
const t = require('@babel/types');

module.exports = declare((api) => {
  api.assertVersion(7);

  function IdentifierVisitor(path) {
    if (!this.provides || !path.parent) return;
    const { parent } = path;
    if (['FunctionDeclaration', 'MemberExpression', 'VariableDeclarator', 'ImportDefaultSpecifier'].includes(parent.type)) return;
    if (parent.type === 'ObjectProperty' && parent.key === path.node) return;
    const identifier = path.node.name;
    if (this.handled[identifier]) return;
    this.handled[identifier] = true;
    const provide = this.provides[identifier];
    if (provide) this.addDefaultImport(identifier, provide);
  }

  return {
    name: 'babel-plugin-provide',
    visitor: {
      Program: {
        enter(nodePath, { file: { opts: { filename } }, opts = {} }) {
          if (filename.includes('node_modules')) {
            let shouldLoad = false;
            for (const m of opts.modules || []) {
              if (filename.includes(m)) shouldLoad = true;
            }
            if (!shouldLoad) return;
          }
          const ctx = {
            provides: opts.provides || {},
            handled: {},
            addDefaultImport(varName, libraryName) {
              if (filename.includes(`/${libraryName}/`)) return;
              nodePath.unshiftContainer(
                'body',
                t.importDeclaration(
                  [t.importDefaultSpecifier(t.identifier(varName))],
                  t.stringLiteral(libraryName),
                )
              );
            },
          };
          nodePath.traverse({
            Identifier: IdentifierVisitor,
          }, ctx);
        },
      },
    },
  };
});
