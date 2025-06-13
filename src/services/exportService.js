import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToExcel = (simulationData) => {
  const data = [
    ['Simulador DryCooler - Relatório de Economia', ''],
    ['', ''],
    ['Dados do Cliente', ''],
    ['Nome:', simulationData.userData.name],
    ['Email:', simulationData.userData.email],
    ['Empresa:', simulationData.userData.company],
    ['Telefone:', simulationData.userData.phone],
    ['Estado:', simulationData.userData.state],
    ['', ''],
    ['Parâmetros da Simulação', ''],
    ['Capacidade Térmica:', `${simulationData.inputs.capacity} kW`],
    ['Localização:', simulationData.inputs.location],
    ['Delta T:', `${simulationData.inputs.deltaT}°C`],
    ['', ''],
    ['Resultados - DryCooler', ''],
    ['Módulos necessários:', simulationData.results.drycooler.modules],
    ['Capacidade total:', `${simulationData.results.drycooler.totalCapacity} kW`],
    ['Consumo hora:', `${simulationData.results.drycooler.consumption.hourly.toFixed(2)} L/h`],
    ['Consumo dia:', `${simulationData.results.drycooler.consumption.daily.toFixed(2)} L/dia`],
    ['Consumo mês:', `${simulationData.results.drycooler.consumption.monthly.toFixed(2)} L/mês`],
    ['Consumo ano:', `${simulationData.results.drycooler.consumption.yearly.toFixed(2)} L/ano`],
    ['', ''],
    ['Resultados - Torre de Resfriamento', ''],
    ['Consumo hora:', `${simulationData.results.tower.consumption.hourly.toFixed(2)} L/h`],
    ['Consumo dia:', `${simulationData.results.tower.consumption.daily.toFixed(2)} L/dia`],
    ['Consumo mês:', `${simulationData.results.tower.consumption.monthly.toFixed(2)} L/mês`],
    ['Consumo ano:', `${simulationData.results.tower.consumption.yearly.toFixed(2)} L/ano`],
    ['', ''],
    ['Economia', ''],
    ['Economia anual:', `${simulationData.results.comparison.yearlyDifference.toFixed(2)} L/ano`],
    ['Percentual de redução:', `${simulationData.results.comparison.yearlyDifferencePercentage.toFixed(2)}%`],
    ['', ''],
    ['Data da simulação:', new Date().toLocaleString('pt-BR')],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Simulação');

  // Estilização da planilha
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let i = 0; i <= range.e.r; i++) {
    const cell = XLSX.utils.encode_cell({ r: i, c: 0 });
    if (!ws[cell]) continue;
    ws[cell].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "EDF2F7" } }
    };
  }

  // Ajustar largura das colunas
  ws['!cols'] = [{ wch: 30 }, { wch: 40 }];

  const filename = `simulacao_drycooler_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const exportToCSV = (simulationData) => {
  const rows = [
    ['Tipo', 'Consumo Hora (L/h)', 'Consumo Dia (L/dia)', 'Consumo Mês (L/mês)', 'Consumo Ano (L/ano)'],
    [
      'DryCooler',
      simulationData.results.drycooler.consumption.hourly.toFixed(2),
      simulationData.results.drycooler.consumption.daily.toFixed(2),
      simulationData.results.drycooler.consumption.monthly.toFixed(2),
      simulationData.results.drycooler.consumption.yearly.toFixed(2)
    ],
    [
      'Torre',
      simulationData.results.tower.consumption.hourly.toFixed(2),
      simulationData.results.tower.consumption.daily.toFixed(2),
      simulationData.results.tower.consumption.monthly.toFixed(2),
      simulationData.results.tower.consumption.yearly.toFixed(2)
    ]
  ];

  const csvContent = rows.map(row => row.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `simulacao_drycooler_${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, filename);
};
