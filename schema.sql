-- Clínica Veterinária — schema para Supabase (SQL Editor > New query > Run)
-- Corrigido a partir de Clinica.sql (sem \c / CREATE DATABASE: o Supabase já fornece o banco).

drop table if exists consultas_medicamentos, exames, faturas, agendamentos, consultas,
  itens_clinica, veterinarios, pacientes, clientes cascade;

create table clientes (
  id bigint generated always as identity primary key,
  nome varchar(100) not null,
  cpf varchar(11) unique check (cpf ~ '^[0-9]{11}$'),
  telefone varchar(20),
  endereco varchar(255),
  email varchar(100)
);

create table pacientes (
  id bigint generated always as identity primary key,   -- antes: integer sem serial
  id_cliente bigint not null references clientes(id) on delete cascade,
  nome varchar(50) not null,
  especie varchar(30),
  raca varchar(50),
  data_nascimento date
);

create table veterinarios (
  id bigint generated always as identity primary key,
  nome varchar(100) not null,
  crmv varchar(20) unique,
  especialidade varchar(50),
  telefone varchar(20)
);

create table consultas (
  id bigint generated always as identity primary key,
  id_paciente bigint not null references pacientes(id) on delete cascade,
  id_veterinario bigint not null references veterinarios(id),
  data_consulta timestamptz not null default now(),      -- antes: text
  motivo varchar(255),
  diagnostico text,
  peso_kg numeric(5,2) check (peso_kg > 0)
);

create table agendamentos (
  id bigint generated always as identity primary key,
  id_paciente bigint not null references pacientes(id) on delete cascade,
  id_veterinario bigint not null references veterinarios(id),
  data_hora timestamptz not null,
  tipo_servico varchar(50),
  status_agendamento varchar(20) not null default 'agendado'   -- antes: status_agedamento
    check (status_agendamento in ('agendado','confirmado','concluido','cancelado'))
);

create table itens_clinica (
  id bigint generated always as identity primary key,
  nome varchar(100) not null unique,
  tipo varchar(20) check (tipo in ('medicamento','produto','servico')),
  preco_venda numeric(10,2) check (preco_venda >= 0),
  estoque_atual int not null default 0 check (estoque_atual >= 0)
);

create table faturas (
  id bigint generated always as identity primary key,
  id_cliente bigint not null references clientes(id),
  id_consulta bigint not null references consultas(id),
  data_emissao date not null default current_date,
  valor_total numeric(10,2) check (valor_total >= 0),
  status_pagamento varchar(20) not null default 'pendente'
    check (status_pagamento in ('pendente','pago','cancelado'))
);

create table exames (
  id bigint generated always as identity primary key,
  id_consulta bigint not null references consultas(id) on delete cascade,  -- antes: faltava REFERENCES
  nome_exame varchar(100) not null,
  data_solicitacao date default current_date,
  resultado text,
  status_exame varchar(20) not null default 'solicitado'
    check (status_exame in ('solicitado','em_analise','concluido'))
);

create table consultas_medicamentos (
  id_consulta bigint not null references consultas(id) on delete cascade,
  id_item bigint not null references itens_clinica(id),
  quantidade int not null default 1 check (quantidade > 0),
  instrucoes_uso text,                                    -- antes: instucoes_uso
  primary key (id_consulta, id_item)                      -- antes: "serial PRIMARY KEY"
);

create index on pacientes(id_cliente);
create index on consultas(id_paciente);
create index on agendamentos(data_hora);

-- Segurança: só usuários logados (Supabase Auth) acessam os dados
do $$ declare t text; begin
  for t in select unnest(array['clientes','pacientes','veterinarios','consultas','agendamentos',
    'itens_clinica','faturas','exames','consultas_medicamentos']) loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "logados" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Dados de exemplo
insert into clientes (nome,cpf,telefone,endereco,email) values
 ('Mariana Souza','12345678901','(53) 99911-2233','Rua das Flores, 120','mariana@email.com'),
 ('Carlos Pereira','98765432100','(53) 99844-5566','Av. Rio Grande, 45','carlos@email.com');
insert into pacientes (id_cliente,nome,especie,raca,data_nascimento) values
 (1,'Thor','Cão','Labrador','2019-03-10'),(1,'Mia','Gato','Siamês','2021-07-22'),(2,'Bidu','Cão','Poodle','2018-11-05');
insert into veterinarios (nome,crmv,especialidade,telefone) values
 ('Dra. Helena Lima','RS-12345','Clínica geral','(53) 99700-1111'),
 ('Dr. Paulo Matos','RS-67890','Cirurgia','(53) 99700-2222');
insert into itens_clinica (nome,tipo,preco_venda,estoque_atual) values
 ('Vacina V10','medicamento',95.00,30),('Vermífugo','medicamento',40.00,50),('Ração Premium 10kg','produto',210.00,12);
insert into consultas (id_paciente,id_veterinario,data_consulta,motivo,diagnostico,peso_kg) values
 (1,1,now()-interval '3 days','Vacinação anual','Saudável',32.40);
insert into agendamentos (id_paciente,id_veterinario,data_hora,tipo_servico,status_agendamento) values
 (2,2,now()+interval '2 days','Cirurgia','confirmado');
insert into faturas (id_cliente,id_consulta,valor_total,status_pagamento) values (1,1,95.00,'pago');
insert into exames (id_consulta,nome_exame,status_exame) values (1,'Hemograma','solicitado');
insert into consultas_medicamentos (id_consulta,id_item,quantidade,instrucoes_uso) values (1,1,1,'Dose única');
