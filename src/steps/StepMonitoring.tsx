import { Box, Button, FormControl, Grid, InputAdornment, InputLabel, OutlinedInput, Typography } from "@mui/material";
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import React from "react";
import { useAppSelector, useAppDispatch } from '../app/hooks';
import AutoScroll from "@brianmcallister/react-auto-scroll";
import { sendInGameCommand, updateInGameCommand } from "../features/localSlice";
import { useTranslation } from "react-i18next";
import { StepMonitoringProps } from "./types";
import { formatProtocol } from "../common";

export const StepMonitoring: React.FC<StepMonitoringProps> = ({ handleBack, handleNext }) => {
  const clientInfo = useAppSelector(state => state.tunnel.clientInfo)
  const localMessages = useAppSelector(state => state.local.messages)
  const inGameCommand = useAppSelector(state => state.local.inGameCommand)
  const dispatch = useAppDispatch()
  const { t } = useTranslation();

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || event.key !== 'Enter') return
    handleSubmit()
  }
  function handleSubmit() {
    console.log(`submit: ${inGameCommand}`)
    dispatch(sendInGameCommand(inGameCommand))
  }
  function sendCommand(event: React.ChangeEvent<HTMLInputElement>) {
    const command = event.target.value
    dispatch(updateInGameCommand(command))
  }
  return (
    <React.Fragment>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>
              <p>{t('panel.startServer.steps.monitor.publicAddress')}</p>
              {clientInfo && (
                <ul>
                  {clientInfo.endpoints.map(endpoint => (
                    <li key={endpoint.id} style={{ verticalAlign: 'middle' }}>{formatProtocol(endpoint.protocol)}://localhost:{endpoint.local_port} <SyncAltIcon sx={{verticalAlign: 'middle'}}/> {clientInfo.host}:{endpoint.remote_port}</li>
                  ))}
                </ul>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              {t('panel.startServer.steps.monitor.serverLogs')}:
            </Typography>

            <Box
              id="local-server-inf"
              sx={{
                border: '1px solid gray',
                borderRadius: '4px',
                padding: 1,
              }}
            >
              <AutoScroll
                showOption={false}
                height={300}
              >
                {localMessages.map(msg => {
                  return (
                    <div key={msg.key}>
                      {msg.message}
                    </div>
                  );
                })}
              </AutoScroll>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="local-server-send-command">{t('panel.startServer.steps.monitor.inputCommand')}</InputLabel>
              <OutlinedInput
                id="local-server-send-command"
                endAdornment={
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                    >
                      {t('panel.startServer.steps.monitor.sendCommand')}
                    </Button>
                  </InputAdornment>
                }
                label={t('panel.startServer.steps.monitor.inputCommand')}
                value={inGameCommand}
                onChange={sendCommand}
                onKeyDown={handleKeyDown}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          onClick={handleBack}
        >
          {t('common.control.back')}
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />

      </Box>
    </React.Fragment>
  )
}
