const { spawn } = require('child_process')

describe('Run iperf3', () => {
  it('can publish local server', async () => {
    ////
    // Select Custom
    {
      const minecraft = await $('aria/Minecraft Java Edition')
      await minecraft.click()

      const custom = await $('aria/Custom')
      await custom.click()

      const next = await $('button*=Next')
      await next.waitUntil(async () => await next.isClickable(), {
        timeout: 15000,
        timeoutMsg: 'expected next button to be enabled after 15s'
      });
      await next.click()
    }


    ////
    // Fill out Custom form
    {
      const start = await $('button*=Start')
      await start.waitUntil(async () => await start.isEnabled(), {
        timeout: 5000,
        timeoutMsg: 'expected srat button to be enabled after 5s'
      });
      await start.click()


      const next = await $('button*=Next')
      await next.waitUntil(async () => await next.isEnabled(), {
        timeout: 15000,
        timeoutMsg: 'expected next button to be enabled after 15s'
      });
      await next.click()
    }

    ////
    // Configure ownserver
    //
    {
      const start = await $('button*=Start')
      await start.click()

      const next = await $('button*=Next')
      await next.waitUntil(async () => await next.isEnabled(), {
        timeout: 15000,
        timeoutMsg: 'expected next button to be enabled after 15s'
      });
      await next.click()
    }

    ////
    // Monitor
    //
    {
      const address = await $('p*=Your Public Address')
      await address.waitUntil(async function () {
        return (await address.getText()).includes('ownserver.kumassy.com')
      }, {
        timeout: 5000,
        timeoutMsg: 'expected public address to be available after 5s'
      });

      // assert flag pattern is echo by local nc server via ownserver
      const flag = 'hello from webdriver'

      const [ip, port] = (await address.getText()).replace('Your Public Address: ', '').split(':')
      const nc = spawn('nc', [ip, port, '-N'], {
        input: flag,
        timeout: 30000
      })
      nc.stdin.write(`${flag}\n`);


      const terminal = await $('#local-server-inf')
      await terminal.waitUntil(async function () {
        return (await terminal.getText()).includes(flag)
      }, {
        timeout: 30000,
        timeoutMsg: `expected flag ${flag} to be available in 30s`
      });

      nc.stdin.end()
    }

    // make sure to increase mochaOpts.timeout
    // await browser.debug()
  })
})
