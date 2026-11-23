const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const day = v => (v || '').slice(0, 10);

// Campos: [coluna, rótulo, tipo, extra]  — tipo: text | number | date | datetime-local | textarea | ref(tabela) | select(opções)
const T = {
  clientes: { label: 'Clientes', lab: r => r.nome, f: [['nome','Nome','text'],['cpf','CPF (11 dígitos)','text'],['telefone','Telefone','text'],['endereco','Endereço','text'],['email','E-mail','text']] },
  pacientes: { label: 'Pacientes', lab: r => r.nome, f: [['id_cliente','Tutor','ref','clientes'],['nome','Nome','text'],['especie','Espécie','text'],['raca','Raça','text'],['data_nascimento','Nascimento','date']] },
  veterinarios: { label: 'Veterinários', lab: r => r.nome, f: [['nome','Nome','text'],['crmv','CRMV','text'],['especialidade','Especialidade','text'],['telefone','Telefone','text']] },
  consultas: { label: 'Consultas', lab: r => `#${r.id} · ${day(r.data_consulta)}`, f: [['id_paciente','Paciente','ref','pacientes'],['id_veterinario','Veterinário','ref','veterinarios'],['data_consulta','Data e hora','datetime-local'],['motivo','Motivo','text'],['diagnostico','Diagnóstico','textarea'],['peso_kg','Peso (kg)','number']] },
  agendamentos: { label: 'Agenda', lab: r => `#${r.id}`, f: [['id_paciente','Paciente','ref','pacientes'],['id_veterinario','Veterinário','ref','veterinarios'],['data_hora','Data e hora','datetime-local'],['tipo_servico','Serviço','text'],['status_agendamento','Status','select',['agendado','confirmado','concluido','cancelado']]] },
  exames: { label: 'Exames', lab: r => r.nome_exame, f: [['id_consulta','Consulta','ref','consultas'],['nome_exame','Exame','text'],['data_solicitacao','Solicitado em','date'],['resultado','Resultado','textarea'],['status_exame','Status','select',['solicitado','em_analise','concluido']]] },
  itens_clinica: { label: 'Estoque', lab: r => r.nome, f: [['nome','Item','text'],['tipo','Tipo','select',['medicamento','produto','servico']],['preco_venda','Preço (R$)','number'],['estoque_atual','Estoque','number']] },
  faturas: { label: 'Faturas', lab: r => `#${r.id}`, f: [['id_cliente','Cliente','ref','clientes'],['id_consulta','Consulta','ref','consultas'],['data_emissao','Emissão','date'],['valor_total','Valor (R$)','number'],['status_pagamento','Pagamento','select',['pendente','pago','cancelado']]] },
};
let cur = 'clientes', cache = {}, editId = null;

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 3000); }

async function load(t) {
  const { data, error } = await sb.from(t).select('*').order('id');
  if (error) { toast(error.message); return; }
  cache[t] = data;
}
function fmt(f, v) {
  if (v == null) return '';
  if (f[2] === 'ref') { const r = (cache[f[3]] || []).find(x => x.id == v); return r ? T[f[3]].lab(r) : v; }
  if (f[2] === 'datetime-local') return new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  if (f[2] === 'date') return v.split('-').reverse().join('/');
  return v;
}

async function render() {
  const t = T[cur], refs = [...new Set(t.f.filter(f => f[2] === 'ref').map(f => f[3]))];
  await Promise.all([load(cur), ...refs.map(load)]);
  const q = $('#busca').value.toLowerCase();
  const rows = (cache[cur] || []).filter(r => !q || t.f.some(f => String(fmt(f, r[f[0]])).toLowerCase().includes(q)));
  $('#grid').innerHTML = rows.length
    ? `<tr><th>ID</th>${t.f.map(f => `<th>${f[1]}</th>`).join('')}<th></th></tr>` +
      rows.map(r => `<tr><td>${r.id}</td>${t.f.map(f => `<td>${esc(fmt(f, r[f[0]]))}</td>`).join('')}
        <td class="act"><button class="ghost" data-e="${r.id}">Editar</button><button class="del" data-d="${r.id}">Excluir</button></td></tr>`).join('')
    : `<tr><td class="vazio">Nenhum registro. Use “Novo registro” para começar.</td></tr>`;
}

function field(f, v) {
  const [k, l, type, x] = f; let el;
  if (type === 'ref') el = `<select name="${k}" required><option value="">Selecione</option>${(cache[x] || []).map(r => `<option value="${r.id}" ${r.id == v ? 'selected' : ''}>${esc(T[x].lab(r))}</option>`).join('')}</select>`;
  else if (type === 'select') el = `<select name="${k}">${x.map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  else if (type === 'textarea') el = `<textarea name="${k}" rows="3">${esc(v)}</textarea>`;
  else {
    if (type === 'datetime-local' && v) v = new Date(new Date(v) - new Date(v).getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    el = `<input name="${k}" type="${type}" ${type === 'number' ? 'step="0.01"' : ''} value="${esc(v)}">`;
  }
  return `<label>${l}${el}</label>`;
}
function openForm(id) {
  editId = id; const row = id ? cache[cur].find(r => r.id == id) : {};
  $('#dlgTitulo').textContent = (id ? 'Editar ' : 'Novo registro em ') + T[cur].label.toLowerCase();
  $('#campos').innerHTML = T[cur].f.map(f => field(f, row[f[0]])).join('');
  $('#dlg').showModal();
}

$('#frm').addEventListener('submit', async e => {
  const body = {};
  new FormData($('#frm')).forEach((v, k) => body[k] = v === '' ? null : v);
  const q = editId ? sb.from(cur).update(body).eq('id', editId) : sb.from(cur).insert(body);
  const { error } = await q;
  toast(error ? error.message : 'Salvo'); if (!error) render();
});
$('#cancelar').onclick = () => $('#dlg').close();
$('#novo').onclick = () => openForm(null);
$('#busca').oninput = render;
$('#grid').onclick = async e => {
  if (e.target.dataset.e) openForm(e.target.dataset.e);
  if (e.target.dataset.d && confirm('Excluir este registro?')) {
    const { error } = await sb.from(cur).delete().eq('id', e.target.dataset.d);
    toast(error ? error.message : 'Excluído'); render();
  }
};
$('#csv').onclick = () => {
  const t = T[cur], line = a => a.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';');
  const csv = [line(['id', ...t.f.map(f => f[1])]), ...cache[cur].map(r => line([r.id, ...t.f.map(f => fmt(f, r[f[0]]))]))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = cur + '.csv'; a.click();
};
$('#tabs').innerHTML = Object.keys(T).map(k => `<button data-t="${k}">${T[k].label}</button>`).join('');
$('#tabs').onclick = e => {
  if (!e.target.dataset.t) return;
  cur = e.target.dataset.t; $('#busca').value = '';
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === cur));
  render();
};

// Login
$('#authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const { error } = await sb.auth.signInWithPassword({ email: $('#email').value, password: $('#senha').value });
  $('#authMsg').textContent = error ? 'E-mail ou senha incorretos.' : '';
});
$('#signup').onclick = async () => {
  const { error } = await sb.auth.signUp({ email: $('#email').value, password: $('#senha').value });
  $('#authMsg').textContent = error ? error.message : 'Conta criada. Confirme pelo e-mail (se exigido) e entre.';
};
$('#logout').onclick = () => sb.auth.signOut();
sb.auth.onAuthStateChange((_, s) => {
  $('#login').hidden = !!s; $('#app').hidden = !s;
  if (s) { $('#user').textContent = s.user.email; document.querySelector('#tabs button').click(); }
});
sb.auth.getSession().then(({ data }) => { if (!data.session) $('#login').hidden = false; });
