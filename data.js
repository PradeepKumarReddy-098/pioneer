const getApiData = async () => {
    try {
      const response = await fetch("https://api.publicapis.org/entries");
      const data = await response.json();
      return data; // Return the actual data
    } catch (err) {
      console.error('Error fetching data:', err);
      throw err; // Re-throw for error handling in routes
    }
  };
  
  // Export the function directly (optional)
  module.exports = getApiData;