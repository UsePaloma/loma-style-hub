# Loma Style Hub

Crie uma aplicação web moderna, elegante e minimalista de e-commerce de moda feminina inspirada na marca "USE LOMA", incluindo um PAINEL ADMINISTRATIVO (CMS) completo para gestão do site e dos pedidos.

---

### 1. PALETA DE CORES E ESTILO VISUAL (Marca USE LOMA)
- Background principal: Off-White / Creme suave (#F9F6F0 / #F5EFE6)
- Cartões e Containers: Nude/Beige claro (#EADBC8 e #E8DEC8)
- Cor Principal / Botões Primários (CTA): Marrom Chocolate / Café (#4A2E1B / #5C3A21)
- Texto Principal: Marrom Escuro (#2C1A0E)
- Detalhes / Destaques: Dourado Suave / Cobre (#D4AF37 / #C59B6C)
- Tipografia: Serif sofisticada para títulos (Cormorant Garamond ou Playfair Display) e Sans-Serif limpa para textos/botões (Inter).
- Estilo: Bordas arredondadas (rounded-2xl), estética limpa, feminina, sofisticada e de alta conversão.

---

### 2. ESTRUTURA DO SITE PÚBLICO (E-commerce)

#### A. Cabeçalho (Header) & Banner Dinâmico
- **Barra de aviso superior (Editável no Admin):** Ex: "Frete fixo para todo o Brasil | Descontos especiais na Compra em Grupo ♡"
- **Logo:** "USE LOMA - MODA FEMININA" com o ícone de coração minimalista.
- **Navegação:** Novidades | Coleções | Compra em Grupo | Pedidos | WhatsApp | Botão "Área Admin" (no canto superior com ícone de engrenagem/cadeado).
- **Banner Hero (Editável no Admin):** Título principal e slogan (Ex: "Mais que moda, é você bem vestida ♡").
- **Botões de Ação Rápida:**
  - Botão "Siga nosso Instagram @useloma" (Link editável).
  - Botão "Pedidos pelo WhatsApp - Me chama para pedir e separar sua peça ♡" (Número editável).

#### B. Catálogo de Produtos & Cards de Compra em Grupo
- Cada produto exibe:
  - Foto do produto, título e categoria.
  - Preço Normal (ex: R$ 150,00) e Preço em Grupo (ex: R$ 110,00).
  - Badge: "Compra Coletiva Ativa".
  - Botão para abrir o Modal de Oferta.

#### C. Modal do Produto & Regra da Compra em Grupo
- Ao clicar no produto, o cliente escolhe:
  1. **Compra Individual (R$ 150,00):** Compra direta sem meta de grupo.
  2. **Compra em Grupo (R$ 110,00):** 
     - **Barra de Progresso interativa:** Mostra visualmente o preenchimento da cota (Ex: 4 de 5 pessoas).
     - **Alerta em destaque:** "Falta apenas 1 pessoa para que a compra em grupo ocorra!"
     - Contador regressivo fictício/configurável para urgência.
     - Botão "Participar deste Grupo (R$ 110,00)" e botão "Convidar Amigas no WhatsApp" para compartilhar o link do grupo.

#### D. Opções de Checkout
- **Opção 1 - Finalizar no Site:** Formulário (Nome, Telefone, Endereço, PIX/Cartão). Salva o pedido no banco de dados e envia notificação.
- **Opção 2 - Finalizar pelo WhatsApp:** Gera mensagem automática para o responsável:
  *"Olá! Quero pedir o produto [Nome do Produto]. Tipo de Compra: [Individual R$ 150 / Grupo R$ 110]. Grupo ID: #GP123 (Falta 1 pessoa). Por favor, separe minha peça! ♡"*

#### E. Rodapé (Footer) - Totalmente Editável no Admin
- **Selos de Qualidade / Diferenciais (Editáveis):**
  - 🛍️ Qualidade em cada detalhe
  - 🤍 Looks para todas as ocasiões
  - 👑 Você ainda mais linda
  - ♡ Moda que conecta mulheres
- **Links Sociais, Contatos e Direitos Autorais.**

---

### 3. PAINEL DE ADMINISTRAÇÃO (PAINEL ADMIN / CMS)
Crie uma página acessível pela rota `/admin` (ou através de um modal/botão de login) protegida por senha simples/autenticação. O painel deve ser organizado em **Abas (Tabs)**:

#### Aba 1: Configurações do Site & Banner
- Editar o texto da **Barra Superior de Avisos**.
- Editar o **Título Principal** e **Slogan** do Banner Hero.
- Editar o **Número do WhatsApp** do responsável (para onde serão enviados os pedidos).
- Editar o **User do Instagram** (@useloma) e links de redes sociais.

#### Aba 2: Edição do Rodapé (Footer)
- Editar os **4 Selos de Destaque** (Título e Subtítulo de cada um).
- Editar o **Texto Institucional / Sobre a marca** do rodapé.
- Editar o **Texto de Direitos Autorais** (Copyright).

#### Aba 3: Gestão de Produtos e Compras em Grupo
- Formulário para **Adicionar e Editar Produtos**:
  - Nome do produto, descrição e foto (URL da imagem).
  - Preço Individual (Preço Regular).
  - Preço em Grupo (Preço com Desconto).
  - **Quantidade mínima de pessoas** para ativar o desconto do grupo (ex: 5 pessoas).
  - **Quantidade atual de participantes** do grupo (permitir alterar manualmente para controlar o status da barra de progresso, ex: definir em 4 para exibir "Falta apenas 1 pessoa").

#### Aba 4: Gestão de Pedidos e Grupos Ativos
- **Tabela de Pedidos:**
  - Lista de pedidos feitos pelo site e registrados via WhatsApp.
  - Exibir: Nome do cliente, produto, tipo (Individual ou Grupo), valor total, status do pedido.
  - Botão de status: "Aguardando Pagamento", "Em Separação", "Aguardando Cota do Grupo", "Enviado", "Concluído".
- **Monitor de Grupos:**
  - Visualizar grupos de compra ativos e quais já atingiram o limite mínimo para liberação dos pedidos.

---

### 4. REQUISITOS TÉCNICOS DE ESTADO E UX
- Utilize estado global/persistente (React State / LocalStorage / Supabase) para que qualquer alteração feita no Painel Admin (textos do rodapé, avisos, preços, contatos) **seja refletida instantaneamente na interface pública do site**.
- Componentes e Ícones usando **Tailwind CSS** e **Lucide Icons**.
- Animações suaves nos modais, na barra de progresso do grupo e na transição entre as abas do Painel Admin.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4a63c1a7-2d2b-4f32-8ba4-9e0b642a7069).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
