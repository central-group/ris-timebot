# Timesheet bot for RIS at Central Group
![Build & Run Timebot](https://github.com/dvgamerr/ris-timebot/workflows/Build%20&%20Run%20Timebot/badge.svg)


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
ris-timebot --employee 20065479 --password xxxxxx --job 20P180010 --hour 8 --submit
```
