import CDP from 'chrome-remote-interface'

const main: () => Promise<void> = async () => {
  const url = 'http:///localhost:8000'
  const client = await (CDP as any)({
    port: 9222,
    host: process.env.CHROME_HOST ?? 'localhost',
  })
  await client.Log.entryAdded(console.log)
  await client.Log.enable()
  await client.Page.enable()
  await client.Page.navigate({ url })
  await client.Page.loadEventFired()
  await client.close()
}

main().catch(console.error)
