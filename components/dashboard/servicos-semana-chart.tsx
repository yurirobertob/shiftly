"use client";

interface DiaServicos {
  dia: string;
  total: number;
  hoje: boolean;
}

export function ServicosSemanaChart({ data }: { data: DiaServicos[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <div className="rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Serviços na semana</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((d) => {
          const pct = (d.total / maxTotal) * 100;
          return (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{d.total}</span>
              <div className="w-full max-w-[32px] flex flex-col justify-end h-20">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.hoje ? "bg-[#1B6545]" : "bg-[#4DAE89]/40"
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${d.hoje ? "text-[#1B6545] font-bold" : "text-gray-400"}`}>
                {d.dia}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
