# ris-timesheet-bot
Bot approve time sheet automatic.

## How to build Project

1. Download windows msi [nasm](https://www.nasm.us/pub/nasm/releasebuilds/) latest version.
2. add PATH `~\AppData\Local\bin\NASM` to Environment PATH.
3. Installation `pkg` and build

```
npm i -g pkg
npm run build
pkg package.json
ris-timebot --help
```

## How to run
```
// after complier
ris-timebot --employee 18000922 --job 14P120001 --hour 8
```