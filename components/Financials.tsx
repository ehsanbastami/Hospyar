import React from 'react';
import { FinancialRecord } from '../types.ts';
import { Printer, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinancialsProps {
  records: FinancialRecord[];
}

const Financials: React.FC<FinancialsProps> = ({ records }) => {
  
  const totalIncome = records.filter(r => r.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutcome = records.filter(r => r.type === 'Outcome').reduce((acc, curr) => acc + curr.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  // Prepare data for chart
  const data = [
    { name: 'درآمد', value: totalIncome, color: '#10b981' }, // emerald-500
    { name: 'هزینه', value: totalOutcome, color: '#ef4444' }, // red-500
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto print:p-0 print:bg-white print:text-black">
      
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-white">مدیریت مالی</h2>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-gray-300 px-4 py-2 rounded-xl border border-dark-600 transition-colors"
        >
          <Printer size={18} />
          چاپ گزارش
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 relative overflow-hidden print:border-gray-300 print:bg-gray-100">
            <div className="absolute top-0 left-0 p-4 opacity-5">
                <TrendingUp size={100} />
            </div>
            <p className="text-gray-400 mb-2 font-medium">مجموع درآمد</p>
            <h3 className="text-3xl font-bold text-emerald-400 dir-ltr text-right">{totalIncome.toLocaleString()} <span className="text-sm text-gray-500">تومان</span></h3>
        </div>
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 relative overflow-hidden print:border-gray-300 print:bg-gray-100">
            <div className="absolute top-0 left-0 p-4 opacity-5">
                <TrendingDown size={100} />
            </div>
            <p className="text-gray-400 mb-2 font-medium">مجموع هزینه</p>
            <h3 className="text-3xl font-bold text-red-400 dir-ltr text-right">{totalOutcome.toLocaleString()} <span className="text-sm text-gray-500">تومان</span></h3>
        </div>
        <div className="bg-dark-800 p-6 rounded-3xl border border-dark-700 relative overflow-hidden print:border-gray-300 print:bg-gray-100">
            <div className="absolute top-0 left-0 p-4 opacity-5">
                <DollarSign size={100} />
            </div>
            <p className="text-gray-400 mb-2 font-medium">تراز مالی</p>
            <h3 className={`text-3xl font-bold dir-ltr text-right ${totalIncome - totalOutcome >= 0 ? 'text-primary' : 'text-red-500'}`}>
                {(totalIncome - totalOutcome).toLocaleString()} <span className="text-sm text-gray-500">تومان</span>
            </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table */}
        <div className="lg:col-span-2 bg-dark-800 rounded-3xl border border-dark-700 overflow-hidden print:border-gray-300">
          <table className="w-full text-right">
            <thead className="bg-dark-900 text-gray-400 print:bg-gray-200 print:text-black">
              <tr>
                <th className="p-4 font-medium">عنوان</th>
                <th className="p-4 font-medium">تاریخ</th>
                <th className="p-4 font-medium">نوع</th>
                <th className="p-4 font-medium text-left">مبلغ (تومان)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700 print:divide-gray-300">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-dark-700/50 print:hover:bg-transparent">
                  <td className="p-4 text-white print:text-black">{record.title}</td>
                  <td className="p-4 text-gray-400 print:text-black">{record.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${record.type === 'Income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} print:border`}>
                      {record.type === 'Income' ? 'درآمد' : 'هزینه'}
                    </span>
                  </td>
                  <td className="p-4 text-left font-mono text-white print:text-black">{record.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className="bg-dark-800 rounded-3xl border border-dark-700 p-6 flex flex-col items-center justify-center print:hidden">
            <h3 className="text-gray-400 mb-6 w-full text-right">نمودار وضعیت</h3>
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                        <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff'}}
                            itemStyle={{color: '#fff'}}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Financials;