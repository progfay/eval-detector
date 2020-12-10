const CDP = require('chrome-remote-interface')
const { v4: generateUuid } = require('uuid')

const TARGET_FUNCTION = 'globalThis.eval'

const main = async () => {
  const url = 'http://localhost:8000'
  const uuid = generateUuid()
  console.log({ url, uuid })
  const client = await CDP({
    port: 9222,
    host: process.env.CHROME_HOST ?? 'localhost',
  })
  await client.Runtime.enable()
  const unsubscribe = await client.Runtime.consoleAPICalled(message => {
    if (message?.args?.[0]?.value !== uuid) return
    console.log(`function ${TARGET_FUNCTION} is called`, {
      arguments: message?.args?.[1]?.preview?.properties,
      stackTrace: message?.stackTrace?.callFrames,
    })
  })

  await client.Page.enable()
  await client.Page.addScriptToEvaluateOnNewDocument({
    source: `
        (function(native) {
          ${TARGET_FUNCTION} = function() {
            console.trace('${uuid}', arguments)
            return native.apply(this, arguments)
          }
        })(${TARGET_FUNCTION})
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
