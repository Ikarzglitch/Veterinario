# 🐾 Clínica Veterinária

Sistema web para gerenciar uma clínica veterinária: clientes, pacientes (animais), veterinários, consultas, agenda, exames, estoque e faturas. Projeto do TCA (Trabalho de Conclusão de Ano).

## Funcionalidades

- Login e cadastro de usuários (Supabase Auth)
- Uma aba para cada tabela: Clientes, Pacientes, Veterinários, Consultas, Agenda, Exames, Estoque e Faturas
- Cadastrar, editar e excluir registros
- Busca dentro da tabela aberta
- Exportação da tabela para planilha (CSV)
- Acesso aos dados somente para usuários logados (Row Level Security)

## Tecnologias

- HTML, CSS e JavaScript (sem framework)
- [Supabase](https://supabase.com): banco PostgreSQL e autenticação

## Estrutura do projeto

| Arquivo | Função |
|---|---|
| `index.html` | Páginas de login e do sistema |
| `style.css` | Visual do site |
| `app.js` | Lógica: login, tabelas, formulários |
| `config.js` | URL e chave do Supabase |
| `schema.sql` | Criação das tabelas, regras de segurança e dados de exemplo |

## Banco de dados

9 tabelas: `clientes`, `pacientes`, `veterinarios`, `consultas`, `agendamentos`, `itens_clinica`, `faturas`, `exames` e `consultas_medicamentos`.

Principais relações:
- um cliente tem vários pacientes
- uma consulta liga um paciente a um veterinário
- uma fatura liga um cliente a uma consulta
- exames e medicamentos pertencem a uma consulta

## Como rodar

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor**, cole o conteúdo de `schema.sql` e clique em **Run**.
3. Em **Project Settings → API**, copie a *Project URL* e a *anon public key* para o `config.js`.
4. (Opcional, para testes) Em **Authentication → Providers → Email**, desative **Confirm email**.
5. Abra o `index.html` no navegador, clique em **Criar conta** e depois em **Entrar**.

> Nunca publique a chave `service_role`. A chave `anon` pode ficar no `config.js`, pois o acesso é protegido pelas regras do banco.

## Problemas conhecidos / melhorias futuras

- Tela para os medicamentos usados em cada consulta
- Painel com os agendamentos do dia
- Níveis de acesso (recepção, veterinário, administrador)
- Impressão de faturas e receitas

## Autor

Seu Nome — Turma / Curso — Ano
