# Tools

## Dev-Server mit festem Port

ng serve --port 4300

## Cache leeren und neu bauen

```powershell
ng cache clean
Remove-Item -Recurse -Force .angular\cache, dist -ErrorAction SilentlyContinue
npm run build:prod
```

## Projektbaum erstellen

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\make-tree.ps1 -Depth 10 -Files -OutFile .\tree.txt
```