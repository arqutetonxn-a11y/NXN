# Cyber-Nexis + Firebase — Etapa 1

Objetivo desta etapa:

- centralizar a configuração no arquivo `public/firebase-config.js`;
- ativar login/cadastro com Firebase Authentication;
- exigir verificação de e-mail antes de liberar páginas protegidas;
- bloquear completamente Cloud Firestore, Realtime Database e Cloud Storage;
- não salvar perfis, testes ou resultados no banco ainda.

## 1. Vincular esta pasta ao seu projeto

Na raiz desta pasta:

```bash
cp .firebaserc.example .firebaserc
```

Abra `.firebaserc` e substitua `SEU_PROJECT_ID` pelo ID real do projeto.

Alternativa pela CLI:

```bash
firebase use --add
```

## 2. Copiar a configuração do aplicativo Web

No Firebase Console:

1. Abra **Configurações do projeto**.
2. Vá até **Seus apps**.
3. Abra o aplicativo Web.
4. Em **Configuração do SDK**, escolha **Config**.
5. Copie os valores para `public/firebase-config.js`.

Exemplo de formato:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  databaseURL: "https://...", // opcional nesta etapa
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

Não altere os nomes das propriedades. Cole os valores exatos do Console.

## 3. Ativar Authentication

No Firebase Console:

1. Abra **Authentication**.
2. Clique em **Começar**.
3. Abra **Método de login**.
4. Ative **E-mail/Senha**.
5. Salve.

Recomendado em **Configurações > Política de senha**:

- mínimo de 10 caracteres;
- letra minúscula;
- letra maiúscula;
- número;
- caractere especial;
- modo **Exigir** para contas novas.

Em **Configurações > Domínios autorizados**, confirme que estão presentes:

- `localhost`, para testes locais;
- `<PROJECT_ID>.web.app`;
- `<PROJECT_ID>.firebaseapp.com`;
- seu domínio personalizado, quando houver.

## 4. Criar os serviços em modo bloqueado

No Console:

- Crie o Cloud Firestore em **modo de produção**.
- Se for usar Realtime Database, crie-o em **modo bloqueado**.
- Se for usar Storage, crie o bucket sem liberar acesso público.

Os arquivos desta etapa negam toda leitura e escrita do cliente.

## 5. Publicar primeiro as regras

```bash
firebase deploy --only firestore:rules
```

Caso Realtime Database já exista:

```bash
firebase deploy --only database
```

Caso Storage já exista:

```bash
firebase deploy --only storage
```

Também é possível executar os três de uma vez quando todos os serviços já estiverem criados:

```bash
firebase deploy --only firestore:rules,database,storage
```

## 6. Publicar o site

```bash
firebase deploy --only hosting
```

Abra o endereço exibido pela CLI.

## 7. Teste controlado

1. Abra `register.html` pelo endereço do Hosting.
2. Crie uma conta de teste.
3. Confirme que o site informa que enviou a verificação.
4. Tente entrar sem confirmar o e-mail: o acesso deve ser negado.
5. Abra o e-mail e confirme.
6. Entre novamente: `Index.html` deve abrir.
7. Abra `pagina-secreta.html` diretamente em aba anônima: deve redirecionar para `login.html`.

## 8. O que deve falhar nesta etapa

Qualquer tentativa do JavaScript cliente de ler ou escrever no:

- Cloud Firestore;
- Realtime Database;
- Cloud Storage.

O erro esperado é semelhante a `permission-denied`.

Isso é intencional. Na etapa seguinte, abriremos somente os documentos do próprio candidato e apenas através de formatos validados.

## Arquivos principais

- `public/firebase-config.js`: configuração central do SDK.
- `public/site.js`: cadastro, login, logout e proteção de páginas.
- `firestore.rules`: negação total do Firestore.
- `database.rules.json`: negação total do Realtime Database.
- `storage.rules`: negação total do Storage.
- `firebase.json`: mapeamento de Hosting e regras.

## Observação sobre a página secreta

Ela ainda contém vários módulos antigos que tentam gravar dados diretamente no banco. As regras bloquearão essas gravações. Na próxima etapa, esses módulos serão migrados para coleções controladas e, posteriormente, para Cloud Functions.
