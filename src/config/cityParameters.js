export const cityParameters = {
  'São Paulo': {
    capacity: 168.74,
    tin: 41,
    tout: 35,
    waterFlow: 24.2,
    waterConsumptionYearTemp: 171,
    makeupWaterTemp: 0.08,
    waterConsumptionYearFan: 334,
    makeupWaterFanLogic: 0.16,
    waterConsumptionFanLogic: 1.90
  },
  'Rio de Janeiro': {
    capacity: 123.24,
    tin: 41,
    tout: 35,
    waterFlow: 17.7,
    waterConsumptionYearTemp: 94,
    makeupWaterTemp: 0.06,
    waterConsumptionYearFan: 244,
    makeupWaterFanLogic: 0.16,
    waterConsumptionFanLogic: 1.90
  },
  'Manaus': {
    capacity: 113.65,
    tin: 41,
    tout: 35,
    waterFlow: 16.3,
    waterConsumptionYearTemp: 260,
    makeupWaterTemp: 0.18,
    waterConsumptionYearFan: 379,
    makeupWaterFanLogic: 0.27,
    waterConsumptionFanLogic: 1.90
  },
  'Brasília': {
    capacity: 175.90,
    tin: 41,
    tout: 35,
    waterFlow: 25.2,
    waterConsumptionYearTemp: 350,
    makeupWaterTemp: 0.16,
    waterConsumptionYearFan: 510,
    makeupWaterFanLogic: 0.23,
    waterConsumptionFanLogic: 1.90
  },
  'Recife': {
    capacity: 111.83,
    tin: 41,
    tout: 35,
    waterFlow: 16.0,
    waterConsumptionYearTemp: 214,
    makeupWaterTemp: 0.15,
    waterConsumptionYearFan: 396,
    makeupWaterFanLogic: 0.28,
    waterConsumptionFanLogic: 1.90
  },
  'Fortaleza': {
    capacity: 137.63,
    tin: 41,
    tout: 35,
    waterFlow: 19.7,
    waterConsumptionYearTemp: 254,
    makeupWaterTemp: 0.15,
    waterConsumptionYearFan: 401,
    makeupWaterFanLogic: 0.23,
    waterConsumptionFanLogic: 1.90
  },
  'Florianópolis': {
    capacity: 138.23,
    tin: 41,
    tout: 35,
    waterFlow: 19.8,
    waterConsumptionYearTemp: 58,
    makeupWaterTemp: 0.03,
    waterConsumptionYearFan: 162,
    makeupWaterFanLogic: 0.09,
    waterConsumptionFanLogic: 1.90
  },
  'Belo Horizonte': {
    capacity: 168.60,
    tin: 41,
    tout: 35,
    waterFlow: 24.2,
    waterConsumptionYearTemp: 236,
    makeupWaterTemp: 0.11,
    waterConsumptionYearFan: 480,
    makeupWaterFanLogic: 0.23,
    waterConsumptionFanLogic: 1.90
  },
  'Porto Alegre': {
    capacity: 135.03,
    tin: 41,
    tout: 35,
    waterFlow: 19.4,
    waterConsumptionYearTemp: 99,
    makeupWaterTemp: 0.06,
    waterConsumptionYearFan: 184,
    makeupWaterFanLogic: 0.11,
    waterConsumptionFanLogic: 1.90
  },
  'Salvador': {
    capacity: 119.86,
    tin: 41,
    tout: 35,
    waterFlow: 17.2,
    waterConsumptionYearTemp: 101,
    makeupWaterTemp: 0.07,
    waterConsumptionYearFan: 295,
    makeupWaterFanLogic: 0.20,
    waterConsumptionFanLogic: 1.90
  },
  'Campinas': {
    capacity: 159.51,
    tin: 41,
    tout: 35,
    waterFlow: 22.8631,
    waterConsumptionYearTemp: 192,
    makeupWaterTemp: 0.10,
    waterConsumptionYearFan: 346,
    makeupWaterFanLogic: 0.17,
    waterConsumptionFanLogic: 1.90
  }
};

// Parâmetros comuns para todas as cidades
export const commonParameters = {
  deltaT: 6, // Diferença entre Tin (41°C) e Tout (35°C)
  operationHours: 8760, // Operação 24/7 (365 dias * 24 horas)
};