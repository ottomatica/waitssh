# waitssh

`waitssh` is a cross-platform utility that allows waiting for ssh to become available:

```js
let sshInfo = {port: 2002, hostname: 'localhost'}
try {
    await waitssh(sshInfo);
} catch (error) {
    console.error(error);
    process.exit(1);
}
```
