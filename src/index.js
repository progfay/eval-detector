const CDP = require('chrome-remote-interface')

const main = async () => {
  const url = 'http://localhost:8000'
  const client = await CDP({
    port: 9222,
    host: process.env.CHROME_HOST ?? 'localhost',
  })
  await client.Runtime.enable()
  const unsubscribe = await client.Runtime.consoleAPICalled(console.log)

  await client.Page.enable()
  await client.Page.addScriptToEvaluateOnNewDocument({
    source: `
        (function(native) {
          globalThis.eval = function() {
            native.apply(this, arguments)
            console.trace(arguments)
          }
        })(globalThis.eval)
      `,
  })
  await client.Page.navigate({ url })
  await client.Page.loadEventFired()
  unsubscribe()
  await client.Runtime.disable()
  await client.Page.disable()
  await client.close()
}

main().catch(console.error)
