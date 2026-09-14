# Testes do PCFPlayerAudio

Projeto independente com Vitest, TypeScript e jsdom. Importa diretamente o codigo de `../../src/PCFPlayerAudio/PCFPlayerAudio`, sem copiar a implementacao ou alterar o pacote de producao.

Requisito: Node.js 24 LTS (validado com 24.14.0).

Execute a partir de `C:\Repos\dynamicsdevs-pcfs\Basic\test\PCFPlayerAudio`:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run typecheck
```

Modo continuo: `npm.cmd run test:watch` no mesmo diretorio.

Cobertura funcional: politica de URLs, formatacao de tempo, mapeamento de recursos, ciclo de vida PCF, leitura protegida, download, preservacao da fonte, controles acessiveis, eventos de midia e descarte.

As APIs de reproducao de HTMLMediaElement sao simuladas, pois jsdom nao reproduz audio. Os testes nao validam rede, codecs, reproducao real, layout ou integracao Dynamics/Dataverse. Esses cenarios continuam exigindo aceitacao no navegador e no host.

