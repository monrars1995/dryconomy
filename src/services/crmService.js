// CRM Integration Service

const RAMPER_API_ENDPOINT = process.env.REACT_APP_RAMPER_API_ENDPOINT;
const RAMPER_API_KEY = process.env.REACT_APP_RAMPER_API_KEY;

// Function to send lead data to Ramper CRM
export const submitLeadToRamper = async (leadData) => {
  try {
    const response = await fetch(`${RAMPER_API_ENDPOINT}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RAMPER_API_KEY}`,
      },
      body: JSON.stringify({
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        phone: leadData.phone,
        state: leadData.state,
        source: 'Dryconomy Calculator',
        calculationResults: leadData.results
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit lead to CRM');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting lead to CRM:', error);
    throw error;
  }
};

// Function to save calculation history
export const saveCalculationHistory = async (calculationData) => {
  try {
    // Here we would typically save to a database
    // For now, we'll use localStorage as a temporary solution
    const history = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
    history.push({
      ...calculationData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('calculationHistory', JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('Error saving calculation history:', error);
    return false;
  }
};

// Function to get calculation history
export const getCalculationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('calculationHistory') || '[]');
  } catch (error) {
    console.error('Error retrieving calculation history:', error);
    return [];
  }
};

// Function to generate detailed report
export const generateDetailedReport = (calculationData) => {
  // This would typically generate a PDF or detailed report format
  // For now, we'll return a structured object
  return {
    timestamp: new Date().toISOString(),
    location: calculationData.location,
    systemComparison: {
      drycooler: calculationData.drycooler,
      tower: calculationData.tower
    },
    savings: {
      water: calculationData.comparison.yearlyDifference,
      percentage: calculationData.comparison.yearlyDifferencePercentage
    },
    environmentalImpact: {
      waterSaved: calculationData.comparison.yearlyDifference,
      sustainabilityScore: calculateSustainabilityScore(calculationData)
    }
  };
};

// Helper function to calculate sustainability score
const calculateSustainabilityScore = (data) => {
  // This would implement a scoring algorithm based on water savings
  // For now, we'll use a simple calculation
  const maxScore = 100;
  const score = (data.comparison.yearlyDifferencePercentage / 100) * maxScore;
  return Math.min(Math.max(score, 0), maxScore); // Ensure score is between 0 and 100
};