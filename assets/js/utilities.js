export async function makeApiCall(url, method, payload = null) {
    try {
      const options = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json', 
        },
      };
  
      if (method.toUpperCase() === 'GET' && payload) {
        const queryString = Object.entries(payload)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
  
        url += `?${queryString}`;
      } else {
        options.body = payload ? JSON.stringify(payload) : undefined;
      }
  
      const response = await fetch(url, options);
  
   
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        
        throw new Error(`API request failed with status ${response.status}`);
      }
    } catch (error) {
     
      console.error('API call error:', error.message);
      throw error;
    }
  }
  

 export function formatTimestamp(timestamp) {
    const currentDate = new Date();
    const inputDate = new Date(timestamp);
  
   
    if (
      inputDate.getDate() === currentDate.getDate() &&
      inputDate.getMonth() === currentDate.getMonth() &&
      inputDate.getFullYear() === currentDate.getFullYear()
    ) {
    
      const formattedTime = inputDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
      return `Today, ${formattedTime}`;
    }
  
  
    const yesterday = new Date();
    yesterday.setDate(currentDate.getDate() - 1);
    if (
      inputDate.getDate() === yesterday.getDate() &&
      inputDate.getMonth() === yesterday.getMonth() &&
      inputDate.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    }
  
 
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(currentDate.getDate() - 7);
    if (inputDate >= oneWeekAgo) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = daysOfWeek[inputDate.getDay()];
      return dayOfWeek;
    }
  
    
    const formattedDate = inputDate.toLocaleDateString('en-GB');
    return formattedDate;
  }
  
  