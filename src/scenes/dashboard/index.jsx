import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { tokens } from "../../theme";
import axios from 'axios'; // Import Axios for making HTTP requests
import FilterListIcon from '@mui/icons-material/FilterList';
import Header from "../../components/Header";
import { mockalerts } from "../../data/mockData";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openFilter, setOpenFilter] = useState(false);
  const [openLiveData, setOpenLiveData] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedParameter, setSelectedParameter] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  const [liveMachine, setLiveMachine] = useState('');
  const [liveParameter, setLiveParameter] = useState('');
  const [liveComponent, setLiveComponent] = useState('');
  const [liveValue, setLiveValue] = useState('');
  const [probability, setProbability] = useState('');
  const [suggestion, setSuggestion] = useState(''); // State to hold the suggestion

  const TELEGRAM_BOT_TOKEN = '7488203839:AAEQkJRmwE_YJlRVoRDCsL75NGt4OEIt_CE'; // Replace with your Telegram bot token
  const TELEGRAM_CHAT_ID = '5754347459'; // Replace with your chat ID
  const OPENAI_API_KEY = 'sk-proj-eWdoPyfVKdykASDYtt9nT3BlbkFJYoZ9EqzAiipnwTaMkwib'; // Replace with your OpenAI API key

  const handleOpenFilter = () => setOpenFilter(true);
  const handleCloseFilter = () => setOpenFilter(false);

  const handleOpenLiveData = () => setOpenLiveData(true);
  const handleCloseLiveData = () => setOpenLiveData(false);

  const handleMachineChange = (event) => {
    setSelectedMachine(event.target.value);
  };

  const handleComponentChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  const handleParameterChange = (event) => {
    setSelectedParameter(event.target.value);
  };

  const handleLiveMachineChange = (event) => {
    setLiveMachine(event.target.value);
  };

  const handleLiveParameterChange = (event) => {
    setLiveParameter(event.target.value);
    if (event.target.value === 'Temperature') {
      setLiveComponent(''); // Reset component selection when parameter changes
    } else {
      setLiveComponent(''); // Disable component dropdown if not Temperature
    }
  };

  const handleLiveComponentChange = (event) => {
    setLiveComponent(event.target.value);
  };

  const handleLiveValueChange = (event) => {
    setLiveValue(event.target.value);
  };

  const sendTelegramNotification = async (message) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const params = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    };
    
    try {
      await axios.post(url, params);
    } catch (error) {
      console.error("Error sending Telegram notification", error);
    }
  };

  const fetchSuggestion = async () => {
    const messages = [
      {
        role: "system",
        content: "You are an expert maintenance technician  at caterpillar company providing concise suggestions of about 50 words to reduce machine downtime.provide only the suggestion steps to prevent the failure"
      },
      {
        role: "user",
        content: `Machine: ${liveMachine}\nParameter: ${liveParameter}\nComponent: ${liveComponent || 'N/A'}\nValue: ${liveValue}\n\nProvide a maintenance suggestion to reduce downtime.`
      }
    ];

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4', // or 'gpt-3.5-turbo' depending on your needs
        messages: messages,
        max_tokens: 150,
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const generatedSuggestion = response.data.choices[0].message.content.trim();
      setSuggestion(generatedSuggestion);
    } catch (error) {
      console.error("Error fetching suggestion from OpenAI:", error.response ? error.response.data : error.message);

      if (error.response) {
        if (error.response.status === 401) {
          setSuggestion("Invalid API Key. Please check your OpenAI API key.");
        } else if (error.response.status === 429) {
          setSuggestion("Rate limit exceeded. Please wait and try again later.");
        } else {
          setSuggestion(`Error: ${error.response.data.error.message}`);
        }
      } else {
        setSuggestion("Unable to fetch suggestion at the moment due to network or other issues.");
      }
    }
  };

  const calculateProbability = () => {
    let failureProbability = 'Low';

    if (liveParameter === 'Oil Pressure' && (liveValue > 65 || liveValue < 25)) {
      failureProbability = 'High';
    } else if (liveParameter === 'Speed' && liveValue > 1800) {
      failureProbability = 'Medium';
    } else if (liveParameter === 'Temperature' && liveComponent === 'Engine' && liveValue > 105) {
      failureProbability = 'High';
    } else if (liveParameter === 'Temperature' && liveComponent === 'Fuel' && liveValue > 400) {
      failureProbability = 'High';
    } else if (liveParameter === 'Brake Control' && liveValue < 1) {
      failureProbability = 'Medium';
    } else if (liveParameter === 'Transmission Pressure' && (liveValue > 450 || liveValue < 200)) {
      failureProbability = 'Medium';
    } else if (liveParameter === 'Pedal Sensor' && liveValue > 4.7) {
      failureProbability = 'Low';
    } else if (liveParameter === 'Water Fuel' && liveValue > 1800) {
      failureProbability = 'High';
    } else if (liveParameter === 'Fuel Pressure' && (liveValue > 65 || liveValue < 35)) {
      failureProbability = 'High';
    } else if (liveParameter === 'System Voltage' && (liveValue > 15 || liveValue < 12)) {
      failureProbability = 'High';
    } else if (liveParameter === 'Exhaust Gas Temperature' && liveValue > 365) {
      failureProbability = 'High';
    } else if (liveParameter === 'Hydraulic Pump Rate' && liveValue > 125) {
      failureProbability = 'Medium';
    } else if (liveParameter === 'Air Filter Pressure Drop' && liveValue < 20) {
      failureProbability = 'Medium';
    }

    setProbability(failureProbability);

    if (failureProbability === 'High') {
      const message = `⚠️ High Probability of Failure Detected ⚠️\nMachine: ${liveMachine}\nParameter: ${liveParameter}\nComponent: ${liveComponent || 'N/A'}\nValue: ${liveValue}`;
      sendTelegramNotification(message);
      fetchSuggestion(); // Fetch suggestion when probability is high
    }
  };

  const handleLiveDataSubmit = () => {
    calculateProbability();
    setOpenLiveData(false);
    alert(`Probability of Failure: ${probability}`);
  };

  const filteredTransactions = useMemo(() => {
    return mockalerts.filter((alerts) => {
      if (alerts.Probability_Failure !== "High") return false;
      if (selectedMachine && alerts.Machine !== selectedMachine) return false;
      if (selectedComponent && alerts.Component !== selectedComponent) return false;
      if (selectedParameter && alerts.Parameter_x !== selectedParameter) return false;
      return true;
    });
  }, [selectedMachine, selectedComponent, selectedParameter]);

  const loadMore = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Caterpillar Maintenance Dashboard" />

        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              marginRight: "10px",
            }}
            onClick={handleOpenFilter}
          >
            <FilterListIcon sx={{ mr: "10px" }} />
            Filter Alerts
          </Button>
        </Box>
      </Box>

      {/* FILTER DIALOG */}
      <Dialog open={openFilter} onClose={handleCloseFilter}>
        <DialogTitle>Filter Alerts</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="machine-label">Machine</InputLabel>
            <Select
              labelId="machine-label"
              value={selectedMachine}
              onChange={handleMachineChange}
            >
              <MenuItem value="Backhoe_Loader_1">Backhoe_Loader_1</MenuItem>
              <MenuItem value="Articulated_Truck_1">Articulated_Truck_1</MenuItem>
              <MenuItem value="Excavator_1">Excavator_1</MenuItem>
              <MenuItem value="Dozer_1">Dozer_1</MenuItem>
              <MenuItem value="Asphalt_Paver_1">Asphalt_Paver_1</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="component-label">Component</InputLabel>
            <Select
              labelId="component-label"
              value={selectedComponent}
              onChange={handleComponentChange}
            >
              <MenuItem value="Drive">Drive</MenuItem>
              <MenuItem value="Engine">Engine</MenuItem>
              <MenuItem value="Fuel">Fuel</MenuItem>
              <MenuItem value="Misc">Misc</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="parameter-label">Parameter</InputLabel>
            <Select
              labelId="parameter-label"
              value={selectedParameter}
              onChange={handleParameterChange}
            >
              <MenuItem value="Brake Control">Brake Control</MenuItem>
              <MenuItem value="Exhaust Gas Temperature">Exhaust Gas Temperature</MenuItem>
              <MenuItem value="Hydraulic Pump Rate">Hydraulic Pump Rate</MenuItem>
              <MenuItem value="Level">Level</MenuItem>
              <MenuItem value="Oil Pressure">Oil Pressure</MenuItem>
              <MenuItem value="Pedal Sensor">Pedal Sensor</MenuItem>
              <MenuItem value="Pressure">Pressure</MenuItem>
              <MenuItem value="Speed">Speed</MenuItem>
              <MenuItem value="System Voltage">System Voltage</MenuItem>
              <MenuItem value="Temperature">Temperature</MenuItem>
              <MenuItem value="Transmission Pressure">Transmission Pressure</MenuItem>
              <MenuItem value="Water Fuel">Water Fuel</MenuItem>
              <MenuItem value="Water in Fuel">Water in Fuel</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilter} color="primary">Cancel</Button>
          <Button onClick={handleCloseFilter} color="primary">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Alerts
            </Typography>
          </Box>
          {filteredTransactions.slice(0, visibleCount).map((transaction, i) => (
            <Box
              key={`${transaction.Id}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="25px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.Id}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.Machine}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.Component}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.Parameter_x}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{transaction.Date}</Box>
              <Box
                backgroundColor={colors.redAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {transaction.Probability_Failure}
              </Box>
            </Box>
          ))}
          {visibleCount < filteredTransactions.length && (
            <Button
              onClick={loadMore}
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                margin: "20px",
                display: "block",
                width: "100%"
              }}
            >
              Load More
            </Button>
          )}
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          p="20px"
          flexDirection="column"
        >
          <Button
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              mb: "10px",
            }}
            onClick={handleOpenLiveData}
          >
            Add Live Data
          </Button>

          {/* Suggestion Box */}
          {suggestion && (
            <Box
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "20px",
                borderRadius: "5px",
                width: "100%",
                textAlign: "left",
              }}
            >
              <Typography variant="h6">Suggestion:</Typography>
              <Typography>{suggestion}</Typography>
            </Box>
          )}
        </Box>

        {/* Live Data Dialog */}
        <Dialog open={openLiveData} onClose={handleCloseLiveData}>
          <DialogTitle>Add Live Data</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel id="live-machine-label">Machine</InputLabel>
              <Select
                labelId="live-machine-label"
                value={liveMachine}
                onChange={handleLiveMachineChange}
              >
                <MenuItem value="Articulated_Truck_1">Articulated_Truck_1</MenuItem>
                <MenuItem value="Asphalt_Paver_1">Asphalt_Paver_1</MenuItem>
                <MenuItem value="Backhoe_Loader_1">Backhoe_Loader_1</MenuItem>
                <MenuItem value="Dozer_1">Dozer_1</MenuItem>
                <MenuItem value="Excavator_1">Excavator_1</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="live-parameter-label">Parameter</InputLabel>
              <Select
                labelId="live-parameter-label"
                value={liveParameter}
                onChange={handleLiveParameterChange}
              >
                <MenuItem value="Brake Control">Brake Control</MenuItem>
                <MenuItem value="Exhaust Gas Temperature">Exhaust Gas Temperature</MenuItem>
                <MenuItem value="Hydraulic Pump Rate">Hydraulic Pump Rate</MenuItem>
                <MenuItem value="Level">Level</MenuItem>
                <MenuItem value="Oil Pressure">Oil Pressure</MenuItem>
                <MenuItem value="Pedal Sensor">Pedal Sensor</MenuItem>
                <MenuItem value="Pressure">Pressure</MenuItem>
                <MenuItem value="Speed">Speed</MenuItem>
                <MenuItem value="System Voltage">System Voltage</MenuItem>
                <MenuItem value="Temperature">Temperature</MenuItem>
                <MenuItem value="Transmission Pressure">Transmission Pressure</MenuItem>
                <MenuItem value="Water Fuel">Water Fuel</MenuItem>
                <MenuItem value="Water in Fuel">Water in Fuel</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={liveParameter !== 'Temperature'}>
              <InputLabel id="live-component-label">Component</InputLabel>
              <Select
                labelId="live-component-label"
                value={liveComponent}
                onChange={handleLiveComponentChange}
                disabled={liveParameter !== 'Temperature'}
              >
                <MenuItem value="Engine">Engine</MenuItem>
                <MenuItem value="Fuel">Fuel</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Value"
              type="number"
              value={liveValue}
              onChange={handleLiveValueChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLiveData} color="primary">Cancel</Button>
            <Button onClick={handleLiveDataSubmit} color="primary">Submit</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Box>
  );
};

export default Dashboard;
