import { useState, useEffect } from 'react'
import { cityParameters } from '../config/cityParameters'

const useSimulator = () => {
  const [inputs, setInputs] = useState({
    capacity: 500,
    location: 'São Paulo',
    deltaT: 6,
    waterFlow: 71.7,
    operatingHours: 24 // Horas de operação por dia (padrão: 24h)
  })

  const [results, setResults] = useState({
    drycooler: {
      moduleCapacity: 0,
      modules: 0,
      totalCapacity: 0,
      nominalWaterFlow: 0,
      evaporationPercentage: 0,
      evaporationFlow: 0,
      consumption: {
        hourly: 0,
        daily: 0,
        monthly: 0,
        yearly: 0
      }
    },
    tower: {
      capacity: 0,
      nominalWaterFlow: 0,
      evaporationPercentage: 0,
      evaporationFlow: 0,
      consumption: {
        hourly: 0,
        daily: 0,
        monthly: 0,
        yearly: 0
      }
    },
    comparison: {
      yearlyDifference: 0,
      yearlyDifferencePercentage: 0
    }
  })

  const locations = [
    'São Paulo', 'Rio de Janeiro', 'Manaus', 'Brasília',
    'Recife', 'Fortaleza', 'Florianópolis', 'Belo Horizonte',
    'Porto Alegre', 'Salvador', 'Campinas'
  ]

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const newValue = name === 'operatingHours' || name === 'capacity' ? 
      (value === '' ? '' : Number(value)) : value;
    
    setInputs(prev => ({
      ...prev,
      [name]: newValue
    }));
  }

  const calculateResults = () => {
    const cityParams = cityParameters[inputs.location]

    // Fator de operação baseado nas horas de operação (padrão 24h)
    const operatingFactor = (inputs.operatingHours || 0) / 24;
    
    // Drycooler calculations
    const drycooler = {
      moduleCapacity: cityParams.capacity,
      modules: Math.ceil(inputs.capacity / cityParams.capacity),
      totalCapacity: Math.ceil(inputs.capacity / cityParams.capacity) * cityParams.capacity,
      nominalWaterFlow: cityParams.waterFlow,
      evaporationPercentage: cityParams.makeupWaterFanLogic,
      evaporationFlow: (cityParams.waterFlow * cityParams.makeupWaterFanLogic) / 100,
      operatingHours: inputs.operatingHours || 24
    }

    // Ajustar consumo com base nas horas de operação
    drycooler.consumption = {
      hourly: drycooler.evaporationFlow * operatingFactor,
      daily: drycooler.evaporationFlow * (inputs.operatingHours || 24),
      monthly: drycooler.evaporationFlow * (inputs.operatingHours || 24) * 30,
      yearly: drycooler.evaporationFlow * (inputs.operatingHours || 24) * 365
    }

    // Tower calculations
    const tower = {
      capacity: inputs.capacity,
      nominalWaterFlow: inputs.waterFlow,
      evaporationPercentage: cityParams.waterConsumptionFanLogic / 100,
      evaporationFlow: (inputs.waterFlow * (cityParams.waterConsumptionFanLogic / 100)),
      operatingHours: inputs.operatingHours || 24
    }

    // Ajustar consumo com base nas horas de operação
    tower.consumption = {
      hourly: tower.evaporationFlow * operatingFactor,
      daily: tower.evaporationFlow * (inputs.operatingHours || 24),
      monthly: tower.evaporationFlow * (inputs.operatingHours || 24) * 30,
      yearly: tower.evaporationFlow * (inputs.operatingHours || 24) * 365
    }

    // Calculate comparison
    const comparison = {
      yearlyDifference: tower.consumption.yearly - drycooler.consumption.yearly,
      yearlyDifferencePercentage: ((tower.consumption.yearly - drycooler.consumption.yearly) / tower.consumption.yearly * 100)
    }

    setResults({ drycooler, tower, comparison })
  }

  useEffect(() => {
    calculateResults()
  }, [inputs])

  return {
    inputs,
    handleInputChange,
    results,
    locations
  }
}

export default useSimulator