import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, TextField, Tooltip, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import React from "react";
import { launchTunnel, interruptTunnel, updateTokenServer } from "../features/tunnelSlice";
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { useTranslation } from "react-i18next";
import { OperationButton, ResultChip } from "../utils";
import { StepLaunchTunnelProps } from "./types";
import { formatProtocol } from "../common";

export const StepLaunchTunnel: React.FC<StepLaunchTunnelProps> = ({ handleBack, handleNext }) => {
  const tokenServer = useAppSelector(state => state.tunnel.tokenServer)
  const tunnelError = useAppSelector(state => state.tunnel.error)
  const tunnelStatus = useAppSelector(state => state.tunnel.tunnelStatus)
  const clientInfo = useAppSelector(state => state.tunnel.clientInfo)
  const dispatch = useAppDispatch()
  const { t } = useTranslation();

  const isBackDisabled = tunnelStatus === 'running'
  const isNextDisabled = tunnelStatus !== 'running'

  return (
    <React.Fragment>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { marginBottom: 1 },
        }}
      >
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Typography sx={{ mb: 2 }} variant="h6" component="div">
              {t('panel.startServer.steps.configureOwnServer.settings')}
            </Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography>{t('panel.startServer.steps.configureOwnServer.advancedSettings.label')}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  id="auth-server-url"
                  label={t('panel.startServer.steps.configureOwnServer.advancedSettings.authServerUrl')}
                  variant="outlined"
                  onChange={e => dispatch(updateTokenServer(e.target.value))}
                  value={tokenServer}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
              {t('panel.startServer.steps.configureOwnServer.tasks.label')}
            </Typography>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography>{t('panel.startServer.steps.configureOwnServer.tasks.launchOwnServer')} <ResultChip status={tunnelStatus}/></Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {clientInfo ?
                    <div>
                      <p>{t('panel.startServer.steps.configureOwnServer.tasks.clientID')}: {clientInfo.client_id}</p>
                      <p>{t('panel.startServer.steps.configureOwnServer.tasks.publicAddress')}</p>
                      <ul>
                        {clientInfo.endpoints.map(endpoint => (
                          <li key={endpoint.id}>{formatProtocol(endpoint.protocol)}://localhost:{endpoint.local_port} <SyncAltIcon sx={{verticalAlign: 'middle'}}/> {clientInfo.host}:{endpoint.remote_port}</li>
                        ))}
                      </ul>
                    </div>
                    : <div></div>
                  }
                  {tunnelError ? tunnelError : ""}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>

        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item xs={12}>
            <OperationButton
              status={tunnelStatus}
              launch={launchTunnel}
              interrupt={interruptTunnel}
            />
          </Grid>
        </Grid>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Tooltip title={isBackDisabled ? t('panel.startServer.steps.configureOwnServer.control.backDesc'): ""}>
          <span>
            <Button
              color="inherit"
              disabled={isBackDisabled}
              onClick={handleBack}
            >
              {t('common.control.back')}
            </Button>
          </span>
        </Tooltip>
        <Box sx={{ flex: '1 1 auto' }} />

        <Tooltip title={isNextDisabled ? t('panel.startServer.steps.configureOwnServer.control.nextDesc'): ""}>
          <span>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
            >
              {t('common.control.next')}
            </Button>
          </span>
        </Tooltip>
      </Box>
    </React.Fragment>
  )
}
