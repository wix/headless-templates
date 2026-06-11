import type { Rule } from 'eslint';
import type { JSXElement, JSXAttribute, Literal } from 'estree-jsx';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Fix empty string values in SelectItem components',
      category: 'Possible Errors',
    },
    fixable: 'code',
    schema: [],
    messages: {
      emptyValue: 'SelectItem value cannot be empty. Auto-fixing to "all".',
    },
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      JSXElement(node: JSXElement) {
        const { openingElement } = node;

        if (openingElement.name?.type !== 'JSXIdentifier' ||
            openingElement.name.name !== 'SelectItem') {
          return;
        }

        const valueAttr = openingElement.attributes.find(
          (attr): attr is JSXAttribute =>
            attr.type === 'JSXAttribute' &&
            attr.name?.type === 'JSXIdentifier' &&
            attr.name.name === 'value'
        );

        if (!valueAttr?.value) return;

        const isEmptyString =
          valueAttr.value.type === 'Literal' &&
          (valueAttr.value as Literal).value === '';

        if (isEmptyString) {
          context.report({
            node: valueAttr.value,
            messageId: 'emptyValue',
            fix: (fixer) => fixer.replaceText(valueAttr.value!, '"all"'),
          });
        }
      },
    };
  },
};
