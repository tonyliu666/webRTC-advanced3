import axios from "axios";

const serverApi = "http://localhost:5002/api";

export const getRoomExists = async (roomId) => {
  const response = await axios.get(`${serverApi}/room-exists/${roomId}`);
  return response.data;
};

export const getTURNCredentials = async () => {
  const response = await axios.get(`${serverApi}/get-turn-credentials`);
  return response.data;
};

// -----------------------------------
// expose client metrics to backend protheuse nodejs library 
export const SendMessagesMetrics  = async (exectime) => {
  const payload = exectime ;
  if(payload.labels==='message'){
    
    const response = await axios.post(serverApi+'/messagetime', 
    payload,
    )
    .then((response) => {
      console.log('Response: ', response.data);
    })
    .catch((error) => {
      console.error('Error: ', error.message);
    })
    return response;
  }
  else if(payload.labels==='createroom'){
    const response = await axios.post(serverApi+'/createroom', 
    payload,
    )
    .then((response) => {
      console.log('Response: ', response.data);
    })
    .catch((error) => {
      console.error('Error: ', error.message);
    })
    return response;
  }
  else if(payload.labels==='screenon'){
    const response = await axios.post(serverApi+'/screenon', 
      payload,
    )
    .then((response) => {
      console.log('Response: ', response.data);
    })
    .catch((error) => {
      console.error('Error: ', error.message);
    })
    return response;
  }
  else if(payload.labels==='screenoff'){
    const response = await axios.post(serverApi+'/screenoff', 
      payload,
    )
    .then((response) => {
      console.log('Response: ', response.data);
    })
    .catch((error) => {
      console.error('Error: ', error.message);
    })
    return response;
  }
};




