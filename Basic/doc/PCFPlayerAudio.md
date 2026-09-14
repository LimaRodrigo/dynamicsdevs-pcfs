# PCFPlayerAudio

PCF field StandardControl vinculado a UrlAudio (SingleLine.Text). Reproduz o arquivo indicado; não altera nem salva o campo.

`PermitirDownload` é uma propriedade de entrada `TwoOptions`. Quando `true`, o player exibe a ação Baixar; quando `false` ou não configurada, a ação fica indisponível. Essa opção controla a interface do player, mas não substitui a autorização do servidor que hospeda o arquivo.

Aceita URLs absolutas HTTP/HTTPS sem credenciais incorporadas. Prefira HTTPS: conteúdo HTTP pode ser bloqueado pelo navegador em aplicativos HTTPS. URLs relativas, protocolos diferentes e valores inválidos são rejeitados. O arquivo precisa estar acessível ao navegador; o player não adiciona tokens de autenticação.

Atualizações com a mesma URL normalizada preservam a reprodução. Campo vazio, URL inválida ou security.readable=false interrompem o áudio e removem sua fonte. Restrições de edição não impedem a reprodução, pois o controle não edita dados. Mensagens acessíveis usam recursos PCF en-US/pt-BR. Erros de mídia são tratados por eventos; destroy remove os listeners e libera a fonte.

Validação local em Basic/src/PCFPlayerAudio: npm.cmd run lint e npm.cmd run build.

## Organização do código

- `index.ts`: adapta o ciclo de vida do PCF e converte o `context` em comandos para a view.
- `domain/AudioUrlResolver.ts`: aplica a política de URLs HTTP/HTTPS válidas sem depender do PCF ou do DOM.
- `application/AudioPlayerLabels.ts`: define o contrato dos textos e os mapeia a partir dos recursos localizados.
- `application/AudioPlayerViewPort.ts`: define a porta e a factory da apresentação consumidas pelo adaptador PCF.
- `presentation/AudioPlayerView.ts`: cria a interface, controla a reprodução e libera eventos e elementos.
- `presentation/formatAudioTime.ts`: formata tempos de áudio por meio de uma função pura.

Aceitação no Dynamics/Dataverse: reproduzir arquivo acessível; atualizar o formulário sem alterar URL e conferir posição; trocar e limpar URL durante reprodução; testar campo protegido sem leitura, URL inválida, arquivo inacessível e formato incompatível; verificar teclado e mensagens nos dois idiomas; remover o controle durante reprodução. Build local não substitui esses testes no host.

