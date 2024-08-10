import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Added for scatter plot
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterListIcon from '@mui/icons-material/FilterList';
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import { mockalerts } from "../../data/mockData";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openGraphDialog, setOpenGraphDialog] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [selectedParameter, setSelectedParameter] = useState('');
  const [selectedGraphMachine, setSelectedGraphMachine] = useState('');
  const [selectedGraphComponent, setSelectedGraphComponent] = useState('');
  const [selectedGraphParameter, setSelectedGraphParameter] = useState('');

  const handleFilterOpen = () => setOpenFilterDialog(true);
  const handleFilterClose = () => setOpenFilterDialog(false);

  const handleGraphOpen = () => setOpenGraphDialog(true);
  const handleGraphClose = () => setOpenGraphDialog(false);

  const handleMachineChange = (event) => setSelectedMachine(event.target.value);
  const handleComponentChange = (event) => setSelectedComponent(event.target.value);
  const handleParameterChange = (event) => setSelectedParameter(event.target.value);

  const handleGraphMachineChange = (event) => setSelectedGraphMachine(event.target.value);
  const handleGraphComponentChange = (event) => setSelectedGraphComponent(event.target.value);
  const handleGraphParameterChange = (event) => setSelectedGraphParameter(event.target.value);

  const filteredTransactions = useMemo(() => {
    return mockalerts.filter((alerts) => {
      if (alerts.Probability_Failure !== "High") return false;
      if (selectedMachine && alerts.Machine !== selectedMachine) return false;
      if (selectedComponent && alerts.Component !== selectedComponent) return false;
      if (selectedParameter && alerts.Parameter_x !== selectedParameter) return false;
      return true;
    });
  }, [selectedMachine, selectedComponent, selectedParameter]);

  const filteredGraphData = useMemo(() => {
    return mockalerts.filter((alert) => {
      if (selectedGraphMachine && alert.Machine !== selectedGraphMachine) return false;
      if (selectedGraphComponent && alert.Component !== selectedGraphComponent) return false;
      if (selectedGraphParameter && alert.Parameter_x !== selectedGraphParameter) return false;
      return true;
    }).map((alert) => ({
      x: new Date(alert.Date).getTime(),
      y: alert.Probability_Failure,
    }));
  }, [selectedGraphMachine, selectedGraphComponent, selectedGraphParameter]);

  const yAxisTicks = ['Low', 'Medium', 'High'];

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
            onClick={handleFilterOpen}
          >
            <FilterListIcon sx={{ mr: "10px" }} />
            Filter Alerts
          </Button>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              marginRight: "10px",
            }}
            onClick={handleGraphOpen}
          >
            Graph Filtering
          </Button>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* FILTER DIALOG */}
      <Dialog open={openFilterDialog} onClose={handleFilterClose}>
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
          <Button onClick={handleFilterClose} color="primary">Cancel</Button>
          <Button onClick={handleFilterClose} color="primary">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* GRAPH FILTER DIALOG */}
      <Dialog open={openGraphDialog} onClose={handleGraphClose}>
        <DialogTitle>Graph Filtering</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="graph-machine-label">Machine</InputLabel>
            <Select
              labelId="graph-machine-label"
              value={selectedGraphMachine}
              onChange={handleGraphMachineChange}
            >
              <MenuItem value="Backhoe_Loader_1">Backhoe_Loader_1</MenuItem>
              <MenuItem value="Articulated_Truck_1">Articulated_Truck_1</MenuItem>
              <MenuItem value="Excavator_1">Excavator_1</MenuItem>
              <MenuItem value="Dozer_1">Dozer_1</MenuItem>
              <MenuItem value="Asphalt_Paver_1">Asphalt_Paver_1</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="graph-component-label">Component</InputLabel>
            <Select
              labelId="graph-component-label"
              value={selectedGraphComponent}
              onChange={handleGraphComponentChange}
            >
              <MenuItem value="Drive">Drive</MenuItem>
              <MenuItem value="Engine">Engine</MenuItem>
              <MenuItem value="Fuel">Fuel</MenuItem>
              <MenuItem value="Misc">Misc</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="graph-parameter-label">Parameter</InputLabel>
            <Select
              labelId="graph-parameter-label"
              value={selectedGraphParameter}
              onChange={handleGraphParameterChange}
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
          <Button onClick={handleGraphClose} color="primary">Cancel</Button>
          <Button onClick={handleGraphClose} color="primary">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Revenue Generated
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                $59,342.32
              </Typography>
            </Box>
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
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
          {filteredTransactions.map((transaction, i) => (
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
        </Box>

        {/* ROW 3 - Scatter Plot */}
        <Box
          gridColumn="span 12"
          gridRow="span 4"
          backgroundColor={colors.primary[400]}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Graph Based on Filtering
          </Typography>
          <Box height="400px">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Date"
                  domain={['auto', 'auto']}
                  tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
                />
                <YAxis
                  type="category"
                  dataKey="y"
                  name="Probability_Failure"
                  domain={['Low', 'High']}
                  ticks={yAxisTicks}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Alerts" data={filteredGraphData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
