/* =========================================================
   highlight.js — JSON & PHP syntax highlighting utilities
   ========================================================= */

const Highlight = (() => {

  /**
   * highlightJSON
   * Transforms a JS object into a colorized HTML string.
   * Token classes are defined in css/syntax.css.
   *
   * @param  {*}      data  — Any JSON-serialisable value
   * @returns {string}       HTML string with <span> tokens
   */
  function highlightJSON(data) {
    const raw = JSON.stringify(data, null, 2);

    return raw.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        // Object key  → ends with a colon after the closing quote
        if (/^"/.test(match) && /:$/.test(match)) {
          return `<span class="json-key">${match}</span>`;
        }

        // String value
        if (/^"/.test(match)) {
          return `<span class="json-str">${escapeHtml(match)}</span>`;
        }

        // Boolean
        if (/true|false/.test(match)) {
          return `<span class="json-bool">${match}</span>`;
        }

        // Null
        if (/null/.test(match)) {
          return `<span class="json-null">${match}</span>`;
        }

        // Number
        return `<span class="json-num">${match}</span>`;
      }
    );
  }

  /**
   * renderMigrationCode
   * Produces a highlighted PHP migration snippet for the Setup section.
   * Tokens use classes defined in css/syntax.css.
   *
   * @returns {string} HTML string
   */
  function renderMigrationCode() {
    /* Each line is built as an array of tagged spans to keep this
       readable rather than one massive template literal. */
    const lines = [
      `<span class="kw">return new class extends</span> <span class="cls">Migration</span> {`,
      `  <span class="kw">public function</span> <span class="fn">up</span>(): <span class="kw">void</span> {`,
      `    <span class="cls">Schema</span>::<span class="fn">create</span>(<span class="str">'tasks'</span>, <span class="kw">function</span> (<span class="cls">Blueprint</span> $table) {`,
      `      $table-><span class="fn">id</span>();`,
      `      $table-><span class="fn">string</span>(<span class="str">'title'</span>);`,
      `      $table-><span class="fn">date</span>(<span class="str">'due_date'</span>);`,
      `      $table-><span class="fn">enum</span>(<span class="str">'priority'</span>, [<span class="str">'low'</span>, <span class="str">'medium'</span>, <span class="str">'high'</span>]);`,
      `      $table-><span class="fn">enum</span>(<span class="str">'status'</span>, [<span class="str">'pending'</span>, <span class="str">'in_progress'</span>, <span class="str">'done'</span>])`,
      `             -><span class="fn">default</span>(<span class="str">'pending'</span>);`,
      `      $table-><span class="fn">timestamps</span>();`,
      `      <span class="cm">// Enforce unique title per due_date at the DB level</span>`,
      `      $table-><span class="fn">unique</span>([<span class="str">'title'</span>, <span class="str">'due_date'</span>]);`,
      `    });`,
      `  }`,
      ``,
      `  <span class="kw">public function</span> <span class="fn">down</span>(): <span class="kw">void</span> {`,
      `    <span class="cls">Schema</span>::<span class="fn">dropIfExists</span>(<span class="str">'tasks'</span>);`,
      `  }`,
      `};`,
    ];

    return lines.join('\n');
  }

  /* ── Private helpers ────────────────────────────────────── */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  return { highlightJSON, renderMigrationCode };
})();
