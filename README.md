# 🐾 Clínica Veterinária

Sistema web simples para organizar uma clínica veterinária: clientes, animais, veterinários, consultas, agenda, exames, estoque e faturas.

## Como funciona

- O usuário cria uma conta e faz login.
- Cada aba do site mostra uma tabela do banco de dados.
- Dá para cadastrar, editar, excluir, buscar e exportar os dados em CSV.
- Os dados ficam guardados no Supabase (PostgreSQL), e só usuários logados têm acesso.

## Como rodar

1. Crie um projeto no [Supabase](https://supabase.com) e rode o `schema.sql` no SQL Editor.
2. Coloque a URL e a chave `anon` no `config.js`.
3. Abra o `index.html` no navegador.

## Tecnologias

HTML, CSS, JavaScript e Supabase.
