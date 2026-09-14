# PCFPlayerAudio

PCF field StandardControl vinculado a UrlAudio (SingleLine.Text). Reproduz o arquivo indicado; não altera nem salva o campo.

Aceita URLs absolutas HTTP/HTTPS sem credenciais incorporadas. Prefira HTTPS: conteúdo HTTP pode ser bloqueado pelo navegador em aplicativos HTTPS. URLs relativas, protocolos diferentes e valores inválidos são rejeitados. O arquivo precisa estar acessível ao navegador; o player não adiciona tokens de autenticação.

Atualizações com a mesma URL normalizada preservam a reprodução. Campo vazio, URL inválida ou security.readable=false interrompem o áudio e removem sua fonte. Restrições de edição não impedem a reprodução, pois o controle não edita dados. Mensagens acessíveis usam recursos PCF en-US/pt-BR. Erros de mídia são tratados por eventos; destroy remove os listeners e libera a fonte.

Validação local em Basic/src/PCFPlayerAudio: npm.cmd run lint e npm.cmd run build.

Aceitação no Dynamics/Dataverse: reproduzir arquivo acessível; atualizar o formulário sem alterar URL e conferir posição; trocar e limpar URL durante reprodução; testar campo protegido sem leitura, URL inválida, arquivo inacessível e formato incompatível; verificar teclado e mensagens nos dois idiomas; remover o controle durante reprodução. Build local não substitui esses testes no host.

