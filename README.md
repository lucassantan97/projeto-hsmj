# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## 🚀 Guia de Teste com n8n

Para testar a automação de extração de dados de notas fiscais, você precisará configurar um fluxo de trabalho (workflow) no n8n para enviar os arquivos para a API do seu sistema. Siga os passos abaixo.

### Passo 1: Adicione o Nó de Requisição HTTP

1.  Abaixo do seu gatilho ("Acionar manualmente"), clique no `+` para adicionar um novo nó.
2.  Na caixa de busca, procure por **"HTTP Request"** (ou "Requisição HTTP") e selecione-o.

### Passo 2: Configure o Nó de Requisição HTTP

Esta é a parte principal. Preencha os campos do nó da seguinte forma:

#### 1. Autenticação (Authentication)
   - No campo **Authentication**, selecione **Header Auth**.
   - **Nome (Name):** `x-api-key`
   - **Valor (Value):** Cole aqui o valor da sua `API_SECRET_KEY` que está no seu arquivo `.env`.

#### 2. URL
   - **Método da Requisição (Request Method):** `POST`
   - **URL:** Para testar localmente, use: `http://localhost:3000/api/maintenance`
     *(Quando sua aplicação estiver publicada, substitua `http://localhost:3000` pela URL de produção)*

#### 3. Corpo da Requisição (Body)
   - Garanta que a opção **Send Body** esteja marcada/ligada.
   - **Tipo de Conteúdo do Corpo (Body Content Type):** `Multipart/Form-Data`
   - Na seção **Fields**, clique em "Add Field" para criar 3 campos:
     - **Campo 1:**
       - **Nome (Name):** `file`
       - **É um Arquivo (Is File):** Marque esta caixa.
       - **Nome da Propriedade (Property Name):** Deixe como `data`.
       - Agora, você pode fazer upload de um arquivo de nota fiscal (imagem ou PDF) para testar.
     - **Campo 2:**
       - **Nome (Name):** `vehicleId`
       - **Valor (Value):** Para o teste, pegue o ID de um dos veículos do seu sistema. Vá no arquivo `src/lib/mock-data.ts` e copie um `id` de um veículo (Ex: `1`).
     - **Campo 3:**
       - **Nome (Name):** `ownerUserId`
       - **Valor (Value):** Este é o ID do seu usuário anônimo.
         1. Vá para o **Firebase Console > Authentication**.
         2. Na lista de usuários, copie o valor da coluna **"UID do usuário"** e cole aqui.

### Passo 3: Execute o Teste

Com tudo configurado, clique no botão **"Executar Fluxo de Trabalho"** (Execute Workflow) no canto inferior direito da tela do n8n.

Se tudo estiver correto, o n8n enviará a nota fiscal para sua API, a IA processará o arquivo, e a manutenção será registrada no veículo correspondente no Firestore!
