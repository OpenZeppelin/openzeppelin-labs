function transpile(source, transformations) {
  let cursor = Number.NEGATIVE_INFINITY;

  let transpiledCode = transformations
    .sort((a, b) => {
      return a.start - b.start;
    })
    .reduce((output, trans) => {
      const { start, end, text } = trans;

      if (cursor > start) {
        throw new Error(
          `Transpile failed due to overlapping transformations at range ${start}:${end}`
        );
      }

      output += source.slice(cursor, start);
      output += text;
      cursor = end;
      return output;
    }, "");

  transpiledCode += source.slice(cursor);
  return transpiledCode;
}

module.exports = { transpile };
