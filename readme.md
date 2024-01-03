```
# rollup start dev
npm run dev
```

```
# vue3 demo start

cd ./example/vue3
npm run serve
```

- `.npmrc` 設定 `registry` 公開 或 私有自建的 位置

  - 如個人公開位置 : 執行 `npm login` 登入個人帳號(免費版只能公開，所以需要設定 `access=public`)，然後執行 `npm run publish`就能按照 `packages.json`內的相關對應設定來發布
  - [私建在 Azure devops artifacts feed](https://learn.microsoft.com/en-us/azure/devops/artifacts/npm/upstream-sources?view=azure-devops)
