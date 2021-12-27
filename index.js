async function wait(sshInfo, timeout = 5000, verbose = true) {
    // We will wait until we can verify a connection to ssh server.
    let connected = false;
    do {
        connected = await connect(sshInfo.port, sshInfo.hostname, verbose).catch((error) => {
            // terminate due to fatal exception.
            throw error;
        });

        // We have either timed out or received a ECONNRESET.
        if (!connected) {
            // Let's back-off a few seconds and retry again.
            await delay(timeout);
        }
    } while (!connected);
}


async function connect(port, host, verbose = true) {
    const s = new require('net').Socket();
    return new Promise((resolve, reject) => {
        try {
            // terminate connection after 10s so we can try again.
            s.setTimeout(10000, function () {
                //console.log('timeout')
                s.destroy();
                resolve(false);
            });
            // We finally heard something from the ssh server, which should be the version string!
            // https://tools.ietf.org/html/rfc4253#section-4.2
            s.on('data', (d) => {
                if (verbose) console.log('\nreceived from ssh server: ', d.toString());
                if (d.toString().includes("SSH-2")) {
                    s.destroy();
                    resolve(true)
                }
                // We are talking to something else that isn't a ssh server, comments prior to string, or empty data.
                else (resolve(false));
            })
            // This is a good sign, this means the VM has booted up and networking is up.
            // However, the ssh server is not quite ready yet.
            s.on('error', function (e) {
                //console.log('ECONNRESET');
                s.destroy();
                resolve(false);
            });
            // Make our connection to server than write something and hope to hear something back in one of our handlers.
            s.connect(port, host, function () {
                //console.log('connected');
                s.write('SSH-2.0-Ping Test\r\n', function () {
                    //console.log('written');
                });
            });
        }
        // We received some other exception, terminate.
        catch (e) {
            reject(e);
        }
    });
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = wait;
