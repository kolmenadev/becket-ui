// App code uses a Becket component wherever one exists for the raw element.
export default {
  id: 'becket-components',
  guide: 'building-with-becket § 2 Must use a Becket component when one exists',
  check: ({ ts, source, isAppCode, inScope, report }) => ({
    visit(node) {
      if (
        !inScope(node) ||
        !isAppCode ||
        !(ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      )
        return;
      const tag = node.tagName.getText(source);
      const becket = {
        h1: 'Heading as="h1"',
        h2: 'Heading as="h2"',
        h3: 'Heading as="h3"',
        h4: 'Heading as="h4"',
        h5: 'Heading as="h5"',
        h6: 'Heading as="h6"',
        p: 'Text',
        hr: 'Separator',
        button: 'Button',
        input: 'TextField / Checkbox / Switch',
        select: 'Select',
        textarea: 'Textarea',
        table: 'Table',
        a: 'Link (or Button as="a")',
        img: 'Image',
        ul: 'List',
        ol: 'List as="ol"',
        li: 'ListItem',
        code: 'Code',
        kbd: 'Kbd',
        mark: 'Mark',
        blockquote: 'Blockquote',
        svg: 'Icon',
        div: 'Box / Stack / HStack / Flex / SimpleGrid / Container',
        span: 'Text',
      }[tag];
      if (becket) report({ node, level: 'must', message: `<${tag}>; use ${becket}` });
    },
  }),
};
