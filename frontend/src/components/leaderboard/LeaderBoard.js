import React, { useState } from "react";
import {
  AppBar,
  Box,
  Tab,
  Tabs,
  Typography,
  Container,
  Button,
} from "@mui/material";

const IframeContainer = ({ src }) => (
  <div style={{ height: "400px", width: "1000px", border: "1px solid #ccc" }}>
    <iframe
      width="1000"
      height="600"
      src={src}
      title="iframe"
      style={{ height: "100%", width: "100%" }}
    />
  </div>
);

const LeaderBoard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [timeframeType, setTimeframeType] = useState("user");
  const [timeframe, setTimeframe] = useState("daily");
  const [category, setCategory] = useState("user");
  const [topPerforming, setTopPerforming] = useState("user");

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  const handleTimeframeTypeChange = (newTimeframeType) => {
    setTimeframeType(newTimeframeType);
    // Reset the timeframe when changing the timeframeType
    setTimeframe("daily");
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
  };

  const handleTopPerformingChange = (newTopPerforming) => {
    setTopPerforming(newTopPerforming);
  };

  const timeframeIframeSrc =
    timeframeType === "user"
      ? timeframe === "daily"
        ? "https://lookerstudio.google.com/embed/reporting/68588ae4-bafe-48f6-ae0f-ea93cdad97be/page/37wYD"
        : timeframe === "weekly"
        ? "https://lookerstudio.google.com/embed/reporting/d6e0802f-85d6-4f52-87e2-1ebf3852d638/page/Y0wYD"
        : timeframe === "monthly"
        ? "https://lookerstudio.google.com/embed/reporting/fb72e39b-fadd-4543-9d75-833fd1fec8c6/page/NywYD"
        : "https://lookerstudio.google.com/embed/reporting/3314d779-5aca-4fe9-a616-90adcf1196d7/page/38wYD"
      : timeframe === "daily"
      ? "https://lookerstudio.google.com/embed/reporting/0f74b1e9-afbb-4198-b3dd-cc1e00a66133/page/GRxYD"
      : timeframe === "weekly"
      ? "https://lookerstudio.google.com/embed/reporting/8550b086-3a95-4126-948f-960db58d1d5b/page/ZQxYD"
      : timeframe === "monthly"
      ? "https://lookerstudio.google.com/embed/reporting/7c315a4a-c40c-40af-8ff8-dcc431c0dc89/page/LPxYD"
      : "https://lookerstudio.google.com/embed/reporting/81b6c33b-ed8a-4f3e-9696-3d39a65399b3/page/hRxYD";

  const categoryIframeSrc =
    category === "user"
      ? "https://lookerstudio.google.com/embed/reporting/a6a98dde-86f9-4a04-b168-4c3a4fd0f123/page/nWxYD"
      : "https://lookerstudio.google.com/embed/reporting/fd995526-71fc-41d9-a945-fa2d6af12c5b/page/DVxYD";

  const topPerformingIframeSrc =
    topPerforming === "user"
      ? "https://lookerstudio.google.com/embed/reporting/dd7b581d-10df-4b3f-a414-49882a2b3da0/page/YXxYD"
      : "https://lookerstudio.google.com/embed/reporting/f05b8e5d-762c-461a-a626-391a3b9e6ae3/page/2XxYD";

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          textColor="black"
          centered
        >
          <Tab label="Timeframe" />
          <Tab label="Category" />
          <Tab label="Top-Performing" />
        </Tabs>
      </AppBar>
      {tabIndex === 0 && (
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Timeframe
          </Typography>
          <Box mb={2}>
            <Button
              variant={timeframeType === "user" ? "contained" : "outlined"}
              onClick={() => handleTimeframeTypeChange("user")}
            >
              User
            </Button>
            <Button
              variant={timeframeType === "team" ? "contained" : "outlined"}
              onClick={() => handleTimeframeTypeChange("team")}
            >
              Team
            </Button>
          </Box>
          {timeframeType === "user" ? (
            <Box mb={2}>
              <Button
                variant={timeframe === "daily" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("daily")}
              >
                Daily
              </Button>
              <Button
                variant={timeframe === "weekly" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={timeframe === "monthly" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={timeframe === "all-time" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("all-time")}
              >
                All-Time
              </Button>
            </Box>
          ) : (
            <Box mb={2}>
              <Button
                variant={timeframe === "daily" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("daily")}
              >
                Daily (Team)
              </Button>
              <Button
                variant={timeframe === "weekly" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("weekly")}
              >
                Weekly (Team)
              </Button>
              <Button
                variant={timeframe === "monthly" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("monthly")}
              >
                Monthly (Team)
              </Button>
              <Button
                variant={timeframe === "all-time" ? "contained" : "outlined"}
                onClick={() => handleTimeframeChange("all-time")}
              >
                All-Time (Team)
              </Button>
            </Box>
          )}
          <IframeContainer src={timeframeIframeSrc} />
        </Box>
      )}
      {tabIndex === 1 && (
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Category
          </Typography>
          <Box mb={2}>
            <Button
              variant={category === "user" ? "contained" : "outlined"}
              onClick={() => handleCategoryChange("user")}
            >
              User
            </Button>
            <Button
              variant={category === "team" ? "contained" : "outlined"}
              onClick={() => handleCategoryChange("team")}
            >
              Team
            </Button>
          </Box>
          <IframeContainer src={categoryIframeSrc} />
        </Box>
      )}
      {tabIndex === 2 && (
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Top-Performing
          </Typography>
          <Box mb={2}>
            <Button
              variant={topPerforming === "user" ? "contained" : "outlined"}
              onClick={() => handleTopPerformingChange("user")}
            >
              User
            </Button>
            <Button
              variant={topPerforming === "team" ? "contained" : "outlined"}
              onClick={() => handleTopPerformingChange("team")}
            >
              Team
            </Button>
          </Box>
          <IframeContainer src={topPerformingIframeSrc} />
        </Box>
      )}
    </Container>
  );
};

export default LeaderBoard;
