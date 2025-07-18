
import { useState, useEffect, useCallback } from 'react';
import { getCities, saveSimulation } from '../services/simulationService';

const useSimulator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [budgetRequestData, setBudgetRequestData] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [inputs, setInputs] = useState({
    capacity: 500,
    location: 'São Paulo',
    deltaT: 6,
    waterFlow: 71.7,
    operatingHours: 24,
    operatingDays: 365,
  });
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    state: '',
  });
  const [results, setResults] = useState({
    comparison: {
      yearlyDifference: 0,
      yearlyDifferencePercentage: 0
    }
  });
  const [selectedCity, setSelectedCity] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Move the calculateResults function before the useEffect that uses it
  const calculateResults = useCallback((inputParams = inputs) => {
    const { capacity, operatingHours, operatingDays } = inputParams;
    
    const drycoolerHourlyConsumption = capacity * 0.00186;
    const drycoolerDailyConsumption = drycoolerHourlyConsumption * operatingHours;
    const drycoolerMonthlyConsumption = drycoolerDailyConsumption * 30;
    const drycoolerYearlyConsumption = drycoolerDailyConsumption * operatingDays;
    
    const towerHourlyConsumption = capacity * 0.019;
    const towerDailyConsumption = towerHourlyConsumption * operatingHours;
    const towerMonthlyConsumption = towerDailyConsumption * 30;
    const towerYearlyConsumption = towerDailyConsumption * operatingDays;
    
    const yearlyDifference = towerYearlyConsumption - drycoolerYearlyConsumption;
    const yearlyDifferencePercentage = (yearlyDifference / towerYearlyConsumption) * 100;

    return {
      drycooler: {
        moduleCapacity: 168.74,
        modules: Math.ceil(capacity / 168.74),
        totalCapacity: Math.ceil(capacity / 168.74) * 168.74,
        nominalWaterFlow: 24.2,
        evaporationPercentage: 0.16,
        evaporationFlow: 0.0387,
        consumption: {
          hourly: drycoolerHourlyConsumption,
          daily: drycoolerDailyConsumption,
          monthly: drycoolerMonthlyConsumption,
          yearly: drycoolerYearlyConsumption,
        },
      },
      tower: {
        capacity: capacity,
        consumption: {
          hourly: towerHourlyConsumption,
          daily: towerDailyConsumption,
          monthly: towerMonthlyConsumption,
          yearly: towerYearlyConsumption,
        },
      },
      savings: {
        water: {
          daily: towerDailyConsumption - drycoolerDailyConsumption,
          monthly: towerMonthlyConsumption - drycoolerMonthlyConsumption,
          yearly: yearlyDifference,
        },
        cost: {
          daily: (towerDailyConsumption - drycoolerDailyConsumption) * 0.0105,
          monthly: (towerMonthlyConsumption - drycoolerMonthlyConsumption) * 0.0105,
          yearly: yearlyDifference * 0.0105,
        },
        co2: {
          daily: (towerDailyConsumption - drycoolerDailyConsumption) * 0.00058,
          monthly: (towerMonthlyConsumption - drycoolerMonthlyConsumption) * 0.00058,
          yearly: yearlyDifference * 0.00058,
        },
      },
      comparison: {
        yearlyDifference,
        yearlyDifferencePercentage,
      },
    };
  }, [inputs]);

  // Recalculate results whenever inputs or selected city changes
  useEffect(() => {
    // Only calculate if we have all required inputs
    if (inputs.capacity && inputs.operatingHours && inputs.operatingDays) {
      const newResults = calculateResults(inputs);
      setResults(newResults);
    }
  }, [inputs, calculateResults]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const citiesData = await getCities();
        if (isMounted) {
          setCities(citiesData);
          if (inputs.location && citiesData?.length > 0) {
            const city = citiesData.find(
              (c) =>
                c.name === inputs.location ||
                c.name.toLowerCase() === inputs.location.toLowerCase()
            );
            if (city) setSelectedCity(city);
          }
        }
      } catch (error) {
        if (isMounted) {
          setNotification({
            open: true,
            message: 'Erro ao carregar dados iniciais. Usando valores padrão.',
            severity: 'warning',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [inputs.location]);

  const handleNext = () => {
    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps((prev) => [...prev, activeStep]);
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStartSimulation = () => {
    setShowSimulator(true);
    setSimulationStarted(true);
    setActiveStep(1);
  };

  const handleRestart = () => {
    setShowSimulator(false);
    setSimulationStarted(false);
    setSimulationCompleted(false);
    setActiveStep(0);
    setCompletedSteps([]);
    setBudgetRequestData(null);
    setUserData({
      name: '',
      email: '',
      company: '',
      phone: '',
      state: '',
    });
    setInputs({
      capacity: 500,
      location: 'São Paulo',
      deltaT: 6,
      waterFlow: 71.7,
      operatingHours: 24,
      operatingDays: 365,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserDataChange = (newUserData) => {
    setUserData(newUserData);
  };

  const handleParametersChange = (newParams) => {
    setInputs((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  const handleCityChange = useCallback((city) => {
    if (!city) return;
    
    // Update the selected city
    setSelectedCity(city);
    
    // Update inputs with the new city's data
    setInputs(prev => ({
      ...prev,
      location: city.name,
      // Add any other city-specific parameters that affect calculations
      // For example, if cities have different default values:
      // deltaT: city.defaultDeltaT || prev.deltaT,
      // waterFlow: city.defaultWaterFlow || prev.waterFlow
    }));
    
    // Note: The results will be automatically recalculated by the useEffect
    // that watches for changes in the inputs
  }, []);

  const handleFinishSimulation = () => {
    // Mark the current step as completed
    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps(prev => [...prev, activeStep]);
    }
    
    // Move to the next step
    handleNext();
    
    // Open the budget request modal
    setBudgetModalOpen(true);
  };

  const handleBudgetRequest = async (budgetData) => {
    try {
      setIsLoading(true);
      const simulationData = {
        userData,
        inputs,
        results: {
          drycooler: {
            consumption: results.drycooler.consumption,
            modules: results.drycooler.modules,
            totalCapacity: results.drycooler.totalCapacity,
          },
          tower: { consumption: results.tower.consumption },
          comparison: {
            yearlyDifference: results.comparison.yearlyDifference,
            yearlyDifferencePercentage: results.comparison.yearlyDifferencePercentage,
          },
        },
        budgetRequest: {
          wantsBudget: budgetData.wantsBudget,
          additionalInfo: budgetData.additionalInfo,
        },
        timestamp: new Date().toISOString(),
        location: inputs.location,
        capacity: inputs.capacity,
      };

      await saveSimulation(simulationData);
      setCompletedSteps((prev) => [...prev, activeStep]);
      setBudgetRequestData(budgetData);
      setSimulationCompleted(true);
      setActiveStep(5);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erro ao salvar a simulação. Tente novamente mais tarde.',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
      setBudgetModalOpen(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 1:
        return userData.name && userData.email;
      case 2:
        return inputs.capacity > 0;
      case 3:
        return selectedCity !== null;
      default:
        return true;
    }
  };

  return {
    activeStep,
    isLoading,
    cities,
    showSimulator,
    simulationStarted,
    completedSteps,
    simulationCompleted,
    budgetRequestData,
    notification,
    inputs,
    userData,
    results,
    selectedCity,
    budgetModalOpen,
    setBudgetModalOpen, // Add this line to expose setBudgetModalOpen
    handleNext,
    handleBack,
    handleStartSimulation,
    handleRestart,
    handleInputChange,
    handleUserDataChange,
    handleParametersChange,
    handleCityChange,
    handleFinishSimulation,
    handleBudgetRequest,
    canProceed,
    setNotification,
    setDarkMode: () => {}, // Placeholder for now
  };
};

export default useSimulator;
