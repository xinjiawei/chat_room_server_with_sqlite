import { escapeHtml } from "https://deno.land/x/escape_html/mod.ts";

export function getHighlightedJson(database) {
  /* The worst syntax highlighting filter ever written */
  return escapeHtml(JSON.stringify(database, null, 2)).replaceAll(
    /^(?<space>\s*)(?<key>&quot;.*&quot;?):\s*(?<value>&quot;?[^\[{]*?&quot;|[^\[{]*?)(?<tail>[,\[{]?)$/gm,
    '$<space><span class="key">$<key></span>: <span class="value">$<value></span>$<tail>',
  );
}

export function getIndexer(router, database) {
  /* The index function that shows the API routes */
  return function (req, params) {
    const routeFormats = router.routes
      .map((route) => {
        const path = route.re
          .toString()
          .replace(/^\/\^/, "")
          .replace("\\/?$/", "")
          .replaceAll("\\/", "/")
          .replaceAll("(\\d+)", "{id}")
          .replaceAll("(\\w+)", "{user}");

        let id = 1;
        return {
          ...route,
          path: path,
          example_url: path
            .replaceAll("{id}", (_) => id++)
            .replaceAll("{user}", database.users[0].username),
        };
      })
      .filter((route) => route.path.startsWith("/api"))
      .map((route) => {
        let paramtext = "";
        if (route.requiredFields) {
          paramtext = Object.entries(route.requiredFields)
            .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
            .join("\n");
          paramtext = `<dl>${paramtext}</dl>`;
        }
        if(route.action.description) {
          paramtext += `<small>${route.action.description}</small>`;
        }

        return { route, paramtext };
      })
      .map(
        ({ route, paramtext }) =>
          `<tr>
              <td class="method method-${route.method}">${route.method}</td>
              <td class="endpoint">${
            route.path.replaceAll(
              /{(.*?)}/g,
              "<em>$1</em>",
            )
          }</td>
              <td class="example"><a href="${route.example_url}">${route.example_url}</a></td>
              <td class="params">${paramtext}</td>
          </tr>`,
      )
      .join("\n");

    const tpl = `<!DOCTYPE html>
      <html>
          <head><title>Assignment2</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: sans-serif;
            }
            
            /* layout */
            div.content {
                display: flex;
                flex-wrap: wrap;
            }
            
            div.content > div {
                flex: 1 0;
                margin: 0 1rem;
            }
            
            table {
              border-spacing: 0;
              margin: 1rem;
            }
            td {
              color: #333;
              font-family: consolas, fixed-width;
            }
            dl {
              margin: 0;
            }
            dd {
              font-family: sans-serif;
            }
            
            .method {
              font-weight: 700;
            }
            .method-GET {
              color: #393;
            }
            .method-POST {
              color: #660;
            }
            .method-DELETE {
              color: #900;
            }
            .endpoint {
              font-weight: 300;
              white-space:nowrap;
            }
            .endpoint em {
              color: #339;
              font-weight: 700;
              font-style: normal;
            }
            th,
            td {
              text-align: left;
              border-bottom: 1px solid #666;
              padding: 0.2rem 1rem;
              margin: 0;
              vertical-align: top;
            }
            th:first-child,
            td:first-child {
              text-align: center;
            }
            span.key {
              color: #339;
            }
            span.value {
              color: #393;
            }
          
          </style>
          
          </head>
          <body>
              <h1>Assignment 2</h1>
              <div class="content">
                <div id="endpoints">
                  <h3>API endpoints:</h1>
                  <p>URL components listed in bold and blue below are configurable
                  - replace them with your values (as in the example column)</p><p>
                  <a href="./poem.postman_collection.json">postman接口测试工程文件</a></p>
                  <table>
                  <tr>
                      <th>Method</th>
                      <th>Endpoint</th>
                      <th>Example</th>
                      <th>Notes / JSON parameters</th>
                  </tr>
                  ${routeFormats}
                  </table>
                </div>
    
                <div id="contents">
                  <h3>Initial contents of database</h3>
                  <pre id="database_contents">${getHighlightedJson(database)}</pre>
                </div>
              </div>
              
          </body>
      </html>`;

    return {
      body: tpl,
      "content-type": "text/html",
    };
  };
}
