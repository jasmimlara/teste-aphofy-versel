import React, { useContext, useState, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { TrendingUp, TrendingDown, Plus, Wallet, Trash2, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Calendar, AlertCircle, CheckCircle2, AlertTriangle, History } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AppContext } from '../App';
import { Transaction, Bill } from '../types';
import { Modal } from '../components/Modal';

const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': '#FF8C42',
  'Trabalho': '#3B82F6',
  'Casa': '#10B981',
  'Lazer': '#A855F7',
  'Educação': '#EC4899',
  'Saúde': '#EF4444',
  'Outros': '#64748B',
  'Salário': '#22C55E'
};

export const FinanceTab: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isBillModalOpen, setBillModalOpen] = useState(false);
  const [isDeleteBillModalOpen, setIsDeleteBillModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [billView, setBillView] = useState<'pending' | 'paid'>('pending');
  
  const [formData, setFormData] = useState({ description: '', amount: '', type: 'expense' as 'income'|'expense', category: 'Alimentação' });
  const [billData, setBillData] = useState({ name: '', dueDate: '', amount: '' });

  if (!context) return null;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0 || !formData.description.trim()) {
      context.notify('error', 'Erro na transação', 'Por favor, preencha valor e descrição corretamente.');
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: formData.description,
      amount: amountNum,
      type: formData.type,
      category: formData.category,
      date: new Date().toISOString()
    };
    
    context.setTransactions([transaction, ...context.transactions]);
    setModalOpen(false);
    setFormData({ description: '', amount: '', type: 'expense', category: 'Alimentação' });
    context.notify('success', 'Fluxo registrado!', `R$ ${amountNum.toFixed(2)} registrados.`);
    
    setTimeout(() => context.checkAchievements(), 500);
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(billData.amount);
    if (!billData.name.trim() || !billData.dueDate) {
      context.notify('error', 'Erro na conta', 'Preencha o nome e a data de vencimento.');
      return;
    }

    const newBill: Bill = {
      id: Date.now().toString(),
      name: billData.name,
      dueDate: billData.dueDate,
      amount: isNaN(amountNum) ? 0 : amountNum,
      paid: false
    };

    context.setBills(prev => [...prev, newBill]);
    setBillModalOpen(false);
    setBillData({ name: '', dueDate: '', amount: '' });
    context.notify('success', 'Conta agendada!', `"${newBill.name}" adicionada às contas a pagar.`);
  };

  const deleteTransaction = (id: string) => {
    if (confirm("Deseja apagar este registro permanentemente?")) {
      context.setTransactions(prev => prev.filter(t => t.id !== id));
      context.notify('info', 'Transação removida.');
    }
  };

  const promptDeleteBill = (bill: Bill, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBillToDelete(bill);
    setIsDeleteBillModalOpen(true);
  };

  const confirmDeleteBill = () => {
    if (billToDelete) {
      context.setBills(prev => prev.filter(b => b.id !== billToDelete.id));
      context.notify('info', 'Conta removida.');
      setIsDeleteBillModalOpen(false);
      setBillToDelete(null);
    }
  };

  const toggleBillPaid = (id: string) => {
    context.setBills(prev => prev.map(b => b.id === id ? { ...b, paid: !b.paid } : b));
    const bill = context.bills.find(b => b.id === id);
    if (bill && !bill.paid) {
       context.notify('success', 'Conta Paga!', `"${bill.name}" foi marcada como liquidada.`);
    }
  };

  const totals = useMemo(() => context.transactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 }), [context.transactions]);

  const balance = totals.income - totals.expense;

  const chartData = useMemo(() => {
    const expenses = context.transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [context.transactions]);

  const sortedBills = useMemo(() => {
    return [...context.bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [context.bills]);

  const filteredBills = useMemo(() => {
    return sortedBills.filter(b => billView === 'pending' ? !b.paid : b.paid);
  }, [sortedBills, billView]);

  const isOverdue = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
  };

  return (
    <div className="space-y-8 pb-24 md:pb-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Minhas Finanças</h2>
           <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Gestão de recursos e capital</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => setBillModalOpen(true)}
            className="flex-1 md:flex-none glass text-orange-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-orange-500/20 hover:bg-orange-500/5 transition-all flex items-center justify-center gap-2"
          >
            <Calendar size={16} /> Agendar Conta
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            className="bg-orange-500 text-white p-5 rounded-2xl shadow-xl shadow-orange-500/30 hover:scale-110 transition-all active:scale-95 flex items-center justify-center"
          >
            <Plus size={28} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 bg-gradient-to-br from-zinc-900 to-black border-none p-10 relative overflow-hidden group h-fit min-h-[340px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 text-white/5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
             <Wallet size={120} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center mb-10 relative z-10">
            <span className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Saldo Geral</span>
            <span className={`text-6xl md:text-7xl font-black italic tracking-tighter ${balance >= 0 ? 'text-white' : 'text-red-500'}`}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="glass bg-green-500/5 border-green-500/20 p-6 rounded-3xl">
              <div className="flex items-center gap-3 text-green-500 mb-2">
                <ArrowUpRight size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Receitas</span>
              </div>
              <span className="text-2xl font-black text-white italic">R$ {totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="glass bg-red-500/5 border-red-500/20 p-6 rounded-3xl">
              <div className="flex items-center gap-3 text-red-500 mb-2">
                <ArrowDownRight size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Despesas</span>
              </div>
              <span className="text-2xl font-black text-white italic">R$ {totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </GlassCard>

        {/* Contas Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
              {billView === 'pending' ? <Calendar className="text-orange-500" /> : <History className="text-green-500" />} 
              {billView === 'pending' ? 'Contas a Pagar' : 'Histórico Pago'}
            </h3>
            <div className="flex glass p-1 rounded-xl border-white/5">
              <button 
                onClick={() => setBillView('pending')}
                className={`p-2 rounded-lg transition-all ${billView === 'pending' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}
                title="Pendentes"
              >
                <Calendar size={14} />
              </button>
              <button 
                onClick={() => setBillView('paid')}
                className={`p-2 rounded-lg transition-all ${billView === 'paid' ? 'bg-green-500 text-white' : 'text-gray-500 hover:text-white'}`}
                title="Pagas"
              >
                <CheckCircle2 size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
            {filteredBills.length === 0 ? (
              <div className="text-center py-20 text-gray-600 glass rounded-[2.5rem] border-dashed border border-white/5 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  {billView === 'pending' ? <CheckCircle2 size={32} className="opacity-20" /> : <Calendar size={32} className="opacity-20" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest max-w-[150px] leading-relaxed">
                  {billView === 'pending' ? 'Você não tem contas pendentes para os próximos dias.' : 'Nenhuma conta paga encontrada no histórico.'}
                </p>
              </div>
            ) : (
              filteredBills.map(bill => {
                const overdue = isOverdue(bill.dueDate) && !bill.paid;
                return (
                  <div key={bill.id} className={`glass rounded-[2rem] p-5 flex flex-col gap-4 border border-white/5 transition-all group ${bill.paid ? 'border-green-500/20' : 'hover:border-orange-500/30'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleBillPaid(bill.id)}
                          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${bill.paid ? 'bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-[#4B5563] hover:border-orange-500'}`}
                        >
                          {bill.paid && <CheckCircle2 size={16} className="text-white" />}
                        </button>
                        <div>
                          <p className={`font-black text-sm uppercase italic tracking-tight ${bill.paid ? 'text-white' : 'text-white'}`}>{bill.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${overdue ? 'text-red-500' : 'text-gray-500'}`}>
                            {bill.paid ? 'Pago em ' : 'Vence em '} {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className={`text-sm font-black italic ${bill.paid ? 'text-green-500' : 'text-white'}`}>R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        {overdue && <AlertCircle size={12} className="text-red-500 animate-pulse" />}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${overdue ? 'text-red-500' : (bill.paid ? 'text-green-500' : 'text-gray-600')}`}>
                          {overdue ? 'ATRASADA' : (bill.paid ? 'LIQUIDADA' : 'AGUARDANDO')}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => promptDeleteBill(bill, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-[#4B5563] hover:text-[#EF4444] hover:bg-red-500/10 transition-all tracking-widest z-20"
                        aria-label="Remover conta"
                      >
                        <Trash2 size={12} />
                        Remover
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="flex flex-col p-8 border-white/5 min-h-[400px]">
          <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3 mb-8">
             <PieIcon className="text-orange-500" /> Onde o dinheiro vai
          </h3>
          <div className="h-64 relative flex-1">
             {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={90}
                    paddingAngle={8} dataKey="value" stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748B'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <PieIcon size={48} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sem despesas registradas</p>
               </div>
             )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#64748B' }}></div>
                  <span className="text-gray-400 text-[10px] font-black uppercase truncate">{item.name}</span>
                </div>
                <span className="font-bold text-sm">R$ {item.value.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black italic uppercase tracking-tight">Extrato Recente</h3>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
            {context.transactions.length === 0 ? (
              <div className="text-center py-24 text-gray-500 italic glass rounded-[2rem] border-dashed border border-white/10 opacity-50">
                Ainda não há movimentos.
              </div>
            ) : (
              context.transactions.map((t) => (
                <GlassCard key={t.id} className="p-5 flex items-center gap-4 border-white/5 hover:bg-white/5 transition-all">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-lg truncate leading-none mb-1">{t.description}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className={`font-black italic text-lg ${t.type === 'income' ? 'text-green-500' : 'text-white'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => deleteTransaction(t.id)} className="text-gray-600 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-white/5">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Nova Transação">
        <form onSubmit={handleAddTransaction} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Descrição</label>
            <input 
              type="text" placeholder="Ex: Salário, Aluguel, Supermercado..." required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none font-bold text-white"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Valor (R$)</label>
            <input 
              type="number" step="0.01" placeholder="0,00" required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-2xl font-black italic text-white"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={() => setFormData({...formData, type: 'income'})}
              className={`py-4 rounded-2xl font-black italic uppercase tracking-widest border transition-all ${formData.type === 'income' ? 'bg-green-500 text-white border-green-500' : 'bg-white/5 border-white/10 text-gray-500'}`}
            >Entrada</button>
            <button 
              type="button" 
              onClick={() => setFormData({...formData, type: 'expense'})}
              className={`py-4 rounded-2xl font-black italic uppercase tracking-widest border transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 border-white/10 text-gray-500'}`}
            >Saída</button>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Categoria</label>
             <select 
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 outline-none font-black uppercase text-xs text-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 font-bold rounded-2xl hover:bg-white/5 transition-colors text-white">Cancelar</button>
            <button type="submit" className="flex-1 py-4 bg-orange-500 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20 text-white">REGISTRAR</button>
          </div>
        </form>
      </Modal>

      {/* Bill Modal */}
      <Modal isOpen={isBillModalOpen} onClose={() => setBillModalOpen(false)} title="Agendar Conta">
        <form onSubmit={handleAddBill} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Nome da Conta</label>
            <input 
              type="text" placeholder="Ex: Internet, Luz, Netflix..." required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none font-bold text-white"
              value={billData.name}
              onChange={e => setBillData({...billData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Valor Previsto</label>
            <input 
              type="number" step="0.01" placeholder="0,00" required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none text-xl font-black italic text-white"
              value={billData.amount}
              onChange={e => setBillData({...billData, amount: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Data de Vencimento</label>
            <input 
              type="date" required
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none font-bold text-white"
              value={billData.dueDate}
              onChange={e => setBillData({...billData, dueDate: e.target.value})}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setBillModalOpen(false)} className="flex-1 py-4 font-bold rounded-2xl hover:bg-white/5 transition-colors text-white">Voltar</button>
            <button type="submit" className="flex-1 py-4 bg-orange-500 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-orange-500/20 text-white">AGENDAR</button>
          </div>
        </form>
      </Modal>

      {/* Delete Bill Confirmation Modal */}
      <Modal isOpen={isDeleteBillModalOpen} onClose={() => setIsDeleteBillModalOpen(false)} title="Remover Conta">
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl mx-auto flex items-center justify-center">
            <AlertTriangle size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-white font-black uppercase italic text-xl">Confirmar Remoção?</p>
            <p className="text-[#999999] text-xs font-medium leading-relaxed">
              Deseja remover a conta <span className="text-white font-bold">"{billToDelete?.name}"</span> da sua lista de agendamentos?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setIsDeleteBillModalOpen(false)}
              className="py-4 glass rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 text-[#999999] hover:bg-white/5"
            >
              CANCELAR
            </button>
            <button 
              onClick={confirmDeleteBill}
              className="py-4 bg-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> REMOVER
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};