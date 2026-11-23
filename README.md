# 🐾 Clínica Veterinária

Sistema web simples para organizar uma clínica veterinária: clientes, animais, veterinários, consultas, agenda, exames, estoque e faturas.

## Como funciona

- O usuário cria uma conta e entra com e-mail e senha.
- Cada aba do site mostra uma tabela do banco de dados.
- É possível cadastrar, editar, excluir, buscar e exportar para CSV.
- Os dados ficam no Supabase e só usuários logados têm acesso.

## Como usar

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o arquivo `schema.sql`.
3. Coloque a URL e a chave `anon` do projeto no `config.js`.
4. Abra o `index.html`, crie uma conta e entre.

## Arquivos

- `index.html`, `style.css`, `app.js`: o site
- `config.js`: dados de conexão com o Supabase
- `schema.sql`: tabelas do banco
