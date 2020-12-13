const CDP = require('chrome-remote-interface')
const { v4: generateUuid } = require('uuid')

// TARGET_NAME is global object in website
const TARGET_NAME = 'globalThis'
// TARGET_NAME is function name of TARGET_NAME and must not include single-quote
const FUNCTION_NAME = 'eval'

const main = async () => {
  const url = 'http://localhost:8000'
  const uuid = generateUuid()
  const client = await CDP({
    port: 9222,
    host: process.env.CHROME_HOST ?? 'localhost',
  })
  await client.Runtime.enable()
  const unsubscribe = await client.Runtime.consoleAPICalled(message => {
    if (message?.args?.[0]?.value !== uuid) return
    console.log(`detect calling function: ${TARGET_NAME}['${FUNCTION_NAME}']`, {
      arguments: message?.args?.[1]?.preview?.properties,
      stackTrace: message?.stackTrace?.callFrames,
    })
  })

  await client.Page.enable()
  const detectingScript = await client.Page.addScriptToEvaluateOnNewDocument({
    source: `
        (function(target, prop) {
          const original = target[prop]
          target[prop] = function() {
            console.log('${uuid}', arguments)
            return original.apply(this, arguments)
          }
        })(${TARGET_NAME}, '${FUNCTION_NAME}')
      `,
  })
  await client.Page.navigate({ url })
  await client.Page.loadEventFired()

  unsubscribe()
  await client.Page.removeScriptToEvaluateOnNewDocument(detectingScript)
  await client.Runtime.disable()
  await client.Page.disable()
  await client.close()
}

main().catch(console.error)
